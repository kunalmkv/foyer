'use client'

import React, { useState, useEffect, FormEvent } from 'react'
import { baseurl } from "@/app/consts"
import {OFFER_MANAGER_ADDRESS} from "@/app/consts";
import {offerabi} from "@/app/consts/abi";
import {eventService} from "@/app/service/events.service";
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Copy, Check } from 'lucide-react';

const PYUSD_TOKEN_ADDRESS = '0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9'
const ERC20_ABI = [
    {
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}, {"name": "_spender", "type": "address"}],
        "name": "allowance",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{"name": "_spender", "type": "address"}, {"name": "_value", "type": "uint256"}],
        "name": "approve",
        "outputs": [{"name": "", "type": "bool"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint8"}],
        "type": "function"
    }
] as const;

export interface Events {
    _id: string;
    id: number;
    name: string;
    description: string;
    category: 'SPORTS'|'COMEDY'|'MUSIC'|'EDUCATION';
    venue: string;
    imageUrl: string;
    metadataUrl: string;
    status: 'UPCOMING'|'ONGOING'|'COMPLETED'|'CANCELLED';
}

interface TicketFormData {
    quantity: number
    seatType: string
    isPhysicalTicketNeededToAttend: boolean
}

enum TransactionStep {
    UPLOADING_METADATA = 'UPLOADING_METADATA',
    APPROVING_PYUSD = 'APPROVING_PYUSD',
    CREATING_OFFER = 'CREATING_OFFER',
    COMPLETED = 'COMPLETED'
}

