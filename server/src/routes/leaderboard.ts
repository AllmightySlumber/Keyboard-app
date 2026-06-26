import { Router } from 'express'
import { prisma } from '../prisma'
import { requireAuth } from '../middleware/requireAuth'

const router = Router()

router.get('/top', requireAuth, async (_req, res) => {
  const sessions = await prisma.typingSession.findMany({
    orderBy: { wpm: 'desc' },
    take: 5,
    include: { user: { select: { pseudo: true } } }
  })

  res.json(
    sessions.map((s) => ({
      pseudo: s.user.pseudo,
      wpm: s.wpm,
      accuracy: s.accuracy
    }))
  )
})

export default router
