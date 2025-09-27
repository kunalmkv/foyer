import mongoose from 'mongoose';
import collectionEnum from "../enum/collection.enum";

const chatSchema = new mongoose.Schema({
    participants: [{
        type: String,
        required: true
    }],
    lastMessage: {
        type: String,
        required: true
    },
    lastMessageFrom: {
        type: String,
        required: true
    },
    lastMessageTimestamp: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

chatSchema.index({participants: 1});
chatSchema.index({lastMessageTimestamp: -1});

export default mongoose.connection
    .useDb("block_tix")
    .model(collectionEnum.CHAT, chatSchema);
