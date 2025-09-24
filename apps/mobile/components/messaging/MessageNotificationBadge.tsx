import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../lib/auth';
import { messagingService } from '../../lib/messaging';

interface MessageNotificationBadgeProps {
  userType: 'trainer' | 'trainee';
  style?: any;
}

export function MessageNotificationBadge({ userType, style }: MessageNotificationBadgeProps) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();

    // Set up interval to check for new messages
    const interval = setInterval(loadUnreadCount, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [user]);

  const loadUnreadCount = async () => {
    try {
      const count = await messagingService.getTotalUnreadCount(user?.uid || 'demo');
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  if (unreadCount === 0) {
    return null;
  }

  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.badgeText}>
        {unreadCount > 99 ? '99+' : unreadCount.toString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});