
import { getConversationHistory } from '../tools/dbTools'

export async function supportAgent(chatId: number, userMessage: string) {
   // const history = await getConversationHistory(chatId)
   // const recent = history.map(m => `${m.sender}: ${m.content}`).join('\n')
    const history = await getConversationHistory(chatId)
    const recent = history.map(m => `${m.sender}: ${m.content}`).join('\n')
    //   response using history
    return `Looking at our chat: ${recent.slice(0, 100)}... ` +
        `For general support like "${userMessage}", here's a quick tip: try checking FAQ or resetting from settings. Need more help?`
}