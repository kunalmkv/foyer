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
        case 'SPORTS': return 'linear-gradient(135deg, #0F4A3C 0%, #2A6B5C 50%, #6D94C5 100%)';
        case 'MUSIC': return 'linear-gradient(135deg, #2A3B5C 0%, #465C88 50%, #6D94C5 100%)';
        case 'COMEDY': return 'linear-gradient(135deg, #8B5A3C 0%, #D2691E 50%, #FFD700 100%)';
        case 'EDUCATION': return 'linear-gradient(135deg, #4A5568 0%, #6B7280 50%, #9CA3AF 100%)';
        default: return 'linear-gradient(135deg, #6D94C5 0%, #CBD6EB 50%, #E8DFCA 100%)';
    }
};

export const HeroBanner = ({events}:{events:Events[]}) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    console.log(events,"getting events")
    // Filter events to show only upcoming or ongoing events
    const activeEvents = events.filter(event =>
        event.status === 'UPCOMING' || event.status === 'ONGOING'
    );

    // If no active events, return a placeholder
    if (activeEvents.length === 0) {
        return (
            <div className="relative w-full h-96 rounded-3xl overflow-hidden shadow-2xl bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500 text-xl">No upcoming events available</p>
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
                        <button className="bg-white text-gray-900 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105">
                            See Tickets
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
