

import { Context, Next } from 'hono'

export async function errorHandler(c: Context, next: Next) {
    try {
        await next()
    } catch (err: any) {
        console.error('Global error caught:', err?.message || err)

        const status = err?.status || 500
        const msg = status === 500 ? 'Something broke on our side' : (err?.message || 'Error')

        return c.json({ success: false, error: msg }, status)
    }
}