'use client';

import { User, Wallet } from "lucide-react";
import { ConnectButton } from '@rainbow-me/rainbowkit';

export const Header = () => {
    return (
        <nav className="flex w-full bg-gray-900/95 backdrop-blur-md justify-between items-center px-8 py-6 shadow-2xl border-b border-gray-700/50">
            <div className="flex gap-8 items-center">
                <h1 className="font-bold text-3xl bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">TicketHub</h1>
                <div className="hidden md:flex gap-8">
                    <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors font-medium hover:scale-105 transform duration-200">🏈 Sports</a>
                    <a href="#" className="text-gray-300 hover:text-purple-400 transition-colors font-medium hover:scale-105 transform duration-200">🎤 Concerts</a>
                    <a href="#" className="text-gray-300 hover:text-pink-400 transition-colors font-medium hover:scale-105 transform duration-200">🎭 Theater</a>
                    <a href="#" className="text-gray-300 hover:text-green-400 transition-colors font-medium hover:scale-105 transform duration-200">🌆 Top Cities</a>
                </div>
            </div>
            <div className="flex gap-6 items-center">
                <a href="#" className="text-gray-300 hover:text-white transition-all duration-200 font-medium px-3 py-2 rounded-lg hover:bg-gray-800">Explore</a>
                <a href="#" className="text-gray-300 hover:text-white transition-all duration-200 font-medium px-3 py-2 rounded-lg hover:bg-gray-800">Sell</a>
                <a href="#" className="text-gray-300 hover:text-white transition-all duration-200 font-medium px-3 py-2 rounded-lg hover:bg-gray-800">My Tickets</a>

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
                        // Note: If your app doesn't use authentication, you
                        // can remove all 'authenticationStatus' checks
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
                                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                                            >
                                                <Wallet size={16} />
                                                Connect Wallet
                                            </button>
                                        );
                                    }

                                    if (chain.unsupported) {
                                        return (
                                            <button
                                                onClick={openChainModal}
                                                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center gap-2 shadow-lg"
                                            >
                                                Wrong network
                                            </button>
                                        );
                                    }

                                    return (
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={openChainModal}
                                                className="bg-gray-800 text-gray-200 px-4 py-2 rounded-xl hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 border border-gray-600"
                                            >
                                                {chain.hasIcon && (
                                                    <div
                                                        className="w-4 h-4 rounded-full overflow-hidden"
                                                    >
                                                        {chain.iconUrl && (
                                                            <img
                                                                alt={chain.name ?? 'Chain icon'}
                                                                src={chain.iconUrl}
                                                                className="w-4 h-4"
                                                            />
                                                        )}
                                                    </div>
                                                )}
                                                {chain.name}
                                            </button>

                                            <button
                                                onClick={openAccountModal}
                                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                                            >
                                                <User size={16} />
                                                {account.displayName}
                                                {account.displayBalance
                                                    ? ` (${account.displayBalance})`
                                                    : ''}
                                            </button>
                                        </div>
                                    );
                                })()}
                            </div>
                        );
                    }}
                </ConnectButton.Custom>
            </div>
        </nav>
    );
};