import cors from "cors";
import _ from "lodash";
import express from "express";

import loggerLib from "../lib/logger.lib";

import userRoutes from "./route/user.route";
import offerRoute from "./route/offer.route";
import eventRoute from "./route/event.route";

class Api {
    constructor(port: number) {
        try {
            if (_.isNil(port)) {
                throw new Error(`Missing args! port: ${port}`);
            }

            const app = express();

            app.use(cors());
            app.use(express.json());
            app.use(express.urlencoded({extended: true}));

            app.use("/user", userRoutes);
            app.use("/offer", offerRoute);
            app.use("/event", eventRoute);

            app.get("/status", (req
                , res) => {
                return res.json({
                    status: "OK",
                })
            });

            app.listen(port, () => {
                loggerLib.logInfo({
                    message: "API server running!",
                    port: port,
                });
            });
        } catch (error) {
            throw error;
        }
    }
}

export default Api;