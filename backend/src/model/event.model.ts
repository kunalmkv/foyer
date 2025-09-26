import mongoose from "mongoose";

import collectionEnum from "../enum/collection.enum";
import eventStatusEnum from "../enum/event.status.enum";
import eventCategoryEnum from "../enum/event.category.enum";

const eventSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    time: {
        type: Number,
        required: true,
    },
    creator: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: Object.values(eventCategoryEnum),
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    venue: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    metadataUrl: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: Object.values(eventStatusEnum)
    }
}, {
    timestamps: true,
});

eventSchema.index({id: 1}, {unique: true});
eventSchema.index({name: 1});
eventSchema.index({time: 1});
eventSchema.index({description: 1});
eventSchema.index({status: 1, time: 1});
eventSchema.index({category: 1, time: 1});
eventSchema.index({category: 1, status: 1, time: 1});

export default mongoose.connection
    .useDb("block_tix")
    .model(collectionEnum.EVENT, eventSchema);