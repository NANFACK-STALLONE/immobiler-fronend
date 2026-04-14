<template>
  <div class="auth-page">
    <div class="auth-card card">
      <div class="auth-header">
        <RouterLink to="/" class="auth-logo">🏠 ImmoApp</RouterLink>
        <h1>Connexion</h1>
        <p>Accédez à votre espace personnel</p>
      </div>

      <div class="card-body">
        <!-- Alerte erreur API -->
        <div v-if="error" class="alert alert-error">
          ⚠️ {{ error }}
        </div>

        <form @submit.prevent="handleLogin">
          <!-- Email -->
          <div class="form-group">
            <label class="form-label">Adresse email</label>
            <input
              v-model="form.email"
              type="email"
              class="form-control"
              :class="{ 'is-invalid': errors.email }"
              placeholder="exemple@email.com"
              autocomplete="email"
            />
            <div v-if="errors.email" class="form-error">{{ errors.email }}</div>
          </div>

          <!-- Mot de passe -->
          <div class="form-group">
            <label class="form-label">Mot de passe</label>
            <div class="input-password">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-control"
                :class="{ 'is-invalid': errors.password }"
                placeholder="Votre mot de passe"
                autocomplete="current-password"
              />
              <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            <div v-if="errors.password" class="form-error">{{ errors.password }}</div>
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-block btn-lg mt-3"
            :disabled="auth.loading"
          >
            <span v-if="auth.loading" class="spinner-inline"></span>
            <span v-else>Se connecter</span>
          </button>
        </form>

        <p class="auth-switch">
          Pas encore de compte ?
          <RouterLink to="/register">Créer un compte →</RouterLink>
        </p>

        <div class="test-credentials">
          <p><strong>Test :</strong> utilisez l'email et le mot de passe créés via /register</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route  = useRoute()
const auth   = useAuthStore()

const error        = ref(null)
const showPassword = ref(false)

const form   = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })

function validate() {
  errors.email    = ''
  errors.password = ''

  if (!form.email) {
    errors.email = "L'email est requis"
  } else if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) {
    errors.email = 'Adresse email invalide'
  }

  if (!form.password) {
    errors.password = 'Le mot de passe est requis'
  } else if (form.password.length < 4) {
    errors.password = 'Minimum 4 caractères'
  }

  return !errors.email && !errors.password
}

async function handleLogin() {
  error.value = null
  if (!validate()) return

  try {
    await auth.login(form.email, form.password)
    const redirect = route.query.redirect || '/dashboard'
    router.push(redirect)
  } catch (err) {
    error.value = err.response?.data?.message
                || err.response?.data?.error
                || 'Email ou mot de passe incorrect'
  }
}
</script>

<style scoped>
.auth-page { min-height: calc(100vh - 64px); display: flex; align-items: center; justify-content: center; padding: 2rem; background: var(--gray-50); }
.auth-card { width: 100%; max-width: 440px; }
.auth-header { text-align: center; padding: 2rem 1.5rem 0; }
.auth-logo { font-size: 1.5rem; font-weight: 800; color: var(--primary); display: block; margin-bottom: 1.5rem; }
.auth-header h1 { font-size: 1.6rem; font-weight: 700; color: var(--gray-800); margin-bottom: 0.375rem; }
.auth-header p  { color: var(--gray-500); font-size: 0.9rem; margin-bottom: 0.5rem; }
.input-password { position: relative; }
.input-password .form-control { padding-right: 3rem; }
.toggle-password { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 1.1rem; cursor: pointer; }
.auth-switch { text-align: center; margin-top: 1.25rem; font-size: 0.875rem; color: var(--gray-500); }
.auth-switch a { color: var(--primary); font-weight: 500; }
.test-credentials { margin-top: 1.5rem; padding: 0.875rem; background: var(--gray-50); border-radius: var(--radius-sm); border: 1px dashed var(--gray-200); font-size: 0.78rem; color: var(--gray-500); }
.spinner-inline { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
