<template>
  <div class="page">
    <div class="container">
      <h1 class="page-title">Rechercher un bien</h1>

      <!-- Filtres -->
      <div class="filters-card card mb-4">
        <div class="card-body">
          <div class="filters-grid">
            <div class="form-group">
              <label class="form-label">Ville</label>
              <input v-model="filters.city" type="text" class="form-control" placeholder="Paris, Lyon..." />
            </div>
            <div class="form-group">
              <label class="form-label">Type de bien</label>
              <select v-model="filters.propertyType" class="form-control">
                <option value="">Tous les types</option>
                <option value="APARTMENT">Appartement</option>
                <option value="HOUSE">Maison</option>
                <option value="VILLA">Villa</option>
                <option value="LAND">Terrain</option>
                <option value="OFFICE">Bureau</option>
                <option value="COMMERCIAL">Commercial</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Prix min (FCFA)</label>
              <input v-model.number="filters.minPrice" type="number" class="form-control" placeholder="0" />
            </div>
            <div class="form-group">
              <label class="form-label">Prix max (FCFA)</label>
              <input v-model.number="filters.maxPrice" type="number" class="form-control" placeholder="Sans limite" />
            </div>
            <div class="form-group">
              <label class="form-label">Chambres min</label>
              <select v-model.number="filters.bedrooms" class="form-control">
                <option value="">Peu importe</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>
            <div class="form-group filters-actions">
              <button class="btn btn-primary btn-block" @click="doSearch(0)">
                🔍 Rechercher
              </button>
              <button v-if="!filters.propertyType" class="btn btn-secondary btn-block" @click="resetFilters">
                ✕ Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Résultats -->
      <div class="results-header" v-if="!propertyStore.loading">
        <p class="results-count">
          <strong>{{ propertyStore.pagination.totalElements }}</strong> bien(s) trouvé(s)
          <span v-if="filters.city">dans <strong>{{ filters.city }}</strong></span>
          <span v-if="filters.propertyType" class="type-badge">
            {{ TYPE_LABELS[filters.propertyType] }}
          </span>
        </p>
        <select v-model="pageSize" class="form-control" style="width: auto;" @change="doSearch(0)">
          <option value="6">6 par page</option>
          <option value="9">9 par page</option>
          <option value="12">12 par page</option>
          <option value="24">24 par page</option>
        </select>
      </div>

      <LoadingSpinner v-if="propertyStore.loading" message="Recherche en cours..." />

      <div v-else-if="propertyStore.error" class="alert alert-error">
        ⚠️ {{ propertyStore.error }}
      </div>

      <div v-else-if="propertyStore.properties.length === 0" class="empty-state">
        <div class="icon">🔍</div>
        <h3>Aucun résultat</h3>
        <p>Essayez d'élargir vos critères de recherche</p>
       
      </div>

      <div v-else class="properties-grid">
        <PropertyCard
          v-for="property in propertyStore.properties"
          :key="property.id"
          :property="property"
        />
      </div>

      <Pagination
        :current-page="propertyStore.pagination.number"
        :total-pages="propertyStore.pagination.totalPages"
        @change="doSearch"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePropertyStore } from '@/stores/property'
import PropertyCard   from '@/components/property/PropertyCard.vue'
import Pagination     from '@/components/common/Pagination.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const route         = useRoute()
const propertyStore = usePropertyStore()
const pageSize      = ref(9)

const filters = reactive({
  city: '', propertyType: '',
  minPrice: '', maxPrice: '', bedrooms: ''
})

const TYPE_LABELS = {
  APARTMENT: 'Appartements',
  HOUSE:     'Maisons',
  VILLA:     'Villas',
  LAND:      'Terrains',
  OFFICE:    'Bureaux',
  COMMERCIAL:'Commercial',
}

onMounted(() => {
  // Initialiser les filtres depuis la query string
  if (route.query.city)         filters.city         = route.query.city
  if (route.query.propertyType) filters.propertyType = route.query.propertyType
  doSearch(0)
})

async function doSearch(page = 0) {
  const params = { page, size: pageSize.value }
  if (filters.city)         params.city         = filters.city
  if (filters.minPrice)     params.minPrice     = filters.minPrice
  if (filters.maxPrice)     params.maxPrice     = filters.maxPrice
  if (filters.bedrooms)     params.bedrooms     = filters.bedrooms
  if (filters.propertyType) params.propertyType = filters.propertyType
  await propertyStore.search(params)
}

function resetFilters() {
  Object.assign(filters, { city: '', propertyType: '', minPrice: '', maxPrice: '', bedrooms: '' })
  doSearch(0)
}
</script>

<style scoped>
.page-title { font-size: 1.75rem; font-weight: 700; color: var(--gray-800); margin-bottom: 1.5rem; }
.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  align-items: end;
}
.filters-actions { display: flex; flex-direction: column; gap: 0.5rem; }
.results-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.5rem; }
.results-count { font-size: 0.9rem; color: var(--gray-600); display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.type-badge {
  display: inline-flex; align-items: center; gap: 0.375rem;
  background: var(--primary); color: white;
  padding: 0.2rem 0.625rem; border-radius: var(--radius-full);
  font-size: 0.8rem; font-weight: 600;
}
</style>
