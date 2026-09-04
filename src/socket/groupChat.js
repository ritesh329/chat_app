// import Message from '../models/Message.js';
// import Group from '../models/Group.js';
// import AIService from '../services/aiService.js';

// const aiService = new AIService();

// export const handleGroupChat = (io, socket) => {
//   // ============================================================
//   // JOIN GROUP
//   // ============================================================
//   socket.on('join-group', async ({ groupId }) => {
//     try {
//       if (!groupId) return;

//       socket.join(`group_${groupId}`);

//       console.log(
//         `User ${socket.userId} joined group ${groupId}`
//       );
//     } catch (error) {
//       console.error('Join group error:', error);
//     }
//   });

//   // ============================================================
//   // LEAVE GROUP
//   // ============================================================
//   socket.on('leave-group', async ({ groupId }) => {
//     try {
//       if (!groupId) return;

//       socket.leave(`group_${groupId}`);

//       console.log(
//         `User ${socket.userId} left group ${groupId}`
//       );
//     } catch (error) {
//       console.error('Leave group error:', error);
//     }
//   });

//   // ============================================================
//   // SEND GROUP MESSAGE (TEXT + FILE/MEDIA)
//   // ============================================================
//   socket.on('group-message', async (data) => {
//     try {
//       const {
//         groupId,
//         content,
//         replyToId = null,
//         fileMessageId = null,
//         clientMessageId = null,
//       } = data;

//       if (!groupId) {
//         return socket.emit('error', {
//           message: 'Group ID is required',
//         });
//       }

//       // Check group
//       const group = await Group.findById(groupId);

//       if (!group) {
//         return socket.emit('error', {
//           message: 'Group not found',
//         });
//       }

//       let message;

//       // ========================================================
//       // FILE / MEDIA MESSAGE
//       // (file already uploaded via /upload/single REST route,
//       //  which already created the Message doc — we just fetch it)
//       // ========================================================
//       if (fileMessageId) {
//         message = await Message.findById(fileMessageId);

//         if (!message) {
//           return socket.emit('error', {
//             message: 'File message not found',
//           });
//         }

//         if (replyToId) {
//           message.replyTo = replyToId;
//           await message.save();
//         }
//       } else {
//         // ======================================================
//         // TEXT MESSAGE
//         // ======================================================
//         if (!content?.trim()) {
//           return socket.emit('error', {
//             message: 'Group ID and message are required',
//           });
//         }

//         message = await Message.create({
//           sender: socket.userId,
//           chatId: groupId,
//           chatType: 'group',
//           content: content.trim(),
//           replyTo: replyToId || null,
//           readBy: [socket.userId],
//         });
//       }

//       // Populate sender
//       await message.populate('sender', 'username avatar');

//       // Update group last message
//       await Group.findByIdAndUpdate(groupId, {
//         lastMessage: message._id,
//         updatedAt: new Date(),
//       });

//       // Send message to ALL group members
//       io.to(`group_${groupId}`).emit('receive-message', {
//         message: {
//           ...message.toObject(),
//           clientMessageId,
//         },
//         groupId,
//       });

//       // ========================================================
//       // AI MENTION + AUTO AI MODE
//       // (only relevant for text messages, not file/media)
//       // ========================================================
//       if (!fileMessageId) {
//         const isMentioningAI =
//           content.includes('@AI') ||
//           content.includes('@Nova');

//         if (isMentioningAI) {
//           const aiResponse =
//             await aiService.getGroupMentionResponse(
//               group,
//               content
//                 .replace(/@AI|@Nova/gi, '')
//                 .trim()
//             );

//           if (aiResponse) {
//             const aiMessage =
//               await Message.create({
//                 sender: socket.userId,
//                 chatId: groupId,
//                 chatType: 'group',
//                 content: aiResponse,
//                 isAI: true,
//                 readBy: [socket.userId],
//               });

//             await aiMessage.populate(
//               'sender',
//               'username avatar'
//             );

//             await Group.findByIdAndUpdate(
//               groupId,
//               {
//                 lastMessage: aiMessage._id,
//                 updatedAt: new Date(),
//               }
//             );

