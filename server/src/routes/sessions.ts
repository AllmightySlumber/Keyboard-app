import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../prisma'
import { requireAuth, AuthedRequest } from '../middleware/requireAuth'

const router = Router()

router.get('/', requireAuth, async (req: AuthedRequest, res) => {
  const sessions = await prisma.typingSession.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'asc' }
  })
  res.json(sessions)
})

const createSessionSchema = z.object({
  wpm: z.number().min(0),
  accuracy: z.number().min(0).max(100),
  durationSec: z.number().int().min(1),
  layout: z.string()
})

router.post('/', requireAuth, async (req: AuthedRequest, res) => {
  const parsed = createSessionSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const session = await prisma.typingSession.create({
    data: { ...parsed.data, userId: req.userId! }
  })
  res.status(201).json(session)
})

export default router
