import { Proposal, CreateProposalRequest, VoteRequest, IProposalService } from "@/app/types/Proposals";
import { baseurl } from "@/app/consts";

export class ProposalService implements IProposalService {
    async getAllProposals(): Promise<Proposal[]> {
        const response = await fetch(`${baseurl}/proposal`, {
            cache: 'no-cache',
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch proposals: ${response.statusText}`);
        }
        const { proposals } = await response.json();
        return proposals;
    }

    async getProposalById(id: string): Promise<Proposal> {
        const response = await fetch(`${baseurl}/proposal/${id}`, {
            cache: 'no-cache',
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch proposal: ${response.statusText}`);
        }
        const { proposal } = await response.json();
        return proposal;
    }

    async createProposal(proposal: CreateProposalRequest): Promise<Proposal> {
        const response = await fetch(`${baseurl}/proposal/suggest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(proposal),
        });
        if (!response.ok) {
            throw new Error(`Failed to create proposal: ${response.statusText}`);
        }
        const { proposal: createdProposal } = await response.json();
        return createdProposal;
    }

    async voteProposal(proposalId: string, vote: VoteRequest): Promise<Proposal> {
        const response = await fetch(`${baseurl}/proposal/${proposalId}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(vote),
        });
        if (!response.ok) {
            throw new Error(`Failed to vote on proposal: ${response.statusText}`);
        }
        const { proposal } = await response.json();
        return proposal;
    }
}

export const proposalService = new ProposalService();
