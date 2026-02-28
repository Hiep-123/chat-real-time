import { Server } from 'socket.io'
import http from 'http'
import express from 'express'
import { socketMiddleware } from '../middlewares/socketMiddleware.js';
import { getUserConversationsForSocket } from '../controller/conversationController.js';

const app = express()

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        credential: true
    }
})

io.use(socketMiddleware)

const onlineUser = new Map();//{userId:socketId}

io.on("connection", async (socket) => {
    const user = socket.user

    console.log(`${user.displayname} online voi :${socket.id}`)

    onlineUser.set(user._id, socket.id)
    io.emit("online-users", Array.from(onlineUser.keys()))

    const conversationIds = await getUserConversationsForSocket(user._id)
    conversationIds.forEach((id) => {
        socket.join(id)
    })
    socket.on("disconnect", () => {
        onlineUser.delete(user._id)
        io.emit("online-users", Array.from(onlineUser.keys()))
        console.log(`socket disconnect ${socket.id}`)

    })
})

export { io, server, app }