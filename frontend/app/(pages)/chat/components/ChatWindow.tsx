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
    const [sendingMessage, setSendingMessage] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messageCallbackRef = useRef<((message: ChatMessageType) => void) | null>(null);

    const getOtherParticipant = () => {
        if (!chat) return '';
        return chat.participants.find(p => p.toLowerCase() !== currentUser.toLowerCase()) || chat.participants[0];
    };

    const scrollToBottom = () => {
        console.log('Scrolling to bottom');
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (chat) {
            console.log('Chat changed, loading messages for:', chat._id);
            loadMessages();
        } else {
            console.log('No chat selected, clearing messages');
            setMessages([]);
        }
    }, [chat]);

    useEffect(() => {
        console.log('Messages changed, scrolling to bottom. Message count:', messages.length);
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Clean up previous callback
        if (messageCallbackRef.current) {
            chatService.removeMessageCallback(messageCallbackRef.current);
        }

        if (!chat) {
            messageCallbackRef.current = null;
            return;
        }

        // Create new message handler
        const handleNewMessage = (message: ChatMessageType) => {
            console.log('Received new message:', message);
            const otherParticipant = getOtherParticipant();
            const currentUserLower = currentUser.toLowerCase();
            const otherParticipantLower = otherParticipant.toLowerCase();
            
            // Check if this message belongs to the current chat
            const isForCurrentChat = (
                (message.from === currentUserLower && message.to === otherParticipantLower) ||
                (message.from === otherParticipantLower && message.to === currentUserLower)
            );
            
            if (isForCurrentChat) {
                console.log('Adding message to current chat');
                setMessages(prev => {
                    console.log('Current messages before adding new one:', prev.length);
                    
                    // Simple deduplication: check if message with same ID already exists
                    const messageExists = prev.some(m => m._id === message._id);
                    
                    if (messageExists) {
                        console.log('Message already exists, not adding duplicate');
                        return prev;
                    }
                    
                    // Remove any temporary messages from the same user with same content
                    const withoutTemp = prev.filter(m => 
                        !(m._id.startsWith('temp-') && 
                          m.message === message.message && 
                          m.from === message.from)
                    );
                    
                    console.log('Messages after removing temp:', withoutTemp.length);
                    console.log('Adding new message to chat:', message);
                    
                    const newMessages = [...withoutTemp, message];
                    
                    console.log('Final messages array:', newMessages.length);
                    return newMessages;
                });
            } else {
                console.log('Message not for current chat, ignoring. Expected participants:', currentUserLower, otherParticipantLower, 'Got:', message.from, message.to);
            }
        };

        // Store the callback reference and register it
        messageCallbackRef.current = handleNewMessage;
        chatService.onNewMessage(handleNewMessage);
        console.log('Set up message listener for chat:', chat._id);

        return () => {
            if (messageCallbackRef.current) {
                chatService.removeMessageCallback(messageCallbackRef.current);
                messageCallbackRef.current = null;
            }
        };
    }, [chat, currentUser]);

    const loadMessages = async () => {
        if (!chat) return;
        
        setLoading(true);
        try {
            const otherParticipant = getOtherParticipant();
            console.log('Loading messages between:', currentUser, 'and', otherParticipant);
            
            let fetchedMessages = await chatService.getMessages(
                currentUser.toLowerCase(), 
                otherParticipant.toLowerCase()
            );
            
            // Log the number of messages received
            console.log('Received messages from API:', fetchedMessages?.length || 0);
            
            console.log('Fetched messages:', fetchedMessages);
            console.log('Fetched messages type:', typeof fetchedMessages);
            console.log('Is array:', Array.isArray(fetchedMessages));
            
            if (!Array.isArray(fetchedMessages)) {
                console.error('Fetched messages is not an array:', fetchedMessages);
                setMessages([]);
                return;
            }
            
            // Log each message for debugging
            fetchedMessages.forEach((msg, index) => {
                console.log(`Message ${index}:`, {
                    id: msg._id,
                    from: msg.from,
                    to: msg.to,
                    message: msg.message,
                    timestamp: msg.timestamp
                });
            });
            
            // Messages are already sorted by the backend in ascending order
            console.log('Setting messages state with', fetchedMessages.length, 'messages');
            setMessages(fetchedMessages);
        } catch (error) {
            console.error('Failed to load messages:', error);
            setMessages([]); // Clear messages on error
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !chat || sendingMessage) {
            console.log('Cannot send message:', { 
                hasMessage: !!newMessage.trim(), 
                hasChat: !!chat, 
                sendingMessage 
            });
            return;
        }

        const otherParticipant = getOtherParticipant();
        const messageText = newMessage.trim();
        
        console.log('Sending message:', {
            to: otherParticipant,
            message: messageText,
            from: currentUser,
            chat: chat._id
        });

        setSendingMessage(true);
        
        try {
            // Check if socket is connected
            if (!chatService.isSocketConnected()) {
                throw new Error('Chat service is not connected');
            }

            // Optimistically add message to UI immediately
            const optimisticMessage: ChatMessageType = {
                _id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                from: currentUser.toLowerCase(),
                to: otherParticipant.toLowerCase(),
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
            
            // Restore the message text
            setNewMessage(messageText);
            
            // Show error to user
            alert(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setSendingMessage(false);
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/50" style={{ minHeight: '200px' }}>
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <p className="text-gray-400 mt-2">Loading messages...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <div className="w-16 h-16 bg-gray-700 border border-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">💬</span>
                        </div>
                        <p>No messages yet</p>
                        <p className="text-sm">Start the conversation!</p>
                    </div>
                ) : (
                    <>
                        {console.log('Rendering messages:', messages.length, 'messages')}
                        {messages.map((message, index) => {
                            console.log(`Rendering message ${index}:`, message);
                            return (
                                <ChatMessage
                                    key={`${message._id || `${message.timestamp}-${index}`}-${message.from}`}
                                    message={message}
                                    currentUser={currentUser}
                                />
                            );
                        })}
                    </>
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
                        disabled={!newMessage.trim() || sendingMessage}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        {sendingMessage ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <Send size={20} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
