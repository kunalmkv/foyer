import _ from "lodash";

import mongoLib from "../../lib/mongo.lib";
import loggerLib from "../../lib/logger.lib";

import proposalModel from "../../model/proposal.model";
import eventCategoryEnum from "../../enum/event.category.enum";

async function suggestProposal(req: any, res: any) {
    try {
        const { eventName, date, description, category, proposer } = req.body;

        // Validate required fields
        if (_.isEmpty(eventName)) {
            return res.status(400).send({message: "Bad Request", details: "eventName is required"});
        }

        if (_.isEmpty(date)) {
            return res.status(400).send({message: "Bad Request", details: "date is required"});
        }

        if (_.isEmpty(description)) {
            return res.status(400).send({message: "Bad Request", details: "description is required"});
        }

        if (_.isEmpty(category)) {
            return res.status(400).send({message: "Bad Request", details: "category is required"});
        }

        if (_.isEmpty(proposer)) {
            return res.status(400).send({message: "Bad Request", details: "proposer is required"});
        }


        // Validate category
        if (!Object.values(eventCategoryEnum).includes(category)) {
            return res.status(400).send({
                message: "Bad Request",
                details: `category must be one of ${Object.values(eventCategoryEnum).join(", ")}`
            });
        }

        // Validate date format
        const proposalDate = new Date(date);
        if (isNaN(proposalDate.getTime())) {
            return res.status(400).send({message: "Bad Request", details: "date must be a valid date"});
        }

        // Check if date is in the future
        if (proposalDate <= new Date()) {
            return res.status(400).send({message: "Bad Request", details: "date must be in the future"});
        }

        // Create new proposal
        const proposal = new proposalModel({
            eventName,
            date: proposalDate,
            description,
            category,
            proposer,
            status: "PENDING"
        });

        const savedProposal = await proposal.save();

        return res.status(201).send({
            message: "Proposal suggested successfully",
            proposal: savedProposal
        });
    } catch (error) {
        loggerLib.logError(error);
        return res.status(500).send({message: "Internal Server Error"});
    }
}

async function getProposals(req: any, res: any) {
    try {
        const { status, category, page = 1, limit = 10 } = req.query;

        if (page <= 0 || limit <= 0) {
            return res.status(400).send({message: "Bad Request", details: "page and limit must be positive integers"});
        }

        if (limit > 100) {
            return res.status(400).send({message: "Bad Request", details: "limit must not exceed 100"});
        }

        if (status && !["PENDING", "APPROVED", "REJECTED"].includes(status)) {
            return res.status(400).send({
                message: "Bad Request",
                details: "status must be one of PENDING, APPROVED, REJECTED"
            });
        }

        if (category && !Object.values(eventCategoryEnum).includes(category)) {
            return res.status(400).send({
                message: "Bad Request",
                details: `category must be one of ${Object.values(eventCategoryEnum).join(", ")}`
            });
        }

        const proposals = await mongoLib.findWithSkipLimit(
            proposalModel,
            {
                ...(category ? {category: category} : {}),
                ...(status ? {status: status} : {}),
            },
            (page - 1) * limit,
            limit
        );

        return res.status(200).send({message: "Success", proposals: proposals});
    } catch (error) {
        loggerLib.logError(error);
        return res.status(500).send({message: "Internal Server Error"});
    }
}

async function getProposal(req: any, res: any) {
    try {
        const { proposalId } = req.params;
        
        if (_.isEmpty(proposalId)) {
            return res.status(400).send({message: "Bad Request", details: "proposalId is required"});
        }

        const proposal = await mongoLib.findOne(proposalModel, {_id: proposalId});
        if (_.isEmpty(proposal)) {
            return res.status(404).send({message: "Proposal not found"});
        }

        return res.status(200).send({message: "Success", proposal: proposal});
    } catch (error) {
        loggerLib.logError(error);
        return res.status(500).send({message: "Internal Server Error"});
    }
}

async function voteProposal(req: any, res: any) {
    try {
        const { proposalId } = req.params;
        const { voteType, userAddress } = req.body;

        if (_.isEmpty(proposalId)) {
            return res.status(400).send({message: "Bad Request", details: "proposalId is required"});
        }

        if (_.isEmpty(voteType) || !["UPVOTE", "DOWNVOTE"].includes(voteType)) {
            return res.status(400).send({message: "Bad Request", details: "voteType must be either UPVOTE or DOWNVOTE"});
        }

        if (_.isEmpty(userAddress)) {
            return res.status(400).send({message: "Bad Request", details: "userAddress is required"});
        }

        // Find the proposal
        const proposal = await mongoLib.findOne(proposalModel, {_id: proposalId});
        if (_.isEmpty(proposal)) {
            return res.status(404).send({message: "Proposal not found"});
        }

        // Check if user has already voted
        const isUpvoter = proposal.upvoters.includes(userAddress);
        const isDownvoter = proposal.downvoters.includes(userAddress);
        
        if (isUpvoter || isDownvoter) {
            if ((isUpvoter && voteType === "UPVOTE") || (isDownvoter && voteType === "DOWNVOTE")) {
                return res.status(400).send({message: "Bad Request", details: `User has already ${voteType.toLowerCase()}d this proposal`});
            } else {
                // User is changing their vote
                if (isUpvoter && voteType === "DOWNVOTE") {
                    // Remove from upvoters, add to downvoters
                    await proposalModel.updateOne(
                        { _id: proposalId },
                        { 
                            $pull: { upvoters: userAddress },
                            $push: { downvoters: userAddress },
                            $inc: { upvotes: -1, downvotes: 1 }
                        }
                    );
                } else if (isDownvoter && voteType === "UPVOTE") {
                    // Remove from downvoters, add to upvoters
                    await proposalModel.updateOne(
                        { _id: proposalId },
                        { 
                            $pull: { downvoters: userAddress },
                            $push: { upvoters: userAddress },
                            $inc: { upvotes: 1, downvotes: -1 }
                        }
                    );
                }
            }
        } else {
            // New vote - add to appropriate array and increment count
            if (voteType === "UPVOTE") {
                await proposalModel.updateOne(
                    { _id: proposalId },
                    { 
                        $push: { upvoters: userAddress },
                        $inc: { upvotes: 1 }
                    }
                );
            } else {
                await proposalModel.updateOne(
                    { _id: proposalId },
                    { 
                        $push: { downvoters: userAddress },
                        $inc: { downvotes: 1 }
                    }
                );
            }
        }

        // Get updated proposal
        const updatedProposal = await mongoLib.findOne(proposalModel, {_id: proposalId});

        return res.status(200).send({
            message: `Proposal ${voteType.toLowerCase()}d successfully`,
            proposal: updatedProposal
        });
    } catch (error) {
        loggerLib.logError(error);
        return res.status(500).send({message: "Internal Server Error"});
    }
}

export default {
    suggestProposal: suggestProposal,
    getProposals: getProposals,
    getProposal: getProposal,
    voteProposal: voteProposal,
};
