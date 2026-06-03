/**
 * Service utilisateurs — consomme UserResource (JAX-RS)
 *
 * Endpoints :
 *  GET  /api/users                      → liste tous (ADMIN)
 *  GET  /api/users/{id}                 → détail
 *  GET  /api/users/profile              → profil connecté
 *  PUT  /api/users/{id}                 → modifier (ADMIN)
 *  PUT  /api/users/{id}/role?role=      → changer rôle (ADMIN)
 *  PUT  /api/users/{id}/enable          → activer (ADMIN)
 *  PUT  /api/users/{id}/disable         → désactiver (ADMIN)
 *  DELETE /api/users/{id}               → supprimer (ADMIN)
 */
import api from './api'

const userService = {

  /** Liste tous les utilisateurs (ADMIN) */
  async getAll() {
    const res = await api.get('/users')
    return res.data
  },

  /** Profil de l'utilisateur connecté */
  async getProfile() {
    const res = await api.get('/users/profile')
    return res.data
  },

  /** Détail d'un utilisateur par ID */
  async getById(id) {
    const res = await api.get(`/users/${id}`)
    return res.data
  },

  /** Modifier un utilisateur (ADMIN) */
  async update(id, data) {
    const res = await api.put(`/users/${id}`, data)
    return res.data
  },

  /** Changer le rôle (ADMIN) — role : ROLE_USER | ROLE_BUYER | ROLE_SELLER | ROLE_AGENT | ROLE_ADMIN */
  async changeRole(id, role) {
    const res = await api.put(`/users/${id}/role`, null, { params: { role } })
    return res.data
  },

  /** Activer un compte (ADMIN) */
  async enable(id) {
    const res = await api.put(`/users/${id}/enable`)
    return res.data
  },

  /** Désactiver un compte (ADMIN) */
  async disable(id) {
    const res = await api.put(`/users/${id}/disable`)
    return res.data
  },

  /** Supprimer un utilisateur (ADMIN) */
  async delete(id) {
    const res = await api.delete(`/users/${id}`)
    return res.data
  },

  /** Passer directement au rôle Acheteur (ROLE_USER → ROLE_BUYER, sans approbation admin) */
  async becomeBuyer() {
    const res = await api.put('/users/me/become-buyer')
    return res.data
  },

  /** Changer le mot de passe du compte connecte */
  async changePassword(oldPassword, newPassword) {
    const res = await api.post('/users/change-password', { oldPassword, newPassword })
    return res.data
  }
}

export default userService
