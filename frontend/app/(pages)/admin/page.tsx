'use client'
import React, { useState, useEffect } from 'react';
import { Upload, ArrowRight, CheckCircle, AlertCircle, Loader, Calendar, Shield } from 'lucide-react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from 'wagmi';
import {ADMIN_MANAGER_ADDRESS, baseurl, EVENT_MANAGER_ADDRESS} from "@/app/consts";
import {eventManagerABI,adminManagerABI} from "@/app/consts/abi"
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-4">
                            <Shield className="w-8 h-8 text-blue-600 mr-2" />
                            <h1 className="text-3xl font-bold text-gray-900">Admin Event Creation</h1>
                        </div>
                         {isConnected && (
                            <div className="mb-4">
                                {adminCheckLoading ? (
                                    <div className="flex items-center justify-center text-gray-500">
                                        <Loader className="w-4 h-4 animate-spin mr-2" />
                                        Checking admin access...
                                    </div>
                                ) : isAdmin ? (
                                    <div className="flex items-center justify-center text-green-600">
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Admin access verified
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center text-red-600">
                                        <AlertCircle className="w-4 h-4 mr-2" />
                                        Admin access required
                                    </div>
                                )}
                            </div>
                        )}

                        {isConnected && isAdmin==true && (
                            <div className="flex justify-center items-center space-x-4 text-sm text-gray-500">
                                <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                                        currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                                    }`}>1</div>
                                    Upload Metadata
                                </div>
                                <ArrowRight className="w-4 h-4" />
                                <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                                        currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-blue-200'
                                    }`}>2</div>
                                    Create Event
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Wallet Connection Status */}
                    {!isConnected && (
                        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                            <div className="text-center">
                                <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Wallet Connection Required</h3>
                                <p className="text-yellow-700 mb-4">Please connect your wallet to access the admin panel</p>
                                <button className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                                    Connect Wallet
                                </button>
                            </div>
                        </div>
                    )}

                    {isConnected && !adminCheckLoading && isAdmin === false && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-6">
                            <div className="text-center">
                                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-red-800 mb-2">Access Denied</h3>
                                <p className="text-red-700 mb-2">Your wallet address does not have admin privileges.</p>
                                <p className="text-red-600 text-sm">Only admin accounts can create events.</p>
                                <div className="mt-4 p-3 bg-white border border-red-200 rounded">
                                    <p className="text-xs text-gray-600">Connected Address:</p>
                                    <code className="text-xs text-gray-800 break-all">{address}</code>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Contract Error */}
                    {adminCheckError && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-6">
                            <div className="text-center">
                                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-red-800 mb-2">Contract Error</h3>
                                <p className="text-red-700 mb-2">Unable to verify admin status</p>
                                <p className="text-red-600 text-sm">Please check if the contract address is correct and try again.</p>
                                <button
                                    onClick={() => refetchAdminStatus()}
                                    className="mt-3 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Loading State for Admin Check */}
                    {adminCheckLoading && (
                        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <div className="text-center">
                                <Loader className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
                                <h3 className="text-lg font-semibold text-blue-800 mb-2">Verifying Access</h3>
                                <p className="text-blue-700">Checking your admin privileges...</p>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Event Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                handleInputChange('name', e.target.value)
                                            }
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                errors.name ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Enter event name"
                                        />
                                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Event Date & Time *
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                            <input
                                                type="datetime-local"
                                                value={formData.eventDateTime}
                                                min={getMinDateTime()}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                    handleInputChange('eventDateTime', e.target.value)
                                                }
                                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                    errors.eventDateTime ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            />
                                        </div>
                                        {errors.eventDateTime && <p className="text-red-500 text-sm mt-1">{errors.eventDateTime}</p>}
                                        {formData.eventDateTime && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Unix timestamp: {dateTimeToUnixTimestamp(formData.eventDateTime).toString()}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description *
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                                handleInputChange('description', e.target.value)
                                            }
                                            rows={4}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                errors.description ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Enter event description"
                                        />
                                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Venue *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.venue}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                handleInputChange('venue', e.target.value)
                                            }
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                errors.venue ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Enter venue name"
                                        />
                                        {errors.venue && <p className="text-red-500 text-sm mt-1">{errors.venue}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Category *
                                        </label>
                                        <select
                                            value={formData.category}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                                handleInputChange('category', e.target.value)
                                            }
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                errors.category ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        >
                                            <option value="">Select a category</option>
                                            <option value="MUSIC">MUSIC</option>
                                            <option value="EDUCATION">EDUCATION</option>
                                            <option value="SPORTS">SPORTS</option>
                                            <option value="COMEDY">COMEDY</option>
                                        </select>
                                        {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Image URL *
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.imageUrl}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                handleInputChange('imageUrl', e.target.value)
                                            }
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                errors.imageUrl ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="https://example.com/image.jpg"
                                        />
                                        {errors.imageUrl && <p className="text-red-500 text-sm mt-1">{errors.imageUrl}</p>}
                                    </div>

                                    {errors.submit && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                            <div className="flex items-center">
                                                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                                                <p className="text-red-700">{errors.submit}</p>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleSubmitMetadata}
                                        disabled={isLoading}
                                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
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
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                        <div className="flex items-center mb-4">
                                            <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                                            <h3 className="text-lg font-semibold text-green-800">Metadata Uploaded Successfully!</h3>
                                        </div>
                                        <div className="bg-white rounded-lg p-4 border border-green-200">
                                            <p className="text-sm text-gray-600 mb-2">Metadata Hash:</p>
                                            <code className="text-sm bg-gray-100 px-2 py-1 rounded break-all">{metadataHash}</code>
                                        </div>
                                        <div className="bg-white rounded-lg p-4 border border-green-200 mt-4">
                                            <p className="text-sm text-gray-600 mb-2">Event Timestamp:</p>
                                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                                {formData.eventDateTime ? dateTimeToUnixTimestamp(formData.eventDateTime).toString() : ''}
                                            </code>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Step 2: Create Event on Blockchain</h3>
                                        <p className="text-gray-600">
                                            Now create the event on the blockchain using the uploaded metadata and selected date/time.
                                        </p>

                                        <button
                                            onClick={handleContractCall}
                                            disabled={!isConnected || isWritePending || isConfirming}
                                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
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
                                            <div className={`p-4 rounded-lg ${
                                                contractCallStatus.includes('successfully') || contractCallStatus.includes('confirmed')
                                                    ? 'bg-green-50 border border-green-200 text-green-800'
                                                    : contractCallStatus.includes('failed') || contractCallStatus.includes('rejected')
                                                        ? 'bg-red-50 border border-red-200 text-red-800'
                                                        : 'bg-blue-50 border border-blue-200 text-blue-800'
                                            }`}>
                                                <p className="break-all">{contractCallStatus}</p>
                                            </div>
                                        )}

                                        {hash && (
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                <p className="text-sm text-blue-600 mb-2">Transaction Hash:</p>
                                                <code className="text-sm bg-white px-2 py-1 rounded break-all">{hash}</code>
                                            </div>
                                        )}

                                        <div className="pt-4">
                                            <button
                                                onClick={resetForm}
                                                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
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
