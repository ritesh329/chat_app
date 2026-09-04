import Group from '../models/Group.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

export const createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Group name is required',
      });
    }

    const group = await Group.create({
      name,
      description: description || '',
      admin: req.user._id,
      members: [
        { user: req.user._id, role: 'admin' },
        ...(members || []).map((userId) => ({ user: userId, role: 'member' })),
      ],
    });

    // Add group to all members
    const allMembers = [req.user._id, ...(members || [])];
    await User.updateMany(
      { _id: { $in: allMembers } },
      { $addToSet: { groups: group._id } }
    );

    await group.populate('members.user', 'username avatar status');

    res.status(201).json({
      success: true,
      group,
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};


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
    console.error('Get groups error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};


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
    console.error('Get group by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};


export const addMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

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
    console.error('Add member error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};


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
    console.error('Remove member error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};


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
    console.error('Toggle AI mode error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};


export const getGroupMessages = async (req, res) => { 
  try { 
    const { groupId } = req.params; 

     console.log("jkdjkjkdj",groupId)
 
    // Check group 
    const group = await Group.findById(groupId); 
       console.log("sjjsjsjjkskskskskk",group)
    if (!group) { 
      return res.status(404).json({ 
        success: false, 
        message: 'Group not found', 
      }); 
    } 
 
    // Check user is group member 
    const isMember = group.members.some( 
      (member) => 
        member.user.toString() === req.user._id.toString() 
    ); 
 
    if (!isMember) { 
      return res.status(403).json({ 
        success: false, 
        message: 'You are not a member of this group', 
      }); 
    } 
 
    // Get all group messages 
    const messages = await Message.find({ 
      chatId: groupId, 
      chatType: 'group', 
    }) 
      .populate('sender', 'username avatar') 
      .populate({ 
        path: 'replyTo', 
        populate: { 
          path: 'sender', 
          select: 'username avatar', 
        }, 
      }) 
      .sort({ createdAt: 1 }); 
 
    return res.status(200).json({ 
      success: true, 
      count: messages.length, 
      messages, 
    }); 
  } catch (error) { 
    console.error('Get group messages error:', error); 
 
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error', 
    }); 
  } 
}; 