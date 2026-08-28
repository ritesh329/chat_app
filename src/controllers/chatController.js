import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Create or get personal chat
// @route   POST /api/chat/personal
// @access  Private
export const createPersonalChat = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user._id;

    // Check if chat exists
    let chat = await Chat.findOne({
      participants: { $all: [currentUserId, userId], $size: 2 },
    });

    if (chat) {
      return res.json({
        success: true,
        chat,
      });
    }

    // Create new chat
    chat = await Chat.create({
      participants: [currentUserId, userId],
    });

    // Add to friends list
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { friends: userId },
    });
    await User.findByIdAndUpdate(userId, {
      $addToSet: { friends: currentUserId },
    });

    res.status(201).json({
      success: true,
      chat,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get all personal chats
// @route   GET /api/chat/personal
// @access  Private
export const getPersonalChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
    })
      .populate('participants', 'username avatar status lastSeen')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      chats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get chat messages
// @route   GET /api/chat/:chatId/messages
// @access  Private
export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({
      chatId,
      chatType: 'personal',
      isDeleted: false,
    })
      .populate('sender', 'username avatar')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({
      chatId,
      chatType: 'personal',
      isDeleted: false,
    });

    res.json({
      success: true,
      messages: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Send message
// @route   POST /api/chat/message
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { chatId, chatType, content, replyTo, type = 'text' } = req.body;

    const message = await Message.create({
      sender: req.user._id,
      chatId,
      chatType,
      content,
      type,
      replyTo: replyTo || null,
      readBy: [req.user._id],
    });

    // Update chat last message
    if (chatType === 'personal') {
      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: message._id,
        updatedAt: Date.now(),
      });
    } else {
      await Group.findByIdAndUpdate(chatId, {
        lastMessage: message._id,
        updatedAt: Date.now(),
      });
    }

    // Populate sender details
    await message.populate('sender', 'username avatar');
    if (replyTo) {
      await message.populate('replyTo');
    }

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Mark message as read
// @route   PUT /api/chat/message/:messageId/read
// @access  Private
export const markMessageRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      {
        $addToSet: { readBy: req.user._id },
      },
      { new: true }
    );

    res.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Edit message
// @route   PUT /api/chat/message/:messageId
// @access  Private
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findOne({
      _id: messageId,
      sender: req.user._id,
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or unauthorized',
      });
    }

    message.content = content;
    message.isEdited = true;
    await message.save();

    res.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Delete message
// @route   DELETE /api/chat/message/:messageId
// @access  Private
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findOne({
      _id: messageId,
      sender: req.user._id,
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or unauthorized',
      });
    }

    message.isDeleted = true;
    await message.save();

    res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Add reaction to message
// @route   POST /api/chat/message/:messageId/reaction
// @access  Private
export const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Initialize reactions map if not exists
    if (!message.reactions) {
      message.reactions = new Map();
    }

    // Remove existing reaction from this user
    for (let [key, value] of message.reactions) {
      if (value.includes(req.user._id)) {
        message.reactions.set(
          key,
          value.filter((id) => id.toString() !== req.user._id.toString())
        );
      }
    }

    // Add new reaction
    if (!message.reactions.has(emoji)) {
      message.reactions.set(emoji, []);
    }
    message.reactions.get(emoji).push(req.user._id);

    await message.save();

    res.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};