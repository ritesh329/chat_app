import Message from '../models/Message.js';
import Group from '../models/Group.js';
import AIService from '../services/aiService.js';

const aiService = new AIService();

export const handleGroupChat = (io, socket) => {
  // Join group room
  socket.on('join-group', async (data) => {
    const { groupId } = data;
    socket.join(`group_${groupId}`);
    console.log(`User ${socket.userId} joined group ${groupId}`);
  });

  // Leave group room
  socket.on('leave-group', async (data) => {
    const { groupId } = data;
    socket.leave(`group_${groupId}`);
  });

  // Send group message
  socket.on('group-message', async (data) => {
    try {
      const { groupId, content, replyToId } = data;

      // Check if message is mentioning AI
      const isMentioningAI = content.includes('@AI') || content.includes('@Nova');

      const message = await Message.create({
        sender: socket.userId,
        chatId: groupId,
        chatType: 'group',
        content,
        replyTo: replyToId || null,
        readBy: [socket.userId],
      });

      await Group.findByIdAndUpdate(groupId, {
        lastMessage: message._id,
        updatedAt: Date.now(),
      });

      await message.populate('sender', 'username avatar');

      // Emit to group
      io.to(`group_${groupId}`).emit('receive-message', {
        message,
        groupId,
      });

      // Handle AI mention
      if (isMentioningAI) {
        const group = await Group.findById(groupId);
        const aiResponse = await aiService.getGroupMentionResponse(
          group,
          content.replace(/@AI|@Nova/g, '').trim()
        );

        if (aiResponse) {
          const aiMessage = await Message.create({
            sender: socket.userId,
            chatId: groupId,
            chatType: 'group',
            content: aiResponse,
            isAI: true,
            readBy: [socket.userId],
          });

          await Group.findByIdAndUpdate(groupId, {
            lastMessage: aiMessage._id,
          });

          io.to(`group_${groupId}`).emit('receive-message', {
            message: aiMessage,
            groupId,
            isAI: true,
          });
        }
      }

      // Handle Auto Mode
      const group = await Group.findById(groupId);
      if (group.aiMode) {
        const shouldRespond = await aiService.shouldAutoRespond(
          content,
          ''
        );

        if (shouldRespond) {
          const autoResponse = await aiService.generateAutoResponse(
            group,
            content
          );

          if (autoResponse) {
            const aiMessage = await Message.create({
              sender: socket.userId,
              chatId: groupId,
              chatType: 'group',
              content: autoResponse,
              isAI: true,
              readBy: [socket.userId],
            });

            await Group.findByIdAndUpdate(groupId, {
              lastMessage: aiMessage._id,
            });

            io.to(`group_${groupId}`).emit('receive-message', {
              message: aiMessage,
              groupId,
              isAI: true,
            });
          }
        }
      }
    } catch (error) {
      console.error('Group message error:', error);
      socket.emit('error', { message: 'Failed to send group message' });
    }
  });

  // Typing in group
  socket.on('group-typing', async (data) => {
    const { groupId, isTyping } = data;
    
    socket.to(`group_${groupId}`).emit('group-typing-indicator', {
      userId: socket.userId,
      groupId,
      isTyping,
    });
  });
};