//             io.to(`group_${groupId}`).emit(
//               'receive-message',
//               {
//                 message: aiMessage,
//                 groupId,
//                 isAI: true,
//               }
//             );
//           }
//         }

//         if (group.aiMode) {
//           const shouldRespond =
//             await aiService.shouldAutoRespond(
//               content,
//               ''
//             );

//           if (shouldRespond) {
//             const autoResponse =
//               await aiService.generateAutoResponse(
//                 group,
//                 content
//               );

//             if (autoResponse) {
//               const aiMessage =
//                 await Message.create({
//                   sender: socket.userId,
//                   chatId: groupId,
//                   chatType: 'group',
//                   content: autoResponse,
//                   isAI: true,
//                   readBy: [socket.userId],
//                 });

//               await aiMessage.populate(
//                 'sender',
//                 'username avatar'
//               );

//               await Group.findByIdAndUpdate(
//                 groupId,
//                 {
//                   lastMessage: aiMessage._id,
//                   updatedAt: new Date(),
//                 }
//               );

//               io.to(`group_${groupId}`).emit(
//                 'receive-message',
//                 {
//                   message: aiMessage,
//                   groupId,
//                   isAI: true,
//                 }
//               );
//             }
//           }
//         }
//       }
//     } catch (error) {
//       console.error(
//         'Group message error:',
//         error
//       );

//       socket.emit('error', {
//         message: 'Failed to send group message',
//       });
//     }
//   });

//   // ============================================================
//   // EDIT GROUP MESSAGE - REALTIME
//   // (emits 'message-edited' so it matches the frontend listener
//   //  already used for personal chat)
//   // ============================================================
//   socket.on(
//     'group-edit-message',
//     async (data) => {
//       try {
//         const {
//           groupId,
//           messageId,
//           content,
//         } = data;

//         if (
//           !groupId ||
//           !messageId ||
//           !content?.trim()
//         ) {
//           return socket.emit('error', {
//             message:
//               'Group ID, message ID and content are required',
//           });
//         }

//         // Only message owner can edit
//         const message =
//           await Message.findOne({
//             _id: messageId,
//             chatId: groupId,
//             chatType: 'group',
//             sender: socket.userId,
//           });

//         if (!message) {
//           return socket.emit('error', {
//             message:
//               'Message not found or you cannot edit this message',
//           });
//         }

//         // Deleted messages cannot be edited
//         if (message.isDeleted) {
//           return socket.emit('error', {
//             message:
//               'Deleted message cannot be edited',
//           });
//         }

//         // File messages cannot be edited
//         if (message.fileUrl) {
//           return socket.emit('error', {
//             message:
//               'File messages cannot be edited',
//           });
//         }

//         // Update
//         message.content = content.trim();
//         message.isEdited = true;

//         await message.save();

//         await message.populate(
//           'sender',
//           'username avatar'
//         );

//         // Send updated message to EVERYONE
//         // (event name matches frontend's `message-edited` listener)
//         io.to(`group_${groupId}`).emit(
//           'message-edited',
//           {
//             message,
//             chatId: groupId,
//           }
//         );

//         console.log(
//           `Group message ${messageId} edited by ${socket.userId}`
//         );
//       } catch (error) {
//         console.error(
//           'Group edit error:',
//           error
//         );

//         socket.emit('error', {
//           message: 'Failed to edit message',
//         });
//       }
//     }
//   );

//   // ============================================================
//   // DELETE GROUP MESSAGE - REALTIME
//   // (emits 'message-deleted' so it matches the frontend listener
//   //  already used for personal chat)
//   // ============================================================
//   socket.on(
//     'group-delete-message',
//     async (data) => {
//       try {
//         const {
//           groupId,
//           messageId,
//         } = data;

//         if (!groupId || !messageId) {
//           return socket.emit('error', {
//             message:
//               'Group ID and message ID are required',
//           });
//         }

