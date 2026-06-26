import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../prisma'
import { requireAuth, AuthedRequest } from '../middleware/requireAuth'

const router = Router()

async function areFriends(userId: string, otherId: string): Promise<boolean> {
  const friendship = await prisma.friendship.findFirst({
    where: {
      status: 'accepted',
      OR: [
        { userId, friendId: otherId },
        { userId: otherId, friendId: userId }
      ]
    }
  })
  return friendship !== null
}

router.get('/:friendId', requireAuth, async (req: AuthedRequest, res) => {
  if (!(await areFriends(req.userId!, req.params.friendId))) {
    return res.status(403).json({ error: 'Vous devez être amis pour voir cette conversation' })
  }

  await prisma.message.updateMany({
    where: { senderId: req.params.friendId, receiverId: req.userId, readAt: null },
    data: { readAt: new Date() }
  })

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: req.userId, receiverId: req.params.friendId },
        { senderId: req.params.friendId, receiverId: req.userId }
      ]
    },
    orderBy: { createdAt: 'asc' },
    take: 200
  })

  res.json(messages)
})

const sendSchema = z.object({
  content: z.string().min(1).max(1000)
})

router.post('/:friendId', requireAuth, async (req: AuthedRequest, res) => {
  if (!(await areFriends(req.userId!, req.params.friendId))) {
    return res.status(403).json({ error: 'Vous devez être amis pour envoyer un message' })
  }

  const parsed = sendSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const message = await prisma.message.create({
    data: {
      senderId: req.userId!,
      receiverId: req.params.friendId,
      content: parsed.data.content
    }
  })
  res.status(201).json(message)
})

export default router
