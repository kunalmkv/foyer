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
            case 'SPORTS': return 'bg-green-900/30 text-green-300 border border-green-500/30';
            case 'COMEDY': return 'bg-purple-900/30 text-purple-300 border border-purple-500/30';
            case 'MUSIC': return 'bg-pink-900/30 text-pink-300 border border-pink-500/30';
            case 'EDUCATION': return 'bg-blue-900/30 text-blue-300 border border-blue-500/30';
            default: return 'bg-gray-700/50 text-gray-300 border border-gray-600/50';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-900/30 text-green-300 border border-green-500/30';
            case 'REJECTED': return 'bg-red-900/30 text-red-300 border border-red-500/30';
            case 'PENDING': return 'bg-yellow-900/30 text-yellow-300 border border-yellow-500/30';
            default: return 'bg-gray-700/50 text-gray-300 border border-gray-600/50';
        }
    };

    return (
        <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 hover:border-gray-600/50 transition-all duration-200 hover:shadow-xl">
            <div className="flex items-start gap-4">
                {/* Vote Button */}
                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={() => onVote(proposal._id, 'UPVOTE')}
                        disabled={(!canVote && !isDownvoted) || isVoting}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${
                            isUpvoted
                                ? 'bg-green-600/20 text-green-400 border border-green-500/30 cursor-not-allowed'
                                : (canVote || isDownvoted) && !isVoting
                                ? 'bg-gray-700/50 text-gray-400 hover:bg-green-600/20 hover:text-green-400 hover:border-green-500/30 border border-gray-600'
                                : 'bg-gray-700/30 text-gray-500 cursor-not-allowed border border-gray-700'
                        }`}
                    >
                        {isVoting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : (
                            <ThumbsUp size={16} />
                        )}
                    </button>
                    <span className="text-sm font-medium text-gray-300">{proposal.upvotes}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Title and Category */}
                    <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-semibold text-white line-clamp-2 pr-2">
                            {proposal.eventName}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`px-3 py-1 rounded-lg text-xs font-medium backdrop-blur-sm ${getCategoryColor(proposal.category)}`}>
                                {proposal.category}
                            </span>
                            <span className={`px-3 py-1 rounded-lg text-xs font-medium backdrop-blur-sm ${getStatusColor(proposal.status)}`}>
                                {proposal.status}
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                        {proposal.description}
                    </p>

                    {/* Meta Information */}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <Calendar size={12} className="text-blue-400" />
                                <span>{formatDate(proposal.date)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <User size={12} className="text-purple-400" />
                                <span className="font-mono">{proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}</span>
                            </div>
                        </div>
                        <div className="text-gray-400 bg-gray-700/50 px-2 py-1 rounded-lg">
                            {proposal.upvoters.length + proposal.downvoters.length} votes
                        </div>
                    </div>

                    {/* Downvote Button for Mobile */}
                    {userAddress && (
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => onVote(proposal._id, 'DOWNVOTE')}
                                disabled={(!canVote && !isUpvoted) || isVoting}
                                className={`px-4 py-2 text-xs rounded-xl transition-all duration-200 flex items-center gap-2 border backdrop-blur-sm ${
                                    isDownvoted
                                        ? 'bg-red-600/20 text-red-400 border-red-500/30 cursor-not-allowed'
                                        : (canVote || isUpvoted) && !isVoting
                                        ? 'bg-gray-700/50 text-gray-400 hover:bg-red-600/20 hover:text-red-400 hover:border-red-500/30 border-gray-600'
                                        : 'bg-gray-700/30 text-gray-500 cursor-not-allowed border-gray-700'
                                }`}
                            >
                                {isVoting ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                                ) : (
                                    <ThumbsDown size={12} />
                                )}
                                <span>{proposal.downvotes}</span>
                            </button>
                        </div>
                    )}

                    {/* Connect Wallet Message */}
                    {!userAddress && (
                        <div className="mt-4 text-center py-3 bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-500/30 rounded-xl backdrop-blur-sm">
                            <p className="text-xs text-amber-300">Connect wallet to vote</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
