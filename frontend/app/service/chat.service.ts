import { io, Socket } from 'socket.io-client';
import { baseurl } from "@/app/consts";
import { IChatService, Chat, ChatMessage, SendMessageRequest } from "../types/Chat";

export class ChatService implements IChatService {
    private socket: Socket | null = null;
    private messageCallbacks: ((message: ChatMessage) => void)[] = [];

    constructor() {
        // Initialize socket connection
        this.socket = io('http://localhost:3002', {
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            console.log('Connected to chat server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from chat server');
        });

        this.socket.on('newMessage', (data: any) => {
            const message: ChatMessage = {
                _id: '', // Socket messages don't have _id
                from: data.from,
                to: data.to || '', // Will be set by the receiver
                message: data.message,
                timestamp: data.timestamp,
                createdAt: data.timestamp,
                updatedAt: data.timestamp
            };
            
            this.messageCallbacks.forEach(callback => callback(message));
        });
    }

    async getChats(userId: string): Promise<Chat[]> {
        const response = await fetch(`${baseurl.replace('3000', '3002')}/chats/${userId}`, {
            cache: 'no-cache',
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to fetch chats: ${response.statusText}`);
        }
        const { chats } = await response.json();
        return chats;
    }

    async getMessages(userId1: string, userId2: string, page: number = 1, limit: number = 50): Promise<ChatMessage[]> {
        const response = await fetch(`${baseurl.replace('3000', '3002')}/messages/${userId1}/${userId2}?page=${page}&limit=${limit}`, {
            cache: 'no-cache',
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to fetch messages: ${response.statusText}`);
        }
        const { messages } = await response.json();
        return messages;
    }

    connectToChat(userId: string): void {
        if (this.socket) {
            this.socket.emit('join', { userId });
        }
    }

    sendMessage(data: SendMessageRequest): void {
        if (this.socket) {
            this.socket.emit('sendMessage', data);
        }
    }

    onNewMessage(callback: (message: ChatMessage) => void): void {
        this.messageCallbacks.push(callback);
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export const chatService = new ChatService();
