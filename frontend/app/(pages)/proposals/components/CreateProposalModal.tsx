'use client';

import { useState } from 'react';
import { X, Calendar, FileText, Tag } from 'lucide-react';

interface CreateProposalModalProps {
    onClose: () => void;
    onSubmit: (proposal: any) => void;
}

export const CreateProposalModal = ({ onClose, onSubmit }: CreateProposalModalProps) => {
    const [formData, setFormData] = useState({
        eventName: '',
        date: '',
        description: '',
        category: 'EDUCATION' as 'SPORTS' | 'COMEDY' | 'MUSIC' | 'EDUCATION'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.eventName || !formData.date || !formData.description) {
            alert('Please fill in all required fields');
            return;
        }

        // Validate date is in the future
        const selectedDate = new Date(formData.date);
        if (selectedDate <= new Date()) {
            alert('Event date must be in the future');
            return;
        }

        setLoading(true);
        try {
            await onSubmit(formData);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const categories = [
        { value: 'SPORTS', label: 'Sports' },
        { value: 'COMEDY', label: 'Comedy' },
        { value: 'MUSIC', label: 'Music' },
        { value: 'EDUCATION', label: 'Education' }
    ];

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800/95 backdrop-blur-md border border-gray-700/50 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-700/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-white">Suggest New Event</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-200 transition-colors p-2 hover:bg-gray-700/50 rounded-xl"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Event Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Event Name *
                        </label>
                        <input
                            type="text"
                            name="eventName"
                            value={formData.eventName}
                            onChange={handleChange}
                            placeholder="Enter event name"
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white placeholder-gray-400"
                            required
                        />
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Event Date *
                        </label>
                        <input
                            type="datetime-local"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white [color-scheme:dark]"
                            required
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Category *
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white"
                            required
                        >
                            {categories.map(category => (
                                <option key={category.value} value={category.value} className="bg-gray-800 text-white">
                                    {category.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Description *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe the event..."
                            rows={4}
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white placeholder-gray-400 resize-none"
                            required
                        />
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700/50 hover:border-gray-500 transition-all duration-200 backdrop-blur-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Creating...
                                </div>
                            ) : (
                                'Create Proposal'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
