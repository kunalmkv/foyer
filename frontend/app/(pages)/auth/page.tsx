'use client';

import React, { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSignMessage } from 'wagmi';
import { getUniversalLink } from "@selfxyz/core";
import {
    SelfQRcodeWrapper,
    SelfAppBuilder,
    type SelfApp,
} from "@selfxyz/qrcode";
import {baseurl} from "@/app/consts";

interface AuthStep {
    WALLET_CONNECT: 'wallet-connect';
    NONCE_VERIFICATION: 'nonce-verification';
    SELF_VERIFICATION: 'self-verification';
    COMPLETED: 'completed';
}

const AUTH_STEPS: AuthStep = {
    WALLET_CONNECT: 'wallet-connect',
    NONCE_VERIFICATION: 'nonce-verification',
    SELF_VERIFICATION: 'self-verification',
    COMPLETED: 'completed'
};

function AuthPage() {
    const { address, isConnected } = useAccount();
    const { signMessage, isPending: isSigningPending } = useSignMessage();

    const [currentStep, setCurrentStep] = useState<keyof AuthStep>('WALLET_CONNECT');
    const [nonce, setNonce] = useState<string>('');
    const [authToken, setAuthToken] = useState<string>('');
    const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
    const [universalLink, setUniversalLink] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset state when wallet disconnects
    useEffect(() => {
        if (!isConnected) {
            setCurrentStep('WALLET_CONNECT');
            setNonce('');
            setAuthToken('');
            setSelfApp(null);
            setUniversalLink('');
            setError(null);
        }
    }, [isConnected]);

    // Auto-proceed to nonce verification when wallet connects
    useEffect(() => {
        if (isConnected && address && currentStep === 'WALLET_CONNECT') {
            handleGetNonce();
        }
    }, [isConnected, address, currentStep]);

    const handleGetNonce = async () => {
        if (!address) return;

        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`${baseurl}/user/${address}/nonce`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to get nonce');
            }

            setNonce(data.nonce);
            setCurrentStep('NONCE_VERIFICATION');
        } catch (error) {
            console.error('Failed to get nonce:', error);
            setError(error instanceof Error ? error.message : 'Failed to get nonce');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignNonce = async () => {
        if (!address || !nonce) return;

        try {
            setIsLoading(true);
            setError(null);

            signMessage(
                { message: nonce },
                {
                    onSuccess: async (signature) => {
                        await validateNonce(signature);
                    },
                    onError: (error) => {
                        console.error('Signature error:', error);
                        setError('Failed to sign message');
                        setIsLoading(false);
                    }
                }
            );
        } catch (error) {
            console.error('Failed to sign nonce:', error);
            setError('Failed to sign message');
            setIsLoading(false);
        }
    };

    const validateNonce = async (signature: string) => {
        try {
            const response = await fetch(`${baseurl}/user/validate/nonce`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userAddress: address,
                    signature: signature
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to validate signature');
            }

            setAuthToken(data.token);
            await initializeSelfApp();
        } catch (error) {
            console.error('Failed to validate nonce:', error);
            setError(error instanceof Error ? error.message : 'Failed to validate signature');
        } finally {
            setIsLoading(false);
        }
    };

    const initializeSelfApp = async () => {
        try {
            setIsLoading(true);
            setCurrentStep('SELF_VERIFICATION');

            const app = new SelfAppBuilder({
                version: 2,
                appName: "Foyer",
                scope: "foyer-test",
                endpoint: "0x1da4235ba09377415cb5105a7d4749b152cc63af".toLowerCase(),
                logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
                userId: address,
                endpointType: "staging_celo",
                userIdType: "hex",
                userDefinedData: "Foyer Identity Verification",
                disclosures: {
                    ofac: true,
                    minimumAge: 12,
                    excludedCountries: ["ISR"]
                }
            }).build();

            setSelfApp(app);
            setUniversalLink(getUniversalLink(app));
            setError(null);
        } catch (error) {
            console.error("Failed to initialize Self app:", error);
            setError("Failed to initialize verification. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuccessfulVerification = async () => {
        try {
            console.log("Self verification successful!");
            setCurrentStep("COMPLETED")

        } catch (error) {
            console.error("Failed to update verification status:", error);
            setError("Failed to complete verification");
        }
    };

    const handleVerificationError = () => {
        console.error("Error: Failed to verify identity");
        setError("Verification failed. Please try scanning the QR code again.");
    };

    const renderWalletConnect = () => (
        <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Connect Your Wallet</h3>
            <p className="text-gray-300 mb-6">
                Connect your wallet to begin the authentication process
            </p>
            <ConnectButton />
        </div>
    );

    const renderNonceVerification = () => (
        <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Sign Message</h3>
            <p className="text-gray-300 mb-6">
                Sign a message to verify wallet ownership
            </p>
            <div className="bg-slate-700/50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-300 break-all">
                    <strong>Message:</strong> {nonce}
                </p>
            </div>
            <button
                onClick={handleSignNonce}
                disabled={isLoading || isSigningPending}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
                {isLoading || isSigningPending ? (
                    <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing...
                    </div>
                ) : (
                    'Sign Message'
                )}
            </button>
        </div>
    );

    const renderSelfVerification = () => (
        <div className="text-center">
            {isLoading ? (
                <div className="py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <p className="text-gray-300 font-medium">Generating QR Code...</p>
                    <p className="text-gray-400 text-sm mt-1">Please wait a moment</p>
                </div>
            ) : selfApp ? (
                <>
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-white mb-2">Identity Verification</h3>
                        <p className="text-gray-300 text-sm mb-4">
                            Scan the QR code with the Self app to complete your identity verification
                        </p>
                    </div>

                    <div className="bg-slate-700/30 rounded-2xl p-6 mb-6 inline-block">
                        <SelfQRcodeWrapper
                            selfApp={selfApp}
                            onSuccess={handleSuccessfulVerification}
                            onError={()=>{}}
                        />
                    </div>

                    <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-4 mb-6">
                        <h4 className="font-semibold text-white mb-3 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Verification Requirements
                        </h4>
                        <div className="space-y-2 text-left">
                            <div className="flex items-center text-sm text-gray-300">
                                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                                </svg>
                                Must be 18+ years old
                            </div>
                            <div className="flex items-center text-sm text-gray-300">
                                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                                </svg>
                                Nationality verification
                            </div>
                            <div className="flex items-center text-sm text-gray-300">
                                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                                </svg>
                                OFAC compliance check
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-gray-400 mb-2">
                            Don&#39;t have the Self app?
                        </p>
                        <a
                            href="#"
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                        >
                            Download from App Store
                        </a>
                    </div>
                </>
            ) : null}
        </div>
    );

    const renderCompleted = () => (
        <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                </svg>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">Verification Complete!</h3>
            <p className="text-gray-300 mb-6">
                Your identity has been successfully verified. You can now access all features.
            </p>
            <div className="bg-slate-700/50 border border-green-600/30 rounded-xl p-4">
                <p className="text-green-400 text-sm">
                    ✅ Wallet Connected<br/>
                    ✅ Signature Verified<br/>
                    ✅ Identity Verified
                </p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 flex items-center justify-center p-4">
            <div className="w-full max-w-lg mx-auto">
                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        {Object.keys(AUTH_STEPS).map((step, index) => {
                            const isActive = step === currentStep;
                            const isCompleted = Object.keys(AUTH_STEPS).indexOf(currentStep) > index;

                            return (
                                <div key={step} className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                        isCompleted ? 'bg-green-500 text-white' :
                                            isActive ? 'bg-blue-600 text-white' :
                                                'bg-gray-200 text-gray-600'
                                    }`}>
                                        {isCompleted ? '✓' : index + 1}
                                    </div>
                                    {index < Object.keys(AUTH_STEPS).length - 1 && (
                                        <div className={`w-12 h-1 ml-2 ${
                                            isCompleted ? 'bg-green-500' : 'bg-gray-200'
                                        }`}></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between text-xs text-gray-300">
                        <span>Connect</span>
                        <span>Verify</span>
                        <span>Identity</span>
                        <span>Complete</span>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-700 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-center">
                        <h1 className="text-2xl font-bold text-white mb-2">Authentication</h1>
                        <p className="text-blue-100 text-sm">Secure wallet and identity verification</p>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    <p className="text-red-700 text-sm">{error}</p>
                                </div>
                                <button
                                    onClick={() => setError(null)}
                                    className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
                                >
                                    Dismiss
                                </button>
                            </div>
                        )}

                        {currentStep === 'WALLET_CONNECT' && renderWalletConnect()}
                        {currentStep === 'NONCE_VERIFICATION' && renderNonceVerification()}
                        {currentStep === 'SELF_VERIFICATION' && renderSelfVerification()}
                        {currentStep === 'COMPLETED' && renderCompleted()}
                    </div>

                    {/* Footer */}
                    <div className="bg-slate-700/50 px-8 py-4 text-center">
                        <div className="flex items-center justify-center text-gray-300 text-xs">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                            </svg>
                            Secured by Foyer Protocol
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="mt-6 text-center">
                    <p className="text-gray-300 text-xs">
                        Your privacy is protected. Only required information will be verified and stored securely.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AuthPage;
