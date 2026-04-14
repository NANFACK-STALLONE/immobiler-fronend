<template>
  <div v-if="totalPages > 1" class="pagination">
    <button
      class="page-btn"
      :disabled="currentPage === 0"
      @click="$emit('change', currentPage - 1)"
    >← Précédent</button>

    <div class="page-numbers">
      <button
        v-for="page in visiblePages"
        :key="page"
        :class="['page-btn', 'number', { active: page === currentPage }]"
        @click="$emit('change', page)"
      >{{ page + 1 }}</button>
    </div>

    <button
      class="page-btn"
      :disabled="currentPage === totalPages - 1"
      @click="$emit('change', currentPage + 1)"
    >Suivant →</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages:  { type: Number, required: true }
})
defineEmits(['change'])

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(0, props.currentPage - 2)
  const end   = Math.min(props.totalPages - 1, props.currentPage + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})
</script>

<style scoped>
.pagination { display: flex; align-items: center; justify-content: center; gap: 0.375rem; margin-top: 2rem; }
.page-btn {
  padding: 0.5rem 0.875rem;
  border: 1.5px solid var(--gray-200);
  border-radius: var(--radius-sm);
  background: var(--white); color: var(--gray-600);
  font-size: 0.875rem; cursor: pointer; transition: all 0.15s;
}
.page-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-btn.number.active { background: var(--primary); border-color: var(--primary); color: #fff; font-weight: 600; }
.page-numbers { display: flex; gap: 0.25rem; }
</style>
