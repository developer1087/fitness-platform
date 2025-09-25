import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: 'trainer' | 'trainee';
  recipientId: string;
  recipientName: string;
  content: string;
  type: 'text' | 'image' | 'workout' | 'session_update' | 'progress_share';
  timestamp: string;
  isRead: boolean;
  metadata?: {
    workoutId?: string;
    sessionId?: string;
    imageUrl?: string;
    progressData?: any;
  };
}

export interface Conversation {
  id: string;
  trainerId: string;
  trainerName: string;
  traineeId: string;
  traineeName: string;
  lastMessage: Message | null;
  unreadCount: number;
  lastActivity: string;
  isActive: boolean;
}

export interface MessageTemplate {
  id: string;
  category: 'motivation' | 'workout' | 'progress' | 'general';
  title: string;
  content: string;
}

class MessagingService {
  private readonly CONVERSATIONS_KEY = 'fitness_conversations';
  private readonly MESSAGES_KEY = 'fitness_messages';
  private readonly UNREAD_KEY = 'fitness_unread';

  // Pre-defined message templates for trainers
  private messageTemplates: MessageTemplate[] = [
    {
      id: 'motivation_1',
      category: 'motivation',
      title: 'Great Job!',
      content: 'Great job on your workout today! Keep up the excellent progress! 💪'
    },
    {
      id: 'motivation_2',
      category: 'motivation',
      title: 'Keep Going',
      content: 'You\'re doing amazing! Every workout gets you closer to your goals. 🌟'
    },
    {
      id: 'workout_1',
      category: 'workout',
      title: 'Workout Reminder',
      content: 'Don\'t forget about your workout today! Remember to warm up properly. 🏃‍♂️'
    },
    {
      id: 'workout_2',
      category: 'workout',
      title: 'Form Check',
      content: 'Great workout! Remember to focus on form over speed. Quality reps are better than fast reps. 🎯'
    },
    {
      id: 'progress_1',
      category: 'progress',
      title: 'Progress Check',
      content: 'I noticed great improvement in your strength this week! How are you feeling about your progress? 📈'
    },
    {
      id: 'general_1',
      category: 'general',
      title: 'Check In',
      content: 'How are you feeling today? Any questions about your training plan? 😊'
    }
  ];

