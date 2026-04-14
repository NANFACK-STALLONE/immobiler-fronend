/**
 * Store Pinia — Authentification
 * Gère : token JWT, utilisateur courant, état connecté/déconnecté
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {

  // ── State ──────────────────────────────────────────────────────────────────
  const accessToken  = ref(localStorage.getItem('accessToken')  || null)
  const refreshToken = ref(localStorage.getItem('refreshToken') || null)
  const user         = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const loading      = ref(false)
  const error        = ref(null)

  // ── Getters (computed) ────────────────────────────────────────────────────
  const isAuthenticated = computed(() => !!accessToken.value)
  const currentUser     = computed(() => user.value)
  const userRole        = computed(() => user.value?.role || null)
  // Les rôles dans le JWT / réponse login ont le préfixe ROLE_ (ex: "ROLE_ADMIN")
  const isSeller        = computed(() => ['ROLE_SELLER', 'ROLE_AGENT', 'ROLE_ADMIN'].includes(userRole.value))
  const isAdmin         = computed(() => userRole.value === 'ROLE_ADMIN')

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Connexion */
  async function login(email, password) {
    loading.value = true
    error.value   = null
    try {
      const data = await authService.login(email, password)
      _setTokens(data.accessToken, data.refreshToken)
      // Utiliser l'objet user de la réponse (contient l'ID MongoDB réel + rôle avec préfixe)
      if (data.user) {
        _setUserFromResponse(data.user)
      } else {
        _decodeAndSetUser(data.accessToken)
      }
      return data
    } catch (err) {
      error.value = _extractError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /** Inscription */
  async function register(username, email, password, fullName) {
    loading.value = true
    error.value   = null
    try {
      const data = await authService.register(username, email, password, fullName)
      return data
    } catch (err) {
      error.value = _extractError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /** Déconnexion */
  function logout() {
    accessToken.value  = null
    refreshToken.value = null
    user.value         = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }

  // ── Helpers privés ────────────────────────────────────────────────────────

  function _setTokens(access, refresh) {
    accessToken.value  = access
    refreshToken.value = refresh
    localStorage.setItem('accessToken',  access)
    if (refresh) localStorage.setItem('refreshToken', refresh)
  }

  /** Mettre à jour le rôle localement (après approbation demande / become-buyer) */
  function updateUserRole(newRole) {
    if (user.value) {
      user.value = { ...user.value, role: newRole }
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  /** Hydrate le user depuis la réponse login (id MongoDB réel + rôle exact) */
  function _setUserFromResponse(userDTO) {
    const userData = {
      id:       userDTO.id,
      email:    userDTO.email,
      username: userDTO.username,
      fullName: userDTO.fullName,
      role:     userDTO.role,
    }
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
  }

  function _decodeAndSetUser(token) {
    try {
      // Décoder le payload Base64 du JWT (2e partie)
      const payload = JSON.parse(atob(token.split('.')[1]))
      const userData = {
        id:       payload.sub || payload.userId || payload.id,
        email:    payload.email || payload.sub,
        username: payload.username || payload.name || payload.sub,
        role:     payload.role || (payload.roles && payload.roles[0]) || 'USER',
        roles:    payload.roles || []
      }
      user.value = userData
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (e) {
      console.warn('Impossible de décoder le JWT', e)
    }
  }

  function _extractError(err) {
    return err.response?.data?.message
        || err.response?.data?.error
        || err.message
        || 'Une erreur est survenue'
  }

  return {
    // state
    accessToken, refreshToken, user, loading, error,
    // getters
    isAuthenticated, currentUser, userRole, isSeller, isAdmin,
    // actions
    login, register, logout, updateUserRole
  }
})
