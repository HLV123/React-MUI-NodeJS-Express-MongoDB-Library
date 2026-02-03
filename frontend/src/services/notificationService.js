import api from './api';

const notificationService = {
  /**
   * Get notifications
   */
  getNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response;
  },

  /**
   * Get unread count
   */
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response;
  },

  /**
   * Mark as read
   */
  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response;
  },

  /**
   * Mark all as read
   */
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response;
  },

  /**
   * Delete notification
   */
  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response;
  },
};

export default notificationService;
