import _ from 'lodash';
import {ethers} from 'ethers';

import loggerLib from "./logger.lib";
import globalLib from "./global.lib";

import chainEnum from "../enum/chain.enum";
import globalKeyEnum from "../enum/global.key.enum";

function initialiseProvider(chain: string, rpcUrl: string) {
    try {
        if (_.isEmpty(chain) || _.isEmpty(rpcUrl)) {
            throw new Error(`Missing args! chain: ${chain}, rpcUrl: ${rpcUrl}`);
        }

        switch (chain) {
            case chainEnum.ETH_SEPOLIA:
                globalLib.setGlobalKey(globalKeyEnum.ETH_SEPOLIA_PROVIDER, new ethers.providers.JsonRpcProvider(rpcUrl));
                break;
            case chainEnum.CELO_SEPOLIA:
                globalLib.setGlobalKey(globalKeyEnum.CELO_SEPOLIA_PROVIDER, new ethers.providers.JsonRpcProvider(rpcUrl));
                break;
            default:
                throw new Error(`Unsupported chain: ${chain}`);
        }

        loggerLib.logInfo({
            message: `Provider initialised!`,
            chain: chain
        })
    } catch (error) {
        throw error;
    }
}

function isProviderInitialised(chain: string) {
    try {
        if (_.isEmpty(chain)) {
            throw new Error(`Missing args! chain: ${chain}`);
        }

        let provider;
        switch (chain) {
            case chainEnum.ETH_SEPOLIA:
                provider = globalLib.getGlobalKey(globalKeyEnum.ETH_SEPOLIA_PROVIDER);
                break;
            case chainEnum.CELO_SEPOLIA:
                provider = globalLib.getGlobalKey(globalKeyEnum.CELO_SEPOLIA_PROVIDER);
                break;
            default:
                throw new Error(`Unsupported chain: ${chain}`);
        }

        return !_.isEmpty(provider);
    } catch (error) {
        throw error;
    }
}

function getProvider(chain: string) {
    try {
        if (_.isEmpty(chain)) {
            throw new Error(`Missing args! chain: ${chain}`);
        }

        if (!isProviderInitialised(chain)) {
            throw new Error(`Provider not initialised!`);
        }

        let provider;
        switch (chain) {
            case chainEnum.ETH_SEPOLIA:
                provider = globalLib.getGlobalKey(globalKeyEnum.ETH_SEPOLIA_PROVIDER);
                break;
            case chainEnum.CELO_SEPOLIA:
                provider = globalLib.getGlobalKey(globalKeyEnum.CELO_SEPOLIA_PROVIDER);
                break;
            default:
                throw new Error(`Unsupported chain: ${chain}`);
        }

        return provider;
    } catch (error) {
        throw error;
    }
}

function initialiseContract(chain: string, address: string, abi: any) {
    try {
        if (_.isEmpty(chain) || _.isEmpty(address) || _.isEmpty(abi)) {
            throw new Error(`Missing args! chain: ${chain}, address: ${address}, abi: ${abi}`);
        }

        const provider = getProvider(chain);
        return new ethers.Contract(address, abi, provider);
    } catch (error) {
        throw error;
    }
}

function initialiseContractWithWallet(chain: string, address: string, abi: any, wallet: ethers.Wallet) {
    try {
        if (_.isEmpty(chain) || _.isEmpty(address) || _.isEmpty(abi) || _.isEmpty(wallet)) {
            throw new Error(`Missing args! chain: ${chain}, address: ${address}, abi: ${abi}, wallet: ${wallet}`);
        }

        return new ethers.Contract(address, abi, wallet);
    } catch (error) {
        throw error;
    }
}

function initialiseWallet(chain: string, privateKey: string) {
    try {
        if (_.isEmpty(chain) || _.isEmpty(privateKey)) {
            throw new Error(`Missing args! chain: ${chain}, privateKey: ${privateKey}`);
        }

        const provider = getProvider(chain);
        return new ethers.Wallet(privateKey, provider);
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
    initialiseWallet: initialiseWallet,
    initialiseContract: initialiseContract,
    initialiseProvider: initialiseProvider,
    isProviderInitialised: isProviderInitialised,
    initialiseContractWithWallet:initialiseContractWithWallet,
    getAddressFromMessageSignature: getAddressFromMessageSignature
}

