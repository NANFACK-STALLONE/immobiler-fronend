<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-box card">

        <div class="modal-header">
          <h2>🔐 Connexion requise</h2>
          <button class="close-btn" @click="$emit('close')">✕</button>
        </div>

        <div class="card-body">
          <div class="prompt-icon">🏠</div>
          <h3 class="prompt-title">{{ title }}</h3>
          <p class="prompt-desc">{{ message }}</p>

          <div class="prompt-actions">
            <RouterLink
              :to="{ name: 'Login', query: { redirect: currentPath } }"
              class="btn btn-primary btn-block"
              @click="$emit('close')"
            >
              Se connecter
            </RouterLink>
            <RouterLink
              :to="{ name: 'Register' }"
              class="btn btn-outline btn-block"
              @click="$emit('close')"
            >
              Créer un compte gratuitement
            </RouterLink>
          </div>

          <p class="prompt-note">
            Votre compte vous permet de contacter les vendeurs, faire des offres et suivre vos biens favoris.
          </p>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useRoute } from 'vue-router'

defineProps({
  title:   { type: String, default: 'Accédez aux coordonnées du vendeur' },
  message: { type: String, default: 'Connectez-vous pour contacter le vendeur, faire une offre ou réserver ce bien.' },
})
defineEmits(['close'])

const route = useRoute()
const currentPath = route.fullPath
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 300; padding: 1rem;
}
.modal-box {
  width: 100%; max-width: 420px;
  animation: slideUp 0.25s ease;
}
@keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }

.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--gray-100);
}
.modal-header h2 { font-size: 1rem; font-weight: 700; }
.close-btn { background: none; border: none; font-size: 1.1rem; cursor: pointer; color: var(--gray-400); }
.close-btn:hover { color: var(--gray-700); }

.prompt-icon  { font-size: 3rem; text-align: center; margin-bottom: 0.75rem; }
.prompt-title { font-size: 1.1rem; font-weight: 700; color: var(--gray-800); text-align: center; margin-bottom: 0.5rem; }
.prompt-desc  { font-size: 0.9rem; color: var(--gray-500); text-align: center; margin-bottom: 1.5rem; line-height: 1.6; }

.prompt-actions { display: flex; flex-direction: column; gap: 0.625rem; margin-bottom: 1.25rem; }
.btn-block { width: 100%; justify-content: center; }

.prompt-note {
  font-size: 0.78rem; color: var(--gray-400);
  text-align: center; line-height: 1.5;
  padding-top: 0.75rem;
  border-top: 1px solid var(--gray-100);
}
</style>
