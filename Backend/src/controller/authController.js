import bcrypt from 'bcrypt';
import User from '../model/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Session from '../model/session.js';

const ACCESS_TOKEN_TTL = '30m';
const REFRESHTOKEN_TTL = 14 * 24 * 60 * 60; //14 days in seconds

export const signUp = async (req, res) => {
    try {
        const { username, password, email, firstname, lastname } = req.body;

        // Basic validation
        if (!username || !password || !email || !firstname || !lastname) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        //ktra user co ton tai chua
        const checkUser = await User.findOne({ username });
        if (checkUser) {
            return res.status(409).json({ message: 'Username or email already exists' });
        }
        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //tao user moi
        await User.create({
            username,
            hashedPassword,
            email,
            displayname: `${firstname} ${lastname}`
        })
        //tra ve ket qua
        return res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error during sign up:', error);
        return res.status(500).json({ message: 'Server error' });
    }

}

export const signIn = async (req, res) => {
    try {
        //lay input
        const { username, password } = req.body;

        // ktra input
        if (!username || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        //lay hashedpassword tu db so voi password input
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        //khop, tao accessToken voi JWT 
        const accessToken = jwt.sign(
            { userId: user._id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: ACCESS_TOKEN_TTL });
        //tao refreshToken 
        const refreshToken = crypto.randomBytes(64).toString('hex');
        //tao session moi de luu refreshToken
        await Session.create({
            userId: user._id,
            refreshToken,
            expiresAt: new Date(Date.now() + REFRESHTOKEN_TTL * 1000)
        });
        //tra refreshToken ve cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            samesite: "none",
            maxAge: REFRESHTOKEN_TTL * 1000
        })
        //tra accessToken ve res
        return res.status(200).json({
            message: `User ${username} signed in successfully`,
            accessToken
        })

    } catch (error) {
        console.error('Error during sign in:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const signOut = async (req, res) => {
    try {
        // lấy refresh token từ cookie
        const token = req.cookies?.refreshToken;

        if (token) {
            // xoá refresh token trong Session
            await Session.deleteOne({ refreshToken: token });

            // xoá cookie
            res.clearCookie("refreshToken");
        }

        return res.sendStatus(204);
    } catch (error) {
        console.error("Lỗi khi gọi signOut", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
}

//tao accessToken moi tu refreshtoken
export const refreshToken = async (req, res) => {
    try {
        // lấy refresh token từ cookie
        const token = req.cookies?.refreshToken;

        if (!token) {
            return res.status(401).json({ message: "Không tìm thấy token" });
        }
        //so voi refreshtoken trong db
        const session = await Session.findOne({ refreshToken: token });
        if (!session) {
            return res.status(403).json({ message: "Token không hợp lệ" });
        }
        //ktra het han
        if (session.expiresAt < new Date()) {

            return res.status(403).json({ message: "Token đã hết hạn" });
        }
        //tao accessToken moi
        const accessToken = jwt.sign(
            { userId: session.userId },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: ACCESS_TOKEN_TTL });
        //tra ve accessToken moi
        return res.status(200).json({ accessToken });
    } catch (error) {
        console.error("Lỗi khi gọi refreshToken", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
}
