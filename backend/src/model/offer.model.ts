import mongoose from 'mongoose';

import collectionEnum from "../enum/collection.enum";
import offerStatusEnum from "../enum/offer.status.enum";

const offerSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    eventId: {
        type: Number,
        required: true,
    },
    sellerAddress: {
        type: String,
        required: true,
    },
    collateral: {
        type: Number,
        required: true,
    },
    ask: {
        type: Number,
        required: true,
    },
    buyerAddress: {
        type: String,
        required: false,
        default: null,
    },
    metadata: {
        type: Object,
        required: true,
    },
    metadataUrl: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: Object.values(offerStatusEnum),
    }
}, {
    timestamps: true
});

offerSchema.index({id: 1}, {unique: true});
offerSchema.index({eventId: 1, status: 1});

export default mongoose.connection
    .useDb("block_tix")
    .model(collectionEnum.OFFER, offerSchema);