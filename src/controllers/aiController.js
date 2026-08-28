import AIService from '../services/aiService.js';
import Message from '../models/Message.js';
import Group from '../models/Group.js';

const aiService = new AIService();

// @desc    Get AI response for personal chat
// @route   POST /api/ai/personal
// @access  Private
export const getPersonalAIResponse = async (req, res) => {
  try {
    const { message, context } = req.body;

    const response = await aiService.getPersonalResponse(
      req.user._id,
      message,
      context
    );

    res.json({
      success: true,
      response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error getting AI response',
    });
  }
};

// @desc    Get AI response for group mention
// @route   POST /api/ai/group/mention
// @access  Private
export const getGroupMentionResponse = async (req, res) => {
  try {
    const { groupId, message } = req.body;

    const group = await Group.findById(groupId).populate(
      'members.user',
      'username'
    );

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    const response = await aiService.getGroupMentionResponse(
      group,
      message
    );

    // Save AI message to group
    const aiMessage = await Message.create({
      sender: req.user._id, // Will be replaced with AI ID
      chatId: groupId,
      chatType: 'group',
      content: response,
      isAI: true,
      readBy: [req.user._id],
    });

    res.json({
      success: true,
      message: aiMessage,
      response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error getting AI response',
    });
  }
};