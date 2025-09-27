import _ from 'lodash';
import jwt from 'jsonwebtoken';

import mongoLib from '../../lib/mongo.lib';
import ethersLib from '../../lib/ethers.lib';
import loggerLib from '../../lib/logger.lib';
import helperLib from '../../lib/helper.lib';

import userModel from '../../model/user.model';

async function getNonce(req: any, res: any) {
    try {
        const {userAddress} = req.params;
        if (_.isEmpty(userAddress)) {
            return res.status(400).send({message: "Bad Request", details: "userAddress is required"});
        }

        const user = await mongoLib.findOne(userModel, {
            address: userAddress.toLowerCase()
        });
        if (_.isEmpty(user)) {
            const nonce = helperLib.generateNonce();
            await mongoLib.insertOne(userModel, {
                address: userAddress.toLowerCase(),
                nonce: nonce
            });
            return res.status(200).send({message: "Success", nonce: nonce});
        }

        return res.status(200).send({message: "Success", nonce: user.nonce});
    } catch (error) {
        loggerLib.logError(error);
        return res.status(500).send({message: "Internal Server Error"});
    }
}

async function validateNonce(req: any, res: any) {
    try {
        const {userAddress, signature} = req.body;
        if (_.isEmpty(userAddress) || _.isEmpty(signature)) {
            return res.status(400).send({message: "Bad Request", details: "userAddress and signature are required"});
        }

        const user = await mongoLib.findOne(userModel, {
            address: userAddress.toLowerCase()
        });
        if (_.isEmpty(user)) {
            return res.status(404).send({message: "User not found"});
        }

        const {nonce} = user;
        const recoveredAddress = await ethersLib.getAddressFromMessageSignature(nonce, signature);
        if (recoveredAddress !== userAddress.toLowerCase()) {
            return res.status(401).send({message: "Unauthorized", details: "Invalid signature"});
        }

        const newNonce = helperLib.generateNonce();
        await mongoLib.updateOne(userModel, {
            address: userAddress.toLowerCase()
        }, {
            $set: {
                isVerified: true,
                nonce: newNonce
            }
        });

        const token = jwt.sign(
            {userAddress: userAddress.toLowerCase()},
            process.env["JWT_SECRET"] as string,
            {expiresIn: "30d"},
        );

        return res.status(200).send({message: "Success", token: token});
    } catch (error) {
        loggerLib.logError(error);
        return res.status(500).send({message: "Internal Server Error"});
    }
}

async function getUserInfo(req: any, res: any) {
    try {
        const {userAddress} = req.params;
        if (_.isEmpty(userAddress)) {
            throw new Error("userAddress is required");
        }

        const user = await mongoLib.findOneWithSelect(userModel, {
            address: userAddress.toLowerCase()
        }, {
            nonce: 0,
        });
        if (_.isEmpty(user)) {
            throw new Error("User not found");
        }

        return user;
    } catch (error) {
        throw error;
    }
}

export default {
    getNonce: getNonce,
    getUserInfo: getUserInfo,
    validateNonce: validateNonce
}