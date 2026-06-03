<template>
  <header class="navbar">
    <div class="container navbar-inner">

      <!-- Logo -->
      <RouterLink to="/" class="navbar-brand">
        <span class="brand-icon">🏠</span>
        <span class="brand-name">ImmoApp</span>
      </RouterLink>

      <!-- Navigation centrale -->
      <nav class="navbar-nav">
        <RouterLink to="/" class="nav-link" active-class="active" exact>Accueil</RouterLink>
        <RouterLink to="/search" class="nav-link" active-class="active">Annonces</RouterLink>
      </nav>

      <!-- Actions droite -->
      <div class="navbar-actions">
        <template v-if="!auth.isAuthenticated">
          <RouterLink to="/login"    class="btn btn-secondary btn-sm">Connexion</RouterLink>
          <RouterLink to="/register" class="btn btn-primary btn-sm">Inscription</RouterLink>
        </template>

        <template v-else>
          <!-- Bouton publier (vendeur / agent / admin) -->
          <RouterLink
            v-if="auth.isSeller"
            to="/properties/new"
            class="btn btn-primary btn-sm"
          >
            + Publier
          </RouterLink>

          <!-- Menu utilisateur -->
          <div class="user-menu" @click="menuOpen = !menuOpen" ref="menuRef">
            <div class="avatar">
              {{ auth.currentUser?.username?.charAt(0).toUpperCase() || 'U' }}
            </div>
            <span class="user-name">{{ auth.currentUser?.username }}</span>
            <span class="chevron">▾</span>

            <div v-if="menuOpen" class="dropdown">
              <RouterLink to="/dashboard" class="dropdown-item" @click="menuOpen = false">
                📊 Tableau de bord
              </RouterLink>
              <RouterLink to="/notifications" class="dropdown-item" @click="menuOpen = false">
                🔔 Notifications
              </RouterLink>
              <RouterLink
                v-if="auth.isAdmin"
                to="/admin/users"
                class="dropdown-item admin-item"
                @click="menuOpen = false"
              >
                👑 Gestion utilisateurs
                <span v-if="rrStore.pendingCount > 0" class="notif-dot">{{ rrStore.pendingCount }}</span>
              </RouterLink>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item danger" @click="handleLogout">
                🚪 Déconnexion
              </button>
            </div>
          </div>
        </template>
      </div>

      <!-- Hamburger mobile -->
      <button class="hamburger" @click="mobileOpen = !mobileOpen">
        <span></span><span></span><span></span>
      </button>
    </div>

    <!-- Menu mobile -->
    <div v-if="mobileOpen" class="mobile-menu">
      <RouterLink to="/" class="mobile-link" @click="mobileOpen = false">Accueil</RouterLink>
      <RouterLink to="/search" class="mobile-link" @click="mobileOpen = false">Annonces</RouterLink>
      <template v-if="!auth.isAuthenticated">
        <RouterLink to="/login"    class="mobile-link" @click="mobileOpen = false">Connexion</RouterLink>
        <RouterLink to="/register" class="mobile-link" @click="mobileOpen = false">Inscription</RouterLink>
      </template>
      <template v-else>
        <RouterLink to="/dashboard" class="mobile-link" @click="mobileOpen = false">Tableau de bord</RouterLink>
        <RouterLink to="/notifications" class="mobile-link" @click="mobileOpen = false">🔔 Notifications</RouterLink>
        <RouterLink v-if="auth.isAdmin" to="/admin/users" class="mobile-link admin-mobile" @click="mobileOpen = false">👑 Gestion utilisateurs</RouterLink>
        <RouterLink v-if="auth.isSeller" to="/properties/new" class="mobile-link" @click="mobileOpen = false">Publier une annonce</RouterLink>
        <button class="mobile-link danger-link" @click="handleLogout">Déconnexion</button>
      </template>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore }        from '@/stores/auth'
import { useRoleRequestStore } from '@/stores/roleRequests'

const auth    = useAuthStore()
const rrStore = useRoleRequestStore()
const router  = useRouter()
const menuOpen   = ref(false)
const mobileOpen = ref(false)
const menuRef = ref(null)

