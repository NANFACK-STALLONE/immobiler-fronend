import api from './api'

const notificationService = {
  async getAll() {
    const res = await api.get('/notifications')
    return res.data
  },

  async getUnreadCount() {
    const res = await api.get('/notifications/unread-count')
    return res.data.count
  },

  async markRead(id) {
    const res = await api.put(`/notifications/${id}/read`)
    return res.data
  }
}

export default notificationService
