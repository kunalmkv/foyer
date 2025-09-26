import mongoose from "mongoose";

import collectionEnum from "../enum/collection.enum";
import eventCategoryEnum from "../enum/event.category.enum";

const proposalSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: Object.values(eventCategoryEnum),
    },
    proposer: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: "PENDING",
        enum: ["PENDING", "APPROVED", "REJECTED"]
    },
    upvoters: [{
        type: String,
        required: true
    }],
    downvoters: [{
        type: String,
        required: true
    }],
    upvotes: {
        type: Number,
        default: 0,
        min: 0
    },
    downvotes: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true,
});

proposalSchema.index({eventName: 1});
proposalSchema.index({date: 1});
proposalSchema.index({category: 1});
proposalSchema.index({proposer: 1});
proposalSchema.index({status: 1});
proposalSchema.index({status: 1, date: 1});
proposalSchema.index({category: 1, status: 1});
proposalSchema.index({"upvoters": 1});
proposalSchema.index({"downvoters": 1});
proposalSchema.index({upvotes: -1});
proposalSchema.index({downvotes: -1});

export default mongoose.connection
    .useDb("block_tix")
    .model(collectionEnum.PROPOSAL, proposalSchema);
