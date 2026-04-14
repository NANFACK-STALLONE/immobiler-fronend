/**
 * Store Pinia — Gestion des utilisateurs (Admin)
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import userService from '@/services/userService'

export const useUsersStore = defineStore('users', () => {

  // ── State ──────────────────────────────────────────────────────────────────
  const users   = ref([])
  const loading = ref(false)
  const error   = ref(null)

  // ── Getters ───────────────────────────────────────────────────────────────
  const totalUsers    = computed(() => users.value.length)
  const activeUsers   = computed(() => users.value.filter(u => u.isActive).length)
  const inactiveUsers = computed(() => users.value.filter(u => !u.isActive).length)
  const byRole        = computed(() => {
    const counts = {}
    users.value.forEach(u => {
      counts[u.role] = (counts[u.role] || 0) + 1
    })
    return counts
  })

  // ── Actions ───────────────────────────────────────────────────────────────

  async function fetchAll() {
    loading.value = true
    error.value   = null
    try {
      users.value = await userService.getAll()
    } catch (err) {
      error.value = _extractError(err)
    } finally {
      loading.value = false
    }
  }

  async function changeRole(id, role) {
    loading.value = true
    error.value   = null
    try {
      const res = await userService.changeRole(id, role)
      _updateLocal(id, res.user)
      return res
    } catch (err) {
      error.value = _extractError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function toggleStatus(id, isActive) {
    loading.value = true
    error.value   = null
    try {
      const updated = isActive
        ? await userService.enable(id)
        : await userService.disable(id)
      _updateLocal(id, updated)
      return updated
    } catch (err) {
      error.value = _extractError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function remove(id) {
    loading.value = true
    error.value   = null
    try {
      await userService.delete(id)
      users.value = users.value.filter(u => u.id !== id)
    } catch (err) {
      error.value = _extractError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function _updateLocal(id, updated) {
    const idx = users.value.findIndex(u => u.id === id)
    if (idx !== -1) users.value[idx] = { ...users.value[idx], ...updated }
  }

  function _extractError(err) {
    return err.response?.data?.message
        || err.response?.data?.error
        || err.message
        || 'Une erreur est survenue'
  }

  return {
    users, loading, error,
    totalUsers, activeUsers, inactiveUsers, byRole,
    fetchAll, changeRole, toggleStatus, remove
  }
})
