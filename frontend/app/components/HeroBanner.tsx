'use client'
import {useState} from "react";
import {ChevronLeft, ChevronRight} from "lucide-react";
import Link from "next/link";
import {Events} from "@/app/types/Events";

const getCategoryIcon = (category: Events['category']) => {
    switch(category) {
        case 'SPORTS': return '🏈';
        case 'MUSIC': return '🎤';
        case 'COMEDY': return '🎭';
        case 'EDUCATION': return '📚';
        default: return '🎫';
    }
};

const getCategoryGradient = (category: Events['category']) => {
    switch(category) {
        case 'SPORTS': return 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)';
        case 'MUSIC': return 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)';
        case 'COMEDY': return 'linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fb923c 100%)';
        case 'EDUCATION': return 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)';
        default: return 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)';
    }
};

export const HeroBanner = ({events}:{events:Events[]}) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    console.log(events,"getting events")
    // Filter events to show only upcoming or ongoing events
    const activeEvents = events

    // If no active events, return a placeholder
    if (activeEvents.length === 0) {
        return (
            <div className="relative w-full h-96 rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-gray-700">
                <div className="text-center">
                    <div className="text-6xl mb-4">🎫</div>
                    <p className="text-gray-300 text-xl font-medium">No upcoming events available</p>
                    <p className="text-gray-500 text-sm mt-2">Check back soon for exciting new events!</p>
                </div>
            </div>
        );
    }

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % activeEvents.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + activeEvents.length) % activeEvents.length);

    const currentEvent = activeEvents[currentSlide];

    return (
        <div className="relative w-full h-96 rounded-3xl overflow-hidden shadow-2xl">
            <div
                className="w-full h-full flex items-center justify-between p-12 text-white relative"
                style={{
                    background: currentEvent.imageUrl
                        ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${currentEvent.imageUrl})`
                        : getCategoryGradient(currentEvent.category),
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                <div className="flex-1">
                    <div className="text-6xl mb-4">{getCategoryIcon(currentEvent.category)}</div>
                    <h2 className="text-5xl font-bold mb-2">{currentEvent.name}</h2>
                    <p className="text-xl mb-2 opacity-90">{currentEvent.venue}</p>
                    <p className="text-lg mb-6 opacity-80">{currentEvent.description}</p>
                    <Link href={`/event/${currentEvent._id}`}>
                        <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl">
                            See Tickets →
                        </button>
                    </Link>
                </div>

                {/* Show dots only if there are multiple events */}
                {activeEvents.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
                        {activeEvents.map((_, index) => (
                            <button
                                key={index}
                                className={`w-3 h-3 rounded-full transition-all ${
                                    index === currentSlide ? 'bg-white' : 'bg-white/50'
                                }`}
                                onClick={() => setCurrentSlide(index)}
                            />
                        ))}
                    </div>
                )}

                {/* Show navigation arrows only if there are multiple events */}
                {activeEvents.length > 1 && (
                    <>
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
                        >
                            <ChevronLeft className="text-white" size={24} />
                        </button>

                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
                        >
                            <ChevronRight className="text-white" size={24} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
