import { io, Socket } from 'socket.io-client';
import { baseurl } from "@/app/consts";
import { IChatService, Chat, ChatMessage, SendMessageRequest } from "../types/Chat";

export class ChatService implements IChatService {
    private socket: Socket | null = null;
    private messageCallbacks: ((message: ChatMessage) => void)[] = [];
    private isConnected: boolean = false;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;

    constructor() {
        // Delay socket initialization to prevent blocking
        setTimeout(() => {
            this.initializeSocket();
        }, 100);
    }

    private initializeSocket() {
        try {
            // Initialize socket connection
            this.socket = io('http://18.191.199.142:3002', {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: 1000,
                timeout: 5000, // 5 second timeout
                forceNew: true
            });

        this.socket.on('connect', () => {
            console.log('Connected to chat server');
            this.isConnected = true;
            this.reconnectAttempts = 0;
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from chat server');
            this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            this.reconnectAttempts++;
            this.isConnected = false;
        });

        this.socket.on('connect_timeout', () => {
            console.error('Socket connection timeout');
            this.isConnected = false;
        });

        this.socket.on('newMessage', (data: any) => {
            console.log('Received socket message:', data);
            
            // Generate a unique ID for socket messages
            const messageId = `socket-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            const message: ChatMessage = {
                _id: messageId,
                from: data.from?.toLowerCase() || '',
                to: data.to?.toLowerCase() || '',
                message: data.message || '',
                timestamp: data.timestamp || new Date().toISOString(),
                createdAt: data.timestamp || new Date().toISOString(),
                updatedAt: data.timestamp || new Date().toISOString()
            };
            
            console.log('Processed socket message:', message);
            this.messageCallbacks.forEach(callback => {
                try {
                    callback(message);
                } catch (error) {
                    console.error('Error in message callback:', error);
                }
            });
        });
        } catch (error) {
            console.error('Failed to initialize socket:', error);
            this.isConnected = false;
        }
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
        const url = `${baseurl.replace('3000', '3002')}/messages/${userId1.toLowerCase()}/${userId2.toLowerCase()}?page=${page}&limit=${limit}`;
        console.log('Fetching messages from URL:', url);
        
        const response = await fetch(url, {
            cache: 'no-cache',
        });
        
        console.log('Messages API response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Messages API error:', errorData);
            throw new Error(errorData.error || `Failed to fetch messages: ${response.statusText}`);
        }
        
        const responseData = await response.json();
        console.log('Messages API response data:', responseData);
        
        const { messages } = responseData;
        console.log('Extracted messages:', messages);
        console.log('Number of messages:', messages?.length || 0);
        
        return messages || [];
    }

    connectToChat(userId: string): void {
        if (this.socket && this.isConnected) {
            console.log('Joining chat for user:', userId);
            this.socket.emit('join', { userId: userId.toLowerCase() });
        } else {
            console.warn('Cannot connect to chat: socket not connected');
        }
    }

    sendMessage(data: SendMessageRequest): void {
        if (this.socket && this.isConnected) {
            const messageData = {
                ...data,
                from: data.from.toLowerCase(),
                to: data.to.toLowerCase(),
                timestamp: new Date().toISOString()
            };
            console.log('Sending message via socket:', messageData);
            this.socket.emit('sendMessage', messageData);
        } else {
            console.error('Cannot send message: socket not connected');
            throw new Error('Chat service not connected');
        }
    }

    onNewMessage(callback: (message: ChatMessage) => void): void {
        this.messageCallbacks.push(callback);
    }

    removeMessageCallback(callback: (message: ChatMessage) => void): void {
        const index = this.messageCallbacks.indexOf(callback);
        if (index > -1) {
            this.messageCallbacks.splice(index, 1);
        }
    }

    isSocketConnected(): boolean {
        return this.isConnected && this.socket?.connected === true;
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
            console.log('Disconnecting from chat service');
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.messageCallbacks = [];
        }
    }
}

export const chatService = new ChatService();
