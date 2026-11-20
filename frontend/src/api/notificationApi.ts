import apiClient from './client';

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAtUtc: string;
}

export interface UnreadNotificationCount {
  count: number;
}

// Get current user's notifications
export const getNotifications = async (): Promise<Notification[]> => {
  const response = await apiClient.get<Notification[]>(
    '/api/Notifications'
  );

  return response.data;
};

// Get current user's unread notification count
export const getUnreadNotificationCount = async (): Promise<number> => {
  const response = await apiClient.get<UnreadNotificationCount>(
    '/api/Notifications/unread-count'
  );

  return response.data.count;
};

// Mark one notification as read
export const markNotificationAsRead = async (
  notificationId: number
): Promise<void> => {
  await apiClient.put(
    `/api/Notifications/${notificationId}/read`
  );
};

// Mark all current user's notifications as read
export const markAllNotificationsAsRead = async (): Promise<void> => {
  await apiClient.put(
    '/api/Notifications/read-all'
  );
};