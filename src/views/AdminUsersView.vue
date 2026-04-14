<template>
  <div class="page">
    <div class="container">

      <!-- Header -->
      <div class="admin-header">
        <div>
          <h1>👑 Administration — Utilisateurs</h1>
          <p class="text-muted">Gérer les comptes, rôles et statuts des utilisateurs</p>
        </div>
        <RouterLink to="/dashboard" class="btn btn-secondary">← Tableau de bord</RouterLink>
      </div>

      <!-- Stats rapides -->
      <div class="admin-stats">
        <div class="stat-box">
          <span class="stat-icon">👥</span>
          <div>
            <div class="stat-val">{{ store.totalUsers }}</div>
            <div class="stat-lbl">Total utilisateurs</div>
          </div>
        </div>
        <div class="stat-box active">
          <span class="stat-icon">✅</span>
          <div>
            <div class="stat-val">{{ store.activeUsers }}</div>
            <div class="stat-lbl">Comptes actifs</div>
          </div>
        </div>
        <div class="stat-box inactive">
          <span class="stat-icon">🚫</span>
          <div>
            <div class="stat-val">{{ store.inactiveUsers }}</div>
            <div class="stat-lbl">Comptes désactivés</div>
          </div>
        </div>
        <div class="stat-box admin-box">
          <span class="stat-icon">🔴</span>
          <div>
            <div class="stat-val">{{ store.byRole['ROLE_ADMIN'] || 0 }}</div>
            <div class="stat-lbl">Administrateurs</div>
          </div>
        </div>
        <div class="stat-box seller-box">
          <span class="stat-icon">🏠</span>
          <div>
            <div class="stat-val">{{ (store.byRole['ROLE_SELLER'] || 0) + (store.byRole['ROLE_AGENT'] || 0) }}</div>
            <div class="stat-lbl">Vendeurs / Agents</div>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════ -->
      <!-- SECTION : Demandes de rôle en attente                    -->
      <!-- ══════════════════════════════════════════════════════════ -->
      <div class="section-block mb-4">
        <div class="section-header">
          <h2>
            📋 Demandes de rôle
            <span v-if="rrStore.pendingCount > 0" class="pending-badge">
              {{ rrStore.pendingCount }} en attente
            </span>
          </h2>
          <div class="flex gap-1">
            <button
              :class="['btn btn-sm', showAllRequests ? 'btn-primary' : 'btn-secondary']"
              @click="showAllRequests = true"
            >Toutes</button>
            <button
              :class="['btn btn-sm', !showAllRequests ? 'btn-primary' : 'btn-secondary']"
              @click="showAllRequests = false"
            >En attente ({{ rrStore.pendingCount }})</button>
            <button class="btn btn-secondary btn-sm" @click="rrStore.fetchAll()">🔄</button>
          </div>
        </div>

        <div v-if="rrStore.loading" class="loading-container">
          <div class="spinner"></div>
        </div>

        <div v-else-if="displayedRequests.length === 0" class="empty-requests">
          <p>{{ showAllRequests ? 'Aucune demande.' : 'Aucune demande en attente. ✅' }}</p>
        </div>

        <div v-else class="requests-grid">
          <div
            v-for="req in displayedRequests"
            :key="req.id"
            :class="['request-card card', `status-${req.status.toLowerCase()}`]"
          >
            <div class="request-card-body">
              <!-- En-tête -->
              <div class="req-head">
                <div class="req-user">
                  <div class="req-avatar">{{ req.username?.charAt(0).toUpperCase() }}</div>
                  <div>
                    <div class="req-username">{{ req.fullName }}</div>
                    <div class="text-xs text-muted">@{{ req.username }} · {{ req.email }}</div>
                  </div>
                </div>
                <span :class="['badge', reqStatusBadge(req.status)]">
                  {{ reqStatusLabel(req.status) }}
                </span>
              </div>

              <!-- Rôle demandé -->
              <div class="req-roles">
                <span class="req-role-from">{{ roleLabel(req.currentRole) }}</span>
                <span class="req-arrow">→</span>
                <span class="req-role-to">{{ roleLabel(req.requestedRole) }}</span>
              </div>

              <!-- Motivation -->
              <p v-if="req.motivation" class="req-motivation">
                💬 "{{ req.motivation }}"
              </p>
              <p v-else class="req-no-motivation text-muted text-xs">
                Aucune motivation fournie
              </p>

              <div class="req-date text-xs text-muted">
                Soumise le {{ formatDate(req.createdAt) }}
              </div>

              <!-- Réponse admin existante -->
              <div v-if="req.adminComment" :class="['req-comment', req.status === 'REJECTED' ? 'rejected' : 'approved']">
                <strong>Réponse :</strong> {{ req.adminComment }}
              </div>

              <!-- Actions (seulement si PENDING) -->
              <div v-if="req.status === 'PENDING'" class="req-actions">
                <!-- Champ commentaire -->
                <textarea
                  v-model="comments[req.id]"
                  class="form-control comment-input"
                  placeholder="Commentaire optionnel pour l'utilisateur..."
                  rows="2"
                ></textarea>
                <div class="req-buttons">
                  <button
                    class="btn btn-success btn-sm"
                    :disabled="rrStore.loading"
                    @click="handleApprove(req)"
                  >
                    ✅ Approuver
                  </button>
                  <button
                    class="btn btn-danger btn-sm"
                    :disabled="rrStore.loading"
                    @click="handleReject(req)"
                  >
                    ❌ Rejeter
                  </button>
                </div>
              </div>

              <!-- Traité par -->
              <div v-if="req.processedByUsername" class="req-processed text-xs text-muted">
                Traité par @{{ req.processedByUsername }} · {{ formatDate(req.processedAt) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════ -->
      <!-- SECTION : Liste des utilisateurs                          -->
      <!-- ══════════════════════════════════════════════════════════ -->

      <!-- Barre de recherche + filtre -->
      <div class="toolbar card">
        <div class="card-body toolbar-inner">
          <input
            v-model="search"
            type="text"
            class="form-control"
            placeholder="🔍 Rechercher par nom, email, username..."
            style="max-width: 350px;"
          />
          <select v-model="filterRole" class="form-control" style="width: auto;">
            <option value="">Tous les rôles</option>
            <option value="ROLE_ADMIN">Administrateur</option>
            <option value="ROLE_AGENT">Agent Immobilier</option>
            <option value="ROLE_SELLER">Vendeur</option>
            <option value="ROLE_BUYER">Acheteur</option>
            <option value="ROLE_USER">Utilisateur</option>
          </select>
          <select v-model="filterStatus" class="form-control" style="width: auto;">
            <option value="">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Désactivés</option>
          </select>
          <button class="btn btn-secondary btn-sm" @click="store.fetchAll()">
            🔄 Actualiser
          </button>
        </div>
      </div>

      <!-- Alerte erreur -->
      <div v-if="store.error" class="alert alert-error">⚠️ {{ store.error }}</div>

      <!-- Chargement -->
      <LoadingSpinner v-if="store.loading" message="Chargement des utilisateurs..." />

      <!-- Tableau des utilisateurs -->
      <div v-else class="users-table card">
        <table>
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Inscrit le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="6" class="empty-row">Aucun utilisateur trouvé</td>
            </tr>
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              :class="{ 'row-inactive': !user.isActive, 'row-me': user.id === currentUserId }"
            >
              <!-- Utilisateur -->
              <td>
                <div class="user-cell">
                  <div class="user-avatar" :style="{ background: avatarColor(user.role) }">
                    {{ user.username?.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <div class="user-name">{{ user.fullName }}</div>
                    <div class="user-username text-muted text-xs">@{{ user.username }}</div>
                  </div>
                  <span v-if="user.id === currentUserId" class="me-badge">moi</span>
                </div>
              </td>

              <!-- Email -->
              <td class="text-sm">{{ user.email }}</td>

              <!-- Rôle — select inline -->
              <td>
                <select
                  :value="user.role"
                  :class="['role-select', roleClass(user.role)]"
                  :disabled="user.id === currentUserId"
                  @change="handleRoleChange(user, $event.target.value)"
                >
                  <option value="ROLE_ADMIN">🔴 Admin</option>
                  <option value="ROLE_AGENT">🏢 Agent</option>
                  <option value="ROLE_SELLER">🏠 Vendeur</option>
                  <option value="ROLE_BUYER">🛒 Acheteur</option>
                  <option value="ROLE_USER">👤 Utilisateur</option>
                </select>
              </td>

              <!-- Statut -->
              <td>
                <span :class="['badge', user.isActive ? 'badge-success' : 'badge-danger']">
                  {{ user.isActive ? '✅ Actif' : '🚫 Désactivé' }}
                </span>
              </td>

              <!-- Date inscription -->
              <td class="text-sm text-muted">{{ formatDate(user.createdAt) }}</td>

              <!-- Actions -->
              <td>
                <div class="action-buttons">
                  <!-- Activer / Désactiver -->
                  <button
                    v-if="user.id !== currentUserId"
                    :class="['btn btn-sm', user.isActive ? 'btn-warn' : 'btn-success']"
                    :title="user.isActive ? 'Désactiver le compte' : 'Activer le compte'"
                    @click="handleToggleStatus(user)"
                  >
                    {{ user.isActive ? '🚫' : '✅' }}
                  </button>

                  <!-- Supprimer -->
                  <button
                    v-if="user.id !== currentUserId"
                    class="btn btn-sm btn-danger"
                    title="Supprimer le compte"
                    @click="confirmDelete(user)"
                  >
                    🗑️
                  </button>

                  <!-- Moi-même : protégé -->
                  <span v-if="user.id === currentUserId" class="text-xs text-muted">
                    (votre compte)
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="table-footer">
          <span class="text-sm text-muted">
            {{ filteredUsers.length }} utilisateur(s) affiché(s) sur {{ store.totalUsers }}
          </span>
        </div>
      </div>

      <!-- Modal confirmation suppression -->
      <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
        <div class="modal card">
          <div class="card-body">
            <h3>🗑️ Confirmer la suppression</h3>
            <p>
              Supprimer le compte de <strong>{{ deleteTarget.fullName }}</strong>
              (<span class="text-muted">{{ deleteTarget.email }}</span>) ?
            </p>
            <p class="alert alert-error mt-2" style="font-size:0.82rem;">
              ⚠️ Cette action est irréversible. Toutes les données seront perdues.
            </p>
            <div class="modal-actions">
              <button class="btn btn-secondary" @click="deleteTarget = null">Annuler</button>
              <button class="btn btn-danger" :disabled="store.loading" @click="doDelete">
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Toast notification -->
      <Transition name="toast">
        <div v-if="toast" :class="['toast', `toast-${toast.type}`]">
          {{ toast.message }}
        </div>
      </Transition>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUsersStore }       from '@/stores/users'
import { useAuthStore }        from '@/stores/auth'
import { useRoleRequestStore } from '@/stores/roleRequests'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const store         = useUsersStore()
const auth          = useAuthStore()
const rrStore       = useRoleRequestStore()
const currentUserId = computed(() => auth.currentUser?.id)

// ── Demandes de rôle ────────────────────────────────────────────────────────
const showAllRequests = ref(false)
const comments = ref({})  // { [requestId]: commentaire }

const displayedRequests = computed(() =>
  showAllRequests.value ? rrStore.allRequests : rrStore.pendingRequests
)

const REQ_STATUS_LABELS = { PENDING:'En attente', APPROVED:'Approuvée', REJECTED:'Rejetée' }
const REQ_STATUS_BADGES = { PENDING:'badge-warning', APPROVED:'badge-success', REJECTED:'badge-danger' }
function reqStatusLabel(s) { return REQ_STATUS_LABELS[s] || s }
function reqStatusBadge(s) { return REQ_STATUS_BADGES[s] || 'badge-gray' }

async function handleApprove(req) {
  try {
    await rrStore.approve(req.id, comments.value[req.id] || '')
    showToast(`✅ Rôle ${roleLabel(req.requestedRole)} accordé à ${req.username}`, 'success')
    delete comments.value[req.id]
  } catch { showToast('Erreur lors de l\'approbation', 'error') }
}

async function handleReject(req) {
  try {
    await rrStore.reject(req.id, comments.value[req.id] || '')
    showToast(`❌ Demande de ${req.username} rejetée`, 'warning')
    delete comments.value[req.id]
  } catch { showToast('Erreur lors du rejet', 'error') }
}

const search       = ref('')
const filterRole   = ref('')
const filterStatus = ref('')
const deleteTarget = ref(null)
const toast        = ref(null)

// ── Filtrage ─────────────────────────────────────────────────────────────────
const filteredUsers = computed(() => {
  let list = store.users

  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(u =>
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.fullName?.toLowerCase().includes(q)
    )
  }
  if (filterRole.value) {
    list = list.filter(u => u.role === filterRole.value)
  }
  if (filterStatus.value === 'active')   list = list.filter(u => u.isActive)
  if (filterStatus.value === 'inactive') list = list.filter(u => !u.isActive)

  return list
})

// ── Actions ───────────────────────────────────────────────────────────────────
async function handleRoleChange(user, newRole) {
  if (newRole === user.role) return
  try {
    await store.changeRole(user.id, newRole)
    showToast(`Rôle de ${user.username} mis à jour → ${roleLabel(newRole)}`, 'success')
  } catch {
    showToast('Erreur lors du changement de rôle', 'error')
  }
}

async function handleToggleStatus(user) {
  try {
    await store.toggleStatus(user.id, !user.isActive)
    showToast(
      `Compte de ${user.username} ${!user.isActive ? 'activé' : 'désactivé'}`,
      !user.isActive ? 'success' : 'warning'
    )
  } catch {
    showToast('Erreur lors du changement de statut', 'error')
  }
}

function confirmDelete(user) { deleteTarget.value = user }

async function doDelete() {
  if (!deleteTarget.value) return
  try {
    await store.remove(deleteTarget.value.id)
    showToast(`Compte de ${deleteTarget.value.username} supprimé`, 'success')
    deleteTarget.value = null
  } catch {
    showToast('Erreur lors de la suppression', 'error')
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const ROLE_LABELS = {
  ROLE_ADMIN:  'Administrateur', ROLE_AGENT:  'Agent',
  ROLE_SELLER: 'Vendeur',        ROLE_BUYER:  'Acheteur',
  ROLE_USER:   'Utilisateur'
}
function roleLabel(r) { return ROLE_LABELS[r] || r }

const ROLE_CLASSES = {
  ROLE_ADMIN:  'role-admin',  ROLE_AGENT:  'role-agent',
  ROLE_SELLER: 'role-seller', ROLE_BUYER:  'role-buyer',
  ROLE_USER:   'role-user'
}
function roleClass(r) { return ROLE_CLASSES[r] || '' }

const AVATAR_COLORS = {
  ROLE_ADMIN: '#ef4444', ROLE_AGENT:  '#3b82f6',
  ROLE_SELLER:'#10b981', ROLE_BUYER:  '#f59e0b',
  ROLE_USER:  '#6b7280'
}
function avatarColor(r) { return AVATAR_COLORS[r] || '#6b7280' }

let toastTimer = null
function showToast(message, type = 'success') {
  toast.value = { message, type }
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = null }, 3000)
}

onMounted(() => {
  store.fetchAll()
  rrStore.fetchAll()
  rrStore.fetchPendingCount()
})
</script>

<style scoped>
/* Header */
.admin-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 2rem; }
.admin-header h1 { font-size: 1.6rem; font-weight: 700; color: var(--gray-800); }

/* Stats */
.admin-stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
.stat-box {
  background: var(--white); border-radius: var(--radius-lg);
  padding: 1.25rem; display: flex; align-items: center; gap: 1rem;
  box-shadow: var(--shadow); border-left: 4px solid var(--gray-200);
}
.stat-box.active   { border-left-color: var(--success); }
.stat-box.inactive { border-left-color: var(--danger); }
.stat-box.admin-box  { border-left-color: #ef4444; }
.stat-box.seller-box { border-left-color: #10b981; }
.stat-icon { font-size: 1.75rem; }
.stat-val  { font-size: 1.5rem; font-weight: 800; color: var(--gray-800); }
.stat-lbl  { font-size: 0.75rem; color: var(--gray-500); }

/* Toolbar */
.toolbar-inner { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }

/* Table */
.users-table { overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
thead tr { background: var(--gray-50); }
th {
  padding: 0.875rem 1rem;
  text-align: left; font-size: 0.78rem;
  font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.04em; color: var(--gray-500);
  border-bottom: 1px solid var(--gray-100);
}
td {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--gray-50);
  vertical-align: middle;
}
tr:last-child td { border-bottom: none; }
tr:hover td { background: var(--gray-50); }
.row-inactive td { opacity: 0.55; }
.row-me td { background: #eff6ff; }

/* User cell */
.user-cell { display: flex; align-items: center; gap: 0.75rem; }
.user-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  color: white; display: flex; align-items: center;
  justify-content: center; font-weight: 700; font-size: 0.95rem;
  flex-shrink: 0;
}
.user-name { font-weight: 600; font-size: 0.875rem; color: var(--gray-800); }
.me-badge {
  background: var(--primary-light); color: var(--primary);
  border-radius: var(--radius-full); padding: 0.15rem 0.5rem;
  font-size: 0.7rem; font-weight: 600;
}

/* Role select */
.role-select {
  border: 1.5px solid var(--gray-200);
  border-radius: var(--radius-sm);
  padding: 0.3rem 0.6rem;
  font-size: 0.8rem; font-weight: 500;
  cursor: pointer; outline: none;
  transition: border-color 0.15s;
  background: var(--white);
}
.role-select:hover:not(:disabled) { border-color: var(--primary); }
.role-select:disabled { opacity: 0.6; cursor: not-allowed; }
.role-select.role-admin  { border-color: #ef4444; color: #ef4444; background: #fef2f2; }
.role-select.role-agent  { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }
.role-select.role-seller { border-color: #10b981; color: #10b981; background: #f0fdf4; }
.role-select.role-buyer  { border-color: #f59e0b; color: #92400e; background: #fef3c7; }
.role-select.role-user   { border-color: var(--gray-300); color: var(--gray-600); background: var(--gray-50); }

/* Action buttons */
.action-buttons { display: flex; gap: 0.375rem; align-items: center; }
.btn-warn { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
.btn-warn:hover { background: #fde68a; }

/* Empty row */
.empty-row { text-align: center; padding: 3rem; color: var(--gray-400); font-size: 0.9rem; }

/* Table footer */
.table-footer { padding: 0.875rem 1rem; border-top: 1px solid var(--gray-100); background: var(--gray-50); }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 200; }
.modal { max-width: 450px; width: 90%; }
.modal h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.75rem; }
.modal p  { color: var(--gray-600); font-size: 0.9rem; }
.modal-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem; }

/* Toast */
.toast {
  position: fixed; bottom: 2rem; right: 2rem;
  padding: 0.875rem 1.5rem;
  border-radius: var(--radius);
  font-size: 0.875rem; font-weight: 500;
  box-shadow: var(--shadow-xl);
  z-index: 300;
  min-width: 280px;
}
.toast-success { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
.toast-error   { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
.toast-warning { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(1rem); }

/* ── Demandes de rôle ─────────────────────────────────── */
.section-block { }
.section-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.25rem; flex-wrap:wrap; gap:0.5rem; }
.section-header h2 { font-size:1.25rem; font-weight:700; color:var(--gray-800); display:flex; align-items:center; gap:0.75rem; }
.pending-badge { background:#fef3c7; color:#92400e; border:1px solid #fde68a; padding:0.2rem 0.6rem; border-radius:var(--radius-full); font-size:0.75rem; font-weight:700; }
.empty-requests { text-align:center; padding:2rem; color:var(--gray-400); font-size:0.9rem; background:var(--gray-50); border-radius:var(--radius-lg); }
.requests-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(340px,1fr)); gap:1rem; }
.request-card { border-left:4px solid var(--gray-200); }
.request-card.status-pending  { border-left-color:#f59e0b; }
.request-card.status-approved { border-left-color:#10b981; }
.request-card.status-rejected { border-left-color:#ef4444; }
.request-card-body { padding:1.25rem; }
.req-head { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:0.875rem; }
.req-user { display:flex; align-items:center; gap:0.75rem; }
.req-avatar { width:36px; height:36px; border-radius:50%; background:var(--primary); color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.95rem; flex-shrink:0; }
.req-username { font-weight:600; font-size:0.875rem; color:var(--gray-800); }
.req-roles { display:flex; align-items:center; gap:0.5rem; margin-bottom:0.625rem; }
.req-role-from { font-size:0.8rem; color:var(--gray-500); background:var(--gray-100); padding:0.2rem 0.5rem; border-radius:var(--radius-full); }
.req-arrow     { color:var(--gray-400); font-size:0.9rem; }
.req-role-to   { font-size:0.8rem; color:var(--primary); background:var(--primary-light); padding:0.2rem 0.5rem; border-radius:var(--radius-full); font-weight:600; }
.req-motivation { font-size:0.825rem; color:var(--gray-600); font-style:italic; margin-bottom:0.5rem; line-height:1.5; }
.req-date { margin-bottom:0.75rem; }
.req-comment { font-size:0.82rem; padding:0.5rem 0.75rem; border-radius:var(--radius-sm); margin-bottom:0.75rem; }
.req-comment.approved { background:#f0fdf4; color:#166534; border:1px solid #bbf7d0; }
.req-comment.rejected { background:#fef2f2; color:#991b1b; border:1px solid #fecaca; }
.req-actions { margin-top:0.875rem; }
.comment-input { font-size:0.82rem; margin-bottom:0.625rem; }
.req-buttons { display:flex; gap:0.5rem; }
.req-processed { margin-top:0.5rem; padding-top:0.5rem; border-top:1px solid var(--gray-100); }

@media (max-width: 1024px) {
  .admin-stats { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 768px) {
  .admin-stats { grid-template-columns: 1fr 1fr; }
  table { font-size: 0.8rem; }
  th, td { padding: 0.625rem 0.5rem; }
}
</style>
