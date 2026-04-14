import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import roleRequestService from '@/services/roleRequestService'

export const useRoleRequestStore = defineStore('roleRequests', () => {

  // ── State ──────────────────────────────────────────────────────────────────
  const myRequests  = ref([])   // demandes de l'utilisateur connecté
  const allRequests = ref([])   // toutes les demandes (admin)
  const pendingCount = ref(0)   // badge admin
  const loading  = ref(false)
  const error    = ref(null)

  // ── Getters ───────────────────────────────────────────────────────────────
  const hasPending      = computed(() => myRequests.value.some(r => r.status === 'PENDING'))
  const latestRequest   = computed(() => myRequests.value[0] || null)
  const pendingRequests = computed(() => allRequests.value.filter(r => r.status === 'PENDING'))

  // ── Actions utilisateur ────────────────────────────────────────────────────

  async function submit(requestedRole, motivation) {
    loading.value = true; error.value = null
    try {
      const res = await roleRequestService.submit(requestedRole, motivation)
      myRequests.value.unshift(res.request)
      pendingCount.value++
      return res
    } catch (err) {
      error.value = _extractError(err); throw err
    } finally { loading.value = false }
  }

  async function fetchMine() {
    loading.value = true; error.value = null
    try {
      myRequests.value = await roleRequestService.getMine()
    } catch (err) { error.value = _extractError(err) }
    finally { loading.value = false }
  }

  // ── Actions admin ─────────────────────────────────────────────────────────

  async function fetchAll() {
    loading.value = true; error.value = null
    try {
      allRequests.value = await roleRequestService.getAll()
    } catch (err) { error.value = _extractError(err) }
    finally { loading.value = false }
  }

  async function fetchPendingCount() {
    try {
      pendingCount.value = await roleRequestService.countPending()
    } catch { /* silencieux */ }
  }

  async function approve(id, adminComment) {
    loading.value = true; error.value = null
    try {
      const res = await roleRequestService.approve(id, adminComment)
      _updateLocal(id, res.request)
      pendingCount.value = Math.max(0, pendingCount.value - 1)
      return res
    } catch (err) { error.value = _extractError(err); throw err }
    finally { loading.value = false }
  }

  async function reject(id, adminComment) {
    loading.value = true; error.value = null
    try {
      const res = await roleRequestService.reject(id, adminComment)
      _updateLocal(id, res.request)
      pendingCount.value = Math.max(0, pendingCount.value - 1)
      return res
    } catch (err) { error.value = _extractError(err); throw err }
    finally { loading.value = false }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function _updateLocal(id, updated) {
    const idx = allRequests.value.findIndex(r => r.id === id)
    if (idx !== -1) allRequests.value[idx] = updated
  }

  function _extractError(err) {
    return err.response?.data?.message || err.response?.data?.error || err.message || 'Erreur'
  }

  return {
    myRequests, allRequests, pendingCount, loading, error,
    hasPending, latestRequest, pendingRequests,
    submit, fetchMine, fetchAll, fetchPendingCount, approve, reject
  }
})
