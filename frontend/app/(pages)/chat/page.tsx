'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Chat } from '@/app/types/Chat';
import { chatService } from '@/app/service/chat.service';
import { ChatList } from './components/ChatList';
import { ChatWindow } from './components/ChatWindow';
import { RefreshCw } from 'lucide-react';

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

    // Refresh chats when the page becomes visible (user returns to tab/page)
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (!document.hidden && isConnected && address) {
                console.log('Page became visible, refreshing chats...');
                await loadChats();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isConnected, address]);

    // Listen for new messages and refresh chat list
    useEffect(() => {
        if (!isConnected || !address) return;

        const handleNewMessage = async () => {
            console.log('New message received, refreshing chat list...');
            // Refresh chat list when new messages arrive
            await loadChats();
        };

        chatService.onNewMessage(handleNewMessage);
        
        // Note: chatService.onNewMessage doesn't provide a cleanup function
        // In a real implementation, you'd want to add a removeListener method
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
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🔒</span>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">Connect Your Wallet</h3>
                    <p className="text-gray-300">Please connect your wallet to access chat</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-300">Loading chats...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error}</p>
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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">
            <div className="container mx-auto px-8 py-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Messages</h1>
                        <p className="text-gray-300">Chat with buyers and sellers</p>
                    </div>
                    <button
                        onClick={loadChats}
                        disabled={loading}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>

                {/* Chat Interface */}
                <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700 overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
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
