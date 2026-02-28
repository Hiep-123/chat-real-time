import express from 'express'

import { createConversation, getConversation, getMessage, markAsSeen } from '../controller/conversationController.js'
import { checkFriendShip } from '../middlewares/friendMiddleware.js';

const router = express.Router();

router.post('/', checkFriendShip, createConversation);
router.get('/', getConversation);
router.get('/:conversationId/messages', getMessage);
router.patch('/:conversationId/seen', markAsSeen)
export default router;