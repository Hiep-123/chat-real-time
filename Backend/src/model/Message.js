import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        require: true,
        index: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true,
    },
    content: {
        type: String,
        trim: true
    },
    imgUrl: {
        type: String,
    }
}, {
    timestamps: true
})
messageSchema.index({ conversationId: 1, createAt: -1 });//-1: giam dan 1: tang dan

const Message = mongoose.model("Message", messageSchema)
export default Message;