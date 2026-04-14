<template>
  <div class="loading-container">
    <div class="spinner"></div>
    <p>{{ message }}</p>
  </div>
</template>

<script setup>
defineProps({
  message: { type: String, default: 'Chargement...' }
})
</script>
