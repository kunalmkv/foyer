import { io, Socket } from 'socket.io-client';
import { baseurl } from "@/app/consts";
import { IChatService, Chat, ChatMessage, SendMessageRequest } from "../types/Chat";

export class ChatService implements IChatService {
    private socket: Socket | null = null;
    private messageCallbacks: ((message: ChatMessage) => void)[] = [];

    constructor() {
        // Initialize socket connection
        this.socket = io('http://18.191.199.142:3002', {
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
        const response = await fetch(`${baseurl.replace('3000', '3002')}/chats/${userId.toLowerCase()}`, {
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
        const response = await fetch(`${baseurl.replace('3000', '3002')}/messages/${userId1.toLowerCase()}/${userId2.toLowerCase()}?page=${page}&limit=${limit}`, {
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
            this.socket.emit('join', { userId: userId.toLowerCase() });
        }
    }

    sendMessage(data: SendMessageRequest): void {
        if (this.socket) {
            const messageData = {
                ...data,
                from: data.from.toLowerCase(),
                to: data.to.toLowerCase()
            };
            this.socket.emit('sendMessage', messageData);
        }
    }

    onNewMessage(callback: (message: ChatMessage) => void): void {
        this.messageCallbacks.push(callback);
    }

    async initiateOfferChat(buyerAddress: string, sellerAddress: string, offerId: number, offerType: 'OFFER_TO_BUY' | 'OFFER_TO_SELL'): Promise<void> {
        try {
            // Create initial template message
            const templateMessage = this.createOfferAcceptanceMessage(offerId, offerType);
            
            // Send the initial message to start the chat
            const messageData: SendMessageRequest = {
                from: buyerAddress, // The person who accepted the offer sends the first message
                to: sellerAddress,
                message: templateMessage
            };

            // Send via socket
            this.sendMessage(messageData);
            
            console.log('Offer chat initiated successfully', { offerId, buyerAddress, sellerAddress });
        } catch (error) {
            console.error('Failed to initiate offer chat:', error);
            throw error;
        }
    }

    private createOfferAcceptanceMessage(offerId: number, offerType: 'OFFER_TO_BUY' | 'OFFER_TO_SELL'): string {
        const action = offerType === 'OFFER_TO_SELL' ? 'purchased' : 'accepted your buy request for';
        const nextSteps = offerType === 'OFFER_TO_SELL' 
            ? 'Please arrange for ticket delivery. Once you receive the tickets, please confirm in the system to complete the transaction.'
            : 'Please arrange for ticket delivery. Once the buyer receives the tickets, they will confirm to complete the transaction.';

        return `🎫 Great news! I've ${action} your tickets for Offer #${offerId}. 

${nextSteps}

Looking forward to a smooth transaction! 👍`;
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export const chatService = new ChatService();
