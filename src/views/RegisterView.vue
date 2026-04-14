<template>
  <div class="auth-page">
    <div class="auth-card card">
      <div class="auth-header">
        <RouterLink to="/" class="auth-logo">🏠 ImmoApp</RouterLink>
        <h1>Créer un compte</h1>
        <p>Rejoignez ImmoApp gratuitement</p>
      </div>

      <div class="card-body">
        <!-- Succès -->
        <div v-if="success" class="alert alert-success">
          ✅ Inscription réussie ! <RouterLink to="/login">Se connecter maintenant →</RouterLink>
        </div>

        <!-- Erreur -->
        <div v-if="error" class="alert alert-error">
          ⚠️ {{ error }}
        </div>

        <form v-if="!success" @submit.prevent="handleRegister">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nom d'utilisateur *</label>
              <input
                v-model="form.username"
                type="text"
                class="form-control"
                placeholder="jdupont"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Nom complet *</label>
              <input
                v-model="form.fullName"
                type="text"
                class="form-control"
                placeholder="Jean Dupont"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Adresse email *</label>
            <input
              v-model="form.email"
              type="email"
              class="form-control"
              placeholder="jean@exemple.com"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Mot de passe *</label>
            <div class="input-password">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-control"
                placeholder="Minimum 6 caractères"
              />
              <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            <div class="password-strength" v-if="form.password">
              <div class="strength-bar">
                <div :class="['strength-fill', strengthClass]" :style="{ width: strengthWidth }"></div>
              </div>
              <span :class="['strength-label', strengthClass]">{{ strengthLabel }}</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Confirmer le mot de passe *</label>
            <input
              v-model="form.confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              class="form-control"
              :class="{ 'is-invalid': form.confirmPassword && form.password !== form.confirmPassword }"
              placeholder="Répéter le mot de passe"
            />
            <div v-if="form.confirmPassword && form.password !== form.confirmPassword" class="form-error">
              Les mots de passe ne correspondent pas
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-block btn-lg mt-3"
            :disabled="auth.loading || !isFormValid"
          >
            <span v-if="auth.loading" class="spinner-inline"></span>
            <span v-else>Créer mon compte</span>
          </button>
        </form>

        <p v-if="!success" class="auth-switch">
          Déjà un compte ?
          <RouterLink to="/login">Se connecter →</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth  = useAuthStore()
const error   = ref(null)
const success = ref(false)
const showPassword = ref(false)

const form = reactive({
  username: '', email: '', password: '',
  confirmPassword: '', fullName: ''
})

const isFormValid = computed(() =>
  form.username && form.email && form.password && form.password.length >= 6
  && form.password === form.confirmPassword && form.fullName
)

// Force du mot de passe
const passwordScore = computed(() => {
  let score = 0
  const p = form.password
  if (!p) return 0
  if (p.length >= 8)  score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^a-zA-Z0-9]/.test(p)) score++
  return score
})
const strengthClass = computed(() => ['', 'weak', 'medium', 'good', 'strong'][passwordScore.value] || 'weak')
const strengthLabel = computed(() => ['', 'Faible', 'Moyen', 'Bien', 'Fort'][passwordScore.value] || '')
const strengthWidth = computed(() => `${passwordScore.value * 25}%`)

async function handleRegister() {
  error.value = null
  if (!isFormValid.value) return

  try {
    await auth.register(form.username, form.email, form.password, form.fullName)
    success.value = true
  } catch (err) {
    error.value = err.response?.data?.message
                || err.response?.data?.error
                || 'Erreur lors de l\'inscription'
  }
}
</script>

<style scoped>
.auth-page { min-height: calc(100vh - 64px); display: flex; align-items: center; justify-content: center; padding: 2rem; background: var(--gray-50); }
.auth-card { width: 100%; max-width: 520px; }
.auth-header { text-align: center; padding: 2rem 1.5rem 0; }
.auth-logo { font-size: 1.5rem; font-weight: 800; color: var(--primary); display: block; margin-bottom: 1.5rem; }
.auth-header h1 { font-size: 1.6rem; font-weight: 700; color: var(--gray-800); margin-bottom: 0.375rem; }
.auth-header p  { color: var(--gray-500); font-size: 0.9rem; }
.input-password { position: relative; }
.input-password .form-control { padding-right: 3rem; }
.toggle-password { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 1.1rem; cursor: pointer; }
/* Password strength */
.password-strength { margin-top: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
.strength-bar { flex: 1; height: 4px; background: var(--gray-200); border-radius: 2px; overflow: hidden; }
.strength-fill { height: 100%; border-radius: 2px; transition: width 0.3s; }
.strength-fill.weak   { background: var(--danger); }
.strength-fill.medium { background: var(--warning); }
.strength-fill.good   { background: var(--info); }
.strength-fill.strong { background: var(--success); }
.strength-label { font-size: 0.75rem; font-weight: 600; }
.strength-label.weak   { color: var(--danger); }
.strength-label.medium { color: var(--warning); }
.strength-label.good   { color: var(--info); }
.strength-label.strong { color: var(--success); }
.auth-switch { text-align: center; margin-top: 1.25rem; font-size: 0.875rem; color: var(--gray-500); }
.auth-switch a { color: var(--primary); font-weight: 500; }
.spinner-inline { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
