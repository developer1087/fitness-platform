import firestore from '@react-native-firebase/firestore';

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
  private readonly CONVERSATIONS_COLLECTION = 'conversations';
  private readonly MESSAGES_COLLECTION = 'messages';

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
      const timestamp = new Date().toISOString();
      const message: Message = {
        ...messageData,
        id: '', // Will be set by Firestore
        timestamp,
        isRead: false
      };

      // Save message to Firestore
      const messageRef = await firestore()
        .collection(this.MESSAGES_COLLECTION)
        .add(message);

      message.id = messageRef.id;

      // Update or create conversation
      await this.updateConversation(message);

      console.log('✅ Message sent:', message.id);
      return message;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  }

  private async updateConversation(message: Message): Promise<void> {
    try {
      const conversation: Conversation = {
        id: message.conversationId,
        trainerId: message.senderType === 'trainer' ? message.senderId : message.recipientId,
        trainerName: message.senderType === 'trainer' ? message.senderName : message.recipientName,
        traineeId: message.senderType === 'trainee' ? message.senderId : message.recipientId,
        traineeName: message.senderType === 'trainee' ? message.senderName : message.recipientName,
        lastMessage: message,
        unreadCount: 0,
        lastActivity: message.timestamp,
        isActive: true
      };

      // Update or create conversation in Firestore
      await firestore()
        .collection(this.CONVERSATIONS_COLLECTION)
        .doc(message.conversationId)
        .set(conversation, { merge: true });

      console.log('✅ Conversation updated:', message.conversationId);
    } catch (error) {
      console.error('❌ Error updating conversation:', error);
      throw error;
    }
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    try {
      const messagesSnapshot = await firestore()
        .collection(this.MESSAGES_COLLECTION)
        .where('conversationId', '==', conversationId)
        .orderBy('timestamp', 'asc')
        .get();

      const messages: Message[] = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));

      return messages;
    } catch (error) {
      console.error('❌ Error getting conversation messages:', error);
      return [];
    }
  }

  /**
   * Listen to new messages in real-time
   */
  subscribeToMessages(
    conversationId: string,
    callback: (messages: Message[]) => void
  ): () => void {
    const unsubscribe = firestore()
      .collection(this.MESSAGES_COLLECTION)
      .where('conversationId', '==', conversationId)
      .orderBy('timestamp', 'asc')
      .onSnapshot(
        (snapshot) => {
          const messages: Message[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Message));
          callback(messages);
        },
        (error) => {
          console.error('❌ Error listening to messages:', error);
        }
      );

    return unsubscribe;
  }

  async getUserConversations(userId: string, userType: 'trainer' | 'trainee'): Promise<Conversation[]> {
    try {
      const field = userType === 'trainer' ? 'trainerId' : 'traineeId';

      const conversationsSnapshot = await firestore()
        .collection(this.CONVERSATIONS_COLLECTION)
        .where(field, '==', userId)
        .orderBy('lastActivity', 'desc')
        .get();

      const conversations: Conversation[] = conversationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Conversation));

      // Calculate unread counts for each conversation
      for (const conv of conversations) {
        const unreadCount = await this.getUnreadCount(conv.id, userId);
        conv.unreadCount = unreadCount;
      }

      return conversations;
    } catch (error) {
      console.error('❌ Error getting user conversations:', error);
      return [];
    }
  }

  /**
   * Listen to conversations in real-time
   */
  subscribeToConversations(
    userId: string,
    userType: 'trainer' | 'trainee',
    callback: (conversations: Conversation[]) => void
  ): () => void {
    const field = userType === 'trainer' ? 'trainerId' : 'traineeId';

    const unsubscribe = firestore()
      .collection(this.CONVERSATIONS_COLLECTION)
      .where(field, '==', userId)
      .orderBy('lastActivity', 'desc')
      .onSnapshot(
        async (snapshot) => {
          const conversations: Conversation[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Conversation));

          // Calculate unread counts
          for (const conv of conversations) {
            const unreadCount = await this.getUnreadCount(conv.id, userId);
            conv.unreadCount = unreadCount;
          }

          callback(conversations);
        },
        (error) => {
          console.error('❌ Error listening to conversations:', error);
        }
      );

    return unsubscribe;
  }

  private async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    try {
      const unreadSnapshot = await firestore()
        .collection(this.MESSAGES_COLLECTION)
        .where('conversationId', '==', conversationId)
        .where('recipientId', '==', userId)
        .where('isRead', '==', false)
        .get();

      return unreadSnapshot.size;
    } catch (error) {
      console.error('❌ Error getting unread count:', error);
      return 0;
    }
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      // Get unread messages for this user
      const unreadSnapshot = await firestore()
        .collection(this.MESSAGES_COLLECTION)
        .where('conversationId', '==', conversationId)
        .where('recipientId', '==', userId)
        .where('isRead', '==', false)
        .get();

      // Batch update all unread messages
      const batch = firestore().batch();
      unreadSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { isRead: true });
      });

      await batch.commit();
      console.log(`✅ Marked ${unreadSnapshot.size} messages as read`);
    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
    }
  }

  async getTotalUnreadCount(userId: string): Promise<number> {
    try {
      const unreadSnapshot = await firestore()
        .collection(this.MESSAGES_COLLECTION)
        .where('recipientId', '==', userId)
        .where('isRead', '==', false)
        .get();

      return unreadSnapshot.size;
    } catch (error) {
      console.error('❌ Error getting total unread count:', error);
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

    await firestore()
      .collection(this.CONVERSATIONS_COLLECTION)
      .doc(conversationId)
      .set(conversation, { merge: true });

    console.log('✅ Conversation created:', conversationId);
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
}

export const messagingService = new MessagingService();