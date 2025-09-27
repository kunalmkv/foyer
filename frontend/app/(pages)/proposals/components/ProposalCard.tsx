'use client';

import { Proposal } from '@/app/types/Proposals';
import { ThumbsUp, ThumbsDown, Calendar, MapPin, User } from 'lucide-react';

interface ProposalCardProps {
    proposal: Proposal;
    onVote: (proposalId: string, voteType: 'UPVOTE' | 'DOWNVOTE') => void;
    userAddress?: string;
    isVoting?: boolean;
}

export const ProposalCard = ({ proposal, onVote, userAddress, isVoting = false }: ProposalCardProps) => {
    const isUpvoted = userAddress ? proposal.upvoters.includes(userAddress) : false;
    const isDownvoted = userAddress ? proposal.downvoters.includes(userAddress) : false;
    const canVote = userAddress && !isUpvoted && !isDownvoted;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'SPORTS': return 'bg-green-100 text-green-800';
            case 'COMEDY': return 'bg-purple-100 text-purple-800';
            case 'MUSIC': return 'bg-pink-100 text-pink-800';
            case 'EDUCATION': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
            <div className="flex items-start gap-4">
                {/* Vote Button */}
                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={() => onVote(proposal._id, 'UPVOTE')}
                        disabled={(!canVote && !isDownvoted) || isVoting}
                        className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${
                            isUpvoted
                                ? 'bg-green-100 text-green-600 cursor-not-allowed'
                                : (canVote || isDownvoted) && !isVoting
                                ? 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {isVoting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : (
                            <ThumbsUp size={16} />
                        )}
                    </button>
                    <span className="text-sm font-medium text-gray-700">{proposal.upvotes}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Title and Category */}
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 pr-2">
                            {proposal.eventName}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(proposal.category)}`}>
                                {proposal.category}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(proposal.status)}`}>
                                {proposal.status}
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {proposal.description}
                    </p>

                    {/* Meta Information */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <Calendar size={12} />
                                <span>{formatDate(proposal.date)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <User size={12} />
                                <span>{proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}</span>
                            </div>
                        </div>
                        <div className="text-gray-400">
                            {proposal.upvoters.length + proposal.downvoters.length} votes
                        </div>
                    </div>

                    {/* Downvote Button for Mobile */}
                    {userAddress && (
                        <div className="mt-3 flex justify-end">
                            <button
                                onClick={() => onVote(proposal._id, 'DOWNVOTE')}
                                disabled={(!canVote && !isUpvoted) || isVoting}
                                className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                                    isDownvoted
                                        ? 'bg-red-100 text-red-600 cursor-not-allowed'
                                        : (canVote || isUpvoted) && !isVoting
                                        ? 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {isVoting ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                                ) : (
                                    <ThumbsDown size={12} />
                                )}
                                <span className="ml-1">{proposal.downvotes}</span>
                            </button>
                        </div>
                    )}

                    {/* Connect Wallet Message */}
                    {!userAddress && (
                        <div className="mt-3 text-center py-2 bg-gray-50 rounded">
                            <p className="text-xs text-gray-500">Connect wallet to vote</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
