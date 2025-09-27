import path from "path";
import dotenv from "dotenv";

dotenv.config({path: path.join(__dirname, "/../.env")});

import mongoLib from "./lib/mongo.lib";
import ethersLib from "./lib/ethers.lib";
import loggerLib from "./lib/logger.lib";

import Api from "./api/api";
import IndexerService from "./service/indexer.service";
import KYCRelayerService from "./service/kyc.relayer.service";

import chainEnum from "./enum/chain.enum";
import portConfig from "./config/port.config";
import globalConst from "./const/global.const";

(async () => {
    try {
        await mongoLib.connect(process.env["MONGO_URL"] as string);
        ethersLib.initialiseProvider(chainEnum.ETH_SEPOLIA, process.env["ETH_SEPOLIA_RPC_URL"] as string);
        ethersLib.initialiseProvider(chainEnum.CELO_SEPOLIA, process.env["CELO_SEPOLIA_RPC_URL"] as string);

        new Api(portConfig.API);
        new KYCRelayerService(chainEnum.CELO_SEPOLIA, globalConst.KYC_VERIFIER_ADDRESS, chainEnum.ETH_SEPOLIA, globalConst.KYC_RELAYER_ADDRESS, process.env["KYC_RELAYER_ADMIN_PRIVATE_KEY"] as string);
        new IndexerService(chainEnum.ETH_SEPOLIA, globalConst.ADMIN_MANAGER_ADDRESS, globalConst.EVENT_MANAGER_ADDRESS, globalConst.OFFER_MANAGER_ADDRESS);
    } catch (error) {
        loggerLib.logError(error);
        process.exit(1);
    }
})();

process.on("unhandledRejection", (error) => {
    loggerLib.logError(`Unhandled promise rejection!`);
    loggerLib.logError(error);
    process.exit(1);
});

process.on("uncaughtException", (error) => {
    loggerLib.logError(`Uncaught exception!`);
    loggerLib.logError(error);
    process.exit(1);
});
