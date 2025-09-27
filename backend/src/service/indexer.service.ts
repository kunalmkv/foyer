import {ethers} from 'ethers';
import _ from 'lodash';

import mongoLib from "../lib/mongo.lib";
import pinataLib from "../lib/pinata.lib";
import ethersLib from "../lib/ethers.lib";
import loggerLib from "../lib/logger.lib";

import userModel from "../model/user.model";
import eventModel from "../model/event.model";
import offerModel from "../model/offer.model";
import adminManagerAbi from "../abi/admin.manager.abi.json";
import eventManagerAbi from '../abi/event.manager.abi.json';
import offerManagerAbi from '../abi/offer.manager.abi.json';

import offerTypeEnum from "../enum/offer.type.enum";
import offerStatusEnum from "../enum/offer.status.enum";
import eventStatusEnum from "../enum/event.status.enum";

export class IndexerService {
    private adminManagerContract: ethers.Contract;
    private eventManagerContract: ethers.Contract;
    private offerManagerContract: ethers.Contract;

    constructor(chain: string, adminManagerAddress: string, eventManagerAddress: string, offerManagerAddress: string) {
        try {
            if (_.isEmpty(chain) || _.isEmpty(adminManagerAddress) || _.isEmpty(eventManagerAddress) || _.isEmpty(offerManagerAddress)) {
                throw new Error(`Missing args! adminManagerAddress: ${adminManagerAddress}, eventManagerAddress: ${eventManagerAddress}, offerManagerAddress: ${offerManagerAddress} chain: ${chain}`);
            }

            this.adminManagerContract = ethersLib.initialiseContract(
                chain,
                adminManagerAddress,
                adminManagerAbi
            );

            this.eventManagerContract = ethersLib.initialiseContract(
                chain,
                eventManagerAddress,
                eventManagerAbi
            );

            this.offerManagerContract = ethersLib.initialiseContract(
                chain,
                offerManagerAddress,
                offerManagerAbi
            );

            this.setupAdminManagerListeners();
            this.setupEventManagerListeners();
            this.setupOfferManagerListeners();
        } catch (error) {
            throw error;
        }
    }

    private setupAdminManagerListeners(): void {
        try {
            this.adminManagerContract.on('AdminAdded', async (account, event) => {
                await this.handleAdminAdded(account, event);
            });

            this.adminManagerContract.on('AdminRemoved', async (account, event) => {
                await this.handleAdminRemoved(account, event);
            });

            loggerLib.logInfo('AdminManager listeners are up');
        } catch (error) {
            throw error;
        }
    }

    private setupEventManagerListeners(): void {
        try {
            this.eventManagerContract.on('EventCreated', async (eventId, creator, eventTime, metadataUri, event) => {
                await this.handleEventCreated(eventId, creator, eventTime, metadataUri, event);
            });

            this.eventManagerContract.on('EventCancelled', async (eventId, event) => {
                await this.handleEventCancelled(eventId, event);
            });

            loggerLib.logInfo('EventManager listeners are up');
        } catch (error) {
            throw error;
        }
    }

    private setupOfferManagerListeners(): void {
        try {
            this.offerManagerContract.on('OfferToSellCreated', async (offerId, eventId, seller, ask, collateral, metadataUri, event) => {
                await this.handleOfferToSellCreated(offerId, eventId, seller, ask, collateral, metadataUri, event);
            });

            this.offerManagerContract.on('OfferToBuyCreated', async (offerId, eventId, buyer, bid, collateral, metadataUri, event) => {
                await this.handleOfferToBuyCreated(offerId, eventId, buyer, bid, collateral, metadataUri, event);
            });

            this.offerManagerContract.on('OfferAccepted', async (offerId, buyer, event) => {
                await this.handleOfferAccepted(offerId, buyer, event);
            });

            this.offerManagerContract.on('OfferCancelled', async (offerId, event) => {
                await this.handleOfferCancelled(offerId, event);
            });

            this.offerManagerContract.on('OfferDisputed', async (offerId, by, event) => {
                await this.handleOfferDisputed(offerId, by, event);
            });

            this.offerManagerContract.on('OfferSettled', async (offerId, seller, buyer, event) => {
                await this.handleOfferSettled(offerId, seller, buyer, event);
            });

            loggerLib.logInfo('OfferManager listeners are up');
        } catch (error) {
            throw error;
        }
    }

