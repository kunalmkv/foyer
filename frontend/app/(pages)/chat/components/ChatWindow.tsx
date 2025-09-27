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
            console.log('Received new message:', message);
            const otherParticipant = getOtherParticipant();
            console.log('Current chat participants:', chat?.participants);
            console.log('Other participant:', otherParticipant, 'Current user:', currentUser);
            
            // Check if this message belongs to the current chat
            if (chat && (message.from === otherParticipant || message.from === currentUser)) {
                console.log('Adding message to current chat');
                setMessages(prev => {
                    // Remove any temporary/optimistic messages with same content from same user
                    const withoutOptimistic = prev.filter(m => 
                        !(m._id.startsWith('temp-') && m.message === message.message && m.from === message.from)
                    );
                    
                    // Avoid duplicates (check if real message already exists)
                    const messageExists = withoutOptimistic.some(m => 
                        m.message === message.message && 
                        m.from === message.from && 
                        Math.abs(new Date(m.timestamp).getTime() - new Date(message.timestamp).getTime()) < 5000
                    );
                    
                    if (messageExists) {
                        console.log('Message already exists, not adding duplicate');
                        return withoutOptimistic;
                    }
                    
                    console.log('Adding new message to chat');
                    return [...withoutOptimistic, message];
                });
            } else {
                console.log('Message not for current chat, ignoring');
            }
        };

        if (chat) {
            console.log('Setting up message listener for chat:', chat._id);
            chatService.onNewMessage(handleNewMessage);
        }

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
        if (!newMessage.trim() || !chat) {
            console.log('Cannot send message: empty message or no chat', { newMessage: newMessage.trim(), chat });
            return;
        }

        const otherParticipant = getOtherParticipant();
        console.log('Sending message:', {
            to: otherParticipant,
            message: newMessage.trim(),
            from: currentUser,
            chat: chat._id
        });

        const messageText = newMessage.trim();
        
        try {
            // Optimistically add message to UI immediately
            const optimisticMessage: ChatMessageType = {
                _id: `temp-${Date.now()}`, // Temporary ID
                from: currentUser,
                to: otherParticipant,
                message: messageText,
                timestamp: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            console.log('Adding optimistic message to UI:', optimisticMessage);
            setMessages(prev => [...prev, optimisticMessage]);
            setNewMessage('');

            // Send to server
            chatService.sendMessage({
                to: otherParticipant,
                message: messageText,
                from: currentUser
            });

            console.log('Message sent successfully');
        } catch (error) {
            console.error('Failed to send message:', error);
            // Remove the optimistic message if sending failed
            setMessages(prev => prev.filter(m => !m._id.startsWith('temp-')));
            alert('Failed to send message. Please try again.');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!chat) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-800/50">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gray-700 border border-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">💬</span>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">Select a conversation</h3>
                    <p className="text-gray-300">Choose a chat from the list to start messaging</p>
                </div>
            </div>
        );
    }

    const otherParticipant = getOtherParticipant();

    return (
        <div className="h-full flex flex-col bg-gray-800">
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex items-center gap-3 flex-shrink-0">
                <button
                    onClick={onBack}
                    className="lg:hidden p-2 hover:bg-gray-700 rounded-full transition-colors"
                >
                    <ArrowLeft size={20} className="text-gray-300" />
                </button>
                
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-300">
                        {otherParticipant.slice(0, 2).toUpperCase()}
                    </span>
                </div>
                
                <div>
                    <h3 className="font-medium text-white">
                        {otherParticipant.slice(0, 6)}...{otherParticipant.slice(-4)}
                    </h3>
                    <p className="text-sm text-gray-400">Online</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/50">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
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
            <div className="p-4 border-t border-gray-700 bg-gray-800 flex-shrink-0">
                <div className="flex items-end gap-2">
                    <div className="flex-1">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={1}
                            style={{ minHeight: '40px', maxHeight: '120px' }}
                        />
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};
