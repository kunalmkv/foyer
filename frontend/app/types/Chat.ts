export interface ChatMessage {
    _id: string;
    from: string;
    to: string;
    message: string;
    timestamp: string;
    createdAt: string;
    updatedAt: string;
}

export interface Chat {
    _id: string;
    participants: string[];
    lastMessage: string;
    lastMessageFrom: string;
    lastMessageTimestamp: string;
    createdAt: string;
    updatedAt: string;
}

export interface SendMessageRequest {
    to: string;
    message: string;
    from: string;
}

export interface IChatService {
    getChats(userId: string): Promise<Chat[]>;
    getMessages(userId1: string, userId2: string, page?: number, limit?: number): Promise<ChatMessage[]>;
    connectToChat(userId: string): void;
    sendMessage(data: SendMessageRequest): void;
    onNewMessage(callback: (message: ChatMessage) => void): void;
    initiateOfferChat(buyerAddress: string, sellerAddress: string, offerId: number, offerType: 'OFFER_TO_BUY' | 'OFFER_TO_SELL'): Promise<void>;
    disconnect(): void;
}
