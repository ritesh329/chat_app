import cloudinary from '../config/cloudinary.js';
import Message from '../models/Message.js';
import Chat from '../models/Chat.js';
import Group from '../models/Group.js';
import fs from 'fs';


const getMessageType = (fileName) => {
  const extension =
    fileName
      .split('.')
      .pop()
      .toLowerCase();

  if (
    [
      'jpg',
      'jpeg',
      'png',
      'gif',
      'webp',
      'svg',
      'bmp',
      'ico',
    ].includes(extension)
  ) {
    return 'image';
  }

  if (
    [
      'mp4',
      'mov',
      'avi',
      'mkv',
      'webm',
      'flv',
      'wmv',
    ].includes(extension)
  ) {
    return 'video';
  }

  if (
    [
      'mp3',
      'wav',
      'aac',
      'ogg',
      'flac',
      'm4a',
    ].includes(extension)
  ) {
    return 'audio';
  }

  return 'file';
};



export const uploadFile = async (
  req,
  res
) => {
  try {
    const {
      chatId,
      chatType,
      clientMessageId,
    } = req.body;

    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: 'Chat ID is required',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File is required',
      });
    }

    console.log(
      `📤 Uploading file: ${req.file.originalname}`
    );

    const result =
      await cloudinary.uploader.upload(
        req.file.path,
        {
          resource_type: 'auto',
          folder: `connectai/${
            chatType || 'personal'
          }/${chatId}`,
        }
      );

    const messageType =
      getMessageType(
        req.file.originalname
      );


    const messageData = {
      sender: req.user._id,
      chatId,
      chatType:
        chatType || 'personal',

      type: messageType,

    
      content: '',

      fileUrl:
        result.secure_url,

      fileName:
        req.file.originalname,

      fileSize:
        req.file.size,

      fileType:
        result.format ||
        req.file.mimetype ||
        req.file.originalname
          .split('.')
          .pop()
          .toLowerCase(),

      readBy: [
        req.user._id,
      ],

      ...(clientMessageId
        ? {
            clientMessageId,
          }
        : {}),
    };

    const message =
      await Message.create(
        messageData
      );

    if (
      chatType === 'personal'
    ) {
      await Chat.findByIdAndUpdate(
        chatId,
        {
          lastMessage:
            message._id,
          updatedAt:
            Date.now(),
        }
      );
    }

    if (
      chatType === 'group'
    ) {
      await Group.findByIdAndUpdate(
        chatId,
        {
          lastMessage:
            message._id,
          updatedAt:
            Date.now(),
        }
      );
    }

    await message.populate(
      'sender',
      'username avatar'
    );

  
    if (
      fs.existsSync(
        req.file.path
      )
    ) {
      fs.unlinkSync(
        req.file.path
      );
    }

    console.log(
      `File uploaded: ${result.secure_url}`
    );

    return res.status(201).json({
      success: true,
      message,
    });

  } catch (error) {
    console.error(
      'Upload error:',
      error
    );

    if (
      req.file &&
      fs.existsSync(
        req.file.path
      )
    ) {
      fs.unlinkSync(
        req.file.path
      );
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        'File upload failed',
    });
  }
};



export const uploadMultipleFiles =
  async (req, res) => {
    try {
      const {
        chatId,
        chatType,
      } = req.body;

      if (!chatId) {
        return res.status(400).json({
          success: false,
          message:
            'Chat ID is required',
        });
      }

      if (
        !req.files ||
        req.files.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Files are required',
        });
      }

      if (req.files.length > 5) {
        return res.status(400).json({
          success: false,
          message:
            'Maximum 5 files allowed',
        });
      }

      const messages = [];

      for (
        const file of req.files
      ) {
        try {
          const result =
            await cloudinary.uploader.upload(
              file.path,
              {
                resource_type: 'auto',
                folder: `connectai/${
                  chatType ||
                  'personal'
                }/${chatId}`,
              }
            );

          const messageType =
            getMessageType(
              file.originalname
            );

          const message =
            await Message.create({
              sender:
                req.user._id,

              chatId,

              chatType:
                chatType ||
                'personal',

              type:
                messageType,

              content: '',

              fileUrl:
                result.secure_url,

              fileName:
                file.originalname,

              fileSize:
                file.size,

              fileType:
                result.format ||
                file.mimetype ||
                file.originalname
                  .split('.')
                  .pop()
                  .toLowerCase(),

              readBy: [
                req.user._id,
              ],
            });

          await message.populate(
            'sender',
            'username avatar'
          );

          messages.push(
            message
          );

          if (
            fs.existsSync(
              file.path
            )
          ) {
            fs.unlinkSync(
              file.path
            );
          }

        } catch (error) {
          if (
            fs.existsSync(
              file.path
            )
          ) {
            fs.unlinkSync(
              file.path
            );
          }

          throw error;
        }
      }

      const lastMessage =
        messages[
          messages.length - 1
        ];

      if (
        chatType === 'personal'
      ) {
        await Chat.findByIdAndUpdate(
          chatId,
          {
            lastMessage:
              lastMessage._id,
            updatedAt:
              Date.now(),
          }
        );
      }

      if (
        chatType === 'group'
      ) {
        await Group.findByIdAndUpdate(
          chatId,
          {
            lastMessage:
              lastMessage._id,
            updatedAt:
              Date.now(),
          }
        );
      }

      return res.status(201).json({
        success: true,
        messages,
        count:
          messages.length,
      });

    } catch (error) {
      console.error(
        'Multiple upload error:',
        error
      );

      if (req.files) {
        req.files.forEach(
          (file) => {
            if (
              fs.existsSync(
                file.path
              )
            ) {
              fs.unlinkSync(
                file.path
              );
            }
          }
        );
      }

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          'File upload failed',
      });
    }
  };


export const deleteFile = async (
  req,
  res
) => {
  try {
    const {
      messageId,
    } = req.params;

    const message =
      await Message.findOne({
        _id: messageId,
        sender: req.user._id,
      });

    if (!message) {
      return res.status(404).json({
        success: false,
        message:
          'Message not found or unauthorized',
      });
    }

    message.isDeleted = true;

    await message.save();

    return res.json({
      success: true,
      message:
        'File deleted successfully',
    });

  } catch (error) {
    console.error(
      'Delete file error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        'File deletion failed',
    });
  }
};


export const getFileInfo = async (
  req,
  res
) => {
  try {
    const {
      messageId,
    } = req.params;

    const message =
      await Message.findOne({
        _id: messageId,
        isDeleted: false,
      }).populate(
        'sender',
        'username avatar'
      );

    if (!message) {
      return res.status(404).json({
        success: false,
        message:
          'File not found',
      });
    }

    return res.json({
      success: true,

      file: {
        id:
          message._id,

        url:
          message.fileUrl,

        name:
          message.fileName,

        size:
          message.fileSize,

        type:
          message.fileType,

        messageType:
          message.type,

        sender:
          message.sender,

        createdAt:
          message.createdAt,
      },
    });

  } catch (error) {
    console.error(
      'Get file info error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        'Failed to get file info',
    });
  }
};