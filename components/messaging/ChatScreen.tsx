import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useAuth } from '../../lib/auth';
import { messagingService, Message, MessageTemplate } from '../../lib/messaging';

interface ChatScreenProps {
  visible: boolean;
  onClose: () => void;
  conversationId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserType: 'trainer' | 'trainee';
}

export function ChatScreen({
  visible,
  onClose,
  conversationId,
  otherUserId,
  otherUserName,
  otherUserType,
}: ChatScreenProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const currentUserType = otherUserType === 'trainer' ? 'trainee' : 'trainer';

  useEffect(() => {
    if (visible) {
      loadMessages();
      markMessagesAsRead();
      loadTemplates();
    }
  }, [visible, conversationId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      const conversationMessages = await messagingService.getConversationMessages(conversationId);
      setMessages(conversationMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await messagingService.markMessagesAsRead(conversationId, user?.uid || 'demo');
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const loadTemplates = () => {
    if (currentUserType === 'trainer') {
      setTemplates(messagingService.getMessageTemplates());
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setLoading(true);
      await messagingService.sendMessage({
        conversationId,
        senderId: user?.uid || 'demo',
        senderName: currentUserType === 'trainer' ? 'Trainer' : 'Trainee',
        senderType: currentUserType,
        recipientId: otherUserId,
        recipientName: otherUserName,
        content: newMessage.trim(),
        type: 'text'
      });

      setNewMessage('');
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const sendQuickMessage = async (templateId: string) => {
    try {
      setLoading(true);
      await messagingService.sendQuickMessage(
        conversationId,
        user?.uid || 'demo',
        currentUserType === 'trainer' ? 'Trainer' : 'Trainee',
        currentUserType,
        otherUserId,
        otherUserName,
        templateId
      );

      setShowTemplates(false);
      await loadMessages();
    } catch (error) {
      console.error('Error sending quick message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const shareProgress = async () => {
    try {
      // Mock progress data - in real app, this would come from actual user stats
      const progressData = {
        totalWorkouts: 15,
        currentStreak: 5,
        totalCalories: 2450,
        weeklyGoals: 'Completed 4/5 workouts this week'
      };

      await messagingService.shareProgress(
        conversationId,
        user?.uid || 'demo',
        currentUserType === 'trainer' ? 'Trainer' : 'Trainee',
        currentUserType,
        otherUserId,
        otherUserName,
        progressData
      );

      await loadMessages();
    } catch (error) {
      console.error('Error sharing progress:', error);
      Alert.alert('Error', 'Failed to share progress');
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const renderMessage = (message: Message, index: number) => {
    const isCurrentUser = message.senderId === (user?.uid || 'demo');
    const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;

    return (
      <View key={message.id} style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
      ]}>
        {!isCurrentUser && showAvatar && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {message.senderName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
          !isCurrentUser && !showAvatar && styles.messageWithoutAvatar
        ]}>
          {message.type === 'workout' && (
            <View style={styles.workoutShare}>
              <Text style={styles.workoutShareTitle}>🏋️ Workout Shared</Text>
            </View>
          )}

          {message.type === 'progress_share' && (
            <View style={styles.progressShare}>
              <Text style={styles.progressShareTitle}>📊 Progress Update</Text>
            </View>
          )}

          <Text style={[
            styles.messageText,
            isCurrentUser ? styles.currentUserText : styles.otherUserText
          ]}>
            {message.content}
          </Text>

          <Text style={[
            styles.messageTime,
            isCurrentUser ? styles.currentUserTime : styles.otherUserTime
          ]}>
            {formatMessageTime(message.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  const renderTemplateModal = () => {
    const groupedTemplates = templates.reduce((acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = [];
      }
      acc[template.category].push(template);
      return acc;
    }, {} as { [key: string]: MessageTemplate[] });

    return (
      <Modal
        visible={showTemplates}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTemplates(false)}
      >
        <View style={styles.templateContainer}>
          <View style={styles.templateHeader}>
            <Text style={styles.templateTitle}>Quick Messages</Text>
            <TouchableOpacity
              onPress={() => setShowTemplates(false)}
              style={styles.templateCloseButton}
            >
              <Text style={styles.templateCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.templateContent}>
            {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
              <View key={category} style={styles.templateCategory}>
                <Text style={styles.templateCategoryTitle}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>

                {categoryTemplates.map((template) => (
                  <TouchableOpacity
                    key={template.id}
                    style={styles.templateItem}
                    onPress={() => sendQuickMessage(template.id)}
                  >
                    <Text style={styles.templateItemTitle}>{template.title}</Text>
                    <Text style={styles.templateItemContent}>{template.content}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{otherUserName}</Text>
            <Text style={styles.headerRole}>
              {otherUserType === 'trainer' ? 'Personal Trainer' : 'Trainee'}
            </Text>
          </View>

          <View style={styles.headerActions}>
            {currentUserType === 'trainee' && (
              <TouchableOpacity
                style={styles.shareButton}
                onPress={shareProgress}
              >
                <Text style={styles.shareButtonText}>📊</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Start your conversation!</Text>
              <Text style={styles.emptySubtext}>
                {currentUserType === 'trainer'
                  ? 'Send encouragement and track their progress'
                  : 'Ask questions and share your fitness journey'
                }
              </Text>
            </View>
          ) : (
            messages.map((message, index) => renderMessage(message, index))
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          {currentUserType === 'trainer' && (
            <TouchableOpacity
              style={styles.templatesButton}
              onPress={() => setShowTemplates(true)}
            >
              <Text style={styles.templatesButtonText}>💬</Text>
            </TouchableOpacity>
          )}

          <TextInput
            style={[styles.textInput, currentUserType === 'trainer' && styles.textInputWithTemplates]}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            multiline
            maxLength={500}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!newMessage.trim() || loading) && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || loading}
          >
            <Text style={styles.sendButtonText}>→</Text>
          </TouchableOpacity>
        </View>

        {renderTemplateModal()}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#374151',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerRole: {
    fontSize: 14,
    color: '#6B7280',
  },
  headerActions: {
    width: 40,
    alignItems: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 18,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  currentUserMessage: {
    justifyContent: 'flex-end',
  },
  otherUserMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 16,
  },
  currentUserBubble: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageWithoutAvatar: {
    marginLeft: 40,
  },
  workoutShare: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  workoutShareTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressShare: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressShareTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  currentUserText: {
    color: '#FFFFFF',
  },
  otherUserText: {
    color: '#1F2937',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  currentUserTime: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right',
  },
  otherUserTime: {
    color: '#9CA3AF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  templatesButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  templatesButtonText: {
    fontSize: 18,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textInputWithTemplates: {
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  sendButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  templateContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  templateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  templateCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  templateCloseText: {
    fontSize: 16,
    color: '#6B7280',
  },
  templateContent: {
    flex: 1,
    padding: 20,
  },
  templateCategory: {
    marginBottom: 24,
  },
  templateCategoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  templateItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  templateItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  templateItemContent: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
});