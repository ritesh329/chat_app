
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Group from '../models/Group.js';


export const createPersonalChat = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user._id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    // Check if user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

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
    console.error('Create personal chat error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};


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
    console.error('Get personal chats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};


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
    console.error('Get chat messages error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};


export const sendMessage = async (req, res) => {
  try {
    const { chatId, chatType, content, replyTo, type = 'text', fileUrl, fileName, fileSize, fileType } = req.body;

    let messageData = {
      sender: req.user._id,
      chatId,
      chatType,
      content: content || '',
      type: type,
      replyTo: replyTo || null,
      readBy: [req.user._id],
    };

    // If file data is present
    if (fileUrl) {
      messageData.fileUrl = fileUrl;
      messageData.fileName = fileName || 'file';
      messageData.fileSize = fileSize || 0;
      messageData.fileType = fileType || 'file';
      messageData.type = type || 'file';
    }

    const message = await Message.create(messageData);

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

    await message.populate('sender', 'username avatar');
    if (replyTo) {
      await message.populate('replyTo');
    }

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};


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

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    res.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Mark message read error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};


export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }

    const message = await Message.findOne({ _id: messageId, sender: req.user._id });
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found or unauthorized' });
    }

    message.content = content;
    message.isEdited = true;
    await message.save();
    await message.populate('sender', 'username avatar');

   
    const io = req.app.get('io'); 
    const Chat = (await import('../models/Chat.js')).default; 
    const chat = await Chat.findById(message.chatId).populate('participants', '_id');

    if (chat) {
      chat.participants.forEach((participant) => {
        io.to(`user_${participant._id}`).emit('message-edited', {
          message,
          chatId: message.chatId,
        });
      });
    }

    res.json({ success: true, message });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Delete message
// @route   DELETE /api/chat/message/:messageId
// @access  Private
// export const deleteMessage = async (req, res) => {
//   try {
//     const { messageId } = req.params;

//     const message = await Message.findOne({
//       _id: messageId,
//       sender: req.user._id,
//     });

//     if (!message) {
//       return res.status(404).json({
//         success: false,
//         message: 'Message not found or unauthorized',
//       });
//     }

//     message.isDeleted = true;
//     await message.save();

//     res.json({
//       success: true,
//       message: 'Message deleted successfully',
//     });
//   } catch (error) {
//     console.error('Delete message error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Server error',
//     });
//   }
// };


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

  
    const io = req.app.get('io');
    const chat = await Chat.findById(message.chatId).populate('participants', '_id');

    if (chat && io) {
      chat.participants.forEach((participant) => {
        io.to(`user_${participant._id}`).emit('message-deleted', {
          messageId,
          chatId: message.chatId,
        });
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};


export const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: 'Emoji is required',
      });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

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
    console.error('Add reaction error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};