    private async handleAdminAdded(account: string, event: ethers.Event): Promise<void> {
        try {
            loggerLib.logInfo({
                message: "Detected AdminAdded event",
                account,
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                blockHash: event.blockHash,
                logIndex: event.logIndex
            })

            await mongoLib.updateOne(userModel,
                {address: account.toLowerCase()},
                {address: account, isAdmin: true},
                {upsert: true}
            )
        } catch (error) {
            loggerLib.logError('Error in handling AdminAdded event');
            loggerLib.logError(error);
        }
    }

    private async handleAdminRemoved(account: string, event: ethers.Event): Promise<void> {
        try {
            loggerLib.logInfo({
                message: "Detected AdminRemoved event",
                account,
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                blockHash: event.blockHash,
                logIndex: event.logIndex
            })

            await mongoLib.updateOne(userModel,
                {address: account.toLowerCase()},
                {isAdmin: false},
            )
        } catch (error) {
            loggerLib.logError('Error in handling AdminRemoved event');
            loggerLib.logError(error);
        }
    }

    private async handleEventCreated(
        eventId: ethers.BigNumber,
        creator: string,
        eventTime: ethers.BigNumber,
        metadataUri: string,
        event: ethers.Event
    ): Promise<void> {
        try {
            loggerLib.logInfo({
                message: "Detected EventCreated event",
                eventId: eventId.toNumber(),
                eventTime: eventTime.toNumber(),
                creator: creator.toLowerCase(),
                metadataUri,
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                blockHash: event.blockHash,
                logIndex: event.logIndex
            })

            const {name, description, venue, category, imageUrl} = await pinataLib.downloadJson(metadataUri);

            await mongoLib.updateOne(eventModel,
                {id: eventId.toNumber()},
                {
                    id: eventId.toNumber(),
                    time: eventTime.toNumber(),
                    creator: creator.toLowerCase(),
                    name,
                    description,
                    venue,
                    category,
                    imageUrl,
                    metadataUrl: metadataUri,
                },
                {upsert: true}
            )
        } catch (error) {
            loggerLib.logError('Error in handling EventCreated event');
            loggerLib.logError(error);
        }
    }

    private async handleEventCancelled(eventId: ethers.BigNumber, event: ethers.Event): Promise<void> {
        try {
            loggerLib.logInfo({
                message: "Detected EventCancelled event",
                eventId: eventId.toNumber(),
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                blockHash: event.blockHash,
                logIndex: event.logIndex
            })

            await mongoLib.updateOne(eventModel,
                {id: eventId.toNumber()},
                {status: eventStatusEnum.CANCELLED},
            )
        } catch (error) {
            loggerLib.logError('Error in handling EventCancelled event');
            loggerLib.logError(error);
        }
    }

    private async handleOfferToSellCreated(
        offerId: ethers.BigNumber,
        eventId: ethers.BigNumber,
        seller: string,
        ask: ethers.BigNumber,
        collateral: ethers.BigNumber,
        metadataUri: string,
        event: ethers.Event
    ): Promise<void> {
        try {
            loggerLib.logInfo({
                message: "Detected OfferToSellCreated event",
                offerId: offerId.toNumber(),
                eventId: eventId.toNumber(),
                seller: seller.toLowerCase(),
                ask: ask.toNumber(),
                collateral: collateral.toNumber(),
                metadataUri,
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                blockHash: event.blockHash,
                logIndex: event.logIndex
            })

            const {
                quantity,
                seatNumbers,
                seatType,
                isPhysicalTicketNeededToAttend
            } = await pinataLib.downloadJson(metadataUri);

            await mongoLib.updateOne(offerModel,
                {id: offerId.toNumber()},
                {
                    offerId: offerId.toNumber(),
                    type: offerTypeEnum.OFFER_TO_SELL,
                    eventId: eventId.toNumber(),
                    sellerAddress: seller.toLowerCase(),
                    amount: ask.toNumber(),
                    collateral: collateral.toNumber(),
                    quantity: quantity,
                    seatNumbers: seatNumbers,
                    seatType: seatType,
                    isPhysicalTicketNeededToAttend: isPhysicalTicketNeededToAttend,
                    metadataUrl: metadataUri,
                    status: offerStatusEnum.ACTIVE,
                },
                {upsert: true}
            )
        } catch (error) {
            loggerLib.logError('Error in handling OfferCreated event');
            loggerLib.logError(error);
        }
    }

