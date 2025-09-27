'use client';

import { User, Wallet } from "lucide-react";
import { ConnectButton } from '@rainbow-me/rainbowkit';

export const Header = () => {
    return (
        <nav className="flex w-full bg-[#F5EFE6] backdrop-blur-sm justify-between items-center px-8 py-4 shadow-sm border-b border-gray-100">
            <div className="flex gap-8 items-center">
                <h1 className="font-bold text-3xl text-gray-900">TicketHub</h1>
                <div className="hidden md:flex gap-6">
                    <a href="/" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Events</a>
                    <a href="/proposals" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Proposals</a>
                    <a href="/chat" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Messages</a>
                    <a href="/sell" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Sell</a>
                    <a href="/admin" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Admin</a>
                </div>
            </div>
            <div className="flex gap-6 items-center">
                <a href="/" className="text-gray-700 hover:text-blue-600 transition-colors">Explore</a>
                <a href="/proposals" className="text-gray-700 hover:text-blue-600 transition-colors">Proposals</a>
                <a href="/chat" className="text-gray-700 hover:text-blue-600 transition-colors">Messages</a>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">My Tickets</a>

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
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
                                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                                            >
                                                Wrong network
                                            </button>
                                        );
                                    }

                                    return (
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={openChainModal}
                                                className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
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
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
