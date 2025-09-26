import path from "path";
import dotenv from "dotenv";

dotenv.config({path: path.join(__dirname, "/../.env")});

import mongoLib from "./lib/mongo.lib";
import loggerLib from "./lib/logger.lib";

import Api from "./api/api";

import portConfig from "./config/port.config";

(async () => {
    try {
        await mongoLib.connect(process.env["MONGO_URL"] as string);

        new Api(portConfig.API);
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
