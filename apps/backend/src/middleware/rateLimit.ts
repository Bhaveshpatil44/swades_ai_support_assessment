

import { Context, Next } from 'hono'

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function rateLimiter(limit = 10, windowMs = 60 * 1000) {
    return async (c: Context, next: Next) => {
        const ip = c.req.header('x-forwarded-for') || 'unknown'
        const now = Date.now()

        const record = rateLimitMap.get(ip)

        if (!record || now > record.resetTime) {
            rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
        } else {
            record.count++
            if (record.count > limit) {
                console.log('Rate limit hit for IP:', ip)
                return c.json({ error: 'Slow down bro, too many requests' }, 429)
            }
        }

        await next()
    }
}