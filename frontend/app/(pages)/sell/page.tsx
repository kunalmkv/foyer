'use client'

import React, { useState, FormEvent } from 'react'
import { baseurl } from "@/app/consts"

interface TicketFormData {
    quantity: number
    seatNumbers: string[]
    seatType: string
    isPhysicalTicketNeededToAttend: boolean
}

export default function SellPage() {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<boolean>(false)
    const [seatNumbers, setSeatNumbers] = useState<string[]>([''])

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

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError(null)
        setSuccess(false)

        try {
            const formData = new FormData(event.currentTarget)

            // Filter out empty seat numbers and trim whitespace
            const filteredSeatNumbers = seatNumbers
                .map(seat => seat.trim())
                .filter(seat => seat !== '')

            if (filteredSeatNumbers.length === 0) {
                throw new Error('At least one seat number is required')
            }

            // Create the ticket data object with proper array structure
            const ticketData: TicketFormData = {
                quantity: parseInt(formData.get('quantity') as string),
                seatNumbers: filteredSeatNumbers, // This will be properly serialized as JSON array
                seatType: formData.get('seatType') as string,
                isPhysicalTicketNeededToAttend: formData.get('isPhysicalTicketNeededToAttend') === 'on'
            }

            console.log('Ticket data before sending:', ticketData)
            console.log('Seat numbers array:', JSON.stringify(filteredSeatNumbers))

            const response = await fetch(`${baseurl}/offer/metadata/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Ensure proper JSON stringification of the entire object
                body: JSON.stringify(ticketData),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => null)
                console.error('Server error response:', errorData)
                throw new Error(errorData?.message || 'Failed to submit ticket listing. Please try again.')
            }

            const result = await response.json()
            console.log('Success response:', result)
            setSuccess(true)

            // Reset form after successful submission
            event.currentTarget.reset()
            setSeatNumbers(['']) // Reset seat numbers

        } catch (error: any) {
            setError(error.message || 'An error occurred')
            console.error('Form submission error:', error)
        } finally {
            setIsLoading(false)
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
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200">
                            <p className="text-sm text-green-600">
                                Ticket listing submitted successfully!
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
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
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Submitting...
                                </div>
                            ) : (
                                'List Tickets'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
