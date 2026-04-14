<template>
  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <span class="brand-icon">🏠</span>
        <span class="brand-name">ImmoApp</span>
        <p class="footer-tagline">La plateforme immobilière de confiance</p>
      </div>
      <div class="footer-links">
        <RouterLink to="/">Accueil</RouterLink>
        <RouterLink to="/search">Annonces</RouterLink>
        <RouterLink to="/login">Connexion</RouterLink>
        <RouterLink to="/register">Inscription</RouterLink>
      </div>
      <div class="footer-tech">
        <p>Propulsé par</p>
        <div class="tech-badges">
          <span class="tech-badge">Vue 3</span>
          <span class="tech-badge">Pinia</span>
          <span class="tech-badge">Spring Boot</span>
          <span class="tech-badge">JAX-RS</span>
          <span class="tech-badge">JWT</span>
          <span class="tech-badge">MongoDB</span>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container">
        <p>© {{ new Date().getFullYear() }} ImmoApp — API REST + JAX-RS</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--secondary);
  color: #94a3b8;
  margin-top: auto;
}
.footer-inner {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 2rem;
  padding: 2.5rem 1.5rem;
}
.footer-brand .brand-icon { font-size: 1.5rem; }
.footer-brand .brand-name { font-size: 1.2rem; font-weight: 700; color: #fff; margin-left: 0.375rem; }
.footer-tagline { font-size: 0.85rem; margin-top: 0.375rem; }
.footer-links { display: flex; flex-direction: column; gap: 0.625rem; }
.footer-links a { font-size: 0.875rem; transition: color 0.15s; }
.footer-links a:hover { color: #fff; }
.footer-tech p { font-size: 0.8rem; margin-bottom: 0.5rem; }
.tech-badges { display: flex; flex-wrap: wrap; gap: 0.375rem; }
.tech-badge {
  padding: 0.2rem 0.5rem;
  background: rgba(255,255,255,0.1);
  border-radius: var(--radius-full);
  font-size: 0.72rem;
  color: #cbd5e1;
}
.footer-bottom {
  border-top: 1px solid rgba(255,255,255,0.08);
  padding: 1rem 0;
  text-align: center;
  font-size: 0.8rem;
}
@media (max-width: 768px) {
  .footer-inner { grid-template-columns: 1fr; gap: 1.5rem; }
}
</style>
