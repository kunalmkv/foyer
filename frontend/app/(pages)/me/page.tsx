'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { MySales } from './components/MySales';
import { MyListings } from './components/MyListings';
import { MyOrders } from './components/MyOrders';
import { ShoppingCart, Package, DollarSign, User } from 'lucide-react';

type TabType = 'sales' | 'listings' | 'orders';

export default function MyselfPage() {
    const [activeTab, setActiveTab] = useState<TabType>('listings');
    const { address, isConnected } = useAccount();

    const tabs = [
        {
            id: 'listings' as TabType,
            label: 'My Listings',
            icon: Package,
            description: 'Your active ticket listings'
        },
        {
            id: 'sales' as TabType,
            label: 'My Sales',
            icon: DollarSign,
            description: 'Your completed sales'
        },
        {
            id: 'orders' as TabType,
            label: 'My Orders',
            icon: ShoppingCart,
            description: 'Your ticket purchases'
        }
    ];

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <User size={64} className="text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
                    <p className="text-gray-300">Please connect your wallet to view your account information</p>
                </div>
            </div>
        );
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'sales':
                return <MySales userAddress={address!} />;
            case 'listings':
                return <MyListings userAddress={address!} />;
            case 'orders':
                return <MyOrders userAddress={address!} />;
            default:
                return <MyListings userAddress={address!} />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">
            <div className="container mx-auto px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">My Account</h1>
                    <p className="text-gray-300">Manage your tickets, sales, and orders</p>
                    <div className="mt-2 text-sm text-gray-400">
                        Wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Sidebar */}
                    <div className="w-80 flex-shrink-0">
                        <nav className="space-y-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full text-left p-4 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                                            activeTab === tab.id
                                                ? 'bg-blue-600 text-white shadow-lg'
                                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                                        }`}
                                    >
                                        <Icon size={20} />
                                        <div>
                                            <div className="font-medium">{tab.label}</div>
                                            <div className={`text-xs ${
                                                activeTab === tab.id ? 'text-blue-100' : 'text-gray-400'
                                            }`}>
                                                {tab.description}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}