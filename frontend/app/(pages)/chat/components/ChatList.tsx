'use client';

import { Chat } from '@/app/types/Chat';
import { MessageCircle, Clock } from 'lucide-react';

interface ChatListProps {
    chats: Chat[];
    currentUser: string;
    onChatSelect: (chat: Chat) => void;
    selectedChatId?: string;
}

export const ChatList = ({ chats, currentUser, onChatSelect, selectedChatId }: ChatListProps) => {
    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
        
        if (diffInHours < 24) {
            return date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });
        } else if (diffInHours < 168) { // 7 days
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
        }
    };

    const getOtherParticipant = (chat: Chat) => {
        return chat.participants.find(p => p !== currentUser) || chat.participants[0];
    };

    const truncateMessage = (message: string, maxLength: number = 50) => {
        return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
    };

    return (
        <div className="h-full bg-gray-900 border-r border-gray-700 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex-shrink-0">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <MessageCircle size={20} className="text-blue-500" />
                    Messages
                </h2>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
                {chats.length === 0 ? (
                    <div className="p-4 text-center text-gray-400">
                        <MessageCircle size={48} className="mx-auto mb-2 text-gray-600" />
                        <p>No conversations yet</p>
                        <p className="text-sm">Start a chat with someone!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-800">
                        {chats.map((chat) => {
                            const otherParticipant = getOtherParticipant(chat);
                            const isSelected = selectedChatId === chat._id;
                            
                            return (
                                <div
                                    key={chat._id}
                                    onClick={() => onChatSelect(chat)}
                                    className={`p-4 cursor-pointer hover:bg-gray-800 transition-colors ${
                                        isSelected ? 'bg-blue-900/20 border-r-2 border-blue-500' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Avatar */}
                                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-medium text-gray-300">
                                                {otherParticipant.slice(0, 2).toUpperCase()}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="text-sm font-medium text-white truncate">
                                                    {otherParticipant.slice(0, 6)}...{otherParticipant.slice(-4)}
                                                </h3>
                                                <div className="flex items-baseline gap-1 text-xs text-gray-400">
                                                    <Clock size={11} className="flex-shrink-0 inline-block" />
                                                    <span className="whitespace-nowrap">{formatTime(chat.lastMessageTimestamp)}</span>
                                                </div>
                                            </div>
                                            
                                            <p className="text-sm text-gray-300 truncate">
                                                {chat.lastMessageFrom === currentUser ? 'You: ' : ''}
                                                {truncateMessage(chat.lastMessage)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
