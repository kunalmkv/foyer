import {ethers} from 'ethers';
import _ from 'lodash';

import mongoLib from "../lib/mongo.lib";
import ethersLib from "../lib/ethers.lib";
import loggerLib from "../lib/logger.lib";

import userModel from "../model/user.model";
import kycRelayerAbi from '../abi/kyc.relayer.abi.json';
import kycVerifierAbi from '../abi/kyc.verifier.abi.json';

export class KYCRelayerService {
    private kycVerifierContract: ethers.Contract;
    private readonly kycRelayerContract: ethers.Contract;
    private readonly kycRelayerAdminWallet: ethers.Wallet;

    constructor(kycVerifierChain: string, kycVerifierAddress: string, kycRelayerChain: string, kycRelayerAddress: string, kycRelayerAdminPrivateKey: string) {
        try {
            if (_.isEmpty(kycVerifierChain) || _.isEmpty(kycVerifierAddress) || _.isEmpty(kycRelayerChain) || _.isEmpty(kycRelayerAddress) || _.isEmpty(kycRelayerAdminPrivateKey)) {
                throw new Error(`Missing args! kycVerifierChain: ${kycVerifierChain}, kycVerifierAddress: ${kycVerifierAddress}, kycRelayerChain: ${kycRelayerChain}, kycRelayerAddress: ${kycRelayerAddress}, kycRelayerAdminPrivateKey: ${kycRelayerAdminPrivateKey}`);
            }

            this.kycVerifierContract = ethersLib.initialiseContract(
                kycVerifierChain,
                kycVerifierAddress,
                kycVerifierAbi
            );

            this.kycRelayerAdminWallet = ethersLib.initialiseWallet(
                kycRelayerChain,
                kycRelayerAdminPrivateKey
            );

            this.kycRelayerContract = ethersLib.initialiseContractWithWallet(
                kycRelayerChain,
                kycRelayerAddress,
                kycRelayerAbi,
                this.kycRelayerAdminWallet
            );

            this.setupKycVerifierListeners();
        } catch (error) {
            throw error;
        }
    }

    private setupKycVerifierListeners(): void {
        try {
            this.kycVerifierContract.on('UserVerified', async (output, userData, event) => {
                await this.handleUserVerified(output, userData, event);
            });

            loggerLib.logInfo('KYCVerifier listeners are up');
        } catch (error) {
            throw error;
        }
    }

    private async handleUserVerified(output: any, userData: string, event: any): Promise<void> {
        try {
            const userAddress = output.userIdentifier.toHexString();

            loggerLib.logInfo({
                message: 'Detected UserVerified event',
                userAddress,
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                blockHash: event.blockHash,
                logIndex: event.logIndex
            });

            const transaction = await this.kycRelayerContract['addVerifiedUser'](userAddress);
            const receipt = await transaction.wait();
            if (receipt.status !== 1) {
                loggerLib.logError({
                    message: 'Failed addVerifiedUser transaction',
                    userAddress,
                    transactionHash: transaction.hash,
                });
                return;
            }

            loggerLib.logInfo({
                message: 'Submitted addVerifiedUser transaction',
                userAddress,
                transactionHash: transaction.hash,
            });

            await mongoLib.updateOne(userModel, {
                address: userAddress.toLowerCase()
            }, {
                $set: {
                    isKycVerified: true,
                }
            });
        } catch (error) {
            loggerLib.logError({
                message: 'Error handling UserVerified event',
                error: error
            });
            throw error;
        }
    }
}

export default KYCRelayerService;