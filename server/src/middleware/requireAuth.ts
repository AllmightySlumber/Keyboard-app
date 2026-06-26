import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthedRequest extends Request {
  userId?: string
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing token' })
    return
  }

  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set')

  try {
    const payload = jwt.verify(header.slice('Bearer '.length), secret) as { sub: string }
    req.userId = payload.sub
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}
