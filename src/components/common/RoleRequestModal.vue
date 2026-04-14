<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-box card">

        <div class="modal-header">
          <h2>📋 Demander un rôle professionnel</h2>
          <button class="close-btn" @click="$emit('close')">✕</button>
        </div>

        <div class="card-body">

          <!-- Succès -->
          <div v-if="success" class="alert alert-success">
            ✅ Votre demande a été envoyée ! L'administrateur va l'examiner sous peu.
          </div>

          <!-- Erreur -->
          <div v-if="error" class="alert alert-error">⚠️ {{ error }}</div>

          <form v-if="!success" @submit.prevent="handleSubmit">

            <!-- Rôle actuel -->
            <div class="current-role">
              <span class="label">Votre rôle actuel :</span>
              <span :class="['badge', currentRoleBadge]">{{ currentRoleLabel }}</span>
            </div>

            <!-- Rôle demandé -->
            <div class="form-group">
              <label class="form-label">Rôle demandé *</label>
              <div class="role-cards">
                <label
                  v-for="role in availableRoles"
                  :key="role.value"
                  :class="['role-card', { selected: form.requestedRole === role.value }]"
                >
                  <input
                    type="radio"
                    :value="role.value"
                    v-model="form.requestedRole"
                    hidden
                  />
                  <span class="role-card-icon">{{ role.icon }}</span>
                  <div>
                    <div class="role-card-title">{{ role.label }}</div>
                    <div class="role-card-desc">{{ role.description }}</div>
                  </div>
                </label>
              </div>
            </div>

            <!-- Motivation -->
            <div class="form-group">
              <label class="form-label">
                Motivation
                <span class="text-muted text-xs">(optionnel mais recommandé)</span>
              </label>
              <textarea
                v-model="form.motivation"
                class="form-control"
                rows="4"
                placeholder="Expliquez pourquoi vous souhaitez ce rôle : votre activité professionnelle, vos projets immobiliers..."
              ></textarea>
              <div class="char-count">{{ form.motivation.length }} / 500</div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="$emit('close')">
                Annuler
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="!form.requestedRole || store.loading"
              >
                <span v-if="store.loading" class="spinner-inline"></span>
                <span v-else>📤 Envoyer la demande</span>
              </button>
            </div>
          </form>

          <!-- Après succès -->
          <div v-if="success" class="text-center mt-3">
            <button class="btn btn-secondary" @click="$emit('close')">Fermer</button>
          </div>

        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoleRequestStore } from '@/stores/roleRequests'
import { useAuthStore }        from '@/stores/auth'

const emit = defineEmits(['close', 'submitted'])
const store = useRoleRequestStore()
const auth  = useAuthStore()

const success = ref(false)
const error   = ref(null)

const form = reactive({ requestedRole: '', motivation: '' })

const ROLE_META = {
  ROLE_USER:   { label: 'Utilisateur',      badge: 'badge-gray'   },
  ROLE_BUYER:  { label: 'Acheteur',         badge: 'badge-warning' },
  ROLE_SELLER: { label: 'Vendeur',          badge: 'badge-success' },
  ROLE_AGENT:  { label: 'Agent Immobilier', badge: 'badge-info'   },
  ROLE_ADMIN:  { label: 'Administrateur',   badge: 'badge-danger'  },
}

const currentRoleLabel = computed(() => ROLE_META[auth.currentUser?.role]?.label || auth.currentUser?.role)
const currentRoleBadge = computed(() => ROLE_META[auth.currentUser?.role]?.badge || 'badge-gray')

// Le rôle Acheteur s'obtient directement depuis le dashboard (sans approbation)
// Seuls Vendeur et Agent nécessitent une validation admin
const availableRoles = [
  {
    value: 'ROLE_SELLER',
    icon: '🏠',
    label: 'Vendeur',
    description: 'Publiez vos propres annonces immobilières'
  },
  {
    value: 'ROLE_AGENT',
    icon: '🏢',
    label: 'Agent Immobilier',
    description: 'Gérez des biens pour le compte de vendeurs'
  },
]

async function handleSubmit() {
  error.value = null
  if (!form.requestedRole) return

  try {
    await store.submit(form.requestedRole, form.motivation)
    success.value = true
    emit('submitted')
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Erreur lors de la soumission'
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 300; padding: 1rem;
}
.modal-box {
  width: 100%; max-width: 560px;
  max-height: 90vh; overflow-y: auto;
  animation: slideUp 0.25s ease;
}
@keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }

.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--gray-100);
}
.modal-header h2 { font-size: 1.1rem; font-weight: 700; }
.close-btn { background: none; border: none; font-size: 1.1rem; cursor: pointer; color: var(--gray-400); }
.close-btn:hover { color: var(--gray-700); }

.current-role {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.875rem 1rem; background: var(--gray-50);
  border-radius: var(--radius-sm); margin-bottom: 1.25rem;
}
.current-role .label { font-size: 0.875rem; color: var(--gray-600); }

/* Role cards */
.role-cards { display: flex; flex-direction: column; gap: 0.625rem; }
.role-card {
  display: flex; align-items: center; gap: 1rem;
  padding: 1rem; border-radius: var(--radius);
  border: 2px solid var(--gray-200);
  cursor: pointer; transition: all 0.15s;
  background: var(--white);
}
.role-card:hover { border-color: var(--primary); background: var(--primary-light); }
.role-card.selected { border-color: var(--primary); background: var(--primary-light); }
.role-card-icon { font-size: 1.75rem; flex-shrink: 0; }
.role-card-title { font-weight: 600; font-size: 0.9rem; color: var(--gray-800); }
.role-card-desc  { font-size: 0.8rem; color: var(--gray-500); margin-top: 0.125rem; }

.char-count { font-size: 0.75rem; color: var(--gray-400); text-align: right; margin-top: 0.25rem; }

.modal-footer {
  display: flex; gap: 0.75rem; justify-content: flex-end;
  padding-top: 1rem; border-top: 1px solid var(--gray-100); margin-top: 1rem;
}
.spinner-inline { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
