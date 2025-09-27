'use client';

import { User, Wallet, LogIn } from "lucide-react";
import { ConnectButton } from '@rainbow-me/rainbowkit';

import Image from 'next/image';

export const Header = () => {
    return (
        <nav className="flex w-full bg-gray-900/95 backdrop-blur-md justify-between items-center px-8 py-6 shadow-2xl border-b border-gray-700/50">
            <div className="flex gap-8 items-center">
                <Image
                    src="/foyer_vector_logo.png"
                    alt="Foyer Logo"
                    width={120}
                    height={40}
                    className="w-32 h-10 object-contain brightness-0 invert"
                    priority
                    unoptimized
                />
                <div className="hidden md:flex gap-8">

                </div>
            </div>
            <div className="flex gap-6 items-center">
                <a href="#" className="text-gray-300 hover:text-white transition-all duration-200 font-medium px-3 py-2 rounded-lg hover:bg-gray-800">Explore</a>
                <a href="/sell" className="text-gray-300 hover:text-white transition-all duration-200 font-medium px-3 py-2 rounded-lg hover:bg-gray-800">Sell</a>
                <a href="/buy" className="text-gray-300 hover:text-white transition-all duration-200 font-medium px-3 py-2 rounded-lg hover:bg-gray-800">Buy</a>
                <Link href="/auth" className="text-gray-300 hover:text-white transition-all duration-200 font-medium px-3 py-2 rounded-lg hover:bg-gray-800">Authentication</Link>

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
                                            <Link
                                                href="/auth"
                                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                                            >
                                                <LogIn size={16} />
                                                Sign In
                                            </Link>
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
