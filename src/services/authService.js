/**
 * Service d'authentification — consomme AuthResource (JAX-RS)
 *
 * Endpoints disponibles :
 *  POST /api/auth/login              body JSON  { email, password }
 *  POST /api/auth/register           body JSON { username, email, password, fullName }
 *  POST /api/auth/refresh            body JSON { refreshToken }
 *  GET  /api/auth/validate           Header Authorization: Bearer <token>
 *  GET  /api/auth/health
 */
import api from './api'

const authService = {

  /**
   * Connexion — body JSON
   */
  async login(email, password) {
    const res = await api.post('/auth/login', { email, password })
    return res.data  // { accessToken, refreshToken, tokenType, expiresIn }
  },

  /**
   * Inscription — body JSON
   */
  async register(username, email, password, fullName) {
    const res = await api.post('/auth/register', { username, email, password, fullName })
    return res.data  // { message, userId, username, email }
  },

  /**
   * Rafraîchir le token
   */
  async refreshToken(refreshToken) {
    const res = await api.post('/auth/refresh', { refreshToken })
    return res.data
  },

  /**
   * Valider le token courant
   */
  async validateToken() {
    const res = await api.get('/auth/validate')
    return res.data  // { valid, message }
  },

  /**
   * Vérifier que le backend est en ligne
   */
  async health() {
    const res = await api.get('/auth/health')
    return res.data  // { status, message, timestamp }
  }
}

export default authService
