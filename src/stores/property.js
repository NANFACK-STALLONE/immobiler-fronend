/**
 * Store Pinia — Propriétés immobilières
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import propertyService from '@/services/propertyService'

export const usePropertyStore = defineStore('property', () => {

  // ── State ──────────────────────────────────────────────────────────────────
  const properties      = ref([])
  const myProperties    = ref([])
  const currentProperty = ref(null)
  const pagination      = ref({ totalElements: 0, totalPages: 0, number: 0, size: 9 })
  const loading         = ref(false)
  const error           = ref(null)

  // ── Actions ───────────────────────────────────────────────────────────────

  async function fetchPublic(page = 0, size = 9) {
    loading.value = true; error.value = null
    try {
      const data = await propertyService.getPublicProperties(page, size)
      properties.value = data.content
      pagination.value = {
        totalElements: data.totalElements,
        totalPages:    data.totalPages,
        number:        data.number,
        size:          data.size
      }
    } catch (err) { error.value = _extractError(err) }
    finally { loading.value = false }
  }

  async function search(filters) {
    loading.value = true; error.value = null
    try {
      const data = await propertyService.searchProperties(filters)
      properties.value = data.content
      pagination.value = {
        totalElements: data.totalElements,
        totalPages:    data.totalPages,
        number:        data.number,
        size:          data.size
      }
    } catch (err) { error.value = _extractError(err) }
    finally { loading.value = false }
  }

  async function fetchById(id) {
    loading.value = true; error.value = null
    try {
      currentProperty.value = await propertyService.getById(id)
    } catch (err) { error.value = _extractError(err) }
    finally { loading.value = false }
  }

  async function create(data) {
    loading.value = true; error.value = null
    try {
      const created = await propertyService.create(data)
      myProperties.value.unshift(created)
      return created
    } catch (err) {
      error.value = _extractError(err)
      throw err
    } finally { loading.value = false }
  }

  async function update(id, data) {
    loading.value = true; error.value = null
    try {
      const updated = await propertyService.update(id, data)
      const idx = myProperties.value.findIndex(p => p.id === id)
      if (idx !== -1) myProperties.value[idx] = updated
      return updated
    } catch (err) {
      error.value = _extractError(err)
      throw err
    } finally { loading.value = false }
  }

  async function remove(id) {
    loading.value = true; error.value = null
    try {
      await propertyService.delete(id)
      myProperties.value = myProperties.value.filter(p => p.id !== id)
    } catch (err) {
      error.value = _extractError(err)
      throw err
    } finally { loading.value = false }
  }

  async function fetchMyProperties() {
    loading.value = true; error.value = null
    try {
      myProperties.value = await propertyService.getMyProperties()
    } catch (err) { error.value = _extractError(err) }
    finally { loading.value = false }
  }

  async function updateStatus(id, status) {
    const updated = await propertyService.updateStatus(id, status)
    const idx = myProperties.value.findIndex(p => p.id === id)
    if (idx !== -1) myProperties.value[idx] = updated
    return updated
  }

  async function togglePublish(id, publish) {
    const updated = await propertyService.publish(id, publish)
    const idx = myProperties.value.findIndex(p => p.id === id)
    if (idx !== -1) myProperties.value[idx] = updated
    return updated
  }

  function _extractError(err) {
    return err.response?.data?.message
        || err.response?.data?.error
        || err.message
        || 'Une erreur est survenue'
  }

  return {
    properties, myProperties, currentProperty, pagination, loading, error,
    fetchPublic, search, fetchById, create, update, remove,
    fetchMyProperties, updateStatus, togglePublish
  }
})
