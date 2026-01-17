import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import type { Context } from 'hono'

import { postMessage, getConversation } from './controllers/chatController'
import { errorHandler } from './middleware/errorHandler'
import { rateLimiter } from './middleware/rateLimit'
import { listConversations } from './controllers/chatController'

const app = new Hono()

app.use('*', logger())
app.use('/api/*', cors())          
app.use('*', errorHandler)
app.use('/api/*', rateLimiter(15, 60 * 1000))

app.get('/api/health', (c: Context) => c.text('OK', 200))
app.get('/api/hello', (c: Context) => c.json({ message: 'Hey, backend is alive!' }))

app.post('/api/chat/messages', postMessage)
app.get('/api/chat/conversations/:id', getConversation)

app.get('/api/chat/conversations', listConversations)

app.notFound((c: Context) => c.json({ error: 'Not found' }, 404))
app.onError((err: Error, c: Context) => {
    console.error('Server error:', err)
    return c.json({ error: 'Internal Server Error' }, 500)
})

const port = 3001
console.log(`Backend starting on http://localhost:${port}`)

serve({ fetch: app.fetch, port })