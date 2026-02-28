import apiClient from "@/lib/axios";
import type { Conversation, ConversationResponse, Message } from "@/types/chat";

interface FetchMessageProps {
    messages: Message[]
    cursor?: string

}

const pageLimit = 20

export const chatService = {
    async fetchConversation(): Promise<ConversationResponse> {
        const res = await apiClient.get('/conversations')
        return res.data
    },


    async fetchMessages(id: string, cursor?: string): Promise<FetchMessageProps> {
        const res = await apiClient.get(
            `/conversations/${id}/messages?limit=${pageLimit}&cursor=${cursor}`
        );

        return { messages: res.data.messages, cursor: res.data.nextCursor };
    },
    async sendDirectMessage(recipientId: string, content: string = "", imgUrl?: string, conversationId?: string) {
        const res = await apiClient.post("/messages/direct", { recipientId, content, imgUrl, conversationId })
        return res.data.message
    },

    async sendGroupMessage(conversationId: string, content: string = '', imgUrl?: string) {
        const res = await apiClient.post('/messages/group', { conversationId, imgUrl, content })
        return res.data.message
    },
    async markAsSeen(conversationId: string) {
        const res = await apiClient.patch(`/conversations/${conversationId}/seen`)
        return res.data
    }
}