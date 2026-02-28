import type { Socket } from "socket.io-client";
import type { Conversation, Message } from "./chat";
import type { User } from "./user";

export interface AuthState {
    accessToken: string | null;
    user: User | null;
    loading: boolean;

    signUp: (username: string, password: string, email: string, firstname: string, lastname: string) => Promise<void>;
    signIn: (username: string, password: string) => Promise<void>;
    clearState: () => void;
    signOut: () => Promise<void>;
    fetchMe: () => Promise<void>;
    refresh: () => Promise<void>;
    setAccessToken: (accessToken: string) => void;
}

export interface ThemeState {
    isDark: boolean
    toggleTheme: () => void
    setTheme: (dark: boolean) => void
}

export interface ChatState {
    conversations: Conversation[];
    messages: Record<string, {
        items: Message[],
        hasMore: boolean,
        nextCursor?: string | null,
    }>;
    activeConversationId: string | null
    convoLoading: boolean
    messageLoading: boolean
    reset: () => void
    setActiveConversation: (id: string | null) => void
    fetchConversation: () => Promise<void>
    fetchMessages: (conversationId?: string) => Promise<void>
    sendDirectMessage: (recipientId: string, content: string, imgUrl?: string) => Promise<void>
    sendGroupMessage: (conversationId: string, content: string, imgUrl?: string) => Promise<void>

    //add message
    addMessage: (message: Message) => Promise<void>

    //update convo
    updateConversation: (convosation: unknown) => void
    markAsSeen: () => Promise<void>
}

export interface SocketState {
    socket: Socket | null,
    onlineUsers: string[]
    connectSocket: () => void,
    disconnectSocket: () => void
}