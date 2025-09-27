'use client';

import { useState } from 'react';
import { User, Wallet, Menu, X } from "lucide-react";
import { ConnectButton } from '@rainbow-me/rainbowkit';

export const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="flex w-full bg-[#F5EFE6] backdrop-blur-sm justify-between items-center px-4 sm:px-6 lg:px-8 py-4 shadow-sm border-b border-gray-100">
            {/* Logo and Desktop Navigation */}
            <div className="flex gap-4 sm:gap-8 items-center">
                <h1 className="font-bold text-2xl sm:text-3xl text-gray-900">TicketHub</h1>

                {/* Desktop Navigation Links */}
                <div className="hidden lg:flex gap-6">
                    <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Sports</a>
                    <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Concerts</a>
                    <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Theater</a>
                    <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Top Cities</a>
                </div>
            </div>

            {/* Desktop Right Side */}
            <div className="hidden md:flex gap-4 lg:gap-6 items-center">
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors text-sm lg:text-base">Explore</a>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors text-sm lg:text-base">Sell</a>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors text-sm lg:text-base">My Tickets</a>

                <ConnectButton.Custom>
                    {({
                          account,
                          chain,
                          openAccountModal,
                          openChainModal,
                          openConnectModal,
                          authenticationStatus,
                          mounted,
                      }) => {
                        const ready = mounted && authenticationStatus !== 'loading';
                        const connected =
                            ready &&
                            account &&
                            chain &&
                            (!authenticationStatus ||
                                authenticationStatus === 'authenticated');

                        return (
                            <div
                                {...(!ready && {
                                    'aria-hidden': true,
                                    'style': {
                                        opacity: 0,
                                        pointerEvents: 'none',
                                        userSelect: 'none',
                                    },
                                })}
                            >
                                {(() => {
                                    if (!connected) {
                                        return (
                                            <button
                                                onClick={openConnectModal}
                                                className="bg-blue-600 text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm lg:text-base"
                                            >
                                                <Wallet size={16} />
                                                <span className="hidden lg:inline">Connect Wallet</span>
                                                <span className="lg:hidden">Connect</span>
                                            </button>
                                        );
                                    }

                                    if (chain.unsupported) {
                                        return (
                                            <button
                                                onClick={openChainModal}
                                                className="bg-red-600 text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm lg:text-base"
                                            >
                                                Wrong network
                                            </button>
                                        );
                                    }

                                    return (
                                        <div className="flex items-center gap-2 lg:gap-3">
                                            <button
                                                onClick={openChainModal}
                                                className="bg-gray-100 text-gray-700 px-2 lg:px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm lg:text-base"
                                            >
                                                {chain.hasIcon && (
                                                    <div className="w-4 h-4 rounded-full overflow-hidden">
                                                        {chain.iconUrl && (
                                                            <img
                                                                alt={chain.name ?? 'Chain icon'}
                                                                src={chain.iconUrl}
                                                                className="w-4 h-4"
                                                            />
                                                        )}
                                                    </div>
                                                )}
                                                <span className="hidden lg:inline">{chain.name}</span>
                                            </button>

                                            <button
                                                onClick={openAccountModal}
                                                className="bg-blue-600 text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm lg:text-base"
                                            >
                                                <User size={16} />
                                                <span className="max-w-20 lg:max-w-none truncate">
                                                    {account.displayName}
                                                    {account.displayBalance && window.innerWidth >= 1024
                                                        ? ` (${account.displayBalance})`
                                                        : ''}
                                                </span>
                                            </button>
                                        </div>
                                    );
                                })()}
                            </div>
                        );
                    }}
                </ConnectButton.Custom>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
                {/* Mobile Connect Button */}
                <ConnectButton.Custom>
                    {({
                          account,
                          chain,
                          openAccountModal,
                          openChainModal,
                          openConnectModal,
                          authenticationStatus,
                          mounted,
                      }) => {
                        const ready = mounted && authenticationStatus !== 'loading';
                        const connected =
                            ready &&
                            account &&
                            chain &&
                            (!authenticationStatus ||
                                authenticationStatus === 'authenticated');

                        return (
                            <div
                                {...(!ready && {
                                    'aria-hidden': true,
                                    'style': {
                                        opacity: 0,
                                        pointerEvents: 'none',
                                        userSelect: 'none',
                                    },
                                })}
                            >
                                {(() => {
                                    if (!connected) {
                                        return (
                                            <button
                                                onClick={openConnectModal}
                                                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <Wallet size={16} />
                                            </button>
                                        );
                                    }

                                    if (chain.unsupported) {
                                        return (
                                            <button
                                                onClick={openChainModal}
                                                className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        );
                                    }

                                    return (
                                        <button
                                            onClick={openAccountModal}
                                            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <User size={16} />
                                        </button>
                                    );
                                })()}
                            </div>
                        );
                    }}
                </ConnectButton.Custom>

                <button
                    onClick={toggleMobileMenu}
                    className="text-gray-700 hover:text-blue-600 transition-colors p-2"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                        onClick={toggleMobileMenu}
                    />
                    <div className="absolute top-full left-0 right-0 bg-[#F5EFE6] border-b border-gray-100 shadow-lg z-50 md:hidden">
                        <div className="px-4 py-4 space-y-4">
                            {/* Mobile Navigation Links */}
                            <div className="space-y-3 pb-4 border-b border-gray-200">
                                <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors font-medium py-2">Sports</a>
                                <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors font-medium py-2">Concerts</a>
                                <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors font-medium py-2">Theater</a>
                                <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors font-medium py-2">Top Cities</a>
                            </div>

                            {/* Mobile Action Links */}
                            <div className="space-y-3">
                                <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors py-2">Explore</a>
                                <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors py-2">Sell</a>
                                <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors py-2">My Tickets</a>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </nav>
    );
};

export default Header;
