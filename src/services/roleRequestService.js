/**
 * Service — Demandes de changement de rôle
 *
 * Utilisateur :
 *  POST /api/role-requests                    ?requestedRole=&motivation=
 *  GET  /api/role-requests/mine
 *
 * Admin :
 *  GET  /api/role-requests
 *  GET  /api/role-requests/pending
 *  GET  /api/role-requests/count
 *  PUT  /api/role-requests/{id}/approve       ?adminComment=
 *  PUT  /api/role-requests/{id}/reject        ?adminComment=
 */
import api from './api'

const roleRequestService = {

  /** Soumettre une demande de rôle */
  async submit(requestedRole, motivation = '') {
    const res = await api.post('/role-requests', null, {
      params: { requestedRole, motivation }
    })
    return res.data
  },

  /** Mes demandes (utilisateur connecté) */
  async getMine() {
    const res = await api.get('/role-requests/mine')
    return res.data
  },

  /** Toutes les demandes (admin) */
  async getAll() {
    const res = await api.get('/role-requests')
    return res.data
  },

  /** Demandes en attente seulement (admin) */
  async getPending() {
    const res = await api.get('/role-requests/pending')
    return res.data
  },

  /** Nombre de demandes en attente (badge admin) */
  async countPending() {
    const res = await api.get('/role-requests/count')
    return res.data.pending
  },

  /** Approuver une demande (admin) */
  async approve(id, adminComment = '') {
    const res = await api.put(`/role-requests/${id}/approve`, null, {
      params: { adminComment }
    })
    return res.data
  },

  /** Rejeter une demande (admin) */
  async reject(id, adminComment = '') {
    const res = await api.put(`/role-requests/${id}/reject`, null, {
      params: { adminComment }
    })
    return res.data
  }
}

export default roleRequestService
