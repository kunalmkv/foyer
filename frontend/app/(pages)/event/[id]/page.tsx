import {Breadcrumb} from "@/app/(pages)/event/components/Breadcrums";
import {EventHero} from "@/app/(pages)/event/components/EventHero";
import {TicketCard} from "@/app/(pages)/event/components/TicketCard";
import {EventInformation} from "@/app/(pages)/event/components/EventInfo";
import {OfferCard} from "@/app/(pages)/event/components/OfferCard";
import {eventService} from "@/app/service/events.service";
import {offerService} from "@/app/service/offers.service";
import {Offer} from "@/app/types/Offers";

interface EventDetailsPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EventDetailsPage({ params }: EventDetailsPageProps) {
    const { id } = await params;
    const event = await eventService.getEventById(parseInt(id));
    
    // Fetch offers for this event
    let offers: Offer[] = [];
    let sellOffers: Offer[] = [];
    let buyOffers: Offer[] = [];
    
    try {
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
        offers = activeOffersResponse.offers.length > 0 ? activeOffersResponse.offers : allOffersResponse.offers;
        console.log('Final offers array:', offers);
        
        // Separate sell and buy offers
        sellOffers = offers.filter(offer => offer.type === 'OFFER_TO_SELL');
        buyOffers = offers.filter(offer => offer.type === 'OFFER_TO_BUY');
        console.log('Sell offers:', sellOffers);
        console.log('Buy offers:', buyOffers);
    } catch (error) {
        console.error('Failed to fetch offers:', error);
    }

    return (
        <div className="min-h-screen bg-[#E8DFCA]">
            <main className="container mx-auto px-8 py-8">
                <Breadcrumb eventName={event.name} />

                <EventHero event={event} />

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Sell Offers Section */}
                        {sellOffers.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Tickets ({sellOffers.length})</h2>
                                <div className="space-y-4">
                                    {sellOffers.map((offer) => (
                                        <OfferCard key={offer.id} offer={offer} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Buy Offers Section */}
                        {buyOffers.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Buy Requests ({buyOffers.length})</h2>
                                <div className="space-y-4">
                                    {buyOffers.map((offer) => (
                                        <OfferCard key={offer.id} offer={offer} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No Offers Message */}
                        {offers.length === 0 && (
                            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">No Active Offers</h3>
                                <p className="text-gray-600 mb-6">
                                    There are currently no active buy or sell offers for this event.
                                </p>
                                <div className="text-sm text-gray-500 mb-4">
                                    Event ID: {id} | API Base URL: http://localhost:3000
                                </div>
                                <div className="flex gap-4 justify-center">
                                    <a 
                                        href="/sell" 
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                                    >
                                        List Your Tickets
                                    </a>
                                    <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors">
                                        Make Buy Request
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <EventInformation event={event} />

                        {/* Quick Stats */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4">Market Stats</h3>
                            <div className="space-y-3">
                                {sellOffers.length > 0 ? (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Sell Offers</span>
                                            <span className="font-bold">{sellOffers.length}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Lowest Price</span>
                                            <span className="font-bold text-green-600">
                                                {Math.min(...sellOffers.map(o => o.ask / Math.pow(10, 6))).toFixed(2)} PYUSD
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Highest Price</span>
                                            <span className="font-bold">
                                                {Math.max(...sellOffers.map(o => o.ask / Math.pow(10, 6))).toFixed(2)} PYUSD
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center text-gray-500 py-4">
                                        No sell offers available
                                    </div>
                                )}
                                
                                {buyOffers.length > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Buy Requests</span>
                                        <span className="font-bold">{buyOffers.length}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
