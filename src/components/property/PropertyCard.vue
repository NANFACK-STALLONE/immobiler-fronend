<template>
  <RouterLink :to="`/properties/${property.id}`" class="property-card">

    <!-- Image / Placeholder -->
    <div class="card-image">
      <div class="image-placeholder">
        <span>{{ typeIcon }}</span>
      </div>
      <div class="card-badges">
        <span :class="['badge', statusBadgeClass]">{{ statusLabel }}</span>
        <span v-if="!property.isPublished" class="badge badge-gray">Non publié</span>
      </div>
      <div class="card-type-badge">{{ typeLabel }}</div>
    </div>

    <!-- Contenu -->
    <div class="card-content">
      <h3 class="card-title">{{ property.title }}</h3>
      <p class="card-location">
        📍 {{ property.neighborhood }}, {{ property.city }}
      </p>

      <!-- Stats -->
      <div class="card-stats">
        <span title="Chambres">🛏 {{ property.bedrooms }}</span>
        <span title="Salles de bain">🚿 {{ property.bathrooms }}</span>
        <span title="Surface">📐 {{ property.area }} m²</span>
      </div>

      <!-- Prix -->
      <div class="card-footer-row">
        <span class="card-price">{{ formatPrice(property.price) }} FCFA</span>
        <span class="card-arrow">→</span>
      </div>
    </div>

    <!-- Actions rapides (si showActions) -->
    <div v-if="showActions" class="card-actions" @click.prevent>
      <button
        class="btn btn-sm btn-secondary"
        @click="$emit('edit', property)"
      >✏️ Modifier</button>
      <button
        :class="['btn btn-sm', property.isPublished ? 'btn-warning' : 'btn-success']"
        style="background: #f59e0b; color: white;"
        @click="$emit('toggle-publish', property)"
      >
        {{ property.isPublished ? '🔒 Dépublier' : '🌐 Publier' }}
      </button>
      <button
        class="btn btn-sm btn-danger"
        @click="$emit('delete', property)"
      >🗑️</button>
    </div>

  </RouterLink>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  property:    { type: Object,  required: true },
  showActions: { type: Boolean, default: false }
})

defineEmits(['edit', 'delete', 'toggle-publish'])

const TYPE_ICONS = {
  APARTMENT: '🏢', HOUSE: '🏡', LAND: '🌿',
  COMMERCIAL: '🏪', OFFICE: '🏢', VILLA: '🏖️'
}
const TYPE_LABELS = {
  APARTMENT: 'Appartement', HOUSE: 'Maison', LAND: 'Terrain',
  COMMERCIAL: 'Commercial',  OFFICE: 'Bureau', VILLA: 'Villa'
}
const STATUS_LABELS = {
  AVAILABLE: 'Disponible', RESERVED: 'Réservée',
  SOLD: 'Vendue', RENT: 'À louer'
}
const STATUS_BADGE = {
  AVAILABLE: 'badge-success', RESERVED: 'badge-warning',
  SOLD: 'badge-danger', RENT: 'badge-info'
}

const typeIcon       = computed(() => TYPE_ICONS[props.property.propertyType]  || '🏠')
const typeLabel      = computed(() => TYPE_LABELS[props.property.propertyType] || props.property.propertyType)
const statusLabel    = computed(() => STATUS_LABELS[props.property.status]     || props.property.status)
const statusBadgeClass = computed(() => STATUS_BADGE[props.property.status]   || 'badge-gray')

function formatPrice(price) {
  return new Intl.NumberFormat('fr-FR').format(price)
}
</script>

<style scoped>
.property-card {
  display: flex; flex-direction: column;
  background: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  border: 1.5px solid transparent;
}
.property-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary-light);
}
/* Image */
.card-image { position: relative; height: 200px; background: linear-gradient(135deg, #dbeafe, #eff6ff); }
.image-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-size: 4rem;
}
.card-badges { position: absolute; top: 0.75rem; left: 0.75rem; display: flex; gap: 0.375rem; }
.card-type-badge {
  position: absolute; bottom: 0.75rem; right: 0.75rem;
  background: rgba(0,0,0,0.5); color: #fff;
  padding: 0.2rem 0.6rem; border-radius: var(--radius-full);
  font-size: 0.72rem; font-weight: 500; backdrop-filter: blur(4px);
}
/* Content */
.card-content { padding: 1.25rem; flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.card-title { font-size: 1rem; font-weight: 600; color: var(--gray-800); line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.card-location { font-size: 0.8rem; color: var(--gray-500); }
.card-stats { display: flex; gap: 1rem; font-size: 0.825rem; color: var(--gray-600); margin-top: 0.25rem; }
.card-footer-row { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 0.75rem; border-top: 1px solid var(--gray-100); }
.card-price { font-size: 1rem; font-weight: 700; color: var(--primary); }
.card-arrow { color: var(--gray-300); font-size: 1.1rem; }
/* Actions */
.card-actions { padding: 0.75rem 1.25rem; border-top: 1px solid var(--gray-100); background: var(--gray-50); display: flex; gap: 0.5rem; flex-wrap: wrap; }
</style>
