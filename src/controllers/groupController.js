import Group from '../models/Group.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Create group
// @route   POST /api/group
// @access  Private
export const createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    const group = await Group.create({
      name,
      description: description || '',
      admin: req.user._id,
      members: [
        { user: req.user._id, role: 'admin' },
        ...members.map((userId) => ({ user: userId, role: 'member' })),
      ],
    });

    // Add group to all members
    await User.updateMany(
      { _id: { $in: [req.user._id, ...members] } },
      { $addToSet: { groups: group._id } }
    );

    await group.populate('members.user', 'username avatar status');

    res.status(201).json({
      success: true,
      group,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get all groups of user
// @route   GET /api/group
// @access  Private
export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      'members.user': req.user._id,
    })
      .populate('members.user', 'username avatar status')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      groups,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get group by ID
// @route   GET /api/group/:groupId
// @access  Private
export const getGroupById = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate('members.user', 'username avatar status lastSeen')
      .populate('admin', 'username avatar')
      .populate('pinnedMessages');

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    res.json({
      success: true,
      group,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Add member to group
// @route   POST /api/group/:groupId/member
// @access  Private
export const addMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    // Check if admin
    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only admin can add members',
      });
    }

    // Check if already member
    if (group.members.some((m) => m.user.toString() === userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member',
      });
    }

    group.members.push({ user: userId, role: 'member' });
    await group.save();

    await User.findByIdAndUpdate(userId, {
      $addToSet: { groups: groupId },
    });

    await group.populate('members.user', 'username avatar status');

    res.json({
      success: true,
      group,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Remove member from group
// @route   DELETE /api/group/:groupId/member/:userId
// @access  Private
export const removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    // Check if admin
    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only admin can remove members',
      });
    }

    // Cannot remove admin
    if (group.admin.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove admin',
      });
    }

    group.members = group.members.filter(
      (m) => m.user.toString() !== userId
    );
    await group.save();

    await User.findByIdAndUpdate(userId, {
      $pull: { groups: groupId },
    });

    res.json({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Toggle AI mode
// @route   PUT /api/group/:groupId/ai-mode
// @access  Private
export const toggleAIMode = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { mode } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    // Check if admin
    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only admin can toggle AI mode',
      });
    }

    group.aiMode = mode;
    await group.save();

    res.json({
      success: true,
      aiMode: group.aiMode,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};