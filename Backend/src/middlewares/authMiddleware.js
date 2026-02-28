import jwt from 'jsonwebtoken';
import User from '../model/User.js';

export const protectedRoute = async (req, res, next) => {
    try {
        //lay token tu headers
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        //xac nhan token hop le
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedUser) => {
            if (err) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            //tim user
            const user = await User.findById(decodedUser.userId).select('-hashedpassword');
            if (!user) {
                return res.status(404).json({ message: 'Unauthorized' });
            }
            //tra user ve trong req
            req.user = user;
            next();
        });


    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ message: 'Unauthorized' });
    }
}