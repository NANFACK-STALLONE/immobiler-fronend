import api from './api'

const interactionService = {
  async createOffer(propertyId, payload) {
    const res = await api.post(`/interactions/properties/${propertyId}/offer`, payload)
    return res.data
  },

  async requestVisit(propertyId, payload) {
    const res = await api.post(`/interactions/properties/${propertyId}/visit`, payload)
    return res.data
  },

  async getConversations() {
    const res = await api.get('/interactions/conversations')
    return res.data
  },

  async getMessages(conversationId) {
    const res = await api.get(`/interactions/conversations/${conversationId}/messages`)
    return res.data
  },

  async sendMessage(conversationId, content) {
    const res = await api.post(`/interactions/conversations/${conversationId}/messages`, { content })
    return res.data
  }
}

export default interactionService
