<template>
  <div class="page">
    <div class="container">
      <!-- Bannière accès refusé (redirect depuis router guard) -->
      <div v-if="route.query.accessDenied" class="alert alert-warning mb-3">
        🔒 <strong>Accès restreint :</strong> Les annonces sont réservées aux Vendeurs, Agents et Administrateurs.
        <span v-if="auth.currentUser?.role === 'ROLE_USER'">Devenez Acheteur ou demandez un rôle professionnel ci-dessous.</span>
        <span v-else>Demandez un rôle professionnel (Vendeur ou Agent) ci-dessous.</span>
      </div>

      <!-- Header -->
      <div class="dashboard-header">
        <div>
          <h1>Tableau de bord</h1>
          <p class="text-muted">Bonjour, <strong>{{ auth.currentUser?.username }}</strong> 👋</p>
        </div>
        <RouterLink v-if="auth.isSeller" to="/properties/new" class="btn btn-primary">
          + Publier une annonce
        </RouterLink>
      </div>

      <!-- Stats Cards -->
      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-card-icon">🏠</span>
          <div>
            <div class="stat-card-val">{{ myStats.total }}</div>
            <div class="stat-card-lbl">Mes annonces</div>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-card-icon">✅</span>
          <div>
            <div class="stat-card-val">{{ myStats.published }}</div>
            <div class="stat-card-lbl">Publiées</div>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-card-icon">💰</span>
          <div>
            <div class="stat-card-val">{{ myStats.available }}</div>
            <div class="stat-card-lbl">Disponibles</div>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-card-icon">🤝</span>
          <div>
            <div class="stat-card-val">{{ myStats.sold }}</div>
            <div class="stat-card-lbl">Vendues/Louées</div>
          </div>
        </div>
      </div>

      <!-- Panneau Admin (visible uniquement pour ADMIN) -->
      <div v-if="auth.isAdmin" class="admin-panel card mb-4">
        <div class="card-body admin-panel-inner">
          <div class="admin-panel-text">
            <span class="admin-icon">👑</span>
            <div>
              <h3>Espace Administrateur</h3>
              <p>Gérez les comptes utilisateurs, validez les rôles et contrôlez les accès.</p>
            </div>
          </div>
          <RouterLink to="/admin/users" class="btn btn-admin">
            Gérer les utilisateurs →
          </RouterLink>
        </div>
      </div>

      <!-- Infos utilisateur -->
      <div class="user-info-card card mb-4">
        <div class="card-header">Mon profil</div>
        <div class="card-body user-profile-grid">
          <div class="profile-avatar">
            {{ auth.currentUser?.username?.charAt(0).toUpperCase() }}
          </div>
          <div class="profile-details">
            <div class="profile-row">
              <span class="profile-label">Identifiant</span>
              <span>{{ auth.currentUser?.username }}</span>
            </div>
            <div class="profile-row">
              <span class="profile-label">Email</span>
              <span>{{ auth.currentUser?.email }}</span>
            </div>
            <div class="profile-row">
              <span class="profile-label">Rôle</span>
              <span :class="['badge', roleClass]">{{ auth.currentUser?.role }}</span>
            </div>
          </div>
          <!-- Actions rôle (uniquement ROLE_USER) -->
          <div v-if="auth.currentUser?.role === 'ROLE_USER'" class="profile-request-btn">
            <button
              class="btn btn-buyer"
              :disabled="buyerLoading"
              @click="handleBecomeBuyer"
            >
              <span v-if="buyerLoading">⏳ En cours...</span>
              <span v-else>🛒 Devenir Acheteur</span>
            </button>
            <button
              class="btn btn-outline mt-1"
              :disabled="rrStore.hasPending"
              @click="showRequestModal = true"
            >
              {{ rrStore.hasPending ? '⏳ Demande en cours...' : '📋 Rôle pro (Vendeur/Agent)' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Section : Mes demandes de rôle -->
      <div v-if="rrStore.myRequests.length > 0" class="role-requests-section mb-4">
        <div class="section-header">
          <h2>Mes demandes de rôle</h2>
          <button class="btn btn-secondary btn-sm" @click="rrStore.fetchMine()">🔄</button>
        </div>
        <div class="requests-list">
          <div
            v-for="req in rrStore.myRequests"
            :key="req.id"
            class="request-item card"
          >
            <div class="request-item-body">
              <div class="request-meta">
                <span class="req-role">{{ roleLabel(req.requestedRole) }}</span>
                <span :class="['badge', statusBadge(req.status)]">{{ statusLabel(req.status) }}</span>
                <span class="text-xs text-muted">{{ formatDate(req.createdAt) }}</span>
              </div>
              <p v-if="req.motivation" class="req-motivation">"{{ req.motivation }}"</p>
              <div v-if="req.adminComment" :class="['req-admin-comment', req.status === 'REJECTED' ? 'rejected' : 'approved']">
                <strong>💬 Réponse de l'admin :</strong> {{ req.adminComment }}
              </div>
              <p v-if="req.processedByUsername" class="text-xs text-muted mt-1">
                Traité par @{{ req.processedByUsername }} · {{ formatDate(req.processedAt) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Invitation à étendre les accès si ROLE_USER et aucune demande -->
      <div v-if="auth.currentUser?.role === 'ROLE_USER' && rrStore.myRequests.length === 0" class="upgrade-banner card mb-4">
        <div class="card-body upgrade-inner">
          <div class="upgrade-text">
            <span class="upgrade-icon">🚀</span>
            <div>
              <h3>Étendez vos accès</h3>
              <p>Devenez <strong>Acheteur</strong> instantanément ou demandez un rôle professionnel (Vendeur, Agent).</p>
            </div>
          </div>
          <div class="upgrade-actions">
            <button
              class="btn btn-buyer"
              :disabled="buyerLoading"
              @click="handleBecomeBuyer"
            >
              <span v-if="buyerLoading">⏳</span>
              <span v-else>🛒 Devenir Acheteur</span>
            </button>
            <button class="btn btn-outline" @click="showRequestModal = true">
              📋 Rôle pro
            </button>
          </div>
        </div>
      </div>

      <!-- Modal demande de rôle -->
      <RoleRequestModal
        v-if="showRequestModal"
        @close="showRequestModal = false"
        @submitted="onRequestSubmitted"
      />

      <!-- Mes Propriétés -->
      <div class="section-header">
        <h2>Mes annonces</h2>
        <button class="btn btn-secondary btn-sm" @click="propertyStore.fetchMyProperties()">
          🔄 Actualiser
        </button>
      </div>

      <LoadingSpinner v-if="propertyStore.loading" message="Chargement..." />

      <div v-else-if="propertyStore.error" class="alert alert-error">
        ⚠️ {{ propertyStore.error }}
      </div>

      <div v-else-if="propertyStore.myProperties.length === 0" class="empty-state">
        <div class="icon">📋</div>
        <h3>Aucune annonce</h3>
        <p>Vous n'avez pas encore publié d'annonce</p>
        <RouterLink v-if="auth.isSeller" to="/properties/new" class="btn btn-primary mt-2">
          Publier ma première annonce
        </RouterLink>
        <p v-else class="mt-2 text-sm text-muted">
          Contactez un administrateur pour obtenir le rôle Vendeur.
        </p>
      </div>

      <div v-else class="properties-grid">
        <PropertyCard
          v-for="property in propertyStore.myProperties"
          :key="property.id"
          :property="property"
          :show-actions="true"
          @edit="goEdit"
          @delete="handleDelete"
          @toggle-publish="handleTogglePublish"
        />
      </div>

      <!-- Confirmation suppression -->
      <div v-if="deleteConfirm" class="modal-overlay" @click.self="deleteConfirm = null">
        <div class="modal card">
          <div class="card-body">
            <h3>Confirmer la suppression</h3>
            <p>Supprimer <strong>{{ deleteConfirm.title }}</strong> ? Cette action est irréversible.</p>
            <div class="modal-actions">
              <button class="btn btn-secondary" @click="deleteConfirm = null">Annuler</button>
              <button class="btn btn-danger" @click="doDelete">Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore }        from '@/stores/auth'
import { usePropertyStore }    from '@/stores/property'
import { useRoleRequestStore } from '@/stores/roleRequests'
import PropertyCard      from '@/components/property/PropertyCard.vue'
import LoadingSpinner    from '@/components/common/LoadingSpinner.vue'
import RoleRequestModal  from '@/components/common/RoleRequestModal.vue'
import userService       from '@/services/userService'

const auth          = useAuthStore()
const propertyStore = usePropertyStore()
const rrStore       = useRoleRequestStore()
const router        = useRouter()
const route         = useRoute()
const deleteConfirm    = ref(null)
const showRequestModal = ref(false)
const buyerLoading     = ref(false)
const buyerError       = ref(null)

const myStats = computed(() => {
  const props = propertyStore.myProperties
  return {
    total:     props.length,
    published: props.filter(p => p.isPublished).length,
    available: props.filter(p => p.status === 'AVAILABLE').length,
    sold:      props.filter(p => ['SOLD','RENT'].includes(p.status)).length,
  }
})

const roleClass = computed(() => {
  const r = auth.currentUser?.role
  if (r === 'ROLE_ADMIN')  return 'badge-danger'
  if (r === 'ROLE_AGENT')  return 'badge-info'
  if (r === 'ROLE_SELLER') return 'badge-success'
  if (r === 'ROLE_BUYER')  return 'badge-warning'
  return 'badge-gray'
})

const ROLE_LABELS = {
  ROLE_ADMIN:'Administrateur', ROLE_AGENT:'Agent', ROLE_SELLER:'Vendeur',
  ROLE_BUYER:'Acheteur', ROLE_USER:'Utilisateur'
}
const STATUS_LABELS = { PENDING:'En attente', APPROVED:'Approuvée', REJECTED:'Rejetée' }
const STATUS_BADGES = { PENDING:'badge-warning', APPROVED:'badge-success', REJECTED:'badge-danger' }

function roleLabel(r)   { return ROLE_LABELS[r]  || r }
function statusLabel(s) { return STATUS_LABELS[s] || s }
function statusBadge(s) { return STATUS_BADGES[s] || 'badge-gray' }
function formatDate(d)  {
  if (!d) return ''
  return new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' })
}

function goEdit(property) { router.push(`/properties/${property.id}/edit`) }
function handleDelete(property) { deleteConfirm.value = property }
async function doDelete() {
  if (!deleteConfirm.value) return
  await propertyStore.remove(deleteConfirm.value.id)
  deleteConfirm.value = null
}
async function handleTogglePublish(property) {
  await propertyStore.togglePublish(property.id, !property.isPublished)
}
function onRequestSubmitted() {
  showRequestModal.value = false
  rrStore.fetchMine()
}

async function handleBecomeBuyer() {
  buyerLoading.value = true
  buyerError.value   = null
  try {
    const res = await userService.becomeBuyer()
    // Mettre à jour le rôle localement sans avoir à se reconnecter
    auth.updateUserRole('ROLE_BUYER')
  } catch (err) {
    buyerError.value = err.response?.data?.message || err.message || 'Erreur'
    alert('⚠️ ' + buyerError.value)
  } finally {
    buyerLoading.value = false
  }
}

onMounted(() => {
  propertyStore.fetchMyProperties()
  rrStore.fetchMine()
})
</script>

<style scoped>
.dashboard-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; }
.dashboard-header h1 { font-size: 1.75rem; font-weight: 700; color: var(--gray-800); }
/* Stats */
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
.stat-card { background: var(--white); border-radius: var(--radius-lg); padding: 1.25rem; display: flex; align-items: center; gap: 1rem; box-shadow: var(--shadow); }
.stat-card-icon { font-size: 2rem; }
.stat-card-val  { font-size: 1.75rem; font-weight: 800; color: var(--gray-800); }
.stat-card-lbl  { font-size: 0.8rem; color: var(--gray-500); }
/* Profile */
.user-profile-grid { display: flex; align-items: center; gap: 1.5rem; }
.profile-avatar { width: 64px; height: 64px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; font-weight: 700; flex-shrink: 0; }
.profile-details { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.profile-row { display: flex; align-items: center; gap: 1rem; font-size: 0.875rem; }
.profile-label { font-weight: 500; color: var(--gray-500); min-width: 80px; }
.profile-request-btn { margin-left: auto; }
/* Role requests */
.requests-list { display: flex; flex-direction: column; gap: 0.75rem; }
.request-item { border-left: 4px solid var(--gray-200); }
.request-item-body { padding: 1rem 1.25rem; }
.request-meta { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; flex-wrap: wrap; }
.req-role { font-weight: 600; font-size: 0.9rem; color: var(--gray-700); }
.req-motivation { font-size: 0.875rem; color: var(--gray-500); font-style: italic; margin-bottom: 0.5rem; }
.req-admin-comment { font-size: 0.85rem; padding: 0.625rem 0.875rem; border-radius: var(--radius-sm); margin-top: 0.5rem; }
.req-admin-comment.approved { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
.req-admin-comment.rejected { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
/* Upgrade banner */
.upgrade-banner { border: 2px dashed var(--primary-light); }
.upgrade-inner { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.upgrade-text  { display: flex; align-items: center; gap: 1rem; }
.upgrade-icon  { font-size: 2rem; }
.upgrade-text h3 { font-weight: 700; font-size: 1rem; color: var(--gray-800); margin-bottom: 0.25rem; }
.upgrade-text p  { font-size: 0.875rem; color: var(--gray-500); }
/* Section */
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
.section-header h2 { font-size: 1.25rem; font-weight: 700; color: var(--gray-800); }
/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 200; }
.modal { max-width: 400px; width: 90%; }
.modal h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.75rem; }
.modal p  { color: var(--gray-600); font-size: 0.9rem; margin-bottom: 1.5rem; }
.modal-actions { display: flex; gap: 0.75rem; justify-content: flex-end; }
/* Admin panel */
.admin-panel { border: 2px solid #ede9fe; background: linear-gradient(135deg, #f5f3ff, #ede9fe); }
.admin-panel-inner { display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; }
.admin-panel-text  { display: flex; align-items: center; gap: 1rem; }
.admin-icon { font-size: 2.5rem; }
.admin-panel-text h3 { font-size: 1.1rem; font-weight: 700; color: #5b21b6; margin-bottom: 0.25rem; }
.admin-panel-text p  { font-size: 0.875rem; color: #7c3aed; }
.btn-admin { background: #7c3aed; color: white; border-radius: var(--radius-sm); padding: 0.625rem 1.25rem; font-size: 0.875rem; font-weight: 600; white-space: nowrap; transition: background 0.2s; }
.btn-admin:hover { background: #6d28d9; }

/* Alert */
.alert-warning { background: #fef3c7; border: 1px solid #f59e0b; color: #92400e; border-radius: var(--radius-sm); padding: 0.875rem 1rem; font-size: 0.875rem; }
.mb-3 { margin-bottom: 1.5rem; }

/* Become buyer */
.btn-buyer { background: #0ea5e9; color: white; border-radius: var(--radius-sm); padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 600; white-space: nowrap; transition: background 0.2s; border: none; cursor: pointer; }
.btn-buyer:hover:not(:disabled) { background: #0284c7; }
.btn-buyer:disabled { opacity: 0.6; cursor: not-allowed; }
.upgrade-actions { display: flex; gap: 0.75rem; align-items: center; flex-shrink: 0; }
.profile-request-btn { margin-left: auto; display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-end; }
.mt-1 { margin-top: 0.25rem; }

@media (max-width: 768px) {
  .stats-row { grid-template-columns: 1fr 1fr; }
  .dashboard-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .admin-panel-inner { flex-direction: column; align-items: flex-start; }
  .upgrade-inner { flex-direction: column; align-items: flex-start; }
  .upgrade-actions { width: 100%; }
  .profile-request-btn { margin-left: 0; align-items: flex-start; }
}
</style>
