export interface Proposal {
    _id: string;
    eventName: string;
    date: string;
    description: string;
    category: 'SPORTS' | 'COMEDY' | 'MUSIC' | 'EDUCATION';
    proposer: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    upvoters: string[];
    downvoters: string[];
    upvotes: number;
    downvotes: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProposalRequest {
    eventName: string;
    date: string;
    description: string;
    category: 'SPORTS' | 'COMEDY' | 'MUSIC' | 'EDUCATION';
    proposer: string;
}

export interface VoteRequest {
    voteType: 'UPVOTE' | 'DOWNVOTE';
    userAddress: string;
}

export interface IProposalService {
    getAllProposals(): Promise<Proposal[]>;
    getProposalById(id: string): Promise<Proposal>;
    createProposal(proposal: CreateProposalRequest): Promise<Proposal>;
    voteProposal(proposalId: string, vote: VoteRequest): Promise<Proposal>;
}
