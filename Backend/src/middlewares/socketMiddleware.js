import jwt from 'jsonwebtoken'
import User from '../model/User.js'

export const socketMiddleware = async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token
        if (!token) return next(new Error("Unauthorized - Token khong ton tai"))

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        if (!decoded) return next(new Error("Unauthorized - Token khong hop le hoac da het han"))
        const user = await User.findById(decoded.userId).select("-hashedPassword")
        if (!user) return next(new Error("USer khong ton tai"))

        socket.user = user

        next()
    } catch (error) {
        console.error("loi khi verify jwt trong socketMiddleware", error)
        next(new Error("unauthorized"))
    }
}