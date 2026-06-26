import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import leaderboardRoutes from './routes/leaderboard'
import friendsRoutes from './routes/friends'
import sessionsRoutes from './routes/sessions'
import messagesRoutes from './routes/messages'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/auth', authRoutes)
app.use('/leaderboard', leaderboardRoutes)
app.use('/friends', friendsRoutes)
app.use('/sessions', sessionsRoutes)
app.use('/messages', messagesRoutes)

const port = process.env.PORT ?? 4000
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
