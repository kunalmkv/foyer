'use client'
import {useState} from "react";
import {Calendar, Clock, MapPin, Shield, Star, Image, Plus, ShoppingCart} from "lucide-react";
import {Events} from "@/app/types/Events";
import Link from "next/link";
export const EventHero = ({ event }:{event:Events}) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    const handleImageError = () => {
        setImageError(true);
        setImageLoading(false);
    };

    const renderImage = () => {
        // If no imageUrl is provided or there's an error, show fallback
        if (!event.imageUrl || imageError) {
            return (
                <div className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-600 to-red-500 flex items-center justify-center">
                    <div className="text-center text-white">
                        <Image size={48} className="mx-auto mb-2 opacity-80" />
                        <div className="text-lg font-semibold opacity-90">Event Image</div>
                        <div className="text-sm opacity-70">{event.name}</div>
                    </div>
                </div>
            );
        }

        return (
            <>
                {/* Loading skeleton */}
                {imageLoading && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                        <div className="text-gray-400">
                            <Image size={48} />
                        </div>
                    </div>
                )}

                {/* Actual image */}
                <img
                    src={event.imageUrl}
                    alt={`${event.name} event image`}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                        imageLoading ? 'opacity-0' : 'opacity-100'
                    }`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    loading="lazy"
                />
            </>
        );
    };

    return (
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Event Image */}
            <div className="relative">
                <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl relative">
                    {renderImage()}

                    {/* Overlay gradient for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                </div>
            </div>

            {/* Event Details */}
            <div className="flex flex-col justify-center">
                <div className="mb-6">
                    <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                        {event.name}
                    </h1>

                    <div className="flex flex-wrap gap-4 mb-6">
                        <div className="flex items-center gap-2 text-gray-300">
                            <Clock size={20} />
                            <span className="font-medium">{event.category}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                            <MapPin size={20} />
                            <span className="font-medium">{event.venue}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-1 text-green-400">
                            <Shield size={16} />
                            <span className="text-sm font-medium">Verified seller</span>
                        </div>
                    </div>

                    <p className="text-gray-300 leading-relaxed mb-6">
                        {event.description}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <Link href="/sell">
                        <button className="px-6 py-3 rounded-xl border-2 border-green-500 text-white hover:bg-green-500/10 transition-all duration-200 flex items-center gap-2">
                            <Plus size={20} />
                            Create Offer to Sell
                        </button>
                    </Link>
                    
                    <Link href="/buy">
                        <button className="px-6 py-3 rounded-xl border-2 border-red-500 text-white hover:bg-red-500/10 transition-all duration-200 flex items-center gap-2">
                            <ShoppingCart size={20} />
                            Create Offer to Buy
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};
