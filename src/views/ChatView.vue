<template>
  <div class="page">
    <div class="container-sm">
      <div class="chat-shell card">
        <div class="chat-header">
          <RouterLink to="/dashboard" class="btn btn-outline btn-sm">Retour</RouterLink>
          <div>
            <h1>Conversation</h1>
            <p v-if="conversation">{{ conversation.propertyTitle }}</p>
          </div>
        </div>

        <LoadingSpinner v-if="loading" message="Chargement de la conversation..." />
        <div v-else class="chat-body">
          <div v-if="messages.length === 0" class="empty-chat">Aucun message pour le moment.</div>
          <div
            v-for="message in messages"
            :key="message.id"
            :class="['message-row', { mine: message.senderId === auth.currentUser?.id }]"
          >
            <div class="message-bubble">
              <div class="message-author">{{ message.senderName }}</div>
              <div class="message-content">{{ message.content }}</div>
              <div class="message-time">{{ formatDate(message.createdAt) }}</div>
            </div>
          </div>
        </div>

        <form class="chat-form" @submit.prevent="send">
          <input
            v-model.trim="draft"
            class="form-control"
            placeholder="Ecrire un message..."
            :disabled="sending"
          />
          <button class="btn btn-primary" type="submit" :disabled="sending || !draft">
            Envoyer
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import interactionService from '@/services/interactionService'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const route = useRoute()
const auth = useAuthStore()
const loading = ref(true)
const sending = ref(false)
const draft = ref('')
const conversation = ref(null)
const messages = ref([])

async function load() {
  loading.value = true
  const conversations = await interactionService.getConversations()
  conversation.value = conversations.find(item => item.id === route.params.conversationId) || null
  messages.value = await interactionService.getMessages(route.params.conversationId)
  loading.value = false
}

async function send() {
  if (!draft.value) return
  sending.value = true
  const message = await interactionService.sendMessage(route.params.conversationId, draft.value)
  messages.value.push(message)
  draft.value = ''
  sending.value = false
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
}

onMounted(load)
</script>

<style scoped>
.chat-shell { overflow: hidden; }
.chat-header { display: flex; gap: 1rem; align-items: center; padding: 1rem 1.25rem; border-bottom: 1px solid var(--gray-100); }
.chat-header h1 { font-size: 1.1rem; font-weight: 700; color: var(--gray-800); }
.chat-header p { font-size: 0.85rem; color: var(--gray-500); margin-top: 0.125rem; }
.chat-body { min-height: 420px; max-height: 58vh; overflow-y: auto; padding: 1.25rem; background: var(--gray-50); }
.empty-chat { text-align: center; color: var(--gray-400); padding: 3rem 0; }
.message-row { display: flex; margin-bottom: 0.85rem; }
.message-row.mine { justify-content: flex-end; }
.message-bubble { max-width: min(560px, 82%); padding: 0.75rem 0.9rem; background: #fff; border: 1px solid var(--gray-100); border-radius: var(--radius); box-shadow: var(--shadow-sm); }
.message-row.mine .message-bubble { background: var(--primary); color: #fff; border-color: var(--primary); }
.message-author { font-size: 0.75rem; font-weight: 700; opacity: 0.8; margin-bottom: 0.25rem; }
.message-content { line-height: 1.45; }
.message-time { font-size: 0.7rem; opacity: 0.65; margin-top: 0.35rem; }
.chat-form { display: grid; grid-template-columns: 1fr auto; gap: 0.75rem; padding: 1rem; border-top: 1px solid var(--gray-100); }
@media (max-width: 640px) {
  .chat-form { grid-template-columns: 1fr; }
}
</style>
