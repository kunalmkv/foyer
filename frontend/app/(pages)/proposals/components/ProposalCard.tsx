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
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                        {proposal.eventName}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(proposal.category)}`}>
                            {proposal.category}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                            {proposal.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {proposal.description}
            </p>

            {/* Date */}
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                <Calendar size={16} />
                <span>{formatDate(proposal.date)}</span>
            </div>

            {/* Proposer */}
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                <User size={16} />
                <span>Proposed by: {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}</span>
            </div>

            {/* Voting Section */}
            <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <ThumbsUp size={16} className="text-green-600" />
                            <span className="text-sm font-medium text-green-600">{proposal.upvotes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <ThumbsDown size={16} className="text-red-600" />
                            <span className="text-sm font-medium text-red-600">{proposal.downvotes}</span>
                        </div>
                    </div>
                    <div className="text-xs text-gray-500">
                        {proposal.upvoters.length + proposal.downvoters.length} votes
                    </div>
                </div>

                {/* Vote Buttons */}
                {userAddress ? (
                    <div className="flex gap-2">
                        <button
                            onClick={() => onVote(proposal._id, 'UPVOTE')}
                            disabled={(!canVote && !isDownvoted) || isVoting}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isUpvoted
                                    ? 'bg-green-100 text-green-800 cursor-not-allowed shadow-sm'
                                    : (canVote || isDownvoted) && !isVoting
                                    ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 hover:shadow-sm transform hover:scale-105'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            {isVoting ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            ) : (
                                <ThumbsUp size={16} />
                            )}
                            {isUpvoted ? 'Upvoted' : isVoting ? 'Voting...' : 'Upvote'}
                        </button>
                        <button
                            onClick={() => onVote(proposal._id, 'DOWNVOTE')}
                            disabled={(!canVote && !isUpvoted) || isVoting}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isDownvoted
                                    ? 'bg-red-100 text-red-800 cursor-not-allowed shadow-sm'
                                    : (canVote || isUpvoted) && !isVoting
                                    ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 hover:shadow-sm transform hover:scale-105'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            {isVoting ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            ) : (
                                <ThumbsDown size={16} />
                            )}
                            {isDownvoted ? 'Downvoted' : isVoting ? 'Voting...' : 'Downvote'}
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-2">Connect your wallet to vote</p>
                        <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                            <span>•</span>
                            <span>Vote on proposals</span>
                            <span>•</span>
                            <span>Create new events</span>
                            <span>•</span>
                            <span>Participate in community</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
