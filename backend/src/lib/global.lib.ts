import _ from "lodash";

import globalKeysEnum from "../enum/global.key.enum";

function setGlobalKey(key: string, value: string | object | number | boolean) {
    if (!Object.keys(globalKeysEnum).includes(key)) {
        throw new Error(`Key ${key} not found in globalKeysEnum`)
    }

    // @ts-ignore
    global[key] = value
}

function getGlobalKey(key: string) {
    if (!Object.keys(globalKeysEnum).includes(key)) {
        throw new Error(`Key ${key} not found in globalKeysEnum`)
    }

    // @ts-ignore
    return global[key]
}

function deleteGlobalKey(key: string) {
    if (_.isEmpty(key)) {
        throw new Error(`Key ${key} is empty`)
    }

    // @ts-ignore
    delete global[key]
}

export default {
    setGlobalKey: setGlobalKey,
    getGlobalKey: getGlobalKey,
    deleteGlobalKey: deleteGlobalKey,
}