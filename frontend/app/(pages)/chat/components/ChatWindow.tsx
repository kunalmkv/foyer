'use client';

import { useState, useEffect, useRef } from 'react';
import { Chat, ChatMessage as ChatMessageType } from '@/app/types/Chat';
import { chatService } from '@/app/service/chat.service';
import { ChatMessage } from './ChatMessage';
import { Send, ArrowLeft } from 'lucide-react';

interface ChatWindowProps {
    chat: Chat | null;
    currentUser: string;
    onBack: () => void;
}

export const ChatWindow = ({ chat, currentUser, onBack }: ChatWindowProps) => {
    const [messages, setMessages] = useState<ChatMessageType[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const getOtherParticipant = () => {
        if (!chat) return '';
        return chat.participants.find(p => p !== currentUser) || chat.participants[0];
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (chat) {
            loadMessages();
        }
    }, [chat]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Listen for new messages
        const handleNewMessage = (message: ChatMessageType) => {
            const otherParticipant = getOtherParticipant();
            if (message.from === otherParticipant || message.from === currentUser) {
                setMessages(prev => [...prev, message]);
            }
        };

        chatService.onNewMessage(handleNewMessage);

        return () => {
            // Cleanup would go here if needed
        };
    }, [chat, currentUser]);

    const loadMessages = async () => {
        if (!chat) return;
        
        setLoading(true);
        try {
            const otherParticipant = getOtherParticipant();
            const fetchedMessages = await chatService.getMessages(currentUser, otherParticipant);
            setMessages(fetchedMessages.reverse()); // Reverse to show oldest first
        } catch (error) {
            console.error('Failed to load messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = () => {
        if (!newMessage.trim() || !chat) return;

        const otherParticipant = getOtherParticipant();
        chatService.sendMessage({
            to: otherParticipant,
            message: newMessage.trim(),
            from: currentUser
        });

        setNewMessage('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!chat) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">💬</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-500">Choose a chat from the list to start messaging</p>
                </div>
            </div>
        );
    }

    const otherParticipant = getOtherParticipant();

    return (
        <div className="flex-1 flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                <button
                    onClick={onBack}
                    className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                        {otherParticipant.slice(0, 2).toUpperCase()}
                    </span>
                </div>
                
                <div>
                    <h3 className="font-medium text-gray-900">
                        {otherParticipant.slice(0, 6)}...{otherParticipant.slice(-4)}
                    </h3>
                    <p className="text-sm text-gray-500">Online</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No messages yet</p>
                        <p className="text-sm">Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <ChatMessage
                            key={`${message._id || message.timestamp}-${message.from}`}
                            message={message}
                            currentUser={currentUser}
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-end gap-2">
                    <div className="flex-1">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={1}
                            style={{ minHeight: '40px', maxHeight: '120px' }}
                        />
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};