//         // Only message owner can delete
//         const message =
//           await Message.findOne({
//             _id: messageId,
//             chatId: groupId,
//             chatType: 'group',
//             sender: socket.userId,
//           });

//         if (!message) {
//           return socket.emit('error', {
//             message:
//               'Message not found or you cannot delete this message',
//           });
//         }

//         // Soft delete
//         message.isDeleted = true;

//         await message.save();

//         // Send delete event to EVERYONE
//         // (event name matches frontend's `message-deleted` listener)
//         io.to(`group_${groupId}`).emit(
//           'message-deleted',
//           {
//             messageId: message._id,
//             chatId: groupId,
//           }
//         );

//         console.log(
//           `Group message ${messageId} deleted by ${socket.userId}`
//         );
//       } catch (error) {
//         console.error(
//           'Group delete error:',
//           error
//         );

//         socket.emit('error', {
//           message: 'Failed to delete message',
//         });
//       }
//     }
//   );

//   // ============================================================
//   // GROUP TYPING
//   // ============================================================
//   socket.on(
//     'group-typing',
//     async (data) => {
//       try {
//         const {
//           groupId,
//           isTyping,
//         } = data;

//         if (!groupId) return;

//         socket
//           .to(`group_${groupId}`)
//           .emit(
//             'group-typing-indicator',
//             {
//               userId: socket.userId,
//               groupId,
//               isTyping: Boolean(isTyping),
//             }
//           );
//       } catch (error) {
//         console.error(
//           'Group typing error:',
//           error
//         );
//       }
//     }
//   );
// };


import Message from '../models/Message.js';
import Group from '../models/Group.js';
import AIService from '../services/aiService.js';

const aiService = new AIService();

