'use client';

import { ChatMessage as ChatMessageType } from '@/app/types/Chat';

interface ChatMessageProps {
    message: ChatMessageType;
    currentUser: string;
}

export const ChatMessage = ({ message, currentUser }: ChatMessageProps) => {
    const isOwnMessage = message.from.toLowerCase() === currentUser.toLowerCase();
    const formatTime = (timestamp: string) => {
        try {
            return new Date(timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            console.error('Error formatting timestamp:', timestamp, error);
            return 'Invalid time';
        }
    };

    const isTemporary = message._id.startsWith('temp-');

    return (
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                isOwnMessage 
                    ? `bg-blue-600 text-white shadow-sm ${isTemporary ? 'opacity-70' : ''}` 
                    : 'bg-gray-700 text-white border border-gray-600 shadow-sm'
            }`}>
                <p className="text-sm break-words">{message.message}</p>
                <div className="flex items-center justify-between mt-1">
                    <p className={`text-xs ${
                        isOwnMessage ? 'text-blue-100' : 'text-gray-300'
                    }`}>
                        {formatTime(message.timestamp)}
                    </p>
                    {isTemporary && isOwnMessage && (
                        <span className="text-xs text-blue-200 ml-2">Sending...</span>
                    )}
                </div>
            </div>
        </div>
    );
};
