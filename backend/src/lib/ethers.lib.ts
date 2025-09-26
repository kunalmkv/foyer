import _ from 'lodash';
import {ethers} from 'ethers';

import loggerLib from "./logger.lib";
import globalLib from "./global.lib";

import globalKeyEnum from "../enum/global.key.enum";

function initialiseProvider(rpcUrl: string) {
    try {
        if (_.isEmpty(rpcUrl)) {
            throw new Error(`Missing args! rpcUrl: ${rpcUrl}`);
        }

        globalLib.setGlobalKey(globalKeyEnum.PROVIDER, new ethers.providers.JsonRpcProvider(rpcUrl));
        loggerLib.logInfo(`Chain provider initialised!`);
    } catch (error) {
        throw error;
    }
}

function isProviderInitialised() {
    try {
        const provider = globalLib.getGlobalKey(globalKeyEnum.PROVIDER);
        return !_.isEmpty(provider);
    } catch (error) {
        throw error;
    }
}

function getProvider() {
    try {
        if (!isProviderInitialised()) {
            throw new Error(`Provider not initialised!`);
        }

        return globalLib.getGlobalKey(globalKeyEnum.PROVIDER);
    } catch (error) {
        throw error;
    }
}

function initialiseContract(address: string, abi: any) {
    try {
        if (_.isEmpty(address) || _.isEmpty(abi)) {
            throw new Error(`Missing args! address: ${address}, abi: ${abi}`);
        }

        const provider = getProvider();
        return new ethers.Contract(address, abi, provider);
    } catch (error) {
        throw error;
    }
}

async function getAddressFromMessageSignature(message: string, signature: string) {
    try {
        if (_.isEmpty(message) || _.isEmpty(signature)) {
            throw new Error(`Missing args! message: ${message}, signature: ${signature}`);
        }

        const recoveredAddress = ethers.utils.verifyMessage(message, signature);
        return recoveredAddress.toLowerCase();
    } catch (error) {
        throw error;
    }
}

export default {
    getProvider: getProvider,
    initialiseContract: initialiseContract,
    initialiseProvider: initialiseProvider,
    isProviderInitialised: isProviderInitialised,
    getAddressFromMessageSignature: getAddressFromMessageSignature
}

