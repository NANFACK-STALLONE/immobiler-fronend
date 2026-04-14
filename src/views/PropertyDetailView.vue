<template>
  <div class="page">
    <div class="container-sm">
      <LoadingSpinner v-if="propertyStore.loading" message="Chargement de l'annonce..." />

      <div v-else-if="propertyStore.error" class="alert alert-error">
        ⚠️ {{ propertyStore.error }}
        <RouterLink to="/search" class="btn btn-secondary btn-sm ml-2">Retour aux annonces</RouterLink>
      </div>

      <template v-else-if="property">
        <!-- Breadcrumb -->
        <nav class="breadcrumb">
          <RouterLink to="/">Accueil</RouterLink>
          <span>›</span>
          <RouterLink to="/search">Annonces</RouterLink>
          <span>›</span>
          <span>{{ property.title }}</span>
        </nav>

        <!-- Image + Titre -->
        <div class="detail-hero card">
          <div class="detail-image">
            <span class="detail-type-icon">{{ typeIcon }}</span>
          </div>
          <div class="detail-header">
            <div class="flex-between flex-wrap gap-1">
              <h1 class="detail-title">{{ property.title }}</h1>
              <div class="detail-badges">
                <span :class="['badge', statusBadgeClass]">{{ statusLabel }}</span>
                <span class="badge badge-gray">{{ typeLabel }}</span>
              </div>
            </div>
            <p class="detail-location">📍 {{ property.neighborhood }}, {{ property.city }}</p>
            <p class="detail-address" v-if="property.address">🏠 {{ property.address }}</p>
            <div class="detail-price">{{ formatPrice(property.price) }} <span class="price-currency">FCFA</span></div>
          </div>
        </div>

        <!-- Stats + Description -->
        <div class="detail-grid">
          <!-- Stats principales -->
          <div class="card">
            <div class="card-header">Caractéristiques</div>
            <div class="card-body">
              <div class="stats-grid">
                <div class="stat-box">
                  <span class="stat-icon">🛏</span>
                  <span class="stat-val">{{ property.bedrooms }}</span>
                  <span class="stat-lbl">Chambre(s)</span>
                </div>
                <div class="stat-box">
                  <span class="stat-icon">🚿</span>
                  <span class="stat-val">{{ property.bathrooms }}</span>
                  <span class="stat-lbl">Salle(s) de bain</span>
                </div>
                <div class="stat-box">
                  <span class="stat-icon">📐</span>
                  <span class="stat-val">{{ property.area }}</span>
                  <span class="stat-lbl">m²</span>
                </div>
              </div>

              <!-- Features -->
              <div v-if="property.features?.length" class="features-list">
                <h4>Équipements</h4>
                <div class="features-tags">
                  <span v-for="f in property.features" :key="f" class="feature-tag">✓ {{ f }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="card">
            <div class="card-header">Description</div>
            <div class="card-body">
              <p class="description-text">{{ property.description }}</p>
            </div>
          </div>
        </div>

        <!-- Section Transaction -->
        <div class="transaction-card card">
          <div class="card-header">Intéressé par ce bien ?</div>
          <div class="card-body">

            <!-- Utilisateur connecté : afficher les coordonnées + actions -->
            <template v-if="auth.isAuthenticated">
              <div class="contacts-grid mb-3">
                <div class="contact-item">
                  <span class="contact-icon">👤</span>
                  <div>
                    <div class="contact-role">Propriétaire</div>
                    <div class="contact-name">{{ property.ownerName || 'Non renseigné' }}</div>
                  </div>
                </div>
                <div v-if="property.agentName" class="contact-item">
                  <span class="contact-icon">🏢</span>
                  <div>
                    <div class="contact-role">Agent immobilier</div>
                    <div class="contact-name">{{ property.agentName }}</div>
                  </div>
                </div>
              </div>

              <div class="transaction-actions">
                <button class="btn btn-primary btn-lg" @click="handleContact">
                  📞 Contacter le vendeur
                </button>
                <button
                  v-if="property.status === 'AVAILABLE'"
                  class="btn btn-success btn-lg"
                  @click="handleOffer"
                >
                  🤝 Faire une offre
                </button>
                <button
                  v-if="property.status === 'AVAILABLE'"
                  class="btn btn-outline btn-lg"
                  @click="handleSchedule"
                >
                  📅 Planifier une visite
                </button>
              </div>

              <!-- Feedback après action -->
              <div v-if="actionFeedback" class="action-feedback">
                ✅ {{ actionFeedback }}
              </div>
            </template>

            <!-- Non connecté : teaser + bouton de connexion -->
            <template v-else>
              <div class="transaction-teaser">
                <div class="teaser-items">
                  <div class="teaser-item">📞 <span>Coordonnées du vendeur</span></div>
                  <div class="teaser-item">🤝 <span>Faire une offre</span></div>
                  <div class="teaser-item">📅 <span>Planifier une visite</span></div>
                </div>
                <p class="teaser-note">Connectez-vous pour accéder à ces fonctionnalités</p>
                <div class="teaser-actions">
                  <button class="btn btn-primary btn-lg" @click="showLoginPrompt = true">
                    🔐 Se connecter pour contacter
                  </button>
                  <RouterLink to="/register" class="btn btn-outline">
                    Créer un compte
                  </RouterLink>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Actions pour le propriétaire -->
        <div v-if="auth.isAuthenticated && isOwner" class="owner-actions card">
          <div class="card-body flex gap-2 flex-wrap">
            <RouterLink :to="`/properties/${property.id}/edit`" class="btn btn-primary">
              ✏️ Modifier l'annonce
            </RouterLink>
            <button
              class="btn btn-secondary"
              @click="togglePublish"
            >
              {{ property.isPublished ? '🔒 Dépublier' : '🌐 Publier' }}
            </button>
            <button class="btn btn-danger" @click="confirmDelete">
              🗑️ Supprimer
            </button>
          </div>
        </div>

        <!-- Métadonnées -->
        <p class="detail-meta">
          Publié le {{ formatDate(property.createdAt) }}
          <span v-if="property.updatedAt"> · Mis à jour le {{ formatDate(property.updatedAt) }}</span>
        </p>
      </template>
    </div>

    <!-- Modal connexion requis -->
    <LoginPromptModal
      v-if="showLoginPrompt"
      :title="loginPromptTitle"
      :message="loginPromptMessage"
      @close="showLoginPrompt = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePropertyStore } from '@/stores/property'
import { useAuthStore }     from '@/stores/auth'
import LoadingSpinner    from '@/components/common/LoadingSpinner.vue'
import LoginPromptModal  from '@/components/common/LoginPromptModal.vue'

const route         = useRoute()
const router        = useRouter()
const propertyStore = usePropertyStore()
const auth          = useAuthStore()

const property = computed(() => propertyStore.currentProperty)

const isOwner = computed(() =>
  auth.currentUser && property.value?.ownerId === auth.currentUser.id
)

// ── Transaction state ──────────────────────────────────────────────────────
const showLoginPrompt   = ref(false)
const loginPromptTitle  = ref('Connectez-vous pour continuer')
const loginPromptMessage = ref('')
const actionFeedback    = ref('')

function requireLogin(title, message) {
  if (!auth.isAuthenticated) {
    loginPromptTitle.value   = title
    loginPromptMessage.value = message
    showLoginPrompt.value    = true
    return false
  }
  return true
}

function handleContact() {
  if (!requireLogin(
    '📞 Contacter le vendeur',
    'Connectez-vous pour accéder aux coordonnées du vendeur et le contacter directement.'
  )) return
  actionFeedback.value = `Demande envoyée à ${property.value.ownerName || 'le vendeur'}. Il vous contactera sous peu.`
  setTimeout(() => { actionFeedback.value = '' }, 5000)
}

function handleOffer() {
  if (!requireLogin(
    '🤝 Faire une offre',
    'Connectez-vous pour soumettre une offre sur ce bien et entrer en négociation avec le vendeur.'
  )) return
  actionFeedback.value = 'Votre demande d\'offre a été transmise au vendeur.'
  setTimeout(() => { actionFeedback.value = '' }, 5000)
}

function handleSchedule() {
  if (!requireLogin(
    '📅 Planifier une visite',
    'Connectez-vous pour demander une visite et choisir un créneau avec le vendeur.'
  )) return
  actionFeedback.value = 'Votre demande de visite a été envoyée. Le vendeur vous confirmera un créneau.'
  setTimeout(() => { actionFeedback.value = '' }, 5000)
}

// ── Métadonnées ────────────────────────────────────────────────────────────
const TYPE_ICONS  = { APARTMENT:'🏢', HOUSE:'🏡', LAND:'🌿', COMMERCIAL:'🏪', OFFICE:'💼', VILLA:'🏖️' }
const TYPE_LABELS = { APARTMENT:'Appartement', HOUSE:'Maison', LAND:'Terrain', COMMERCIAL:'Commercial', OFFICE:'Bureau', VILLA:'Villa' }
const STATUS_LABELS = { AVAILABLE:'Disponible', RESERVED:'Réservée', SOLD:'Vendue', RENT:'À louer' }
const STATUS_BADGE  = { AVAILABLE:'badge-success', RESERVED:'badge-warning', SOLD:'badge-danger', RENT:'badge-info' }

const typeIcon         = computed(() => TYPE_ICONS[property.value?.propertyType]  || '🏠')
const typeLabel        = computed(() => TYPE_LABELS[property.value?.propertyType] || '')
const statusLabel      = computed(() => STATUS_LABELS[property.value?.status]     || '')
const statusBadgeClass = computed(() => STATUS_BADGE[property.value?.status]      || 'badge-gray')

function formatPrice(price) {
  return new Intl.NumberFormat('fr-FR').format(price)
}
function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

async function togglePublish() {
  await propertyStore.togglePublish(property.value.id, !property.value.isPublished)
  propertyStore.currentProperty.isPublished = !property.value.isPublished
}

async function confirmDelete() {
  if (confirm('Supprimer cette annonce ? Cette action est irréversible.')) {
    await propertyStore.remove(property.value.id)
    router.push('/dashboard')
  }
}

onMounted(() => propertyStore.fetchById(route.params.id))
</script>

<style scoped>
.breadcrumb { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--gray-500); margin-bottom: 1.5rem; }
.breadcrumb a:hover { color: var(--primary); }
.detail-hero { overflow: hidden; margin-bottom: 1.5rem; }
.detail-image { height: 280px; background: linear-gradient(135deg, #dbeafe, #bfdbfe); display: flex; align-items: center; justify-content: center; font-size: 6rem; }
.detail-header { padding: 1.5rem; }
.detail-title { font-size: 1.5rem; font-weight: 700; color: var(--gray-800); }
.detail-badges { display: flex; gap: 0.375rem; }
.detail-location { color: var(--gray-500); margin-top: 0.375rem; font-size: 0.9rem; }
.detail-address  { color: var(--gray-400); font-size: 0.85rem; margin-top: 0.25rem; }
.detail-price { font-size: 1.75rem; font-weight: 800; color: var(--primary); margin-top: 0.75rem; }
.price-currency { font-size: 1rem; font-weight: 500; color: var(--gray-500); }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.stat-box { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; padding: 1rem; background: var(--gray-50); border-radius: var(--radius); }
.stat-icon { font-size: 1.5rem; }
.stat-val  { font-size: 1.25rem; font-weight: 700; color: var(--gray-800); }
.stat-lbl  { font-size: 0.75rem; color: var(--gray-500); }
.features-list { margin-top: 1.25rem; }
.features-list h4 { font-size: 0.875rem; font-weight: 600; color: var(--gray-700); margin-bottom: 0.75rem; }
.features-tags { display: flex; flex-wrap: wrap; gap: 0.375rem; }
.feature-tag { padding: 0.25rem 0.625rem; background: var(--primary-light); color: var(--primary); border-radius: var(--radius-full); font-size: 0.78rem; }
.description-text { color: var(--gray-600); line-height: 1.8; white-space: pre-wrap; }
.detail-contacts { margin-bottom: 1.5rem; }
.contacts-grid { display: flex; gap: 2rem; }
.contact-item { display: flex; align-items: center; gap: 0.75rem; }
.contact-icon { font-size: 1.75rem; }
.contact-role { font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.04em; }
.contact-name { font-weight: 600; color: var(--gray-700); }
.owner-actions { margin-bottom: 1.5rem; }
.detail-meta { font-size: 0.8rem; color: var(--gray-400); text-align: center; padding: 1rem 0; }

/* Transaction card */
.transaction-card { margin-bottom: 1.5rem; }

.transaction-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.btn-success { background: #16a34a; color: white; border-radius: var(--radius-sm); padding: 0.625rem 1.25rem; font-size: 0.9rem; font-weight: 600; border: none; cursor: pointer; transition: background 0.2s; }
.btn-success:hover { background: #15803d; }
.btn-lg { padding: 0.75rem 1.5rem; font-size: 1rem; }

.action-feedback {
  margin-top: 1rem; padding: 0.875rem 1rem;
  background: #f0fdf4; border: 1px solid #bbf7d0;
  border-radius: var(--radius-sm); color: #166534;
  font-size: 0.875rem; font-weight: 500;
}
.mb-3 { margin-bottom: 1rem; }

/* Teaser (non connecté) */
.transaction-teaser { text-align: center; }
.teaser-items { display: flex; justify-content: center; gap: 2rem; margin-bottom: 1rem; flex-wrap: wrap; }
.teaser-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: var(--gray-600); padding: 0.5rem 1rem; background: var(--gray-50); border-radius: var(--radius-full); border: 1px solid var(--gray-200); filter: blur(0px); }
.teaser-note { font-size: 0.875rem; color: var(--gray-400); margin-bottom: 1.25rem; }
.teaser-actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }

@media (max-width: 768px) {
  .detail-grid { grid-template-columns: 1fr; }
  .transaction-actions { flex-direction: column; }
  .teaser-items { gap: 0.75rem; }
  .teaser-actions { flex-direction: column; align-items: stretch; }
}
</style>
