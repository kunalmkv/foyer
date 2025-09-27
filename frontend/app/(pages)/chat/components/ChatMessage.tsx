'use client';

import { ChatMessage as ChatMessageType } from '@/app/types/Chat';

interface ChatMessageProps {
    message: ChatMessageType;
    currentUser: string;
}

export const ChatMessage = ({ message, currentUser }: ChatMessageProps) => {
    const isOwnMessage = message.from === currentUser;
    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                isOwnMessage 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-gray-700 text-white border border-gray-600 shadow-sm'
            }`}>
                <p className="text-sm break-words">{message.message}</p>
                <p className={`text-xs mt-1 ${
                    isOwnMessage ? 'text-blue-100' : 'text-gray-300'
                }`}>
                    {formatTime(message.timestamp)}
                </p>
            </div>
        </div>
    );
};
