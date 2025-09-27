import path from "path";
import dotenv from "dotenv";

dotenv.config({path: path.join(__dirname, "/../.env")});

import mongoLib from "./lib/mongo.lib";
import ethersLib from "./lib/ethers.lib";
import loggerLib from "./lib/logger.lib";

import Api from "./api/api";
import IndexerService from "./service/indexer.service";

import portConfig from "./config/port.config";
import globalConst from "./const/global.const";

(async () => {
    try {
        await mongoLib.connect(process.env["MONGO_URL"] as string);
        ethersLib.initialiseProvider(process.env["RPC_URL"] as string);

        new Api(portConfig.API);
        new IndexerService(globalConst.ADMIN_MANAGER_ADDRESS, globalConst.EVENT_MANAGER_ADDRESS, globalConst.OFFER_MANAGER_ADDRESS);
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
