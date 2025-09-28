import mongoose from 'mongoose';
import collectionEnum from "../enum/collection.enum";

const chatMessageSchema = new mongoose.Schema({
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now,
    }
}, {
    timestamps: true
});

chatMessageSchema.index({from: 1, to: 1, timestamp: -1});

export default mongoose.connection
    .useDb("block_tix")
    .model(collectionEnum.CHAT_MESSAGE, chatMessageSchema);