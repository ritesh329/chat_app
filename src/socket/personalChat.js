import Message from '../models/Message.js';
import Chat from '../models/Chat.js';
import User from '../models/User.js';

export const handlePersonalChat = (io, socket) => {
  // Send personal message
  socket.on('personal-message', async (data) => {
    try {
      const { chatId, content, replyToId } = data;

      const message = await Message.create({
        sender: socket.userId,
        chatId,
        chatType: 'personal',
        content,
        replyTo: replyToId || null,
        readBy: [socket.userId],
      });

      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: message._id,
        updatedAt: Date.now(),
      });

      await message.populate('sender', 'username avatar');
      
      if (replyToId) {
        await message.populate('replyTo');
      }

      // Get chat participants
      const chat = await Chat.findById(chatId).populate(
        'participants',
        '_id'
      );
      const participants = chat.participants.map((p) => p._id.toString());

      // Emit to both participants
      participants.forEach((userId) => {
        io.to(`user_${userId}`).emit('receive-message', {
          message,
          chatId,
        });
      });
    } catch (error) {
      console.error('Personal message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('typing-start', async (data) => {
    const { chatId } = data;
    const chat = await Chat.findById(chatId).populate('participants', '_id');
    
    chat.participants.forEach((participant) => {
      if (participant._id.toString() !== socket.userId) {
        io.to(`user_${participant._id}`).emit('typing-indicator', {
          userId: socket.userId,
          chatId,
          isTyping: true,
        });
      }
    });
  });

  socket.on('typing-stop', async (data) => {
    const { chatId } = data;
    const chat = await Chat.findById(chatId).populate('participants', '_id');
    
    chat.participants.forEach((participant) => {
      if (participant._id.toString() !== socket.userId) {
        io.to(`user_${participant._id}`).emit('typing-indicator', {
          userId: socket.userId,
          chatId,
          isTyping: false,
        });
      }
    });
  });

  // Mark message as read
  socket.on('mark-read', async (data) => {
    const { messageId, chatId } = data;
    
    await Message.findByIdAndUpdate(messageId, {
      $addToSet: { readBy: socket.userId },
    });

    const chat = await Chat.findById(chatId).populate('participants', '_id');
    chat.participants.forEach((participant) => {
      if (participant._id.toString() !== socket.userId) {
        io.to(`user_${participant._id}`).emit('message-read', {
          messageId,
          userId: socket.userId,
          chatId,
        });
      }
    });
  });

  // Edit message
  socket.on('edit-message', async (data) => {
    try {
      const { messageId, content } = data;
      
      const message = await Message.findOneAndUpdate(
        {
          _id: messageId,
          sender: socket.userId,
        },
        {
          content,
          isEdited: true,
        },
        { new: true }
      ).populate('sender', 'username avatar');

      if (message) {
        const chat = await Chat.findById(message.chatId).populate(
          'participants',
          '_id'
        );
        chat.participants.forEach((participant) => {
          io.to(`user_${participant._id}`).emit('message-edited', {
            message,
            chatId: message.chatId,
          });
        });
      }
    } catch (error) {
      console.error('Edit message error:', error);
    }
  });

  // Delete message
  socket.on('delete-message', async (data) => {
    try {
      const { messageId } = data;
      
      const message = await Message.findOneAndUpdate(
        {
          _id: messageId,
          sender: socket.userId,
        },
        {
          isDeleted: true,
        },
        { new: true }
      );

      if (message) {
        const chat = await Chat.findById(message.chatId).populate(
          'participants',
          '_id'
        );
        chat.participants.forEach((participant) => {
          io.to(`user_${participant._id}`).emit('message-deleted', {
            messageId,
            chatId: message.chatId,
          });
        });
      }
    } catch (error) {
      console.error('Delete message error:', error);
    }
  });
};