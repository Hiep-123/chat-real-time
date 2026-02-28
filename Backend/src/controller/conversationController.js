import Conversation from "../model/Conversation.js"
import Message from "../model/Message.js"
import { io } from "../socket/index.js";

export const createConversation = async (req, res) => {
    try {
        const { type, name, memberIds } = req.body;
        const userId = req.user._id;
        if (!type || (type === 'group' && !name) || !memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
            return res.status(400).json({ message: "Ten nhom va danh sach thanh vien la bat buoc" })
        }
        let conversation;
        const participantId = memberIds.find(
            (id) => id.toString() !== userId.toString()
        );
        if (type === 'direct') {
            //participantId = memberIds[0]

            conversation = await Conversation.findOne({
                type: 'direct',
                'participants.userId': { $all: [userId, participantId] } //cach truy van mang trong mongoose $all phai chua ca 2 tham so nay 
            })
        }

        if (!conversation) {
            conversation = new Conversation({
                type: 'direct',
                participants: [{ userId }, { userId: participantId }],
                lastMessage: new Date(),
            })
            await conversation.save();
        }

        if (type === "group") {
            conversation = new Conversation({
                type: "group",
                participants: [{ userId }, ...memberIds.map((id) => ({ userId: id }))],
                group: {
                    name,
                    createdBy: userId,
                },
                lastMessageAt: new Date(),
            });

            await conversation.save();
        }

        if (!conversation) {
            return res.status(400).json({ message: "Conversation type khong hop le" })
        }

        await conversation.populate([
            { path: "participants.userId", select: "displayname avatarUrl" },
            {
                path: "seenBy",
                select: "displayname avatarUrl",
            },
            { path: "lastMessage.senderId", select: "displayname avatarUrl" },
        ]);
        return res.status(201).json({
            conversation
        })
    } catch (error) {
        console.log("loi khi tao conversation", error)
        return res.status(500).json({ message: "Loi he thong" })
    }
}

export const getConversation = async (req, res) => {
    try {
        const userId = req.user._id;
        const conversations = await Conversation.find({
            'participants.userId': userId
        })
            .sort({ lastMessageAt: -1, updateAt: -1 })
            .populate({
                path: 'participants.userId',
                select: 'displayname avatarUrl'
            })
            .populate({
                path: 'lastMessage.senderId',
                select: 'displayname avatarUrl'
            })
            .populate({
                path: 'seenBy',
                select: 'displayname avatarUrl'
            })

        const formatted = conversations.map((convo) => {
            const participants = (convo.participants || []).map((p) => ({
                _id: p.userId._id,
                displayname: p.userId?.displayname,
                avatarUrl: p.userId?.avatarUrl,
                joinedAt: p.joinedAt
            }))
            return {
                ...convo.toObject(),
                unreadCounts: convo.unreadCounts || {},
                participants
            }
        })
        return res.status(200).json({ conversations: formatted })
    } catch (error) {
        console.log("loi khi lay tin nhan", error),
            res.status(500).json({ message: "loi he thong" })
    }
}

export const getMessage = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { limit = 50, cursor } = req.query;
        const query = { conversationId }

        if (cursor) {
            query.createdAt = { $lt: new Date(cursor) }; //lt less than
        }
        let messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit) + 1)

        let nextCursor = null

        if (messages.length > Number(limit)) {
            const nextMessage = messages[messages.length - 1]
            nextCursor = nextMessage.createdAt.toISOString()
            messages.pop()
        }
        messages = messages.reverse()
        return res.status(200).json({
            messages, nextCursor
        })
    } catch (error) {
        console.log("loi khi lay danh sach tin nhan", error)
        res.status(500).json({ message: "Loi he thong" })
    }
}
export const getUserConversationsForSocket = async (userId) => {
    try {
        const conversations = await Conversation.find(
            { 'participants.userId': userId },
            { _id: 1 })

        return conversations.map((c) => c._id.toString())
    } catch (error) {
        console.error("Lỗi khi fetch conversations: ", error);
        return [];
    }
}

export const markAsSeen = async (req, res) => {
    try {
        const { conversationId } = req.params
        const userId = req.user._id.toString()

        const conversation = await Conversation.findById(conversationId).lean()
        if (!conversation) return res.status(404).json({ message: "Conversation khong ton tai" })
        const last = conversation.lastMessage
        if (!last) return res.status(200).json({
            message: "khong co tin nhan de mark as seen"
        })

        if (last.senderId.toString() === userId) return res.status(200).json({ message: "Sender khong can mark as seen" })

        const updated = await Conversation.findByIdAndUpdate(conversationId,
            {
                $addToSet: { seenBy: userId },
                $set: { [`unreadCounts.${userId}`]: 0 }
            }, {
            new: true
        }
        )

        io.to(conversationId).emit("read-message", {
            conversation: updated,
            lastMessage: {
                _id: updated?.lastMessage._id,
                content: updated?.lastMessage.content,
                createdAt: updated?.lastMessage.createdAt,
                sender: {
                    _id: updated?.lastMessage.senderId
                }
            }
        })

        return res.status(200).json({
            message: "Marked seen",
            seenBy: updated?.seenBy || [],
            myUnreadCount: updated?.unreadCounts[userId] || 0

        })

    } catch (error) {
        console.error("Loi khi mark as seen ", error)
        return res.status(500).json({ message: "Loi he thong" })
    }
}