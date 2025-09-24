import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../../lib/auth';
import { messagingService, Conversation } from '../../lib/messaging';
import { ChatScreen } from './ChatScreen';

interface ConversationsListProps {
  visible: boolean;
  onClose: () => void;
  userType: 'trainer' | 'trainee';
}

export function ConversationsList({
  visible,
  onClose,
  userType,
}: ConversationsListProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadConversations();
    }
  }, [visible]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const userConversations = await messagingService.getUserConversations(
        user?.uid || 'demo',
        userType
      );
      setConversations(userConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      Alert.alert('Error', 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleConversationPress = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowChat(true);
  };

  const handleChatClose = () => {
    setShowChat(false);
    setSelectedConversation(null);
    loadConversations(); // Refresh to update unread counts
  };

  const startNewConversation = async () => {
    try {
      // For demo purposes, create a conversation with a mock user
      const mockOtherUser = userType === 'trainer'
        ? { id: 'trainee_demo', name: 'Demo Trainee', type: 'trainee' as const }
        : { id: 'trainer_demo', name: 'Demo Trainer', type: 'trainer' as const };

      const conversationId = await messagingService.createConversation(
        userType === 'trainer' ? user?.uid || 'demo' : mockOtherUser.id,
        userType === 'trainer' ? 'Trainer' : mockOtherUser.name,
        userType === 'trainee' ? user?.uid || 'demo' : mockOtherUser.id,
        userType === 'trainee' ? 'Trainee' : mockOtherUser.name
      );

      const newConversation: Conversation = {
        id: conversationId,
        trainerId: userType === 'trainer' ? user?.uid || 'demo' : mockOtherUser.id,
        trainerName: userType === 'trainer' ? 'Trainer' : mockOtherUser.name,
        traineeId: userType === 'trainee' ? user?.uid || 'demo' : mockOtherUser.id,
        traineeName: userType === 'trainee' ? 'Trainee' : mockOtherUser.name,
        lastMessage: null,
        unreadCount: 0,
        lastActivity: new Date().toISOString(),
        isActive: true
      };

      setSelectedConversation(newConversation);
      setShowChat(true);
    } catch (error) {
      console.error('Error creating conversation:', error);
      Alert.alert('Error', 'Failed to start new conversation');
    }
  };

  const formatLastActivity = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const renderConversation = (conversation: Conversation) => {
    const otherUserName = userType === 'trainer' ? conversation.traineeName : conversation.trainerName;
    const otherUserType = userType === 'trainer' ? 'trainee' : 'trainer';

    return (
      <TouchableOpacity
        key={conversation.id}
        style={styles.conversationItem}
        onPress={() => handleConversationPress(conversation)}
      >
        <View style={styles.conversationAvatar}>
          <Text style={styles.conversationAvatarText}>
            {otherUserName.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.conversationName}>{otherUserName}</Text>
            <Text style={styles.conversationTime}>
              {conversation.lastMessage
                ? formatLastActivity(conversation.lastMessage.timestamp)
                : formatLastActivity(conversation.lastActivity)
              }
            </Text>
          </View>

          <View style={styles.conversationDetails}>
            <Text style={styles.conversationRole}>
              {otherUserType === 'trainer' ? 'Personal Trainer' : 'Trainee'}
            </Text>
            {conversation.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{conversation.unreadCount}</Text>
              </View>
            )}
          </View>

          {conversation.lastMessage && (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {conversation.lastMessage.type === 'workout' ? '🏋️ Shared workout' :
               conversation.lastMessage.type === 'progress_share' ? '📊 Shared progress' :
               conversation.lastMessage.content}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Messages</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading conversations...</Text>
              </View>
            ) : conversations.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>💬</Text>
                <Text style={styles.emptyTitle}>No conversations yet</Text>
                <Text style={styles.emptyDescription}>
                  {userType === 'trainer'
                    ? 'Start messaging your trainees to provide guidance and motivation'
                    : 'Connect with your trainer for personalized advice and support'
                  }
                </Text>
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={startNewConversation}
                >
                  <Text style={styles.startButtonText}>Start New Chat</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.conversationsList}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    Your {userType === 'trainer' ? 'Trainees' : 'Trainer'}
                  </Text>
                  <TouchableOpacity
                    style={styles.newChatButton}
                    onPress={startNewConversation}
                  >
                    <Text style={styles.newChatButtonText}>+</Text>
                  </TouchableOpacity>
                </View>

                {conversations.map(renderConversation)}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {selectedConversation && (
        <ChatScreen
          visible={showChat}
          onClose={handleChatClose}
          conversationId={selectedConversation.id}
          otherUserId={userType === 'trainer' ? selectedConversation.traineeId : selectedConversation.trainerId}
          otherUserName={userType === 'trainer' ? selectedConversation.traineeName : selectedConversation.trainerName}
          otherUserType={userType === 'trainer' ? 'trainee' : 'trainer'}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  conversationsList: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  newChatButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newChatButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  conversationItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  conversationAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  conversationAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  conversationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  conversationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationRole: {
    fontSize: 14,
    color: '#6B7280',
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
});