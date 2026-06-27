import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../prisma'
import { requireAuth, AuthedRequest } from '../middleware/requireAuth'

const router = Router()

const DAILY_REQUEST_LIMIT = 20
const WEEKLY_REQUEST_LIMIT = 60

async function isBlockedEitherWay(userId: string, otherId: string): Promise<boolean> {
  const block = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: userId, blockedId: otherId },
        { blockerId: otherId, blockedId: userId }
      ]
    }
  })
  return block !== null
}

// Accepted friends, regardless of who originally sent the request.
router.get('/', requireAuth, async (req: AuthedRequest, res) => {
  const friendships = await prisma.friendship.findMany({
    where: {
      status: 'accepted',
      OR: [{ userId: req.userId }, { friendId: req.userId }]
    },
    include: {
      user: { select: { id: true, pseudo: true, displayName: true } },
      friend: { select: { id: true, pseudo: true, displayName: true } }
    }
  })

  const friends = friendships.map((f) => (f.userId === req.userId ? f.friend : f.user))
  res.json(friends)
})

// Pending requests sent to the current user.
router.get('/requests', requireAuth, async (req: AuthedRequest, res) => {
  const requests = await prisma.friendship.findMany({
    where: { friendId: req.userId, status: 'pending' },
    include: { user: { select: { id: true, pseudo: true, displayName: true } } }
  })

  res.json(requests.map((r) => ({ requestId: r.id, from: r.user })))
})

router.get('/blocked', requireAuth, async (req: AuthedRequest, res) => {
  const blocks = await prisma.block.findMany({
    where: { blockerId: req.userId },
    include: { blocked: { select: { id: true, pseudo: true, displayName: true } } }
  })
  res.json(blocks.map((b) => b.blocked))
})

// Friends' most recent session, flagged when it's a new personal best set
// within the last 48h — drives the "X just beat their record" notification.
router.get('/activity', requireAuth, async (req: AuthedRequest, res) => {
  const friendships = await prisma.friendship.findMany({
    where: {
      status: 'accepted',
      OR: [{ userId: req.userId }, { friendId: req.userId }]
    },
    include: {
      user: { select: { id: true, pseudo: true, displayName: true } },
      friend: { select: { id: true, pseudo: true, displayName: true } }
    }
  })
  const friends = friendships.map((f) => (f.userId === req.userId ? f.friend : f.user))

  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000)
  const activity = await Promise.all(
    friends.map(async (friend) => {
      const [latest, best] = await Promise.all([
        prisma.typingSession.findFirst({ where: { userId: friend.id }, orderBy: { createdAt: 'desc' } }),
        prisma.typingSession.findFirst({ where: { userId: friend.id }, orderBy: { wpm: 'desc' } })
      ])
      const isNewRecord = Boolean(
        latest && best && latest.id === best.id && latest.createdAt >= cutoff
      )
      return isNewRecord
        ? {
            id: latest!.id,
            pseudo: friend.pseudo,
            displayName: friend.displayName,
            wpm: latest!.wpm,
            createdAt: latest!.createdAt
          }
        : null
    })
  )

  const sorted = activity
    .filter((a): a is NonNullable<typeof a> => a !== null)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 20)

  res.json(sorted)
})

router.get('/search', requireAuth, async (req: AuthedRequest, res) => {
  const query = z.string().min(1).safeParse(req.query.q)
  if (!query.success) {
    return res.status(400).json({ error: 'Missing query' })
  }

  const blocks = await prisma.block.findMany({
    where: { OR: [{ blockerId: req.userId }, { blockedId: req.userId }] }
  })
  const blockedIds = blocks.map((b) => (b.blockerId === req.userId ? b.blockedId : b.blockerId))

  const users = await prisma.user.findMany({
    where: {
      pseudo: { equals: query.data, mode: 'insensitive' },
      id: { not: req.userId, notIn: blockedIds }
    },
    select: { id: true, pseudo: true, displayName: true },
    take: 10
  })

  res.json(users)
})

