import { Router } from 'express'
import { prisma } from '../prisma'
import { requireAuth } from '../middleware/requireAuth'

const router = Router()

router.get('/top', requireAuth, async (_req, res) => {
  const sessions = await prisma.typingSession.findMany({
    orderBy: { wpm: 'desc' },
    take: 5,
    include: { user: { select: { displayName: true } } }
  })

  res.json(
    sessions.map((s) => ({
      displayName: s.user.displayName,
      wpm: s.wpm,
      accuracy: s.accuracy
    }))
  )
})

export default router
