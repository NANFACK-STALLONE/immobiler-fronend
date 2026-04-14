<template>
  <div>
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">Trouvez votre <span class="highlight">bien idéal</span></h1>
          <p class="hero-subtitle">Des milliers de propriétés disponibles — appartements, maisons, terrains, villas</p>

          <!-- Barre de recherche rapide -->
          <div class="hero-search">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher une ville, un quartier..."
              class="hero-input"
              @keyup.enter="goSearch"
            />
            <button class="btn btn-primary btn-lg" @click="goSearch">
              🔍 Rechercher
            </button>
          </div>

          <!-- Stats rapides -->
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-number">{{ pagination.totalElements || '...' }}</span>
              <span class="stat-label">Annonces</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">6</span>
              <span class="stat-label">Types de biens</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">24/7</span>
              <span class="stat-label">Disponible</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Types de biens -->
    <section class="categories-section">
      <div class="container">
        <h2 class="section-title">Explorer par type</h2>
        <div class="categories-grid">
          <button
            v-for="type in propertyTypes"
            :key="type.value"
            class="category-card"
            @click="searchByType(type.value)"
          >
            <span class="cat-icon">{{ type.icon }}</span>
            <span class="cat-name">{{ type.label }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Dernières annonces — visibles par tous -->
    <section class="listings-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Dernières annonces</h2>
          <RouterLink to="/search" class="btn btn-outline">Voir tout →</RouterLink>
        </div>

        <LoadingSpinner v-if="propertyStore.loading" message="Chargement des annonces..." />

        <div v-else-if="propertyStore.error" class="alert alert-error">
          ⚠️ {{ propertyStore.error }}
        </div>

        <div v-else-if="propertyStore.properties.length === 0" class="empty-state">
          <div class="icon">🏚️</div>
          <h3>Aucune annonce disponible</h3>
          <p>Soyez le premier à publier une annonce !</p>
          <RouterLink v-if="auth.isSeller" to="/properties/new" class="btn btn-primary mt-2">
            Publier maintenant
          </RouterLink>
        </div>

        <div v-else class="properties-grid">
          <PropertyCard
            v-for="property in propertyStore.properties.slice(0, 6)"
            :key="property.id"
            :property="property"
          />
        </div>

        <div v-if="propertyStore.properties.length > 0" class="text-center mt-4">
          <RouterLink to="/search" class="btn btn-outline btn-lg">
            Voir toutes les annonces ({{ pagination.totalElements }})
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section v-if="!auth.isAuthenticated" class="cta-section">
      <div class="container">
        <div class="cta-card">
          <h2>Vous avez un bien à vendre ou louer ?</h2>
          <p>Créez votre compte et publiez votre annonce en quelques minutes</p>
          <div class="cta-buttons">
            <RouterLink to="/register" class="btn btn-primary btn-lg">Créer un compte</RouterLink>
            <RouterLink to="/login"    class="btn btn-outline btn-lg">Se connecter</RouterLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePropertyStore } from '@/stores/property'
import { useAuthStore }     from '@/stores/auth'
import PropertyCard         from '@/components/property/PropertyCard.vue'
import LoadingSpinner       from '@/components/common/LoadingSpinner.vue'

const router        = useRouter()
const propertyStore = usePropertyStore()
const auth          = useAuthStore()
const searchQuery   = ref('')
const pagination    = computed(() => propertyStore.pagination)

const propertyTypes = [
  { value: 'APARTMENT', label: 'Appartements', icon: '🏢' },
  { value: 'HOUSE',     label: 'Maisons',       icon: '🏡' },
  { value: 'VILLA',     label: 'Villas',         icon: '🏖️' },
  { value: 'LAND',      label: 'Terrains',       icon: '🌿' },
  { value: 'OFFICE',    label: 'Bureaux',        icon: '💼' },
  { value: 'COMMERCIAL',label: 'Commercial',     icon: '🏪' },
]

onMounted(() => propertyStore.fetchPublic(0, 6))

function goSearch() {
  router.push({ name: 'Search', query: searchQuery.value ? { city: searchQuery.value } : {} })
}
function searchByType(type) {
  router.push({ name: 'Search', query: { propertyType: type } })
}
</script>

<style scoped>
/* Hero */
.hero {
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%);
  color: white; padding: 5rem 0 4rem;
}
.hero-content { max-width: 700px; margin: 0 auto; text-align: center; }
.hero-title { font-size: 3rem; font-weight: 800; line-height: 1.2; margin-bottom: 1rem; }
.highlight { color: #fbbf24; }
.hero-subtitle { font-size: 1.15rem; opacity: 0.9; margin-bottom: 2rem; }
.hero-search {
  display: flex; gap: 0.75rem;
  background: rgba(255,255,255,0.15); padding: 0.5rem;
  border-radius: var(--radius-lg); backdrop-filter: blur(8px);
  margin-bottom: 2.5rem;
}
.hero-input {
  flex: 1; background: white; border: none; border-radius: var(--radius-sm);
  padding: 0.875rem 1.25rem; font-size: 1rem; outline: none; color: var(--gray-800);
}
.hero-stats { display: flex; justify-content: center; gap: 3rem; }
.stat-item { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
.stat-number { font-size: 1.75rem; font-weight: 800; }
.stat-label  { font-size: 0.8rem; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.05em; }

/* Categories */
.categories-section { padding: 3.5rem 0; background: var(--white); }
.section-title { font-size: 1.6rem; font-weight: 700; color: var(--gray-800); margin-bottom: 1.5rem; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
.categories-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 1rem; }
.category-card {
  display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
  padding: 1.25rem; border-radius: var(--radius-lg);
  background: var(--gray-50); border: 1.5px solid var(--gray-100);
  cursor: pointer; transition: all 0.2s;
}
.category-card:hover { background: var(--primary-light); border-color: var(--primary); transform: translateY(-2px); }
.cat-icon { font-size: 1.75rem; }
.cat-name { font-size: 0.8rem; font-weight: 500; color: var(--gray-700); }

/* Listings */
.listings-section { padding: 3.5rem 0; background: var(--gray-50); }


/* CTA */
.cta-section { padding: 3.5rem 0; background: var(--white); }
.cta-card {
  background: linear-gradient(135deg, #1e3a8a, #2563eb);
  color: white; border-radius: var(--radius-xl);
  padding: 3rem; text-align: center;
}
.cta-card h2 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.75rem; }
.cta-card p  { opacity: 0.85; margin-bottom: 1.75rem; font-size: 1rem; }
.cta-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
.cta-buttons .btn-outline { border-color: rgba(255,255,255,0.5); color: white; }
.cta-buttons .btn-outline:hover { background: rgba(255,255,255,0.15); }

@media (max-width: 768px) {
  .hero-title { font-size: 2rem; }
  .hero-search { flex-direction: column; }
  .hero-stats { gap: 1.5rem; }
  .categories-grid { grid-template-columns: repeat(3, 1fr); }
}
</style>
