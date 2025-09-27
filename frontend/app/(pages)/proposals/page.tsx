'use client';

import { useState, useEffect } from 'react';
import { Proposal } from '@/app/types/Proposals';
import { proposalService } from '@/app/service/proposals.service';
import { ProposalCard } from './components/ProposalCard';
import { CreateProposalModal } from './components/CreateProposalModal';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
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
            <div className="min-h-screen bg-[#E8DFCA] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading proposals...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#E8DFCA] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button 
                        onClick={loadProposals}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#E8DFCA]">
            <div className="container mx-auto px-8 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Event Proposals</h1>
                        <p className="text-gray-600">Suggest and vote on new events for the community</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Wallet Connection */}
                        <div className="flex items-center gap-2">
                            <ConnectButton />
                            {isConnected && (
                                <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                    Connected
                                </div>
                            )}
                        </div>
                        
                        <button
                            onClick={() => setShowCreateModal(true)}
                            disabled={!isConnected}
                            className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                                isConnected
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            <Plus size={20} />
                            Suggest Event
                        </button>
                    </div>
                </div>

                {/* Debug Info */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mb-4 p-3 bg-gray-100 rounded-lg text-xs">
                        <p><strong>Debug Info:</strong></p>
                        <p>Wallet Connected: {isConnected ? 'Yes' : 'No'}</p>
                        <p>Address: {address || 'None'}</p>
                        <p>Proposals Count: {proposals.length}</p>
                    </div>
                )}

                {/* Filters */}
                <div className="flex items-center gap-4 mb-8">
                    <Filter size={20} className="text-gray-600" />
                    <div className="flex gap-2 flex-wrap">
                        {categories.map(category => (
                            <button
                                key={category.key}
                                onClick={() => setFilter(category.key)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    filter === category.key
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                {category.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Proposals Grid */}
                {filteredProposals.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg mb-4">No proposals found</p>
                        <p className="text-gray-400">Be the first to suggest an event!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
