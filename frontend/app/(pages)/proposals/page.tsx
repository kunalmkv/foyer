'use client';

import { useState, useEffect } from 'react';
import { Proposal } from '@/app/types/Proposals';
import { proposalService } from '@/app/service/proposals.service';
import { ProposalCard } from './components/ProposalCard';
import { CreateProposalModal } from './components/CreateProposalModal';
import { useAccount } from 'wagmi';
import { Plus, Filter } from 'lucide-react';

export default function ProposalsPage() {
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [filter, setFilter] = useState<'ALL' | 'SPORTS' | 'COMEDY' | 'MUSIC' | 'EDUCATION'>('ALL');
    const [votingProposalId, setVotingProposalId] = useState<string | null>(null);
    const { address, isConnected } = useAccount();

    useEffect(() => {
        loadProposals();
    }, []);

    const loadProposals = async () => {
        try {
            setLoading(true);
            const data = await proposalService.getAllProposals();
            setProposals(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load proposals');
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (proposalId: string, voteType: 'UPVOTE' | 'DOWNVOTE') => {
        if (!address) {
            alert('Please connect your wallet to vote');
            return;
        }

        setVotingProposalId(proposalId);
        try {
            const updatedProposal = await proposalService.voteProposal(proposalId, {
                voteType,
                userAddress: address
            });

            setProposals(prev =>
                prev.map(p => p._id === proposalId ? updatedProposal : p)
            );
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to vote';
            alert(errorMessage);
            console.error('Voting error:', err);
        } finally {
            setVotingProposalId(null);
        }
    };

    const handleCreateProposal = async (proposalData: any) => {
        if (!address) {
            alert('Please connect your wallet to create a proposal');
            return;
        }

        try {
            const newProposal = await proposalService.createProposal({
                ...proposalData,
                proposer: address
            });

            setProposals(prev => [newProposal, ...prev]);
            setShowCreateModal(false);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to create proposal');
        }
    };

    const filteredProposals = filter === 'ALL'
        ? proposals
        : proposals.filter(p => p.category === filter);

    const categories = [
        { key: 'ALL', label: 'All Proposals' },
        { key: 'SPORTS', label: 'Sports' },
        { key: 'COMEDY', label: 'Comedy' },
        { key: 'MUSIC', label: 'Music' },
        { key: 'EDUCATION', label: 'Education' }
    ] as const;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-300">Loading proposals...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                        onClick={loadProposals}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-200"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <div>
                                <h1 className="text-4xl font-bold text-white">Event Proposals</h1>
                                <p className="text-gray-300 mt-2 text-sm">Suggest and vote on new events for the community</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            disabled={!isConnected}
                            className={`px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 ${isConnected
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-50'
                            }`}
                        >
                            <Plus size={20} />
                            Suggest Event
                        </button>
                    </div>

                    {!isConnected && (
                        <div className="mb-6 bg-amber-900/20 border border-amber-500/30 rounded-2xl p-6 backdrop-blur-sm">
                            <div className="text-center">
                                <div className="p-3 bg-amber-500 rounded-2xl w-fit mx-auto mb-4">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                <h3 className="text-xl font-semibold text-amber-300 mb-2">Wallet Connection Required</h3>
                                <p className="text-amber-200">Please connect your wallet to create proposals and vote</p>
                            </div>
                        </div>
                    )}
                </div>


                {/* Sort and Filters */}
                <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-300">Sort by:</span>
                                <select className="text-sm bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    <option>Created Time</option>
                                    <option>Votes</option>
                                    <option>Category</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter size={20} className="text-gray-400" />
                                <div className="flex gap-2 flex-wrap">
                                    {categories.map(category => (
                                        <button
                                            key={category.key}
                                            onClick={() => setFilter(category.key)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                filter === category.key
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600'
                                            }`}
                                        >
                                            {category.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Search proposals..."
                                className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Proposals Grid */}
                {filteredProposals.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-2xl p-8">
                            <div className="p-4 bg-gray-600 rounded-2xl w-fit mx-auto mb-6">
                                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8l2 2 4-4" />
                                </svg>
                            </div>
                            <p className="text-gray-300 text-lg mb-4">No proposals found</p>
                            <p className="text-gray-400">Be the first to suggest an event!</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredProposals.map(proposal => (
                            <ProposalCard
                                key={proposal._id}
                                proposal={proposal}
                                onVote={handleVote}
                                userAddress={address}
                                isVoting={votingProposalId === proposal._id}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Create Proposal Modal */}
            {showCreateModal && (
                <CreateProposalModal
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateProposal}
                />
            )}
        </div>
    );
}
