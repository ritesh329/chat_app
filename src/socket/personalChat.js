import Message from '../models/Message.js';
import Chat from '../models/Chat.js';

export const handlePersonalChat = (io, socket) => {

  // ============================================================
  // SEND PERSONAL MESSAGE
  // ============================================================
  socket.on('personal-message', async (data) => {
    try {
      const {
        chatId,
        content,
        replyToId,
        fileMessageId,
        clientMessageId,
      } = data;

      if (!chatId) {
        socket.emit('error', {
          message: 'Chat ID is required',
        });
        return;
      }

      /*
       * ========================================================
       * FILE MESSAGE
       *
       * Upload API already creates the Message document.
       * Therefore DO NOT create another Message here.
       * Just fetch the existing message and broadcast it.
       * ========================================================
       */
      if (fileMessageId) {
        const message = await Message.findById(
          fileMessageId
        )
          .populate(
            'sender',
            'username avatar'
          )
          .populate('replyTo');

        if (!message) {
          socket.emit('error', {
            message: 'File message not found',
          });
          return;
        }

        /*
         * Security check:
         * Only the sender who owns this message
         * can broadcast it.
         */
        if (
          message.sender?._id?.toString() !==
          socket.userId.toString()
        ) {
          socket.emit('error', {
            message: 'Unauthorized file message',
          });
          return;
        }

        /*
         * Make sure this message actually belongs
         * to this chat.
         */
        if (
          message.chatId.toString() !==
          chatId.toString()
        ) {
          socket.emit('error', {
            message: 'Invalid chat for file message',
          });
          return;
        }

        /*
         * Update clientMessageId if supplied.
         * This helps frontend prevent socket duplicates.
         */
        if (
          clientMessageId &&
          !message.clientMessageId
        ) {
          message.clientMessageId =
            clientMessageId;

          await message.save();
        }

        /*
         * Update last message.
         */
        await Chat.findByIdAndUpdate(
          chatId,
          {
            lastMessage: message._id,
            updatedAt: Date.now(),
          }
        );

        /*
         * IMPORTANT:
         *
         * Emit the SAME database message.
         * DO NOT Message.create() again.
         */
        const chat =
          await Chat.findById(chatId)
            .populate(
              'participants',
              '_id'
            );

        if (!chat) {
          socket.emit('error', {
            message: 'Chat not found',
          });
          return;
        }

        const participants =
          chat.participants.map(
            (p) => p._id.toString()
          );

        participants.forEach((userId) => {
          io.to(`user_${userId}`).emit(
            'receive-message',
            {
              message,
              chatId,
            }
          );
        });

        return;
      }

      /*
       * ========================================================
       * NORMAL TEXT MESSAGE
       * ========================================================
       */

      if (
        typeof content !== 'string' ||
        !content.trim()
      ) {
        socket.emit('error', {
          message: 'Message content is required',
        });
        return;
      }

      const message = await Message.create({
        sender: socket.userId,
        chatId,
        chatType: 'personal',
        content: content.trim(),
        replyTo: replyToId || null,
        readBy: [socket.userId],
        ...(clientMessageId
          ? { clientMessageId }
          : {}),
      });

      await Chat.findByIdAndUpdate(
        chatId,
        {
          lastMessage: message._id,
          updatedAt: Date.now(),
        }
      );

      await message.populate(
        'sender',
        'username avatar'
      );

      if (replyToId) {
        await message.populate(
          'replyTo'
        );
      }

      const chat =
        await Chat.findById(chatId)
          .populate(
            'participants',
            '_id'
          );

      if (!chat) {
        socket.emit('error', {
          message: 'Chat not found',
        });
        return;
      }

      const participants =
        chat.participants.map(
          (p) => p._id.toString()
        );

      participants.forEach((userId) => {
        io.to(`user_${userId}`).emit(
          'receive-message',
          {
            message,
            chatId,
          }
        );
      });

    } catch (error) {
      console.error(
        'Personal message error:',
        error
      );

      socket.emit('error', {
        message:
          error.message ||
          'Failed to send message',
      });
    }
  });


  // ============================================================
  // TYPING START
  // ============================================================
  socket.on('typing-start', async (data) => {
    try {
      const { chatId } = data;

      const chat =
        await Chat.findById(chatId)
          .populate(
            'participants',
            '_id'
          );

      if (!chat) return;

      chat.participants.forEach(
        (participant) => {
          if (
            participant._id.toString() !==
            socket.userId.toString()
          ) {
            io.to(
              `user_${participant._id}`
            ).emit(
              'typing-indicator',
              {
                userId: socket.userId,
                chatId,
                isTyping: true,
              }
            );
          }
        }
      );
    } catch (error) {
      console.error(
        'Typing start error:',
        error
      );
    }
  });


  // ============================================================
  // TYPING STOP
  // ============================================================
  socket.on('typing-stop', async (data) => {
    try {
      const { chatId } = data;

      const chat =
        await Chat.findById(chatId)
          .populate(
            'participants',
            '_id'
          );

      if (!chat) return;

      chat.participants.forEach(
        (participant) => {
          if (
            participant._id.toString() !==
            socket.userId.toString()
          ) {
            io.to(
              `user_${participant._id}`
            ).emit(
              'typing-indicator',
              {
                userId: socket.userId,
                chatId,
                isTyping: false,
              }
            );
          }
        }
      );
    } catch (error) {
      console.error(
        'Typing stop error:',
        error
      );
    }
  });


  // ============================================================
  // MARK READ
  // ============================================================
  socket.on('mark-read', async (data) => {
    try {
      const {
        messageId,
        chatId,
      } = data;

      if (!messageId || !chatId) {
        return;
      }

      await Message.findByIdAndUpdate(
        messageId,
        {
          $addToSet: {
            readBy: socket.userId,
          },
        }
      );

      const chat =
        await Chat.findById(chatId)
          .populate(
            'participants',
            '_id'
          );

      if (!chat) return;

      chat.participants.forEach(
        (participant) => {
          if (
            participant._id.toString() !==
            socket.userId.toString()
          ) {
            io.to(
              `user_${participant._id}`
            ).emit(
              'message-read',
              {
                messageId,
                userId: socket.userId,
                chatId,
              }
            );
          }
        }
      );
    } catch (error) {
      console.error(
        'Mark read error:',
        error
      );
    }
  });


  // ============================================================
  // EDIT MESSAGE
  // ============================================================
  socket.on('edit-message', async (data) => {
    try {
      const {
        messageId,
        content,
      } = data;

      const message =
        await Message.findOneAndUpdate(
          {
            _id: messageId,
            sender: socket.userId,
            fileUrl: {
              $exists: false,
            },
          },
          {
            content,
            isEdited: true,
          },
          {
            new: true,
          }
        ).populate(
          'sender',
          'username avatar'
        );

      if (!message) return;

      const chat =
        await Chat.findById(
          message.chatId
        ).populate(
          'participants',
          '_id'
        );

      if (!chat) return;

      chat.participants.forEach(
        (participant) => {
          io.to(
            `user_${participant._id}`
          ).emit(
            'message-edited',
            {
              message,
              chatId: message.chatId,
            }
          );
        }
      );

    } catch (error) {
      console.error(
        'Edit message error:',
        error
      );
    }
  });


  // ============================================================
  // DELETE MESSAGE
  // ============================================================
  socket.on('delete-message', async (data) => {
    try {
      const {
        messageId,
      } = data;

      const message =
        await Message.findOneAndUpdate(
          {
            _id: messageId,
            sender: socket.userId,
          },
          {
            isDeleted: true,
          },
          {
            new: true,
          }
        );

      if (!message) return;

      const chat =
        await Chat.findById(
          message.chatId
        ).populate(
          'participants',
          '_id'
        );

      if (!chat) return;

      chat.participants.forEach(
        (participant) => {
          io.to(
            `user_${participant._id}`
          ).emit(
            'message-deleted',
            {
              messageId,
              chatId: message.chatId,
            }
          );
        }
      );

    } catch (error) {
      console.error(
        'Delete message error:',
        error
      );
    }
  });
};