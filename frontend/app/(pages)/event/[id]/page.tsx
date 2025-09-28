'use client'

import { useState, useEffect } from 'react';
import {Breadcrumb} from "@/app/(pages)/event/components/Breadcrums";
import {EventHero} from "@/app/(pages)/event/components/EventHero";
import {TicketCard} from "@/app/(pages)/event/components/TicketCard";
import {EventInformation} from "@/app/(pages)/event/components/EventInfo";
import {OfferCard} from "@/app/(pages)/event/components/OfferCard";
import {eventService} from "@/app/service/events.service";
import {offerService} from "@/app/service/offers.service";
import {Offer, OfferTypeEnum} from "@/app/types/Offers";
import Link from "next/link";
import {Plus, ShoppingCart} from "lucide-react";

interface EventDetailsPageProps {
    params: Promise<{
        id: string;
    }>;
}

type FilterType = 'all' | 'sell' | 'buy';

export default function EventDetailsPage({ params }: EventDetailsPageProps) {
    const [event, setEvent] = useState<any>(null);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterType>('all');
    const [eventId, setEventId] = useState<string>('');

    useEffect(() => {
        const initializePage = async () => {
            try {
                const resolvedParams = await params;
                const id = resolvedParams.id;
                setEventId(id);

                // Fetch event
                const eventData = await eventService.getEventById(parseInt(id));
                setEvent(eventData);

                // Fetch offers
                console.log('Fetching offers for event ID:', id);

                // First try to fetch all offers (no status filter)
                const allOffersResponse = await offerService.getEventOffers({
                    eventId: id,
                    limit: 50
                });
                console.log('All offers response (no status filter):', allOffersResponse);

                // Then try with ACTIVE status
                const activeOffersResponse = await offerService.getEventOffers({
                    eventId: id,
                    status: 'ACTIVE',
                    limit: 50
                });
                console.log('Active offers response:', activeOffersResponse);

                // Use active offers if available, otherwise use all offers
                const allOffers = activeOffersResponse.offers.length > 0 ? activeOffersResponse.offers : allOffersResponse.offers;
                setOffers(allOffers);
                console.log('Final offers array:', allOffers);

            } catch (error) {
                console.error('Failed to fetch data:', error);
                setError('Failed to load event data');
            } finally {
                setLoading(false);
            }
        };

        initializePage();
    }, [params]);

    // Filter offers based on selected filter
    const filteredOffers = offers.filter(offer => {
        switch (filter) {
            case 'sell':
                return offer.type === OfferTypeEnum.OFFER_TO_SELL;
            case 'buy':
                return offer.type === OfferTypeEnum.OFFER_TO_BUY;
            default:
                return true;
        }
    });

    const sellOffers = offers.filter(offer => offer.type === OfferTypeEnum.OFFER_TO_SELL);
    const buyOffers = offers.filter(offer => offer.type === OfferTypeEnum.OFFER_TO_BUY);

    console.log(sellOffers,'sellOffer')

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                    <p className="text-gray-300">Loading event...</p>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error || 'Event not found'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">
            <main className="container mx-auto px-6 md:px-8 py-8">
                <Breadcrumb eventName={event.name} />

                <EventHero event={event} />

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Filter Buttons */}
                        <div className="mb-6">
                            <div className="flex gap-2 bg-gray-800 rounded-xl p-1 shadow-xl border border-gray-700">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        filter === 'all'
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                                    }`}
                                >
                                    All Offers ({offers.length})
                                </button>
                                <button
                                    onClick={() => setFilter('sell')}
                                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        filter === 'sell'
                                            ? 'bg-green-600 text-white'
                                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                                    }`}
                                >
                                    Sell Offers ({sellOffers.length})
                                </button>
                                <button
                                    onClick={() => setFilter('buy')}
                                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        filter === 'buy'
                                            ? 'bg-purple-600 text-white'
                                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                                    }`}
                                >
                                    Buy Requests ({buyOffers.length})
                                </button>
                            </div>
                        </div>

                        {/* Filtered Offers Section */}
                        {filteredOffers.length > 0 ? (
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-white mb-6">
                                    {filter === 'all' && `All Offers (${filteredOffers.length})`}
                                    {filter === 'sell' && `Available Tickets (${filteredOffers.length})`}
                                    {filter === 'buy' && `Buy Requests (${filteredOffers.length})`}
                                </h2>
                                <div className="space-y-4">
                                    {filteredOffers.map((offer) => (
                                        <OfferCard key={offer.id} offer={offer} />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700 text-center">
                                <h3 className="text-xl font-bold text-white mb-4">
                                    {filter === 'all' && 'No Active Offers'}
                                    {filter === 'sell' && 'No Sell Offers Available'}
                                    {filter === 'buy' && 'No Buy Requests Available'}
                                </h3>
                                <p className="text-gray-300 mb-6">
                                    {filter === 'all' && 'There are currently no active buy or sell offers for this event.'}
                                    {filter === 'sell' && 'No one is currently selling tickets for this event.'}
                                    {filter === 'buy' && 'No one is currently looking to buy tickets for this event.'}
                                </p>
                                <div className="text-sm text-gray-400 mb-4">
                                    Event ID: {eventId} | API Base URL: http://localhost:3000
                                </div>
                                <div className="flex gap-4 justify-center">
                                    <a
                                        href="/sell"
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors transform hover:scale-105 shadow-xl"
                                    >
                                        List Your Tickets
                                    </a>
                                    <a
                                        href="/buy"
                                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors transform hover:scale-105 shadow-xl"
                                    >
                                        Make Buy Request
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <EventInformation event={event} />
                    </div>
                </div>
            </main>
        </div>
    );
};
