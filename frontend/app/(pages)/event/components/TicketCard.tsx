import {Shield, Users} from "lucide-react";

export const TicketCard = ({ ticket }) => {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:border-blue-200">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{ticket.section}</h3>
                        {ticket.badge && (
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                ticket.badge === 'Great' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                {ticket.badge}
              </span>
                        )}
                    </div>

                    {ticket.details && (
                        <p className="text-gray-600 mb-2">{ticket.details}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span>{ticket.quantity} tickets</span>
                        </div>
                        {ticket.remaining && (
                            <div className="text-pink-600 font-medium">
                                {ticket.remaining} tickets remaining in this listing
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-right">
                    {ticket.originalPrice && (
                        <div className="text-sm text-gray-500 line-through mb-1">
                            INR{ticket.originalPrice.toLocaleString()}
                        </div>
                    )}
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                        INR{ticket.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mb-3">incl. fees</div>

                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors">
                        Buy Now
                    </button>
                </div>
            </div>

            {/* Seller Info */}
            <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">S</span>
                        </div>
                        <div>
                            <div className="font-medium text-gray-900">Verified Seller</div>
                            <div className="text-sm text-gray-600">99% positive feedback</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 text-green-600">
                        <Shield size={16} />
                        <span className="text-sm font-medium">Secure</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
