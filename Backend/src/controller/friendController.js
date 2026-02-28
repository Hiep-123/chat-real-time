import Friend from "../model/Friend.js";
import FriendRequest from "../model/FriendRequest.js";
import User from "../model/User.js";


export const sendFriendRequest = async (req, res) => {
    try {
        const { to, message } = req.body;
        const from = req.user._id;

        if (from.toString() === to.toString()) {
            return res
                .status(400)
                .json({ message: "Không thể gửi lời mời kết bạn cho chính mình" });
        }
        const userExsist = await User.exists({ _id: to });
        if (!userExsist) { return res.status(404).json({ message: "nguoi dung khong ton tai" }) };

        let userA = from.toString();//1 , 2
        let userB = to.toString();//2 , 1
        if (userA > userB) {
            [userA, userB] = [userB, userA];
        }// false [1,2] // true [1,2]

        const [alreadFriends, exsistingRequest] = await Promise.all([
            Friend.findOne({ userA, userB }), // ktra 2 ng nay da la ban chua
            FriendRequest.findOne({
                $or: [
                    { from, to },
                    { from: to, to: from }
                ]
            }) //xem co loi moi ket ban nao cua 2 ng nay hay chua bat ke ng gui la ai
        ])

        if (alreadFriends) {
            return res.status(400).json({ message: "Hai nguoi nay da la ban" })
        }

        if (exsistingRequest) {
            return res.status(400).json({ message: "Da co loi moi ket ban dang cho" })
        }

        const request = await FriendRequest.create({
            from, to, message
        });

        return res.status(201).json({ message: "Gui loi moi ket ban thanh cong", request });


    } catch (error) {
        console.error("Lỗi khi gửi yêu cầu kết bạn", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
}

export const acceptFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user._id;

        const request = await FriendRequest.findById(requestId);

        if (!request) {
            return res.status(404).json({ message: "Không tìm thấy lời mời kết bạn" });
        }

        if (request.to.toString() !== userId.toString()) {
            return res
                .status(403)
                .json({ message: "Bạn không có quyền chấp nhận lời mời này" });
        }

        const friend = await Friend.create({
            userA: request.from,
            userB: request.to,
        });

        await FriendRequest.findByIdAndDelete(requestId);

        const from = await User.findById(request.from)
            .select("_id displayname avatarUrl")
            .lean();

        return res.status(200).json({
            message: "Chấp nhận lời mời kết bạn thành công",
            newFriend: {
                _id: from?._id,
                displayName: from?.displayname,
                avatarUrl: from?.avatarUrl,
            },
        });
    } catch (error) {
        console.error("Lỗi khi chấp nhận lời mời kết bạn", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const declineFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user._id;//nguoi nhan

        const request = await FriendRequest.findById(requestId);

        if (!request) {
            return res.status(404).json({ message: "Khong tim thay loi moi ket ban" })
        }

        if (request.to.toString() !== userId.toString()) {
            return res.status(403).json({
                message: "Ban khong co quyen tu choi loi moi nay"
            })
        }
        await FriendRequest.findByIdAndDelete(requestId)
    } catch (error) {
        console.error("Lỗi khi tu choi kết bạn", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
}

export const getAllFriends = async (req, res) => {
    try {
        const userId = req.user._id; //userId hien tai
        const friendships = await Friend.find({
            $or: [
                { userA: userId },
                { userB: userId }
            ]
        })
            .populate("userA", "_id displayname avatarUrl")
            .populate("userB", "_id displayname avatarUrl")
            .lean()
        if (!friendships.length) {
            return res.status(200).json({ friends: [] })
        }

        const friends = friendships.map((f) =>
            f.userA._id.toString() === userId.toString() ? f.userB : f.userA
        );
        return res.status(200).json({ friends });
    } catch (error) {
        console.error("Lỗi khi lay danh sach bạn be", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
}

export const getFriendRequests = async (req, res) => {
    try {
        const userId = req.user._id;

        const populateFields = "_id username displayname avatarUrl";

        const [sent, received] = await Promise.all([
            FriendRequest.find({ from: userId }).populate("to", populateFields),
            FriendRequest.find({ to: userId }).populate("from", populateFields),
        ]);

        res.status(200).json({ sent, received });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách yêu cầu kết bạn", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
}