router.post('/request/:friendId', requireAuth, async (req: AuthedRequest, res) => {
  if (req.params.friendId === req.userId) {
    return res.status(400).json({ error: "Tu ne peux pas t'ajouter toi-même" })
  }

  if (await isBlockedEitherWay(req.userId!, req.params.friendId)) {
    return res.status(403).json({ error: 'Impossible de contacter cet utilisateur' })
  }

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userId: req.userId, friendId: req.params.friendId },
        { userId: req.params.friendId, friendId: req.userId }
      ]
    }
  })
  if (existing) {
    return res.status(409).json({ error: 'Demande déjà existante' })
  }

  const now = Date.now()
  const dayCutoff = new Date(now - 24 * 60 * 60 * 1000)
  const weekCutoff = new Date(now - 7 * 24 * 60 * 60 * 1000)
  const [sentToday, sentThisWeek] = await Promise.all([
    prisma.friendship.count({ where: { userId: req.userId, createdAt: { gte: dayCutoff } } }),
    prisma.friendship.count({ where: { userId: req.userId, createdAt: { gte: weekCutoff } } })
  ])
  if (sentToday >= DAILY_REQUEST_LIMIT || sentThisWeek >= WEEKLY_REQUEST_LIMIT) {
    return res.status(429).json({ error: "Trop de demandes d'ami envoyées, réessaie plus tard" })
  }

  const friendship = await prisma.friendship.create({
    data: { userId: req.userId!, friendId: req.params.friendId, status: 'pending' }
  })
  res.status(201).json(friendship)
})

router.post('/accept/:requestId', requireAuth, async (req: AuthedRequest, res) => {
  const request = await prisma.friendship.findUnique({ where: { id: req.params.requestId } })
  if (!request || request.friendId !== req.userId) {
    return res.status(404).json({ error: 'Demande introuvable' })
  }

  const updated = await prisma.friendship.update({
    where: { id: req.params.requestId },
    data: { status: 'accepted' }
  })
  res.json(updated)
})

router.post('/decline/:requestId', requireAuth, async (req: AuthedRequest, res) => {
  const request = await prisma.friendship.findUnique({ where: { id: req.params.requestId } })
  if (!request || request.friendId !== req.userId) {
    return res.status(404).json({ error: 'Demande introuvable' })
  }

  await prisma.friendship.delete({ where: { id: req.params.requestId } })
  res.status(204).end()
})

// Unfriend: remove the friendship regardless of who sent the original request.
router.delete('/:userId', requireAuth, async (req: AuthedRequest, res) => {
  await prisma.friendship.deleteMany({
    where: {
      OR: [
        { userId: req.userId, friendId: req.params.userId },
        { userId: req.params.userId, friendId: req.userId }
      ]
    }
  })
  res.status(204).end()
})

router.post('/block/:userId', requireAuth, async (req: AuthedRequest, res) => {
  if (req.params.userId === req.userId) {
    return res.status(400).json({ error: 'Tu ne peux pas te bloquer toi-même' })
  }

  await prisma.$transaction([
    prisma.block.upsert({
      where: { blockerId_blockedId: { blockerId: req.userId!, blockedId: req.params.userId } },
      create: { blockerId: req.userId!, blockedId: req.params.userId },
      update: {}
    }),
    prisma.friendship.deleteMany({
      where: {
        OR: [
          { userId: req.userId, friendId: req.params.userId },
          { userId: req.params.userId, friendId: req.userId }
        ]
      }
    })
  ])
  res.status(201).end()
})

router.delete('/block/:userId', requireAuth, async (req: AuthedRequest, res) => {
  await prisma.block.deleteMany({
    where: { blockerId: req.userId, blockedId: req.params.userId }
  })
  res.status(204).end()
})

const reportSchema = z.object({
  reason: z.string().min(3).max(500)
})

router.post('/report/:userId', requireAuth, async (req: AuthedRequest, res) => {
  if (req.params.userId === req.userId) {
    return res.status(400).json({ error: 'Tu ne peux pas te signaler toi-même' })
  }

  const parsed = reportSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const report = await prisma.report.create({
    data: {
      reporterId: req.userId!,
      reportedUserId: req.params.userId,
      reason: parsed.data.reason
    }
  })
  res.status(201).json(report)
})

export default router
