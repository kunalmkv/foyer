'use client';

import {User, Wallet, LogIn} from "lucide-react";
import {ConnectButton} from '@rainbow-me/rainbowkit';
import Link from "next/link";
import Image from 'next/image';

export const Header = () => {
    return (
        <nav
            className="flex w-full bg-gray-900/95 backdrop-blur-md justify-between items-center px-8 py-6 shadow-2xl border-b border-gray-700/50">
            <div className="flex gap-8 items-center">
                <Link href={"/"}>
                    <Image
                        src="/foyer_vector_logo.png"
                        alt="Foyer Logo"
                        width={120}
                        height={40}
                        className="w-32 h-10 object-contain brightness-0 invert"
                        priority
                        unoptimized
                    />
                </Link>
                <div className="hidden md:flex gap-8">

                </div>
            </div>
            <div className="flex gap-6 items-center">
                <Link href="/me" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-gray-800">My Account</Link>

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
                                                className="border border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white px-6 py-3 rounded-xl transition-colors duration-200 flex items-center gap-2"
                                            >
                                                <LogIn size={16}/>
                                                Sign In
                                            </Link>
                                        );
                                    }

                                    if (chain.unsupported) {
                                        return (
                                            <button
                                                onClick={openChainModal}
                                                className="border border-red-600 text-red-400 hover:border-red-400 hover:text-red-300 px-6 py-3 rounded-xl transition-colors duration-200 flex items-center gap-2"
                                            >
                                                Wrong network
                                            </button>
                                        );
                                    }

                                    return (
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={openAccountModal}
                                                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-gray-800"
                                            >
                                                <User size={16}/>
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
