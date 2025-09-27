import _ from "lodash";
import axios from "axios";
import {PinataSDK} from "pinata";

const pinata = new PinataSDK({
    pinataJwt: process.env["PINATA_JWT"] as string,
    pinataGateway: process.env["PINATA_GATEWAY"] as string,
});

async function uploadJson(json: object): Promise<string> {
    try {
        if (_.isEmpty(json)) {
            throw new Error(`Missing args! json: ${json}`);
        }

        const result = await pinata.upload.public.json(json);
        if (_.isEmpty(result) || _.isEmpty(result.cid)) {
            throw new Error(`Failed to upload json to pinata! result: ${result}`);
        }

        return result.cid;
    } catch (error) {
        throw error;
    }
}

function getGatewayUrl(cid: string): string {
    try {
        if (_.isEmpty(cid)) {
            throw new Error(`Missing args! cid: ${cid}`);
        }

        return `https://${process.env["PINATA_GATEWAY"]}/ipfs/${cid}`;
    } catch (error) {
        throw error;
    }
}

async function downloadJson(gatewayUrl: string): Promise<any> {
    try {
        if (_.isEmpty(gatewayUrl)) {
            throw new Error(`Missing args! gatewayUrl: ${gatewayUrl}`);
        }

        const response = await axios.get(gatewayUrl);
        if (_.isEmpty(response) || _.isEmpty(response.data)) {
            throw new Error(`Failed to download json from gateway! response: ${response}`);
        }

        return response.data;
    } catch (error) {
        throw error;
    }
}

export default {
    uploadJson: uploadJson,
    downloadJson: downloadJson,
    getGatewayUrl: getGatewayUrl,
}
