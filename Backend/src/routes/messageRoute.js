import express from 'express'
import { checkFriendShip, checkGroupMembership } from '../middlewares/friendMiddleware.js'
import {
    sendDirectMessage, sendGroupMessage
} from '../controller/messageController.js'
const router = express.Router();

router.post('/direct', checkFriendShip, sendDirectMessage)
router.post('/group', checkGroupMembership, sendGroupMessage)

export default router
