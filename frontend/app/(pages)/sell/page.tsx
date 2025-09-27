'use client'

import React, { useState, useEffect, FormEvent } from 'react'
import { baseurl } from "@/app/consts"
import {OFFER_MANAGER_ADDRESS} from "@/app/consts";
import {offerabi} from "@/app/consts/abi";
import {eventService} from "@/app/service/events.service";
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';

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
    seatNumbers: string[]
    seatType: string
    isPhysicalTicketNeededToAttend: boolean
}

enum TransactionStep {
    UPLOADING_METADATA = 'UPLOADING_METADATA',
    APPROVING_PYUSD = 'APPROVING_PYUSD',
    CREATING_OFFER = 'CREATING_OFFER',
    COMPLETED = 'COMPLETED'
}

export default function SellPage() {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<boolean>(false)
    const [seatNumbers, setSeatNumbers] = useState<string[]>([''])
    const [events, setEvents] = useState<Events[]>([])
    const [filteredEvents, setFilteredEvents] = useState<Events[]>([])
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [selectedEvent, setSelectedEvent] = useState<Events | null>(null)
    const [showDropdown, setShowDropdown] = useState<boolean>(false)
    const [eventsLoading, setEventsLoading] = useState<boolean>(true)
    const [metadataUri, setMetadataUri] = useState<string>('')
    const [showPriceModal, setShowPriceModal] = useState<boolean>(false)
    const [totalAskPrice, setTotalAskPrice] = useState<string>('')
    const [pendingTicketData, setPendingTicketData] = useState<TicketFormData | null>(null)
    const [currentStep, setCurrentStep] = useState<TransactionStep>(TransactionStep.UPLOADING_METADATA)
    const [pyusdBalance, setPyusdBalance] = useState<string>('0')
    const [pyusdAllowance, setPyusdAllowance] = useState<bigint>(0n)

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

    // Update balance and allowance when data changes
    useEffect(() => {
        if (balanceData) {
            setPyusdBalance(formatEther(balanceData as bigint))
        }
        if (allowanceData) {
            setPyusdAllowance(allowanceData as bigint)
        }
    }, [balanceData, allowanceData])

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
                setError('Failed to load events')
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
        if (isConfirmed) {
            if (currentStep === TransactionStep.APPROVING_PYUSD) {
                // Approval confirmed, now create the offer
                setCurrentStep(TransactionStep.CREATING_OFFER)
                refetchAllowance() // Refresh allowance data
                createOfferTransaction()
            } else if (currentStep === TransactionStep.CREATING_OFFER) {
                // Offer creation confirmed
                setCurrentStep(TransactionStep.COMPLETED)
                setSuccess(true)
                setShowPriceModal(false)
                setPendingTicketData(null)
                setTotalAskPrice('')
                setMetadataUri('')
                setIsLoading(false)
                // Reset form
                setSeatNumbers([''])
                setSelectedEvent(null)
                setSearchQuery('')
                refetchBalance() // Refresh balance after transaction
            }
            reset() // Reset wagmi state for next transaction
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
            } else if (contractError.message.includes('Ask must be > 0')) {
                errorMessage = 'Ask price must be greater than 0'
            } else if (contractError.message.includes('Event does not exist')) {
                errorMessage = 'Selected event does not exist'
            }

            setError(errorMessage)
            setIsLoading(false)
            setCurrentStep(TransactionStep.UPLOADING_METADATA)
        }
    }, [contractError])

    // Calculate required collateral
    const getRequiredCollateral = (): bigint => {
        if (!totalAskPrice) return BigInt(0)
        try {
            return parseEther(totalAskPrice) / BigInt(2) // Half of ask price
        } catch {
            return BigInt(0)
        }
    }

    // Check if user has sufficient balance and allowance
    const checkBalanceAndAllowance = (): { hasBalance: boolean; hasAllowance: boolean; collateral: bigint } => {
        const collateral = getRequiredCollateral()
        const userBalance = balanceData as bigint || BigInt(0)
        const userAllowance = allowanceData as bigint || BigInt(0)

        return {
            hasBalance: userBalance >= collateral,
            hasAllowance: userAllowance >= collateral,
            collateral
        }
    }

    // Add new seat number input
    const addSeatNumber = () => {
        setSeatNumbers([...seatNumbers, ''])
    }

    // Remove seat number input
    const removeSeatNumber = (index: number) => {
        if (seatNumbers.length > 1) {
            const newSeatNumbers = seatNumbers.filter((_, i) => i !== index)
            setSeatNumbers(newSeatNumbers)
        }
    }

    // Update specific seat number
    const updateSeatNumber = (index: number, value: string) => {
        const newSeatNumbers = [...seatNumbers]
        newSeatNumbers[index] = value
        setSeatNumbers(newSeatNumbers)
    }

    // Handle event selection
    const handleEventSelect = (event: Events) => {
        setSelectedEvent(event)
        setSearchQuery(event.name)
        setShowDropdown(false)
    }

    // Handle search input change
    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
        setShowDropdown(true)
        if (value !== selectedEvent?.name) {
            setSelectedEvent(null)
        }
    }

    // Approve PYUSD spending
    const approvePyusd = async () => {
        const { collateral } = checkBalanceAndAllowance()

        try {
            setCurrentStep(TransactionStep.APPROVING_PYUSD)
            writeContract({
                address: PYUSD_TOKEN_ADDRESS,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [OFFER_MANAGER_ADDRESS, collateral],
            })
        } catch (error: any) {
            setError('Failed to approve PYUSD spending: ' + (error.message || 'Unknown error'))
            setIsLoading(false)
            setCurrentStep(TransactionStep.UPLOADING_METADATA)
        }
    }

    // Create the actual offer transaction
    const createOfferTransaction = async () => {
        if (!pendingTicketData || !selectedEvent || !metadataUri) return

        try {
            writeContract({
                address: OFFER_MANAGER_ADDRESS,
                abi: offerabi,
                functionName: 'createOfferToSell',
                args: [
                    BigInt(selectedEvent.id), // _eventId
                    parseEther(totalAskPrice), // _ask (convert ETH to wei)
                    metadataUri // _metadataUri
                ],
            })
        } catch (error: any) {
            setError('Failed to create offer: ' + (error.message || 'Unknown error'))
            setIsLoading(false)
            setCurrentStep(TransactionStep.UPLOADING_METADATA)
        }
    }

    // Create blockchain offer with approval flow
    const createBlockchainOffer = async () => {
        if (!pendingTicketData || !selectedEvent || !isConnected || !metadataUri) return

        try {
            setIsLoading(true)
            setError(null)

            // Validate price is set and valid
            if (!totalAskPrice || parseFloat(totalAskPrice) <= 0) {
                throw new Error('Please set a valid total ask price')
            }

            // Check balance and allowance
            const { hasBalance, hasAllowance, collateral } = checkBalanceAndAllowance()

            if (!hasBalance) {
                throw new Error(`Insufficient PYUSD balance. Required: ${formatEther(collateral)} PYUSD, Available: ${pyusdBalance} PYUSD`)
            }

            // If allowance is sufficient, create offer directly
            if (hasAllowance) {
                setCurrentStep(TransactionStep.CREATING_OFFER)
                createOfferTransaction()
            } else {
                // Otherwise, approve first
                await approvePyusd()
            }

        } catch (error: any) {
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

            // Filter out empty seat numbers and trim whitespace
            const filteredSeatNumbers = seatNumbers
                .map(seat => seat.trim())
                .filter(seat => seat !== '')

            if (filteredSeatNumbers.length === 0) {
                throw new Error('At least one seat number is required')
            }

            // Create the ticket data object
            const ticketData: TicketFormData = {
                quantity: parseInt(formData.get('quantity') as string),
                seatNumbers: filteredSeatNumbers,
                seatType: formData.get('seatType') as string,
                isPhysicalTicketNeededToAttend: formData.get('isPhysicalTicketNeededToAttend') === 'on'
            }

            console.log('Ticket data before sending:', ticketData)

            // First, upload metadata to get URI
            const response = await fetch(`${baseurl}/offer/metadata/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(ticketData),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => null)
                console.error('Server error response:', errorData)
                throw new Error(errorData?.message || 'Failed to upload metadata. Please try again.')
            }

            const result = await response.json()
            console.log('Metadata upload response:', result)

            // Assuming the response contains the metadata URI
            const uri = result.metadataUrl
            if (!uri) {
                throw new Error('Failed to get metadata URI from server response')
            }

            setMetadataUri(uri)
            setPendingTicketData(ticketData)

            // Show price modal after successful metadata upload
            setShowPriceModal(true)
            setIsLoading(false)

        } catch (error: any) {
            setError(error.message || 'An error occurred')
            console.error('Form submission error:', error)
            setIsLoading(false)
            setCurrentStep(TransactionStep.UPLOADING_METADATA)
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

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 text-center">
                            List Your Tickets
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Fill out the details to list your tickets for sale
                        </p>
                        {isConnected && (
                            <div className="mt-2 text-center text-xs text-gray-500">
                                PYUSD Balance: {pyusdBalance} PYUSD
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200">
                            <p className="text-sm text-green-600">
                                Ticket listing created successfully on blockchain!
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Event Search */}
                        <div className="relative">
                            <label htmlFor="event" className="block text-sm font-medium text-gray-700 mb-2">
                                Select Event
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="event"
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
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

                            {/* Click outside to close dropdown */}
                            {showDropdown && (
                                <div
                                    className="fixed inset-0 z-0"
                                    onClick={() => setShowDropdown(false)}
                                />
                            )}
                        </div>

                        {/* Selected Event Display */}
                        {selectedEvent && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <p className="text-sm font-medium text-blue-900">Selected Event:</p>
                                <p className="text-sm text-blue-800">{selectedEvent.name} at {selectedEvent.venue}</p>
                            </div>
                        )}

                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                                Quantity
                            </label>
                            <input
                                type="number"
                                id="quantity"
                                name="quantity"
                                required
                                min="1"
                                placeholder="Number of tickets"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Seat Numbers
                                </label>
                                <button
                                    type="button"
                                    onClick={addSeatNumber}
                                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
                                >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Seat
                                </button>
                            </div>

                            <div className="space-y-2">
                                {seatNumbers.map((seat, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={seat}
                                            onChange={(e) => updateSeatNumber(index, e.target.value)}
                                            placeholder={`Seat ${index + 1} (e.g., A1, B2)`}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                        />
                                        {seatNumbers.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeSeatNumber(index)}
                                                className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-400 hover:text-red-500 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-200"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Add multiple seat numbers for your tickets. Each seat should be entered separately.
                            </p>
                        </div>

                        <div>
                            <label htmlFor="seatType" className="block text-sm font-medium text-gray-700 mb-2">
                                Seat Type
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

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isPhysicalTicketNeededToAttend"
                                name="isPhysicalTicketNeededToAttend"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition duration-200"
                            />
                            <label htmlFor="isPhysicalTicketNeededToAttend" className="ml-2 block text-sm text-gray-700">
                                Physical ticket delivery required
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !selectedEvent || !isConnected}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                        >
                            {isLoading && currentStep === TransactionStep.UPLOADING_METADATA ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Uploading Metadata...
                                </div>
                            ) : !isConnected ? (
                                'Connect Wallet First'
                            ) : (
                                'Continue to Pricing'
                            )}
                        </button>
                    </form>
                </div>

                {/* Price Modal */}
                {showPriceModal && pendingTicketData && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">Set Total Ask Price</h3>
                                    <button
                                        onClick={() => {
                                            setShowPriceModal(false)
                                            setIsLoading(false)
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
                                    <p className="text-sm text-blue-800">Seats: {pendingTicketData.seatNumbers.join(', ')}</p>
                                    <p className="text-sm text-blue-800">Quantity: {pendingTicketData.quantity}</p>
                                    <p className="text-sm text-blue-800">Seat Type: {pendingTicketData.seatType}</p>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Total Ask Price (PYUSD)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        min="0"
                                        placeholder="100.0"
                                        value={totalAskPrice}
                                        onChange={(e) => setTotalAskPrice(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Enter the total price for all {pendingTicketData.quantity} ticket(s)
                                    </p>
                                    {totalAskPrice && (
                                        <p className="mt-1 text-xs text-gray-600">
                                            Required collateral: {formatEther(getRequiredCollateral())} PYUSD (50% of ask price)
                                        </p>
                                    )}
                                </div>

                                {/* Balance and allowance info */}
                                {totalAskPrice && (
                                    <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md text-xs">
                                        <div className="flex justify-between">
                                            <span>Your PYUSD Balance:</span>
                                            <span className={parseFloat(pyusdBalance) >= parseFloat(formatEther(getRequiredCollateral())) ? 'text-green-600' : 'text-red-600'}>
                                                {pyusdBalance} PYUSD
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Current Allowance:</span>
                                            <span className={pyusdAllowance >= getRequiredCollateral() ? 'text-green-600' : 'text-orange-600'}>
                                                {formatEther(pyusdAllowance)} PYUSD
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}

                                {/* Transaction status */}
                                {isLoading && currentStep !== TransactionStep.UPLOADING_METADATA && (
                                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                        <p className="text-sm text-yellow-800">{getStepText()}</p>
                                        {hash && (
                                            <p className="text-xs text-yellow-700 mt-1">
                                                Transaction: {hash.slice(0, 10)}...{hash.slice(-8)}
                                            </p>
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
                                        disabled={isPending || isConfirming || !totalAskPrice || isLoading}
                                        className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {getStepText()}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