  async sendMessage(messageData: Omit<Message, 'id' | 'timestamp' | 'isRead'>): Promise<Message> {
    try {
      const message: Message = {
        ...messageData,
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        isRead: false
      };

      // Save message
      await this.saveMessage(message);

      // Update or create conversation
      await this.updateConversation(message);

      // Update unread count for recipient
      await this.updateUnreadCount(message.recipientId, message.conversationId);

      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  private async saveMessage(message: Message): Promise<void> {
    try {
      const messagesKey = `${this.MESSAGES_KEY}_${message.conversationId}`;
      const existingMessages = await this.getConversationMessages(message.conversationId);
      const updatedMessages = [...existingMessages, message];

      await AsyncStorage.setItem(messagesKey, JSON.stringify(updatedMessages));
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  private async updateConversation(message: Message): Promise<void> {
    try {
      const conversations = await this.getAllConversations();
      const existingConversationIndex = conversations.findIndex(
        conv => conv.id === message.conversationId
      );

      const conversation: Conversation = {
        id: message.conversationId,
        trainerId: message.senderType === 'trainer' ? message.senderId : message.recipientId,
        trainerName: message.senderType === 'trainer' ? message.senderName : message.recipientName,
        traineeId: message.senderType === 'trainee' ? message.senderId : message.recipientId,
        traineeName: message.senderType === 'trainee' ? message.senderName : message.recipientName,
        lastMessage: message,
        unreadCount: 0, // Will be updated separately
        lastActivity: message.timestamp,
        isActive: true
      };

      if (existingConversationIndex >= 0) {
        conversations[existingConversationIndex] = conversation;
      } else {
        conversations.push(conversation);
      }

      await AsyncStorage.setItem(this.CONVERSATIONS_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error updating conversation:', error);
      throw error;
    }
  }

  private async updateUnreadCount(userId: string, conversationId: string): Promise<void> {
    try {
      const unreadKey = `${this.UNREAD_KEY}_${userId}`;
      const unreadData = await AsyncStorage.getItem(unreadKey);
      const unreadCounts = unreadData ? JSON.parse(unreadData) : {};

      unreadCounts[conversationId] = (unreadCounts[conversationId] || 0) + 1;

      await AsyncStorage.setItem(unreadKey, JSON.stringify(unreadCounts));
    } catch (error) {
      console.error('Error updating unread count:', error);
    }
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    try {
      const messagesKey = `${this.MESSAGES_KEY}_${conversationId}`;
      const messagesData = await AsyncStorage.getItem(messagesKey);
      return messagesData ? JSON.parse(messagesData) : [];
    } catch (error) {
      console.error('Error getting conversation messages:', error);
      return [];
    }
  }

  async getUserConversations(userId: string, userType: 'trainer' | 'trainee'): Promise<Conversation[]> {
    try {
      const conversations = await this.getAllConversations();
      const userConversations = conversations.filter(conv =>
        userType === 'trainer' ? conv.trainerId === userId : conv.traineeId === userId
      );

      // Sort by last activity
      userConversations.sort((a, b) =>
        new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
      );

      // Update unread counts
      const unreadKey = `${this.UNREAD_KEY}_${userId}`;
      const unreadData = await AsyncStorage.getItem(unreadKey);
      const unreadCounts = unreadData ? JSON.parse(unreadData) : {};

      return userConversations.map(conv => ({
        ...conv,
        unreadCount: unreadCounts[conv.id] || 0
      }));
    } catch (error) {
      console.error('Error getting user conversations:', error);
      return [];
    }
  }

  private async getAllConversations(): Promise<Conversation[]> {
    try {
      const conversationsData = await AsyncStorage.getItem(this.CONVERSATIONS_KEY);
      return conversationsData ? JSON.parse(conversationsData) : [];
    } catch (error) {
      console.error('Error getting all conversations:', error);
      return [];
    }
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      // Update messages
      const messages = await this.getConversationMessages(conversationId);
      const updatedMessages = messages.map(msg =>
        msg.recipientId === userId ? { ...msg, isRead: true } : msg
      );

      const messagesKey = `${this.MESSAGES_KEY}_${conversationId}`;
      await AsyncStorage.setItem(messagesKey, JSON.stringify(updatedMessages));

      // Reset unread count
      const unreadKey = `${this.UNREAD_KEY}_${userId}`;
      const unreadData = await AsyncStorage.getItem(unreadKey);
      const unreadCounts = unreadData ? JSON.parse(unreadData) : {};
      unreadCounts[conversationId] = 0;
      await AsyncStorage.setItem(unreadKey, JSON.stringify(unreadCounts));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  async getTotalUnreadCount(userId: string): Promise<number> {
    try {
      const unreadKey = `${this.UNREAD_KEY}_${userId}`;
      const unreadData = await AsyncStorage.getItem(unreadKey);
      const unreadCounts = unreadData ? JSON.parse(unreadData) : {};

      return Object.values(unreadCounts).reduce((total: number, count: any) => total + count, 0);
    } catch (error) {
      console.error('Error getting total unread count:', error);
      return 0;
    }
  }

  async createConversation(trainerId: string, trainerName: string, traineeId: string, traineeName: string): Promise<string> {
    const conversationId = `conv_${trainerId}_${traineeId}`;

    const conversation: Conversation = {
      id: conversationId,
      trainerId,
      trainerName,
      traineeId,
      traineeName,
      lastMessage: null,
      unreadCount: 0,
      lastActivity: new Date().toISOString(),
      isActive: true
    };

    const conversations = await this.getAllConversations();
    const existingIndex = conversations.findIndex(conv => conv.id === conversationId);

    if (existingIndex >= 0) {
      conversations[existingIndex] = conversation;
    } else {
      conversations.push(conversation);
    }

    await AsyncStorage.setItem(this.CONVERSATIONS_KEY, JSON.stringify(conversations));
    return conversationId;
  }

  async sendQuickMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    senderType: 'trainer' | 'trainee',
    recipientId: string,
    recipientName: string,
    templateId: string
  ): Promise<Message> {
    const template = this.messageTemplates.find(t => t.id === templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    return this.sendMessage({
      conversationId,
      senderId,
      senderName,
      senderType,
      recipientId,
      recipientName,
      content: template.content,
      type: 'text'
    });
  }

  async shareWorkout(
    conversationId: string,
    senderId: string,
    senderName: string,
    senderType: 'trainer' | 'trainee',
    recipientId: string,
    recipientName: string,
    workoutData: any
  ): Promise<Message> {
    const content = `Shared workout: ${workoutData.name} - ${workoutData.exercises?.length || 0} exercises, ${workoutData.totalCalories || 0} calories burned`;

    return this.sendMessage({
      conversationId,
      senderId,
      senderName,
      senderType,
      recipientId,
      recipientName,
      content,
      type: 'workout',
      metadata: {
        workoutId: workoutData.id
      }
    });
  }

  async shareProgress(
    conversationId: string,
    senderId: string,
    senderName: string,
    senderType: 'trainer' | 'trainee',
    recipientId: string,
    recipientName: string,
    progressData: any
  ): Promise<Message> {
    const content = `Shared progress update: ${progressData.totalWorkouts} workouts, ${progressData.currentStreak} day streak, ${progressData.totalCalories} calories burned`;

    return this.sendMessage({
      conversationId,
      senderId,
      senderName,
      senderType,
      recipientId,
      recipientName,
      content,
      type: 'progress_share',
      metadata: {
        progressData
      }
    });
  }

  getMessageTemplates(category?: string): MessageTemplate[] {
    if (category) {
      return this.messageTemplates.filter(template => template.category === category);
    }
    return this.messageTemplates;
  }

  // Simulate real-time messaging (in a real app, this would use WebSockets or Firebase)
  private messageListeners: { [conversationId: string]: ((message: Message) => void)[] } = {};

  addMessageListener(conversationId: string, callback: (message: Message) => void): () => void {
    if (!this.messageListeners[conversationId]) {
      this.messageListeners[conversationId] = [];
    }
    this.messageListeners[conversationId].push(callback);

    // Return cleanup function
    return () => {
      const listeners = this.messageListeners[conversationId];
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  private notifyMessageListeners(conversationId: string, message: Message): void {
    const listeners = this.messageListeners[conversationId];
    if (listeners) {
      listeners.forEach(callback => callback(message));
    }
  }
}

export const messagingService = new MessagingService();