function handleLogout() {
  auth.logout()
  menuOpen.value = false
  router.push('/')
}

// Fermer le dropdown si on clique ailleurs
function handleOutsideClick(e) {
  if (menuRef.value && !menuRef.value.contains(e.target)) {
    menuOpen.value = false
  }
}
onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
  // Charger le badge des demandes en attente si admin
  if (auth.isAdmin) rrStore.fetchPendingCount()
})
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))
</script>

<style scoped>
.navbar {
  background: #fff;
  border-bottom: 1px solid var(--gray-100);
  position: sticky; top: 0; z-index: 100;
  box-shadow: var(--shadow-sm);
}
.navbar-inner {
  display: flex; align-items: center;
  height: 64px; gap: 2rem;
}
.navbar-brand {
  display: flex; align-items: center; gap: 0.5rem;
  font-weight: 700; font-size: 1.2rem; color: var(--primary);
  flex-shrink: 0;
}
.brand-icon { font-size: 1.4rem; }
.navbar-nav { display: flex; gap: 0.25rem; flex: 1; }
.nav-link {
  padding: 0.375rem 0.875rem;
  border-radius: var(--radius-sm);
  font-size: 0.9rem; font-weight: 500;
  color: var(--gray-600); transition: all 0.15s;
}
.nav-link:hover, .nav-link.active { color: var(--primary); background: var(--primary-light); }
.navbar-actions { display: flex; align-items: center; gap: 0.75rem; margin-left: auto; }

/* User menu */
.user-menu {
  display: flex; align-items: center; gap: 0.5rem;
  cursor: pointer; position: relative;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-sm);
  background: var(--gray-50); border: 1px solid var(--gray-200);
  transition: background 0.15s;
}
.user-menu:hover { background: var(--gray-100); }
.avatar {
  width: 30px; height: 30px; border-radius: 50%;
  background: var(--primary); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem; font-weight: 700;
}
.user-name { font-size: 0.875rem; font-weight: 500; color: var(--gray-700); }
.chevron { font-size: 0.75rem; color: var(--gray-400); }
.dropdown {
  position: absolute; top: calc(100% + 8px); right: 0;
  background: #fff; border-radius: var(--radius);
  box-shadow: var(--shadow-xl); border: 1px solid var(--gray-100);
  min-width: 180px; overflow: hidden;
  animation: dropIn 0.15s ease;
}
@keyframes dropIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
.dropdown-item {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem; color: var(--gray-700);
  width: 100%; text-align: left; background: none; border: none;
  cursor: pointer; transition: background 0.15s;
}
.dropdown-item:hover { background: var(--gray-50); }
.dropdown-item.danger { color: var(--danger); }
.dropdown-item.danger:hover { background: #fef2f2; }
.dropdown-item.admin-item { color: #7c3aed; font-weight: 600; display:flex; align-items:center; justify-content:space-between; }
.dropdown-item.admin-item:hover { background: #f5f3ff; }
.notif-dot { background:#ef4444; color:white; border-radius:var(--radius-full); padding:0.15rem 0.45rem; font-size:0.7rem; font-weight:700; min-width:18px; text-align:center; }
.dropdown-divider { height: 1px; background: var(--gray-100); }
.admin-mobile { color: #7c3aed; font-weight: 600; }

/* Mobile */
.hamburger {
  display: none; flex-direction: column; gap: 5px;
  background: none; border: none; padding: 0.375rem; margin-left: auto;
}
.hamburger span { width: 22px; height: 2px; background: var(--gray-600); border-radius: 2px; }
.mobile-menu { padding: 1rem; border-top: 1px solid var(--gray-100); display: flex; flex-direction: column; gap: 0.25rem; }
.mobile-link {
  padding: 0.75rem 1rem; border-radius: var(--radius-sm);
  font-size: 0.9rem; color: var(--gray-700);
  background: none; border: none; text-align: left; cursor: pointer;
}
.mobile-link:hover { background: var(--gray-50); }
.danger-link { color: var(--danger); }

@media (max-width: 768px) {
  .navbar-nav, .navbar-actions { display: none; }
  .hamburger { display: flex; }
}
</style>
