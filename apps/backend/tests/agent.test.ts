// tests/agent.test.ts
import { classifyIntent, delegateToAgent } from "../src/agents/router"

describe("Multi-Agent Support System", () => {
    test("Order intent should be detected", async () => {
        const intent = await classifyIntent("track my order ORD-123")
        expect(intent).toBe("order")
    })

    test("Support intent should be detected", async () => {
        const intent = await classifyIntent("reset password")
        expect(intent).toBe("support")
    })

    test("Billing intent should be detected", async () => {
        const intent = await classifyIntent("show my invoice")
        expect(intent).toBe("billing")
    })

    test("Fallback intent for unrelated query", async () => {
        const intent = await classifyIntent("what is the weather today")
        expect(intent).toBe("fallback")
    })

    test("Order agent should return shipping info", async () => {
        const reply = await delegateToAgent("order", 1, "track my order ORD-12345")
        expect(reply).toMatch(/shipped/i)
        expect(reply).toMatch(/track\.example\.com/i)
    })

    test("Billing agent should return invoice info", async () => {
        const reply = await delegateToAgent("billing", 1, "show my last invoice")
        expect(reply).toMatch(/INV-987/i)
        expect(reply).toMatch(/paid/i)
    })

    test("Support agent should give login help", async () => {
        const reply = await delegateToAgent("support", 1, "help with login")
        expect(reply).toMatch(/login/i)
    })
})