export default function BuyPage() {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<boolean>(false)
    const [events, setEvents] = useState<Events[]>([])
    const [filteredEvents, setFilteredEvents] = useState<Events[]>([])
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [selectedEvent, setSelectedEvent] = useState<Events | null>(null)
    const [showDropdown, setShowDropdown] = useState<boolean>(false)
    const [eventsLoading, setEventsLoading] = useState<boolean>(true)
    const [metadataUri, setMetadataUri] = useState<string>('')
    const [showPriceModal, setShowPriceModal] = useState<boolean>(false)
    const [totalBidPrice, setTotalBidPrice] = useState<string>('')
    const [pendingTicketData, setPendingTicketData] = useState<TicketFormData | null>(null)
    const [currentStep, setCurrentStep] = useState<TransactionStep>(TransactionStep.UPLOADING_METADATA)
    const [pyusdBalance, setPyusdBalance] = useState<string>('0')
    const [pyusdAllowance, setPyusdAllowance] = useState<bigint>(BigInt(0))
    const [copiedHash, setCopiedHash] = useState<string | null>(null)

    // Wagmi hooks
    const { address, isConnected } = useAccount()
    const { writeContract, data: hash, isPending, error: contractError, reset } = useWriteContract()
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    })

    // Read PYUSD balance
    const { data: balanceData, refetch: refetchBalance } = useReadContract({
        address: PYUSD_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: { enabled: !!address }
    })
    console.log('pusd balance',balanceData)

    // Read PYUSD allowance
    const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
        address: PYUSD_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: address ? [address, OFFER_MANAGER_ADDRESS] : undefined,
        query: { enabled: !!address }
    })

    // Read PYUSD decimals
    const { data: decimalsData } = useReadContract({
        address: PYUSD_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'decimals',
        query: { enabled: true }
    })

    // Update balance and allowance when data changes
    useEffect(() => {
        if (balanceData && decimalsData) {
            const decimals = decimalsData as number
            const balance = balanceData as bigint
            // Format balance using the correct decimals
            const formattedBalance = (Number(balance) / Math.pow(10, decimals)).toString()
            setPyusdBalance(formattedBalance)
            console.log('PYUSD balance formatted:', {
                raw: balance.toString(),
                decimals,
                formatted: formattedBalance
            })
        }
        if (allowanceData) {
            setPyusdAllowance(allowanceData as bigint)
        }
    }, [balanceData, allowanceData, decimalsData])

    // Fetch events on component mount
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setEventsLoading(true)
                const fetchedEvents = await eventService.getAllEvents()
                setEvents(fetchedEvents)
                setFilteredEvents(fetchedEvents)
            } catch (error) {
                console.error('Error fetching events:', error)
                setError('Failed to fetch events')
            } finally {
                setEventsLoading(false)
            }
        }

        fetchEvents()
    }, [])

    // Filter events based on search query
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredEvents(events)
        } else {
            const filtered = events.filter(event =>
                event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.category.toLowerCase().includes(searchQuery.toLowerCase())
            )
            setFilteredEvents(filtered)
        }
    }, [searchQuery, events])

    // Handle transaction confirmation
    useEffect(() => {
        if (isConfirmed && currentStep === TransactionStep.APPROVING_PYUSD) {
            console.log('PYUSD approval confirmed, creating offer...')
            setCurrentStep(TransactionStep.CREATING_OFFER)
            createOfferTransaction()
        } else if (isConfirmed && currentStep === TransactionStep.CREATING_OFFER) {
            console.log('Offer creation confirmed')
            setCurrentStep(TransactionStep.COMPLETED)
            setIsLoading(false)
            setSuccess(true)
            setShowPriceModal(false)
            // Reset form
            setSelectedEvent(null)
            setTotalBidPrice('')
            setPendingTicketData(null)
            setMetadataUri('')
            // Refetch balance and allowance
            refetchBalance()
            refetchAllowance()
        }
    }, [isConfirmed, currentStep])

    // Handle contract errors
    useEffect(() => {
        if (contractError) {
            console.error('Contract error details:', contractError)
            let errorMessage = 'Blockchain transaction failed'

            // Parse common error messages
            if (contractError.message.includes('insufficient')) {
                errorMessage = 'Insufficient balance or allowance'
            } else if (contractError.message.includes('transfer')) {
                errorMessage = 'Token transfer failed - check balance and approval'
            } else if (contractError.message.includes('Bid must be > 0')) {
                errorMessage = 'Bid price must be greater than 0'
            } else if (contractError.message.includes('Event does not exist')) {
                errorMessage = 'Selected event does not exist'
            }

            setError(errorMessage)
            setIsLoading(false)
            setCurrentStep(TransactionStep.UPLOADING_METADATA)
        }
    }, [contractError])

    // Calculate required collateral (full bid amount for buy offers)
    const getRequiredCollateral = (): bigint => {
        if (!totalBidPrice || !decimalsData) return BigInt(0)
        try {
            const decimals = decimalsData as number
            const bidPriceInWei = BigInt(Math.floor(parseFloat(totalBidPrice) * Math.pow(10, decimals)))
            return bidPriceInWei // Full bid amount for buy offers
        } catch {
            return BigInt(0)
        }
    }

    // Check if user has sufficient balance and allowance
    const checkBalanceAndAllowance = (): { hasBalance: boolean; hasAllowance: boolean; collateral: bigint } => {
        const collateral = getRequiredCollateral()
        const userBalance = balanceData as bigint || BigInt(0)
        const userAllowance = allowanceData as bigint || BigInt(0)

        // Format for display using correct decimals
        const formatWithDecimals = (value: bigint) => {
            if (!decimalsData) return '0'
            const decimals = decimalsData as number
            return (Number(value) / Math.pow(10, decimals)).toString()
        }

        const hasBalance = userBalance >= collateral
        const hasAllowance = userAllowance >= collateral

        console.log('Balance and allowance check:', {
            userBalance: formatWithDecimals(userBalance),
            userAllowance: formatWithDecimals(userAllowance),
            requiredCollateral: formatWithDecimals(collateral),
            hasBalance,
            hasAllowance
        })

        return { hasBalance, hasAllowance, collateral }
    }

    // Approve PYUSD spending
    const approvePyusd = async () => {
        const { collateral } = checkBalanceAndAllowance()

        if (collateral === BigInt(0)) {
            setError('Invalid collateral amount. Please set a valid bid price.')
            return
        }

        try {
            setCurrentStep(TransactionStep.APPROVING_PYUSD)
            setError(null)
            
            console.log('Approving PYUSD:', {
                spender: OFFER_MANAGER_ADDRESS,
                amount: collateral.toString(),
                formatted: decimalsData ? (Number(collateral) / Math.pow(10, decimalsData as number)).toString() : '0'
            })

            writeContract({
                address: PYUSD_TOKEN_ADDRESS,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [OFFER_MANAGER_ADDRESS, collateral],
            })
        } catch (error: any) {
            console.error('Approval error:', error)
            setError('Failed to approve PYUSD spending: ' + (error.message || 'Unknown error'))
            setIsLoading(false)
            setCurrentStep(TransactionStep.UPLOADING_METADATA)
        }
    }

    // Create the actual offer transaction
    const createOfferTransaction = async () => {
        if (!pendingTicketData || !selectedEvent || !metadataUri) {
            setError('Missing required data for offer creation')
            setIsLoading(false)
            setCurrentStep(TransactionStep.UPLOADING_METADATA)
            return
        }

        try {
            console.log('Creating buy offer:', {
                eventId: selectedEvent.id,
                bidPrice: totalBidPrice,
                metadataUri: metadataUri
            })

            const bidPriceInWei = BigInt(Math.floor(parseFloat(totalBidPrice) * Math.pow(10, 6))) // PYUSD has 6 decimals

            writeContract({
                address: OFFER_MANAGER_ADDRESS,
                abi: offerabi,
                functionName: 'createOfferToBuy',
                args: [BigInt(selectedEvent.id), bidPriceInWei, metadataUri],
            })
        } catch (error: any) {
            console.error('Offer creation error:', error)
            setError('Failed to create buy offer: ' + (error.message || 'Unknown error'))
            setIsLoading(false)
            setCurrentStep(TransactionStep.UPLOADING_METADATA)
        }
    }

    // Create blockchain offer
    const createBlockchainOffer = async () => {
        try {
            const { hasBalance, hasAllowance, collateral } = checkBalanceAndAllowance()
            
            console.log('Creating blockchain buy offer:', {
                collateral: formatEther(collateral),
                totalBidPrice
            })

            if (!hasBalance) {
                throw new Error(`Insufficient PYUSD balance. Required: ${formatEther(collateral)} PYUSD, Available: ${pyusdBalance} PYUSD`)
            }

            // If allowance is sufficient, create offer directly
            if (hasAllowance) {
                console.log('Sufficient allowance, creating offer directly')
                setCurrentStep(TransactionStep.CREATING_OFFER)
                createOfferTransaction()
            } else {
                // Otherwise, approve first
                console.log('Insufficient allowance, approving first')
                await approvePyusd()
            }

        } catch (error: any) {
            console.error('Blockchain offer error:', error)
            setError(error.message || 'Failed to create blockchain offer')
            setIsLoading(false)
            setCurrentStep(TransactionStep.UPLOADING_METADATA)
        }
    }

    // Form submission handler
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError(null)
        setSuccess(false)
        setCurrentStep(TransactionStep.UPLOADING_METADATA)

        try {
            if (!selectedEvent) {
                throw new Error('Please select an event')
            }

            if (!isConnected) {
                throw new Error('Please connect your wallet first')
            }

            const formData = new FormData(event.currentTarget)

            const ticketData: TicketFormData = {
                quantity: parseInt(formData.get('quantity') as string) || 1,
                seatType: formData.get('seatType') as string || '',
                isPhysicalTicketNeededToAttend: formData.get('isPhysicalTicketNeededToAttend') === 'on'
            }

            // Store ticket data for later use
            setPendingTicketData(ticketData)

            // Upload metadata to backend
            const metadataResponse = await fetch(`${baseurl}/offer/metadata/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    eventId: selectedEvent.id,
                    type: 'OFFER_TO_BUY',
                    sellerAddress: address, // For buy offers, this is the buyer's address
                    buyerAddress: null,
                    quantity: ticketData.quantity,
                    seatType: ticketData.seatType,
                    isPhysicalTicketNeededToAttend: ticketData.isPhysicalTicketNeededToAttend
                })
            })

            if (!metadataResponse.ok) {
                const errorData = await metadataResponse.json()
                throw new Error(errorData.message || 'Failed to upload metadata')
            }

            const metadataResult = await metadataResponse.json()
            setMetadataUri(metadataResult.metadataUrl)

            // Show price modal
            setShowPriceModal(true)
            setIsLoading(false)

        } catch (error: any) {
            console.error('Form submission error:', error)
            setError(error.message || 'Failed to process request')
            setIsLoading(false)
            setCurrentStep(TransactionStep.UPLOADING_METADATA)
        }
    }

    // Copy transaction hash to clipboard
    const copyTransactionHash = async (txHash: string) => {
        try {
            await navigator.clipboard.writeText(txHash)
            setCopiedHash(txHash)
            setTimeout(() => setCopiedHash(null), 2000) // Reset after 2 seconds
        } catch (error) {
            console.error('Failed to copy transaction hash:', error)
        }
    }

    // Get current step display text
    const getStepText = (): string => {
        switch (currentStep) {
            case TransactionStep.UPLOADING_METADATA:
                return 'Uploading Metadata...'
            case TransactionStep.APPROVING_PYUSD:
                return isPending ? 'Approving PYUSD...' : isConfirming ? 'Confirming Approval...' : 'Approve PYUSD'
            case TransactionStep.CREATING_OFFER:
                return isPending ? 'Creating Offer...' : isConfirming ? 'Confirming Offer...' : 'Create Offer'
            case TransactionStep.COMPLETED:
                return 'Completed!'
            default:
                return 'Processing...'
        }
    }

    // Event selection handler
    const handleEventSelect = (event: Events) => {
        setSelectedEvent(event)
        setSearchQuery(event.name)
        setShowDropdown(false)
    }


    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 text-center">
                            Make a Buy Request
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Fill out the details to request tickets for purchase
                        </p>
                        {isConnected && (
                            <div className="mt-2 text-center text-xs text-gray-500">
                                PYUSD Balance: {pyusdBalance} PYUSD
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm text-green-600">Buy request created successfully!</p>
                        </div>
                    )}

                    {!isConnected && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-sm text-yellow-600">Please connect your wallet to make a buy request</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Event Selection */}
                        <div className="relative">
                            <label htmlFor="event" className="block text-sm font-medium text-gray-700 mb-2">
                                Select Event
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value)
                                        setShowDropdown(true)
                                    }}
                                    onFocus={() => setShowDropdown(true)}
                                    placeholder={eventsLoading ? "Loading events..." : "Search for an event..."}
                                    disabled={eventsLoading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Dropdown */}
                            {showDropdown && !eventsLoading && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                    {filteredEvents.length > 0 ? (
                                        filteredEvents.map((event) => (
                                            <div
                                                key={event._id}
                                                onClick={() => handleEventSelect(event)}
                                                className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{event.name}</p>
                                                        <p className="text-sm text-gray-600">{event.venue}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                                event.category === 'SPORTS' ? 'bg-green-100 text-green-800' :
                                                                    event.category === 'MUSIC' ? 'bg-purple-100 text-purple-800' :
                                                                        event.category === 'COMEDY' ? 'bg-yellow-100 text-yellow-800' :
                                                                            'bg-blue-100 text-blue-800'
                                                            }`}>
                                                                {event.category}
                                                            </span>
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                                event.status === 'UPCOMING' ? 'bg-blue-100 text-blue-800' :
                                                                    event.status === 'ONGOING' ? 'bg-green-100 text-green-800' :
                                                                        event.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                                                                            'bg-red-100 text-red-800'
                                                            }`}>
                                                                {event.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-3 py-2 text-sm text-gray-500">
                                            No events found matching your search
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Quantity */}
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                                Quantity
                            </label>
                            <input
                                type="number"
                                id="quantity"
                                name="quantity"
                                min="1"
                                defaultValue="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                            />
                        </div>


                        {/* Seat Type */}
                        <div>
                            <label htmlFor="seatType" className="block text-sm font-medium text-gray-700 mb-2">
                                Preferred Seat Type
                            </label>
                            <input
                                type="text"
                                id="seatType"
                                name="seatType"
                                required
                                placeholder="e.g., VIP, General, Premium"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                            />
                        </div>

                        {/* Physical Ticket Checkbox */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isPhysicalTicketNeededToAttend"
                                name="isPhysicalTicketNeededToAttend"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isPhysicalTicketNeededToAttend" className="ml-2 block text-sm text-gray-700">
                                Physical ticket required to attend
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading || !isConnected || !selectedEvent}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                        >
                            {isLoading ? 'Processing...' : 'Continue to Pricing'}
                        </button>
                    </form>

                    {/* Price Modal */}
                    {showPriceModal && pendingTicketData && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">Set Your Bid Price</h3>
                                    <button
                                        onClick={() => {
                                            setShowPriceModal(false)
                                            setIsLoading(false)
                                            setError(null)
                                            setCurrentStep(TransactionStep.UPLOADING_METADATA)
                                            reset()
                                        }}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                    <p className="text-sm font-medium text-blue-900">Event: {selectedEvent?.name}</p>
                                    <p className="text-sm text-blue-800">Quantity: {pendingTicketData.quantity}</p>
                                    <p className="text-sm text-blue-800">Seat Type: {pendingTicketData.seatType}</p>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Total Bid Price (PYUSD)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        min="0"
                                        placeholder="100.0"
                                        value={totalBidPrice}
                                        onChange={(e) => setTotalBidPrice(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Enter the total price you're willing to pay for all {pendingTicketData.quantity} ticket(s)
                                    </p>
                                    {totalBidPrice && (
                                        <p className="mt-1 text-xs text-gray-600">
                                            Required collateral: {decimalsData ? (Number(getRequiredCollateral()) / Math.pow(10, decimalsData as number)).toString() : '0'} PYUSD (full bid amount)
                                        </p>
                                    )}
                                </div>

                                {/* Balance and allowance info */}
                                {totalBidPrice && (
                                    <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md text-xs">
                                        <div className="flex justify-between">
                                            <span>Your PYUSD Balance:</span>
                                            <span className={parseFloat(pyusdBalance) >= (decimalsData ? Number(getRequiredCollateral()) / Math.pow(10, decimalsData as number) : 0) ? 'text-green-600' : 'text-red-600'}>
                                                {pyusdBalance} PYUSD
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Current Allowance:</span>
                                            <span className={pyusdAllowance >= getRequiredCollateral() ? 'text-green-600' : 'text-orange-600'}>
                                                {decimalsData ? (Number(pyusdAllowance) / Math.pow(10, decimalsData as number)).toString() : '0'} PYUSD
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Required Collateral:</span>
                                            <span className="font-medium">
                                                {decimalsData ? (Number(getRequiredCollateral()) / Math.pow(10, decimalsData as number)).toString() : '0'} PYUSD
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Error display */}
                                {error && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}

                                {/* Transaction status */}
                                {isLoading && currentStep !== TransactionStep.UPLOADING_METADATA && (
                                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                        <p className="text-sm text-yellow-800">{getStepText()}</p>
                                        {hash && (
                                            <div className="flex items-center justify-between mt-2">
                                                <p className="text-xs text-yellow-700">
                                                    Transaction: {hash.slice(0, 10)}...{hash.slice(-8)}
                                                </p>
                                                <button
                                                    onClick={() => copyTransactionHash(hash)}
                                                    className="flex items-center gap-1 px-2 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded transition-colors"
                                                    title="Copy transaction hash"
                                                >
                                                    {copiedHash === hash ? (
                                                        <>
                                                            <Check size={12} />
                                                            <span>Copied!</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy size={12} />
                                                            <span>Copy</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setShowPriceModal(false)
                                            setIsLoading(false)
                                            setError(null)
                                            setCurrentStep(TransactionStep.UPLOADING_METADATA)
                                            reset()
                                        }}
                                        disabled={isLoading}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={createBlockchainOffer}
                                        disabled={isPending || isConfirming || !totalBidPrice || isLoading || !checkBalanceAndAllowance().hasBalance || !checkBalanceAndAllowance().hasAllowance}
                                        className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {getStepText()}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
