import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../prisma'

const router = Router()

const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[a-z]/, 'Le mot de passe doit contenir une lettre minuscule')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir une lettre majuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir un chiffre'),
  displayName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(24)
})

// Strips accents/punctuation/spaces so "Lucas Müller" -> "lucasmuller".
function slugify(name: string): string {
  const ascii = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
  return ascii || 'user'
}

// Always appends digits (even if the bare slug is free) so a unique handle
// can't be found just by guessing someone's first name.
async function generateUniquePseudo(displayName: string): Promise<string> {
  const base = slugify(displayName)
  for (let attempt = 0; attempt < 20; attempt++) {
    const suffix = Math.floor(100 + Math.random() * 900)
    const candidate = `${base}${suffix}`
    const existing = await prisma.user.findUnique({ where: { pseudo: candidate } })
    if (!existing) return candidate
  }
  // Extremely unlikely fallback: widen the suffix range.
  return `${base}${Date.now().toString().slice(-6)}`
}

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    return res.status(400).json({ error: firstIssue?.message ?? 'Données invalides' })
  }
  const { email, password, displayName } = parsed.data

  const existingEmail = await prisma.user.findUnique({ where: { email } })
  if (existingEmail) {
    return res.status(409).json({ error: 'Cet email est déjà utilisé' })
  }

  const pseudo = await generateUniquePseudo(displayName)
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { email, passwordHash, displayName, pseudo } })

  const token = signToken(user.id)
  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, displayName: user.displayName, pseudo: user.pseudo }
  })
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Email ou mot de passe manquant' })
  }
  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' })
  }

  const token = signToken(user.id)
  res.json({
    token,
    user: { id: user.id, email: user.email, displayName: user.displayName, pseudo: user.pseudo }
  })
})

function signToken(userId: string): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set')
  return jwt.sign({ sub: userId }, secret, { expiresIn: '30d' })
}

export default router
