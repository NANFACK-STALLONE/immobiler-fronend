<template>
  <div class="page">
    <div class="container-sm">
      <div class="page-header">
        <h1>Notifications</h1>
        <p>Demandes de visite, offres et messages recus.</p>
      </div>

      <LoadingSpinner v-if="loading" message="Chargement des notifications..." />
      <div v-else-if="notifications.length === 0" class="empty card">
        Aucune notification pour le moment.
      </div>

      <div v-else class="notifications-list">
        <div
          v-for="item in notifications"
          :key="item.id"
          :class="['notification-card', { unread: !item.isRead }]"
        >
          <div class="notification-icon">{{ iconFor(item.type) }}</div>
          <div class="notification-content">
            <div class="notification-top">
              <h3>{{ item.title }}</h3>
              <span>{{ formatDate(item.createdAt) }}</span>
            </div>
            <p>{{ item.message }}</p>
            <RouterLink
              v-if="item.propertyId"
              :to="`/properties/${item.propertyId}`"
              class="notification-link"
            >
              Voir le bien
            </RouterLink>
          </div>
          <button v-if="!item.isRead" class="btn btn-outline btn-sm" @click="markRead(item)">
            Marquer lu
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import notificationService from '@/services/notificationService'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const loading = ref(true)
const notifications = ref([])

async function load() {
  loading.value = true
  notifications.value = await notificationService.getAll()
  loading.value = false
}

async function markRead(item) {
  const updated = await notificationService.markRead(item.id)
  item.isRead = updated.isRead
}

function iconFor(type) {
  return {
    VISIT_REQUEST: '📅',
    OFFER: '🤝',
    CHAT_MESSAGE: '💬'
  }[type] || '🔔'
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })
}

onMounted(load)
</script>

<style scoped>
.page-header { margin-bottom: 1.5rem; }
.page-header h1 { font-size: 1.5rem; font-weight: 800; color: var(--gray-800); }
.page-header p { color: var(--gray-500); margin-top: 0.25rem; }
.empty { padding: 2rem; text-align: center; color: var(--gray-500); }
.notifications-list { display: grid; gap: 0.85rem; }
.notification-card { display: grid; grid-template-columns: auto 1fr auto; gap: 1rem; align-items: start; padding: 1rem; background: #fff; border: 1px solid var(--gray-100); border-radius: var(--radius); box-shadow: var(--shadow-sm); }
.notification-card.unread { border-color: var(--primary); background: #f8fbff; }
.notification-icon { font-size: 1.5rem; }
.notification-top { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
.notification-top h3 { font-size: 0.95rem; font-weight: 700; color: var(--gray-800); }
.notification-top span { font-size: 0.75rem; color: var(--gray-400); }
.notification-content p { margin: 0.35rem 0; color: var(--gray-600); line-height: 1.5; }
.notification-link { font-size: 0.85rem; color: var(--primary); font-weight: 600; }
@media (max-width: 640px) {
  .notification-card { grid-template-columns: auto 1fr; }
  .notification-card .btn { grid-column: 2; justify-self: start; }
}
</style>
