'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Chat } from '@/app/types/Chat';
import { chatService } from '@/app/service/chat.service';
import { ChatList } from './components/ChatList';
import { ChatWindow } from './components/ChatWindow';

export default function ChatPage() {
    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { address, isConnected } = useAccount();

    useEffect(() => {
        if (isConnected && address) {
            loadChats();
            connectToChat();
        }
    }, [isConnected, address]);

    const loadChats = async () => {
        if (!address) return;
        
        try {
            setLoading(true);
            const userChats = await chatService.getChats(address);
            setChats(userChats);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load chats');
        } finally {
            setLoading(false);
        }
    };

    const connectToChat = () => {
        if (address) {
            chatService.connectToChat(address);
        }
    };

    const handleChatSelect = (chat: Chat) => {
        setSelectedChat(chat);
    };

    const handleBack = () => {
        setSelectedChat(null);
    };

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-[#E8DFCA] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🔒</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
                    <p className="text-gray-500">Please connect your wallet to access chat</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#E8DFCA] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading chats...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#E8DFCA] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button 
                        onClick={loadChats}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#E8DFCA]">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
                    <p className="text-gray-600">Chat with buyers and sellers</p>
                </div>

                {/* Chat Interface */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
                    <div className="flex h-full">
                        {/* Chat List - Hidden on mobile when chat is selected */}
                        <div className={`${selectedChat ? 'hidden lg:block' : 'block'} lg:w-1/3`}>
                            <ChatList
                                chats={chats}
                                currentUser={address || ''}
                                onChatSelect={handleChatSelect}
                                selectedChatId={selectedChat?._id}
                            />
                        </div>

                        {/* Chat Window */}
                        <div className={`${selectedChat ? 'block' : 'hidden lg:block'} flex-1`}>
                            <ChatWindow
                                chat={selectedChat}
                                currentUser={address || ''}
                                onBack={handleBack}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
