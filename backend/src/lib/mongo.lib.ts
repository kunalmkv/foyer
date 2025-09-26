import _ from "lodash";
import mongoose from "mongoose";

import loggerLib from "./logger.lib";

async function connect(url: string) {
    if (_.isEmpty(url)) {
        throw new Error(`Missing args! url: ${url}`);
    }

    mongoose.set("strictQuery", false);
    await mongoose.connect(url);
    loggerLib.logInfo("MongoDB connected!");
}

async function findOne(model: any, filter: object) {
    try {
        if (_.isNil(model) || _.isNil(filter)) {
            throw new Error(`Missing args! model: ${model}, filter: ${filter}`)
        }

        return await model.findOne(filter)
    } catch (error) {
        throw error
    }
}

async function find(model: any, filter: object) {
    try {
        if (_.isNil(model) || _.isNil(filter)) {
            throw new Error(`Missing args! model: ${model}, filter: ${filter}`)
        }

        return await model.find(filter)
    } catch (error) {
        throw error
    }
}

async function findWithSort(model: any, filter: object,sort:object) {
    try {
        if (_.isNil(model) || _.isNil(filter) || _.isNil(sort)) {
            throw new Error(`Missing args! model: ${model}, filter: ${filter}, sort: ${sort}`)
        }

        return await model.find(filter).sort(sort)
    } catch (error) {
        throw error
    }
}

async function findWithSkipLimit(model: any, filter: object, skip: number, limit: number) {
    try {
        if (_.isNil(model) || _.isNil(filter) || _.isNil(skip) || _.isNil(limit)) {
            throw new Error(`Missing args! model: ${model}, filter: ${filter}, skip: ${skip}, limit: ${limit}`)
        }

        return await model.find(filter).skip(skip).limit(limit)
    } catch (error) {
        throw error
    }
}

async function findWithSkipLimitWithSort(model: any, filter: object, skip: number, limit: number,sort:object) {
    try {
        if (_.isNil(model) || _.isNil(filter) || _.isNil(skip) || _.isNil(limit) || _.isNil(sort)) {
            throw new Error(`Missing args! model: ${model}, filter: ${filter}, skip: ${skip}, limit: ${limit} , sort: ${sort}`)
        }

        return await model.find(filter).skip(skip).limit(limit).sort(sort)
    } catch (error) {
        throw error
    }
}



async function count(model: any, filter: object) {
    try {
        if (_.isNil(model) || _.isNil(filter)) {
            throw new Error(`Missing args! model: ${model}, filter: ${filter}`)
        }

        return await model.countDocuments(filter)
    } catch (error) {
        throw error
    }
}

async function updateOne(model: any, filter: object, update: object, options: object = {}) {
    try {
        if (_.isNil(model) || _.isNil(filter) || _.isNil(update)) {
            throw new Error(`Missing args! model: ${model}, filter: ${filter}, update: ${update}`)
        }

        return await model.updateOne(filter, update, options)
    } catch (error) {
        throw error
    }
}

async function insertOne(model: any, doc: object) {
    try {
        if (_.isNil(model) || _.isNil(doc)) {
            throw new Error(`Missing args! model: ${model}, doc: ${doc}`)
        }

        return await model.create(doc)
    } catch (error) {
        throw error
    }
}

async function bulkWrite(model: any, operations: object[]) {
    try {
        if (_.isNil(model) || _.isEmpty(operations)) {
            throw new Error(`Missing args! model: ${model}, operations: ${operations}`)
        }

        return await model.bulkWrite(operations)
    } catch (error) {
        throw error
    }
}

export default {
    find: find,
    count: count,
    connect: connect,
    findOne: findOne,
    insertOne: insertOne,
    bulkWrite: bulkWrite,
    updateOne: updateOne,
    findWithSort:findWithSort,
    findWithSkipLimit:findWithSkipLimit,
    findWithSkipLimitWithSort:findWithSkipLimitWithSort
}