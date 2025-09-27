'use client'
import React, { useState, useEffect } from 'react';
import { Upload, ArrowRight, CheckCircle, AlertCircle, Loader, Calendar, Shield } from 'lucide-react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from 'wagmi';
import {ADMIN_MANAGER_ADDRESS, baseurl, EVENT_MANAGER_ADDRESS} from "@/app/consts";
import {eventManagerABI,adminManagerABI} from "@/app/consts/abi";
import { DatePicker } from "@/app/components/DatePicker";
interface FormData {
    name: string;
    description: string;
    venue: string;
    category: string;
    imageUrl: string;
    eventDateTime: string; // Added event date time
}

interface FormErrors {
    name?: string;
    description?: string;
    venue?: string;
    category?: string;
    imageUrl?: string;
    eventDateTime?: string;
    submit?: string;
}

type Step = 1 | 2;




const AdminMetadataPage: React.FC = () => {
    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        description: '',
        venue: '',
        category: '',
        imageUrl: '',
        eventDateTime: ''
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [metadataHash, setMetadataHash] = useState<string>('');
    const [contractCallStatus, setContractCallStatus] = useState<string>('');
    const [isCheckingAdmin, setIsCheckingAdmin] = useState<boolean>(false);

    // Wagmi hooks
    const { address, isConnected } = useAccount();
    const {
        data: hash,
        error: writeError,
        isPending: isWritePending,
        writeContract
    } = useWriteContract();

    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed,
        error: receiptError
    } = useWaitForTransactionReceipt({
        hash,
    });

    // Add admin check hook
    const {
        data: isAdmin,
        isLoading: adminCheckLoading,
        error: adminCheckError,
        refetch: refetchAdminStatus
    } = useReadContract({
        address: ADMIN_MANAGER_ADDRESS,
        abi: adminManagerABI,
        functionName: 'admin',
        args: [address],
        query: {
            enabled: !!address && isConnected,
        }
    });

    // Convert date-time string to Unix timestamp in seconds
    const dateTimeToUnixTimestamp = (dateTimeString: string): bigint => {
        const date = new Date(dateTimeString);
        return BigInt(Math.floor(date.getTime() / 1000));
    };

    // Get minimum date (current date + 1 hour) for validation
    const getMinDateTime = (): string => {
        const now = new Date();
        now.setHours(now.getHours() + 1); // Add 1 hour buffer
        return now.toISOString().slice(0, 16); // Format for datetime-local input
    };

    // Validation function
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.venue.trim()) newErrors.venue = 'Venue is required';
        if (!formData.category.trim()) newErrors.category = 'Category is required';

        if (!formData.eventDateTime.trim()) {
            newErrors.eventDateTime = 'Event date and time is required';
        } else {
            const selectedTime = new Date(formData.eventDateTime);
            const now = new Date();
            if (selectedTime <= now) {
                newErrors.eventDateTime = 'Event time must be in the future';
            }
        }

        if (!formData.imageUrl.trim()) {
            newErrors.imageUrl = 'Image URL is required';
        } else {
            try {
                new URL(formData.imageUrl);
            } catch {
                newErrors.imageUrl = 'Please enter a valid URL';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: keyof FormData, value: string): void => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleSubmitMetadata = async (): Promise<void> => {
        if (!validateForm()) return;

        setIsLoading(true);

        try {
            // Create metadata payload without eventDateTime
            const metadataPayload = {
                name: formData.name,
                description: formData.description,
                venue: formData.venue,
                category: formData.category,
                imageUrl: formData.imageUrl
            };

            const response = await fetch(`${baseurl}/event/metadata/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(metadataPayload),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const {metadataUrl} = await response.json();
            setMetadataHash(metadataUrl);
            setCurrentStep(2);
        } catch (error) {
            console.error('Error uploading metadata:', error);
            setErrors({ submit: 'Failed to upload metadata. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleContractCall = async (): Promise<void> => {
        if (!isConnected) {
            setContractCallStatus('Please connect your wallet first.');
            return;
        }

        try {
            setContractCallStatus('Preparing transaction...');

            // Convert date to Unix timestamp
            const eventTimestamp = dateTimeToUnixTimestamp(formData.eventDateTime);

            console.log('Event timestamp:', eventTimestamp.toString());
            console.log('Metadata URI:', metadataHash);
            console.log('User address:', address);

            setContractCallStatus('Calling createEvent function...');

            // Call createEvent function using wagmi
            writeContract({
                address: EVENT_MANAGER_ADDRESS,
                abi: eventManagerABI,
                functionName: 'createEvent',
                args: [eventTimestamp, metadataHash],
            });

        } catch (error: any) {
            console.error('Contract call preparation failed:', error);
            let errorMessage = 'Failed to prepare transaction. ';

            if (error.message?.includes('User rejected')) {
                errorMessage += 'Transaction was rejected by user.';
            } else {
                errorMessage += error.message || 'Please try again.';
            }

            setContractCallStatus(errorMessage);
        }
    };

    // Handle transaction status updates
    React.useEffect(() => {
        if (writeError) {
            let errorMessage = 'Transaction failed. ';

            if (writeError.message?.includes('User denied')) {
                errorMessage += 'Transaction was rejected by user.';
            } else if (writeError.message?.includes('insufficient funds')) {
                errorMessage += 'Insufficient funds for gas.';
            } else if (writeError.message?.includes('Caller is not an admin')) {
                errorMessage += 'Only admins can create events.';
            } else if (writeError.message?.includes('Event time must be in the future')) {
                errorMessage += 'Event time must be in the future.';
            } else {
                errorMessage += writeError.message || 'Please try again.';
            }

            setContractCallStatus(errorMessage);
        }
    }, [writeError]);

    React.useEffect(() => {
        if (hash) {
            setContractCallStatus(`Transaction submitted! Hash: ${hash}`);
        }
    }, [hash]);

    React.useEffect(() => {
        if (isConfirming) {
            setContractCallStatus('Waiting for transaction confirmation...');
        }
    }, [isConfirming]);

    React.useEffect(() => {
        if (isConfirmed) {
            setContractCallStatus('Event created successfully! Transaction confirmed.');
        }
    }, [isConfirmed]);

    React.useEffect(() => {
        if (receiptError) {
            setContractCallStatus(`Transaction failed: ${receiptError.message}`);
        }
    }, [receiptError]);

    // Effect to refetch admin status when address changes
    useEffect(() => {
        if (address && isConnected) {
            refetchAdminStatus();
        }
    }, [address, isConnected, refetchAdminStatus]);

    const resetForm = (): void => {
        setCurrentStep(1);
        setFormData({
            name: '',
            description: '',
            venue: '',
            category: '',
            imageUrl: '',
            eventDateTime: ''
        });
        setErrors({});
        setMetadataHash('');
        setContractCallStatus('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 p-6">
            <div className="max-w-2xl mx-auto">
                <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-2xl shadow-2xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-6">
                            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mr-4">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Admin Event Creation</h1>
                        </div>
                         {isConnected && (
                            <div className="mb-6">
                                {adminCheckLoading ? (
                                    <div className="flex items-center justify-center text-gray-400">
                                        <Loader className="w-5 h-5 animate-spin mr-2" />
                                        <span className="font-medium">Checking admin access...</span>
                                    </div>
                                ) : isAdmin ? (
                                    <div className="flex items-center justify-center text-green-400">
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        <span className="font-medium">Admin access verified</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center text-red-400">
                                        <AlertCircle className="w-5 h-5 mr-2" />
                                        <span className="font-medium">Admin access required</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {isConnected && isAdmin==true && (
                            <div className="flex justify-center items-center space-x-6 text-sm">
                                <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-400' : 'text-gray-500'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 font-semibold ${
                                        currentStep >= 1 ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'bg-gray-700 text-gray-400'
                                    }`}>1</div>
                                    <span className="font-medium">Upload Metadata</span>
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-500" />
                                <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-400' : 'text-gray-500'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 font-semibold ${
                                        currentStep >= 2 ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'bg-gray-700 text-gray-400'
                                    }`}>2</div>
                                    <span className="font-medium">Create Event</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Wallet Connection Status */}
                    {!isConnected && (
                        <div className="mb-6 bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-500/30 rounded-2xl p-6 backdrop-blur-sm">
                            <div className="text-center">
                                <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl w-fit mx-auto mb-4">
                                    <AlertCircle className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-amber-300 mb-2">Wallet Connection Required</h3>
                                <p className="text-amber-200 mb-4">Please connect your wallet to access the admin panel</p>
                                <button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                                    Connect Wallet
                                </button>
                            </div>
                        </div>
                    )}

                    {isConnected && !adminCheckLoading && isAdmin === false && (
                        <div className="mb-6 bg-gradient-to-r from-red-900/20 to-pink-900/20 border border-red-500/30 rounded-2xl p-6 backdrop-blur-sm">
                            <div className="text-center">
                                <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl w-fit mx-auto mb-4">
                                    <AlertCircle className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-red-300 mb-2">Access Denied</h3>
                                <p className="text-red-200 mb-2">Your wallet address does not have admin privileges.</p>
                                <p className="text-red-300 text-sm mb-4">Only admin accounts can create events.</p>
                                <div className="p-4 bg-gray-800/50 border border-red-500/20 rounded-xl">
                                    <p className="text-xs text-gray-400 mb-1">Connected Address:</p>
                                    <code className="text-xs text-gray-300 break-all font-mono">{address}</code>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Contract Error */}
                    {adminCheckError && (
                        <div className="mb-6 bg-gradient-to-r from-red-900/20 to-pink-900/20 border border-red-500/30 rounded-2xl p-6 backdrop-blur-sm">
                            <div className="text-center">
                                <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl w-fit mx-auto mb-4">
                                    <AlertCircle className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-red-300 mb-2">Contract Error</h3>
                                <p className="text-red-200 mb-2">Unable to verify admin status</p>
                                <p className="text-red-300 text-sm mb-4">Please check if the contract address is correct and try again.</p>
                                <button
                                    onClick={() => refetchAdminStatus()}
                                    className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Loading State for Admin Check */}
                    {adminCheckLoading && (
                        <div className="mb-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-2xl p-6 backdrop-blur-sm">
                            <div className="text-center">
                                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl w-fit mx-auto mb-4">
                                    <Loader className="w-8 h-8 text-white animate-spin" />
                                </div>
                                <h3 className="text-xl font-semibold text-blue-300 mb-2">Verifying Access</h3>
                                <p className="text-blue-200">Checking your admin privileges...</p>
                            </div>
                        </div>
                    )}

                    {/* Main Content - Only show if user is admin */}
                    {isConnected && isAdmin && !adminCheckLoading && (
                        <>
                            {/* Step 1: Form */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Event Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                handleInputChange('name', e.target.value)
                                            }
                                            className={`w-full px-4 py-3 bg-gray-700/50 border backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white placeholder-gray-400 ${
                                                errors.name ? 'border-red-500' : 'border-gray-600'
                                            }`}
                                            placeholder="Enter event name"
                                        />
                                        {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Event Date & Time *
                                        </label>
                                        <DatePicker
                                            value={formData.eventDateTime}
                                            onChange={(value) => handleInputChange('eventDateTime', value)}
                                            minDateTime={getMinDateTime()}
                                            error={!!errors.eventDateTime}
                                        />
                                        {errors.eventDateTime && <p className="text-red-400 text-sm mt-1">{errors.eventDateTime}</p>}
                                        {formData.eventDateTime && (
                                            <p className="text-xs text-gray-400 mt-1 font-mono">
                                                Unix timestamp: {dateTimeToUnixTimestamp(formData.eventDateTime).toString()}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Description *
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                                handleInputChange('description', e.target.value)
                                            }
                                            rows={4}
                                            className={`w-full px-4 py-3 bg-gray-700/50 border backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white placeholder-gray-400 resize-none ${
                                                errors.description ? 'border-red-500' : 'border-gray-600'
                                            }`}

                                            placeholder="Enter event description"
                                        />
                                        {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Venue *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.venue}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                handleInputChange('venue', e.target.value)
                                            }
                                            className={`w-full px-4 py-3 bg-gray-700/50 border backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white placeholder-gray-400 ${
                                                errors.venue ? 'border-red-500' : 'border-gray-600'
                                            }`}
                                            placeholder="Enter venue name"
                                        />
                                        {errors.venue && <p className="text-red-400 text-sm mt-1">{errors.venue}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Category *
                                        </label>
                                        <select
                                            value={formData.category}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                                handleInputChange('category', e.target.value)
                                            }
                                            className={`w-full px-4 py-3 bg-gray-700/50 border backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white ${
                                                errors.category ? 'border-red-500' : 'border-gray-600'
                                            }`}
                                        >
                                            <option value="" className="bg-gray-800">Select a category</option>
                                            <option value="MUSIC" className="bg-gray-800">🎤 MUSIC</option>
                                            <option value="EDUCATION" className="bg-gray-800">📚 EDUCATION</option>
                                            <option value="SPORTS" className="bg-gray-800">🏈 SPORTS</option>
                                            <option value="COMEDY" className="bg-gray-800">🎭 COMEDY</option>
                                        </select>
                                        {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Image URL *
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.imageUrl}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                handleInputChange('imageUrl', e.target.value)
                                            }
                                            className={`w-full px-4 py-3 bg-gray-700/50 border backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white placeholder-gray-400 ${
                                                errors.imageUrl ? 'border-red-500' : 'border-gray-600'
                                            }`}
                                            placeholder="https://example.com/image.jpg"
                                        />
                                        {errors.imageUrl && <p className="text-red-400 text-sm mt-1">{errors.imageUrl}</p>}
                                    </div>

                                    {errors.submit && (
                                        <div className="bg-gradient-to-r from-red-900/20 to-pink-900/20 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm">
                                            <div className="flex items-center">
                                                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                                                <p className="text-red-300">{errors.submit}</p>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleSubmitMetadata}
                                        disabled={isLoading}
                                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                                    >
                                        {isLoading ? (
                                            <Loader className="w-5 h-5 animate-spin mr-2" />
                                        ) : (
                                            <Upload className="w-5 h-5 mr-2" />
                                        )}
                                        {isLoading ? 'Uploading...' : 'Upload Metadata'}
                                    </button>
                                </div>
                            )}

                            {/* Step 2: Contract Call */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-2xl p-6 backdrop-blur-sm">
                                        <div className="flex items-center mb-4">
                                            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl mr-3">
                                                <CheckCircle className="w-6 h-6 text-white" />
                                            </div>
                                            <h3 className="text-xl font-semibold text-green-300">Metadata Uploaded Successfully!</h3>
                                        </div>
                                        <div className="bg-gray-800/50 rounded-xl p-4 border border-green-500/20 mb-4">
                                            <p className="text-sm text-gray-400 mb-2">Metadata Hash:</p>
                                            <code className="text-sm bg-gray-700/50 text-green-300 px-3 py-2 rounded-lg break-all font-mono">{metadataHash}</code>
                                        </div>
                                        <div className="bg-gray-800/50 rounded-xl p-4 border border-green-500/20">
                                            <p className="text-sm text-gray-400 mb-2">Event Timestamp:</p>
                                            <code className="text-sm bg-gray-700/50 text-green-300 px-3 py-2 rounded-lg font-mono">
                                                {formData.eventDateTime ? dateTimeToUnixTimestamp(formData.eventDateTime).toString() : ''}
                                            </code>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xl font-semibold text-white">Step 2: Create Event on Blockchain</h3>
                                        <p className="text-gray-300">
                                            Now create the event on the blockchain using the uploaded metadata and selected date/time.
                                        </p>

                                        <button
                                            onClick={handleContractCall}
                                            disabled={!isConnected || isWritePending || isConfirming}
                                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                                        >
                                            {(isWritePending || isConfirming) ? (
                                                <Loader className="w-5 h-5 animate-spin mr-2" />
                                            ) : null}
                                            {isWritePending
                                                ? 'Preparing Transaction...'
                                                : isConfirming
                                                    ? 'Confirming...'
                                                    : 'Create Event'}
                                        </button>

                                        {contractCallStatus && (
                                            <div className={`p-4 rounded-xl backdrop-blur-sm ${
                                                contractCallStatus.includes('successfully') || contractCallStatus.includes('confirmed')
                                                    ? 'bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 text-green-300'
                                                    : contractCallStatus.includes('failed') || contractCallStatus.includes('rejected')
                                                        ? 'bg-gradient-to-r from-red-900/20 to-pink-900/20 border border-red-500/30 text-red-300'
                                                        : 'bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 text-blue-300'
                                            }`}>
                                                <p className="break-all font-medium">{contractCallStatus}</p>
                                            </div>
                                        )}

                                        {hash && (
                                            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl p-4 backdrop-blur-sm">
                                                <p className="text-sm text-blue-300 mb-2 font-medium">Transaction Hash:</p>
                                                <code className="text-sm bg-gray-800/50 text-blue-300 px-3 py-2 rounded-lg break-all font-mono">{hash}</code>
                                            </div>
                                        )}

                                        <div className="pt-4">
                                            <button
                                                onClick={resetForm}
                                                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                            >
                                                Create Another Event
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminMetadataPage;
