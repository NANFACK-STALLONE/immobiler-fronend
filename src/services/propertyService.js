/**
 * Service de gestion des propriétés — consomme PropertyResource (JAX-RS)
 *
 * Endpoints disponibles :
 *  GET    /api/properties/public            ?page=&size=
 *  GET    /api/properties/search            ?city=&minPrice=&maxPrice=&bedrooms=&page=&size=
 *  GET    /api/properties/{id}
 *  POST   /api/properties                   body JSON (PropertyDTO) — auth requise
 *  PUT    /api/properties/{id}              body JSON — auth requise
 *  DELETE /api/properties/{id}             — auth requise
 *  GET    /api/properties/owner/list       — auth requise
 *  PUT    /api/properties/{id}/status      ?status=
 *  PUT    /api/properties/{id}/publish     ?publish=
 *  PUT    /api/properties/{id}/assign-agent ?agentId=
 */
import api from './api'

const propertyService = {

  /** Liste publique paginée */
  async getPublicProperties(page = 0, size = 9) {
    const res = await api.get('/properties/public', { params: { page, size } })
    return res.data  // PageResponse<PropertyDTO>
  },

  /** Recherche avec filtres */
  async searchProperties({ city, minPrice, maxPrice, bedrooms, propertyType, page = 0, size = 9 } = {}) {
    const params = { page, size }
    if (city)         params.city         = city
    if (minPrice)     params.minPrice     = minPrice
    if (maxPrice)     params.maxPrice     = maxPrice
    if (bedrooms)     params.bedrooms     = bedrooms
    if (propertyType) params.propertyType = propertyType
    const res = await api.get('/properties/search', { params })
    return res.data
  },

  /** Détail d'une propriété */
  async getById(id) {
    const res = await api.get(`/properties/${id}`)
    return res.data
  },

  /** Créer une propriété (auth requise) */
  async create(propertyData) {
    const res = await api.post('/properties', propertyData)
    return res.data
  },

  /** Modifier une propriété (auth requise) */
  async update(id, propertyData) {
    const res = await api.put(`/properties/${id}`, propertyData)
    return res.data
  },

  /** Supprimer une propriété (auth requise) */
  async delete(id) {
    const res = await api.delete(`/properties/${id}`)
    return res.data
  },

  /** Mes propriétés (auth requise) */
  async getMyProperties() {
    const res = await api.get('/properties/owner/list')
    return res.data
  },

  /** Changer le statut (auth requise) */
  async updateStatus(id, status) {
    const res = await api.put(`/properties/${id}/status`, null, { params: { status } })
    return res.data
  },

  /** Publier / Dépublier (auth requise) */
  async publish(id, publish) {
    const res = await api.put(`/properties/${id}/publish`, null, { params: { publish } })
    return res.data
  },

  /** Assigner un agent (auth requise) */
  async assignAgent(id, agentId) {
    const res = await api.put(`/properties/${id}/assign-agent`, null, { params: { agentId } })
    return res.data
  }
}

export default propertyService
