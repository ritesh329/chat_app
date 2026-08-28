import AIService from '../services/aiService.js';
import Message from '../models/Message.js';

const aiService = new AIService();

export const handleAI = (io, socket) => {
  // AI personal chat
  socket.on('ai-personal-message', async (data) => {
    try {
      const { content } = data;

      const response = await aiService.getPersonalResponse(
        socket.userId,
        content,
        ''
      );

      const aiMessage = {
        sender: 'ai',
        content: response,
        isAI: true,
        timestamp: new Date(),
      };

      socket.emit('ai-response', {
        message: aiMessage,
      });
    } catch (error) {
      console.error('AI personal message error:', error);
      socket.emit('error', { message: 'Failed to get AI response' });
    }
  });

  // Clear AI context
  socket.on('clear-ai-context', () => {
    aiService.clearContext(socket.userId);
    socket.emit('ai-context-cleared', { message: 'AI context cleared' });
  });
};