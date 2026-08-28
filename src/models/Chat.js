import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ============ FIXED: Remove pre-save validation ============
// Instead of pre-save, use a static method or remove validation

// Option 1: Remove pre-save hook completely (Recommended)
// chatSchema.pre('save', function(next) {
//   if (this.participants.length !== 2) {
//     return next(new Error('Personal chat must have exactly 2 participants'));
//   }
//   next();
// });

// Option 2: Use async/await without next (If you need validation)
chatSchema.pre('save', async function() {
  if (this.participants.length !== 2) {
    throw new Error('Personal chat must have exactly 2 participants');
  }
});

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;