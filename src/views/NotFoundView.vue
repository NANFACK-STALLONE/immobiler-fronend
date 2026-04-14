<template>
  <div class="notfound-page">
    <div class="notfound-content">
      <div class="notfound-icon">🏚️</div>
      <h1>404</h1>
      <h2>Page introuvable</h2>
      <p>La page que vous cherchez n'existe pas ou a été déplacée.</p>
      <div class="notfound-actions">
        <RouterLink to="/" class="btn btn-primary btn-lg">Retour à l'accueil</RouterLink>
        <RouterLink to="/search" class="btn btn-outline btn-lg">Voir les annonces</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notfound-page { min-height: calc(100vh - 64px); display: flex; align-items: center; justify-content: center; }
.notfound-content { text-align: center; padding: 2rem; }
.notfound-icon { font-size: 5rem; margin-bottom: 1rem; }
h1 { font-size: 5rem; font-weight: 900; color: var(--gray-200); line-height: 1; }
h2 { font-size: 1.5rem; font-weight: 700; color: var(--gray-800); margin-bottom: 0.75rem; }
p  { color: var(--gray-500); margin-bottom: 2rem; }
.notfound-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
</style>
