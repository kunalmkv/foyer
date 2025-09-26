import mongoose from "mongoose";
import {generateUsername} from 'unique-username-generator';

import collectionEnum from "../enum/collection.enum";

const userSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: false,
        default: generateUsername()
    },
    nonce: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

userSchema.index({address: 1}, {unique: true});
userSchema.index({username: 1}, {unique: true});

export default mongoose.connection
    .useDb("block_tix")
    .model(collectionEnum.USER, userSchema);