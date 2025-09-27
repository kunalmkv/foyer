import _ from "lodash";
import cors from "cors";
import express from 'express';
import {createServer} from 'http';
import {Server as SocketIOServer} from 'socket.io';

import mongoLib from '../lib/mongo.lib';
import loggerLib from '../lib/logger.lib';

import chatModel from '../model/chat.model';
import chatMessageModel from '../model/chat.message.model';

export default class ChatService {
    private io: SocketIOServer;
    private connectedUsers: Map<string, string> = new Map();
    private app: express.Application;
    private server: any;

    constructor(port: number) {
        try {
            if (_.isNil(port)) {
                throw new Error(`Missing args! port: ${port}`);
            }

            this.app = express();
            this.server = createServer(this.app);

            this.io = new SocketIOServer(this.server, {
                cors: {
                    origin: "*",
                    methods: ["GET", "POST"]
                }
            });

            this.setupRoutes();
            this.setupEventHandlers();
            this.startServer(port);
        } catch (error) {
            throw error;
        }
    }

    private setupRoutes(): void {
        this.app.use(cors());
        this.app.use(express.json());

        this.app.get('/status', (req, res) => {
            return res.json({status: 'OK'});
        });

        this.app.get('/connected-users', (req, res) => {
            return res.json({
                connectedUsers: this.getConnectedUsers(),
                count: this.connectedUsers.size
            });
        });

        this.app.get('/chats/:userId', async (req, res) => {
            try {
                const {userId} = req.params;
                if (_.isEmpty(userId)) {
                    return res.status(400).json({error: `Missing params! userId: ${userId}`});
                }

                const chats = await mongoLib.findWithSort(
                    chatModel,
                    {participants: userId.toLowerCase()},
                    {lastMessageTimestamp: -1}
                );

                return res.json({
                    chats: chats
                });
            } catch (error) {
                loggerLib.logError({
                    message: "Error fetching user chats",
                    error: error
                });
                return res.status(500).json({error: 'Failed to fetch chats'});
            }
        });

        this.app.get('/messages/:userId1/:userId2', async (req, res) => {
            try {
                const {userId1, userId2} = req.params;
                const {page = 1, limit = 50} = req.query;
                if(_.isEmpty(userId1) || _.isEmpty(userId2)) {
                    return res.status(400).json({error: `Missing params! userId1: ${userId1}, userId2: ${userId2}`});
                }

                if (isNaN(Number(page)) || isNaN(Number(limit)) || Number(page) < 1 || Number(limit) < 1) {
                    return res.status(400).json({error: `Invalid query params! page: ${page}, limit: ${limit}`});
                }

                const messages = await mongoLib.findWithSkipLimitWithSort(
                    chatMessageModel,
                    {
                        $or: [
                            {from: userId1.toLowerCase(), to: userId2.toLowerCase()},
                            {from: userId2.toLowerCase(), to: userId1.toLowerCase()}
                        ]
                    },
                    (Number(page) - 1) * Number(limit),
                    Number(limit),
                    {timestamp: -1}
                )

                return res.json({
                    messages: messages
                });
            } catch (error) {
                loggerLib.logError({
                    message: "Error fetching direct messages",
                    error: error
                });
                return res.status(500).json({error: 'Failed to fetch messages'});
            }
        });
    }

    private startServer(port: number): void {
        this.server.listen(port, () => {
            loggerLib.logInfo({
                message: "Chat server running!",
                port: port
            });
        });
    }

    private setupEventHandlers(): void {
            this.io.on('connection', (socket: any) => {
            loggerLib.logInfo({
                message: "Socket connected",
                socketId: socket.id
            })

            socket.on('join', ({userId}: {userId: string}) => {
                this.connectedUsers.set(socket.id, userId);
                socket.join(`user_${userId}`);

                loggerLib.logInfo({
                    message: "User joined chat",
                    socketId: socket.id,
                    userId: userId
                })

                socket.emit('joined', {
                    message: 'Successfully joined chat',
                    userId
                });
            });

            socket.on('sendMessage', async ({to, message, from}: {to: string, message: string, from: string}) => {
                try {
                    const timestamp = new Date();

                    await mongoLib.insertOne(chatMessageModel, {
                        from,
                        to,
                        message,
                        timestamp
                    });

                    const participants = [from, to].sort();
                    const existingChat = await mongoLib.findOne(chatModel, {
                        participants: {
                            $all: participants,
                            $size: 2
                        }
                    });

                    if (existingChat) {
                        await mongoLib.updateOne(chatModel,
                            {participants: {$all: participants, $size: 2}},
                            {
                                lastMessage: message,
                                lastMessageFrom: from,
                                lastMessageTimestamp: timestamp
                            }
                        );
                    } else {
                        await mongoLib.insertOne(chatModel, {
                            participants,
                            lastMessage: message,
                            lastMessageFrom: from,
                            lastMessageTimestamp: timestamp
                        });
                    }

                    this.io.to(`user_${to}`).emit('newMessage', {
                        from,
                        message,
                        timestamp,
                    });

                    loggerLib.logInfo({
                        message: "Direct message sent and saved",
                        from,
                        to
                    });
                } catch (error) {
                    loggerLib.logError("Error sending direct message");
                    loggerLib.logError(error);
                }
            });

            socket.on('disconnect', () => {
                const userId = this.connectedUsers.get(socket.id);
                this.connectedUsers.delete(socket.id);

                loggerLib.logInfo({
                    message: "User disconnected!",
                    socketId: socket.id,
                    userId: userId,
                })
            });
        });
    }

    public getConnectedUsers(): string[] {
        return Array.from(this.connectedUsers.values());
    }
}