    private async handleOfferToBuyCreated(
        offerId: ethers.BigNumber,
        eventId: ethers.BigNumber,
        buyer: string,
        bid: ethers.BigNumber,
        collateral: ethers.BigNumber,
        metadataUri: string,
        event: ethers.Event
    ): Promise<void> {
        try {
            loggerLib.logInfo({
                message: "Detected OfferToSellCreated event",
                offerId: offerId.toNumber(),
                eventId: eventId.toNumber(),
                buyer: buyer.toLowerCase(),
                bid: bid.toNumber(),
                collateral: collateral.toNumber(),
                metadataUri,
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                blockHash: event.blockHash,
                logIndex: event.logIndex
            })

            const {
                quantity,
                seatNumbers,
                seatType,
                isPhysicalTicketNeededToAttend
            } = await pinataLib.downloadJson(metadataUri);

            await mongoLib.updateOne(offerModel,
                {id: offerId.toNumber()},
                {
                    offerId: offerId.toNumber(),
                    type: offerTypeEnum.OFFER_TO_SELL,
                    eventId: eventId.toNumber(),
                    buyerAddress: buyer.toLowerCase(),
                    amount: bid.toNumber(),
                    collateral: collateral.toNumber(),
                    quantity: quantity,
                    seatNumbers: seatNumbers,
                    seatType: seatType,
                    isPhysicalTicketNeededToAttend: isPhysicalTicketNeededToAttend,
                    metadataUrl: metadataUri,
                    status: offerStatusEnum.ACTIVE,
                },
                {upsert: true}
            )
        } catch (error) {
            loggerLib.logError('Error in handling OfferCreated event');
            loggerLib.logError(error);
        }
    }

    private async handleOfferAccepted(offerId: ethers.BigNumber, buyer: string, event: ethers.Event): Promise<void> {
        try {
            loggerLib.logInfo({
                message: "Detected OfferAccepted event",
                offerId: offerId.toString(),
                buyer: buyer.toLowerCase(),
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                blockHash: event.blockHash,
                logIndex: event.logIndex
            })

            await mongoLib.updateOne(offerModel,
                {id: offerId.toNumber()},
                {buyerAddress: buyer.toLowerCase(), status: offerStatusEnum.ACCEPTED},
            );
        } catch (error) {
            loggerLib.logError('Error in handling OfferAccepted event');
            loggerLib.logError(error);
        }
    }

    private async handleOfferCancelled(offerId: ethers.BigNumber, event: ethers.Event): Promise<void> {
        try {
            loggerLib.logInfo({
                message: "Detected OfferCancelled event",
                offerId: offerId.toString(),
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                blockHash: event.blockHash,
                logIndex: event.logIndex
            });

            await mongoLib.updateOne(offerModel,
                {id: offerId.toNumber()},
                {status: offerStatusEnum.CANCELLED},
            );
        } catch (error) {
            loggerLib.logError('Error in handling OfferCancelled event');
            loggerLib.logError(error);
        }
    }

    private async handleOfferDisputed(offerId: ethers.BigNumber, by: string, event: ethers.Event): Promise<void> {
        try {
            loggerLib.logInfo({
                message: "Detected OfferDisputed event",
                offerId: offerId.toString(),
                by: by.toLowerCase(),
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                blockHash: event.blockHash,
                logIndex: event.logIndex
            })

            await mongoLib.updateOne(offerModel,
                {id: offerId.toNumber()},
                {status: offerStatusEnum.DISPUTED},
            );
        } catch (error) {
            loggerLib.logError('Error in handling OfferDisputed event');
            loggerLib.logError(error);
        }
    }

    private async handleOfferSettled(
        offerId: ethers.BigNumber,
        seller: string,
        buyer: string,
        event: ethers.Event
    ): Promise<void> {
        try {
            loggerLib.logInfo({
                message: "Detected OfferSettled event",
                offerId: offerId.toString(),
                seller: seller.toLowerCase(),
                buyer: buyer.toLowerCase(),
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                blockHash: event.blockHash,
                logIndex: event.logIndex
            });

            await mongoLib.updateOne(offerModel,
                {id: offerId.toNumber()},
                {status: offerStatusEnum.SETTLED},
            );
        } catch (error) {
            loggerLib.logError('Error in handling OfferSettled event');
            loggerLib.logError(error);
        }
    }
}

export default IndexerService;