export const handleGroupChat = (io, socket) => {
  
  // JOIN GROUP
  socket.on('join-group', async ({ groupId }) => {
    try {
      if (!groupId) return;

      socket.join(`group_${groupId}`);

      console.log(
        `User ${socket.userId} joined group ${groupId}`
      );
    } catch (error) {
      console.error('Join group error:', error);
    }
  });

  
  // LEAVE GROUP

  socket.on('leave-group', async ({ groupId }) => {
    try {
      if (!groupId) return;

      socket.leave(`group_${groupId}`);

      console.log(
        `User ${socket.userId} left group ${groupId}`
      );
    } catch (error) {
      console.error('Leave group error:', error);
    }
  });

 
  // SEND GROUP MESSAGE (TEXT + FILE/MEDIA)

  socket.on('group-message', async (data) => {
    try {
      const {
        groupId,
        content,
        replyToId = null,
        fileMessageId = null,
        clientMessageId = null,
      } = data;

      if (!groupId) {
        return socket.emit('error', {
          message: 'Group ID is required',
        });
      }

      // Check group
      const group = await Group.findById(groupId);

      if (!group) {
        return socket.emit('error', {
          message: 'Group not found',
        });
      }

      let message;

      if (fileMessageId) {
        message = await Message.findById(fileMessageId);

        if (!message) {
          return socket.emit('error', {
            message: 'File message not found',
          });
        }

        if (replyToId) {
          message.replyTo = replyToId;
          await message.save();
        }
      } else {
       
        // TEXT MESSAGE
     
        if (!content?.trim()) {
          return socket.emit('error', {
            message: 'Group ID and message are required',
          });
        }

        message = await Message.create({
          sender: socket.userId,
          chatId: groupId,
          chatType: 'group',
          content: content.trim(),
          replyTo: replyToId || null,
          readBy: [socket.userId],
        });
      }

      // Populate sender
      await message.populate('sender', 'username avatar');

      // Update group last message
      await Group.findByIdAndUpdate(groupId, {
        lastMessage: message._id,
        updatedAt: new Date(),
      });

      // Send message to ALL group members
      io.to(`group_${groupId}`).emit('receive-message', {
        message: {
          ...message.toObject(),
          clientMessageId,
        },
        groupId,
      });

     
      // AI MENTION + AUTO AI MODE
    
      if (!fileMessageId) {
        const isMentioningAI =
          content.includes('@AI') ||
          content.includes('@Nova');

        if (isMentioningAI) {
          const aiResponse =
            await aiService.getGroupMentionResponse(
              group,
              content
                .replace(/@AI|@Nova/gi, '')
                .trim()
            );

          if (aiResponse) {
            const aiMessage =
              await Message.create({
                sender: socket.userId,
                chatId: groupId,
                chatType: 'group',
                content: aiResponse,
                isAI: true,
                readBy: [socket.userId],
              });

            await aiMessage.populate(
              'sender',
              'username avatar'
            );

            await Group.findByIdAndUpdate(
              groupId,
              {
                lastMessage: aiMessage._id,
                updatedAt: new Date(),
              }
            );

            io.to(`group_${groupId}`).emit(
              'receive-message',
              {
                message: aiMessage,
                groupId,
                isAI: true,
              }
            );
          }
        }

        if (group.aiMode) {
          const shouldRespond =
            await aiService.shouldAutoRespond(
              content,
              ''
            );

          if (shouldRespond) {
            const autoResponse =
              await aiService.generateAutoResponse(
                group,
                content
              );

            if (autoResponse) {
              const aiMessage =
                await Message.create({
                  sender: socket.userId,
                  chatId: groupId,
                  chatType: 'group',
                  content: autoResponse,
                  isAI: true,
                  readBy: [socket.userId],
                });

              await aiMessage.populate(
                'sender',
                'username avatar'
              );

              await Group.findByIdAndUpdate(
                groupId,
                {
                  lastMessage: aiMessage._id,
                  updatedAt: new Date(),
                }
              );

              io.to(`group_${groupId}`).emit(
                'receive-message',
                {
                  message: aiMessage,
                  groupId,
                  isAI: true,
                }
              );
            }
          }
        }
      }
    } catch (error) {
      console.error(
        'Group message error:',
        error
      );

      socket.emit('error', {
        message: 'Failed to send group message',
      });
    }
  });


  socket.on(
    'group-edit-message',
    async (data) => {
      try {
        const {
          groupId,
          messageId,
          content,
        } = data;

        if (
          !groupId ||
          !messageId ||
          !content?.trim()
        ) {
          return socket.emit('error', {
            message:
              'Group ID, message ID and content are required',
          });
        }

      
        const message =
          await Message.findOne({
            _id: messageId,
            chatId: groupId,
            chatType: 'group',
            sender: socket.userId,
          });

        if (!message) {
          return socket.emit('error', {
            message:
              'Message not found or you cannot edit this message',
          });
        }

        
        if (message.isDeleted) {
          return socket.emit('error', {
            message:
              'Deleted message cannot be edited',
          });
        }

       
        if (message.fileUrl) {
          return socket.emit('error', {
            message:
              'File messages cannot be edited',
          });
        }

        // Update
        message.content = content.trim();
        message.isEdited = true;

        await message.save();

        await message.populate(
          'sender',
          'username avatar'
        );

        
        io.to(`group_${groupId}`).emit(
          'message-edited',
          {
            message,
            chatId: groupId,
          }
        );

        console.log(
          `Group message ${messageId} edited by ${socket.userId}`
        );
      } catch (error) {
        console.error(
          'Group edit error:',
          error
        );

        socket.emit('error', {
          message: 'Failed to edit message',
        });
      }
    }
  );

  
  socket.on(
    'group-delete-message',
    async (data) => {
      try {
        const {
          groupId,
          messageId,
        } = data;

        if (!groupId || !messageId) {
          return socket.emit('error', {
            message:
              'Group ID and message ID are required',
          });
        }

        // Only message owner can delete
        const message =
          await Message.findOne({
            _id: messageId,
            chatId: groupId,
            chatType: 'group',
            sender: socket.userId,
          });

        if (!message) {
          return socket.emit('error', {
            message:
              'Message not found or you cannot delete this message',
          });
        }

        // Soft delete
        message.isDeleted = true;

        await message.save();

       
        io.to(`group_${groupId}`).emit(
          'message-deleted',
          {
            messageId: message._id,
            chatId: groupId,
          }
        );

        console.log(
          `Group message ${messageId} deleted by ${socket.userId}`
        );
      } catch (error) {
        console.error(
          'Group delete error:',
          error
        );

        socket.emit('error', {
          message: 'Failed to delete message',
        });
      }
    }
  );

  socket.on(
    'group-typing',
    async (data) => {
      try {
        const {
          groupId,
          isTyping,
        } = data;

        if (!groupId) return;

        socket
          .to(`group_${groupId}`)
          .emit(
            'group-typing-indicator',
            {
              userId: socket.userId,
              groupId,
              isTyping: Boolean(isTyping),
            }
          );
      } catch (error) {
        console.error(
          'Group typing error:',
          error
        );
      }
    }
  );

 
  socket.on('suggest-emoji', async (data) => {
    try {
      const { text, groupId } = data;

      if (!text || text.trim().length < 3) return;

      const emoji = await aiService.suggestEmoji(text);

      if (emoji) {
        // Sirf isi socket (sender) ko wapas bhejo, poore group ko nahi
        socket.emit('emoji-suggestion', {
          emoji,
          groupId,
        });
      }
    } catch (error) {
      console.error('Emoji suggestion error:', error);
    }
  });

 
  // ROAST / COMPLIMENT A MESSAGE
 
  // socket.on('react-ai', async (data) => {
  //   try {
  //     const { groupId, messageId, mode } = data; // mode = 'roast' | 'compliment'

  //     if (!groupId || !messageId) {
  //       return socket.emit('error', {
  //         message: 'Group ID and message ID are required',
  //       });
  //     }

  //     const targetMessage = await Message.findOne({
  //       _id: messageId,
  //       chatId: groupId,
  //       chatType: 'group',
  //     });

  //     if (!targetMessage || targetMessage.isDeleted) {
  //       return socket.emit('error', {
  //         message: 'Message not found',
  //       });
  //     }

  //     const reply = await aiService.roastOrCompliment(
  //       targetMessage.content || 'this',
  //       mode === 'compliment' ? 'compliment' : 'roast'
  //     );

  //     if (!reply) return;

  //     const aiMessage = await Message.create({
  //       sender: socket.userId,
  //       chatId: groupId,
  //       chatType: 'group',
  //       content: reply,
  //       isAI: true,
  //       replyTo: messageId,
  //       readBy: [socket.userId],
  //     });

  //     await aiMessage.populate('sender', 'username avatar');

  //     await Group.findByIdAndUpdate(groupId, {
  //       lastMessage: aiMessage._id,
  //       updatedAt: new Date(),
  //     });

  //     io.to(`group_${groupId}`).emit('receive-message', {
  //       message: aiMessage,
  //       groupId,
  //       isAI: true,
  //     });
  //   } catch (error) {
  //     console.error('Roast/Compliment error:', error);
  //     socket.emit('error', { message: 'Failed to generate response' });
  //   }
  // });

  socket.on('react-ai', async (data) => {
  try {
    const { groupId, messageId, mode } = data;

    if (!groupId || !messageId) {
      return socket.emit('error', {
        message: 'Group ID and message ID are required',
      });
    }

    const targetMessage = await Message.findOne({
      _id: messageId,
      chatId: groupId,
      chatType: 'group',
    });

    if (!targetMessage || targetMessage.isDeleted) {
      return socket.emit('error', { message: 'Message not found' });
    }

    const reactionMode = mode === 'compliment' ? 'compliment' : 'roast';

    const reply = await aiService.roastOrCompliment(
      targetMessage.content || 'this',
      reactionMode
    );

    if (!reply) return;

    const aiMessage = await Message.create({
      sender: socket.userId,
      chatId: groupId,
      chatType: 'group',
      content: reply,
      isAI: true,
      replyTo: messageId,
      reactionMode,               
      readBy: [socket.userId],
    });

    await aiMessage.populate('sender', 'username avatar');

  
    await aiMessage.populate({
      path: 'replyTo',
      select: 'content sender',
      populate: { path: 'sender', select: 'username' },
    });

    await Group.findByIdAndUpdate(groupId, {
      lastMessage: aiMessage._id,
      updatedAt: new Date(),
    });

    io.to(`group_${groupId}`).emit('receive-message', {
      message: aiMessage,
      groupId,
      isAI: true,
    });
  } catch (error) {
    console.error('Roast/Compliment error:', error);
    socket.emit('error', { message: 'Failed to generate response' });
  }
});

 
  // ICEBREAKER QUESTION

  socket.on('request-icebreaker', async (data) => {
    try {
      const { groupId } = data;

      if (!groupId) {
        return socket.emit('error', { message: 'Group ID is required' });
      }

      const group = await Group.findById(groupId);
      if (!group) {
        return socket.emit('error', { message: 'Group not found' });
      }

      const question = await aiService.generateIcebreaker(group.name);

      const aiMessage = await Message.create({
        sender: socket.userId,
        chatId: groupId,
        chatType: 'group',
        content: `🧊 Icebreaker: ${question}`,
        isAI: true,
        readBy: [socket.userId],
      });

      await aiMessage.populate('sender', 'username avatar');

      await Group.findByIdAndUpdate(groupId, {
        lastMessage: aiMessage._id,
        updatedAt: new Date(),
      });

      io.to(`group_${groupId}`).emit('receive-message', {
        message: aiMessage,
        groupId,
        isAI: true,
      });
    } catch (error) {
      console.error('Icebreaker error:', error);
      socket.emit('error', { message: 'Failed to generate icebreaker' });
    }
  });

 
  // CREATE POLL (from text, using /poll command)
  
  socket.on('create-poll', async (data) => {
    try {
      const { groupId, text } = data;

      if (!groupId || !text?.trim()) {
        return socket.emit('error', {
          message: 'Group ID and text are required',
        });
      }

      const group = await Group.findById(groupId);
      if (!group) {
        return socket.emit('error', { message: 'Group not found' });
      }

      const pollData = await aiService.generatePoll(text);

      if (!pollData) {
        return socket.emit('error', {
          message: 'Could not generate a poll from that text. Try rephrasing.',
        });
      }

      const pollMessage = await Message.create({
        sender: socket.userId,
        chatId: groupId,
        chatType: 'group',
        content: pollData.question,
        type: 'poll',
        poll: {
          question: pollData.question,
          options: pollData.options.map((opt) => ({ text: opt, votes: [] })),
        },
        readBy: [socket.userId],
      });

      await pollMessage.populate('sender', 'username avatar');

      await Group.findByIdAndUpdate(groupId, {
        lastMessage: pollMessage._id,
        updatedAt: new Date(),
      });

      io.to(`group_${groupId}`).emit('receive-message', {
        message: pollMessage,
        groupId,
      });
    } catch (error) {
      console.error('Poll creation error:', error);
      socket.emit('error', { message: 'Failed to create poll' });
    }
  });

  // VOTE ON POLL

  socket.on('vote-poll', async (data) => {
    try {
      const { groupId, messageId, optionIndex } = data;

      if (!groupId || !messageId || optionIndex == null) {
        return socket.emit('error', {
          message: 'Group ID, message ID and option are required',
        });
      }

      const message = await Message.findOne({
        _id: messageId,
        chatId: groupId,
        chatType: 'group',
        type: 'poll',
      });

      if (!message || !message.poll) {
        return socket.emit('error', { message: 'Poll not found' });
      }

 
      message.poll.options.forEach((opt) => {
        opt.votes = opt.votes.filter(
          (uid) => uid.toString() !== socket.userId.toString()
        );
      });

  
      if (message.poll.options[optionIndex]) {
        message.poll.options[optionIndex].votes.push(socket.userId);
      }

      await message.save();
      await message.populate('sender', 'username avatar');

      io.to(`group_${groupId}`).emit('poll-updated', {
        messageId: message._id,
        poll: message.poll,
        groupId,
      });
    } catch (error) {
      console.error('Poll vote error:', error);
      socket.emit('error', { message: 'Failed to vote' });
    }
  });
};