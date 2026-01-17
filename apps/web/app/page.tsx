

'use client'

import { useState, useRef, useEffect } from 'react'

export default function ChatPage() {
    const [messages, setMessages] = useState<{ sender: 'user' | 'agent'; text: string }[]>([])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [statusText, setStatusText] = useState('')

    const messagesEndRef = useRef<HTMLDivElement | null>(null)

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isTyping, statusText])

    const sendMessage = async () => {
        const msg = input.trim()
        if (!msg) return

        //  user's message  
        setMessages(prev => [...prev, { sender: 'user', text: msg }])
        setInput('')
        setIsTyping(true)
        setStatusText('Thinking...')

        try {
            const res = await fetch('http://localhost:3001/api/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatId: 1, message: msg }),
            })

            if (!res.ok) throw new Error('Network error')
            if (!res.body) throw new Error('No stream body')

            const reader = res.body.getReader()
            const decoder = new TextDecoder()
            let agentReply = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value, { stream: true })
                const lines = chunk.split('\n').filter(Boolean)

                for (const line of lines) {
                    const match = line.match(/^data:\s*(.*)$/)
                    if (!match || !match[1]) continue

                    try {
                        const data = JSON.parse(match[1])
                        if (data.type === 'thinking') {
                            setStatusText(data.text)
                        } else if (data.type === 'content') {
                            agentReply += data.text
                            setMessages(prev => {
                                const lastMsg = prev[prev.length - 1]
                                if (lastMsg?.sender === 'agent') {
                                    return [...prev.slice(0, -1), { ...lastMsg, text: agentReply }]
                                }
                                return [...prev, { sender: 'agent', text: agentReply }]
                            })
                        } else if (data.type === 'done') {
                            setIsTyping(false)
                            setStatusText('')
                        }
                    } catch {
                       
                    }
                }
            }
        } catch (err) {
            console.error('Chat error:', err)
            setMessages(prev => [...prev, { sender: 'agent', text: 'Sorry, something went wrong...' }])
        } finally {
            setIsTyping(false)
            setStatusText('')
        }
    }

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ textAlign: 'center' }}>Support Chat</h1>

            <div
                style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '16px',
                    minHeight: '400px',
                    maxHeight: '500px',
                    overflowY: 'auto',
                    background: '#f9f9f9',
                    marginBottom: '16px',
                }}
            >
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        style={{
                            marginBottom: '12px',
                            textAlign: msg.sender === 'user' ? 'right' : 'left',
                        }}
                    >
                        <div
                            style={{
                                display: 'inline-block',
                                padding: '10px 14px',
                                borderRadius: '18px',
                                background: msg.sender === 'user' ? '#007bff' : '#e9ecef',
                                color: msg.sender === 'user' ? 'white' : '#333',
                                maxWidth: '80%',
                            }}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div style={{ color: '#666', fontStyle: 'italic', marginTop: '12px' }}>
                        Agent is typing… {statusText && `(${statusText})`}
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message here..."
                    style={{
                        flex: 1,
                        padding: '12px',
                        border: '1px solid #ccc',
                        borderRadius: '6px',
                        fontSize: '16px',
                    }}
                />
                <button
                    onClick={sendMessage}
                    disabled={isTyping}
                    style={{
                        padding: '12px 24px',
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '16px',
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    )
}