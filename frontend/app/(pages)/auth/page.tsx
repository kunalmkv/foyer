'use client';

import React, { useState, useEffect } from 'react';
import { getUniversalLink } from "@selfxyz/core";
import {
    SelfQRcodeWrapper,
    SelfAppBuilder,
    type SelfApp,
} from "@selfxyz/qrcode";
import { ethers } from "ethers";
function VerificationPage() {
    const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
    const [universalLink, setUniversalLink] = useState("");
    const [userId] = useState(ethers.ZeroAddress);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                setIsLoading(true);
                const app = new SelfAppBuilder({
                    version: 2,
                    appName: "Foyer",
                    devMode: true,
                    scope:  "foyer-test",
                    endpoint: "0x72249832554C06f829Dc0C606E7d4926FA33415B",
                    logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
                    userId: "0x0000000000000000000000000000000000000000",
                    endpointType: "staging_celo",
                    chainID:44787,
                    userIdType: "hex",
                    userDefinedData: "Hello World",
                    disclosures: {
                        ofac:false,
                        minimumAge:0,
                        excludedCountries:[]
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

        initializeApp();
    }, [userId]);

    const handleSuccessfulVerification = () => {
        console.log("Verification successful!");

    };

    const handleVerificationError = () => {
        console.error("Error: Failed to verify identity");
        setError("Verification failed. Please try scanning the QR code again.");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg mx-auto flex items-center justify-center min-h-screen">
                <div className="w-full max-w-md">
                    {/* Main Card */}
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-10 text-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">Verify Your Identity</h1>
                            <p className="text-blue-100 text-sm">Secure verification using Self protocol</p>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-red-700 text-sm">{error}</p>
                                    </div>
                                </div>
                            )}

                            {isLoading ? (
                                <div className="text-center py-12">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                                        <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </div>
                                    <p className="text-gray-600 font-medium">Generating QR Code...</p>
                                    <p className="text-gray-400 text-sm mt-1">Please wait a moment</p>
                                </div>
                            ) : selfApp ? (
                                <div className="text-center">
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Scan with Self App</h3>
                                        <p className="text-gray-600 text-sm mb-4">
                                            Open the Self app on your mobile device and scan this QR code to verify your identity
                                        </p>
                                    </div>

                                    {/* QR Code Container */}
                                    <div className="bg-gray-50 rounded-2xl p-6 mb-6 inline-block">
                                        <SelfQRcodeWrapper
                                            selfApp={selfApp}
                                            onSuccess={handleSuccessfulVerification}
                                            onError={handleVerificationError}
                                        />
                                    </div>

                                    {/* Requirements */}
                                    <div className="bg-blue-50 rounded-xl p-4 mb-6">
                                        <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Verification Requirements
                                        </h4>
                                        <div className="space-y-2 text-left">
                                            <div className="flex items-center text-sm text-blue-800">
                                                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Must be 18+ years old
                                            </div>
                                            <div className="flex items-center text-sm text-blue-800">
                                                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Nationality verification
                                            </div>
                                            <div className="flex items-center text-sm text-blue-800">
                                                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Gender information
                                            </div>
                                        </div>
                                    </div>

                                    {/* Help Text */}
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 mb-2">
                                            Don&#39;t have the Self app?
                                        </p>
                                        <a
                                            href="#"
                                            className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                                        >
                                            Download from App Store
                                        </a>
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-8 py-4 text-center">
                            <div className="flex items-center justify-center text-gray-500 text-xs">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Secured by Self Protocol
                            </div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-500 text-xs">
                            Your privacy is protected. Only the required information will be verified.
                        </p>
                    </div>
                </div>
            </div>
        </div>
            );
            }
            export default VerificationPage;
