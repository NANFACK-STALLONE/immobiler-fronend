<template>
  <div class="page">
    <div class="container-sm">
      <div class="form-page-header">
        <RouterLink to="/dashboard" class="btn btn-secondary btn-sm">← Retour</RouterLink>
        <h1>{{ isEdit ? 'Modifier l\'annonce' : 'Publier une annonce' }}</h1>
      </div>

      <!-- Succès -->
      <div v-if="success" class="alert alert-success">
        ✅ {{ isEdit ? 'Annonce modifiée' : 'Annonce créée' }} avec succès !
        <RouterLink :to="`/properties/${savedId}`" class="btn btn-primary btn-sm ml-2">Voir l'annonce</RouterLink>
      </div>

      <!-- Erreur -->
      <div v-if="error" class="alert alert-error">⚠️ {{ error }}</div>

      <form v-if="!success" @submit.prevent="handleSubmit" class="card">
        <div class="card-header">{{ isEdit ? 'Modifier les informations' : 'Informations du bien' }}</div>
        <div class="card-body">

          <!-- Titre -->
          <div class="form-group">
            <label class="form-label">Titre de l'annonce *</label>
            <input v-model="form.title" type="text" class="form-control" placeholder="ex: Bel appartement 3 pièces vue mer" required />
          </div>

          <!-- Description -->
          <div class="form-group">
            <label class="form-label">Description *</label>
            <textarea v-model="form.description" class="form-control" rows="4" placeholder="Décrivez votre bien en détail..." required></textarea>
          </div>

          <!-- Type + Statut -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Type de bien *</label>
              <select v-model="form.propertyType" class="form-control" required>
                <option value="">Choisir...</option>
                <option value="APARTMENT">Appartement</option>
                <option value="HOUSE">Maison</option>
                <option value="VILLA">Villa</option>
                <option value="LAND">Terrain</option>
                <option value="OFFICE">Bureau</option>
                <option value="COMMERCIAL">Commercial</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Statut</label>
              <select v-model="form.status" class="form-control">
                <option value="AVAILABLE">Disponible</option>
                <option value="RESERVED">Réservée</option>
                <option value="SOLD">Vendue</option>
                <option value="RENT">À louer</option>
              </select>
            </div>
          </div>

          <!-- Prix + Surface -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Prix (FCFA) *</label>
              <input v-model.number="form.price" type="number" class="form-control" placeholder="150000000" min="0" required />
            </div>
            <div class="form-group">
              <label class="form-label">Surface (m²) *</label>
              <input v-model.number="form.area" type="number" class="form-control" placeholder="75" min="1" required />
            </div>
          </div>

          <!-- Chambres + Salles de bain -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Chambres *</label>
              <input v-model.number="form.bedrooms" type="number" class="form-control" placeholder="3" min="0" required />
            </div>
            <div class="form-group">
              <label class="form-label">Salles de bain *</label>
              <input v-model.number="form.bathrooms" type="number" class="form-control" placeholder="1" min="0" required />
            </div>
          </div>

          <!-- Ville + Quartier -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Ville *</label>
              <input v-model="form.city" type="text" class="form-control" placeholder="Dakar" required />
            </div>
            <div class="form-group">
              <label class="form-label">Quartier *</label>
              <input v-model="form.neighborhood" type="text" class="form-control" placeholder="Plateau" required />
            </div>
          </div>

          <!-- Adresse -->
          <div class="form-group">
            <label class="form-label">Adresse complète</label>
            <input v-model="form.address" type="text" class="form-control" placeholder="12 rue de la Paix" />
          </div>

          <!-- Équipements -->
          <div class="form-group">
            <label class="form-label">Équipements (séparés par virgule)</label>
            <input v-model="featuresInput" type="text" class="form-control" placeholder="Piscine, Parking, Gardiennage, Climatisation" />
            <div v-if="parsedFeatures.length" class="features-preview">
              <span v-for="f in parsedFeatures" :key="f" class="feature-tag">✓ {{ f }}</span>
            </div>
          </div>

          <!-- Publier immédiatement -->
          <div class="form-group">
            <label class="checkbox-label">
              <input v-model="form.isPublished" type="checkbox" class="checkbox" />
              Publier l'annonce immédiatement
            </label>
          </div>

        </div>
        <div class="card-footer flex-between">
          <RouterLink to="/dashboard" class="btn btn-secondary">Annuler</RouterLink>
          <button type="submit" class="btn btn-primary" :disabled="propertyStore.loading">
            <span v-if="propertyStore.loading" class="spinner-inline"></span>
            <span v-else>{{ isEdit ? '💾 Enregistrer' : '🚀 Publier l\'annonce' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePropertyStore } from '@/stores/property'

const route         = useRoute()
const router        = useRouter()
const propertyStore = usePropertyStore()

const isEdit  = computed(() => !!route.params.id && route.name === 'PropertyEdit')
const error   = ref(null)
const success = ref(false)
const savedId = ref(null)

const featuresInput  = ref('')
const parsedFeatures = computed(() =>
  featuresInput.value.split(',').map(s => s.trim()).filter(Boolean)
)

const form = reactive({
  title: '', description: '', price: null, area: null,
  bedrooms: null, bathrooms: null, propertyType: '',
  city: '', neighborhood: '', address: '',
  status: 'AVAILABLE', isPublished: true, features: []
})

// Charger les données si mode édition
onMounted(async () => {
  if (isEdit.value) {
    await propertyStore.fetchById(route.params.id)
    const p = propertyStore.currentProperty
    if (p) {
      Object.assign(form, {
        title: p.title, description: p.description,
        price: p.price, area: p.area,
        bedrooms: p.bedrooms, bathrooms: p.bathrooms,
        propertyType: p.propertyType,
        city: p.city, neighborhood: p.neighborhood,
        address: p.address || '',
        status: p.status, isPublished: p.isPublished,
      })
      featuresInput.value = (p.features || []).join(', ')
    }
  }
})

async function handleSubmit() {
  error.value = null
  const payload = { ...form, features: parsedFeatures.value }

  try {
    if (isEdit.value) {
      const updated = await propertyStore.update(route.params.id, payload)
      savedId.value = updated.id
    } else {
      const created = await propertyStore.create(payload)
      savedId.value = created.id
    }
    success.value = true
  } catch (err) {
    error.value = err.response?.data?.message
                || err.response?.data?.error
                || 'Erreur lors de la sauvegarde'
  }
}
</script>

<style scoped>
.form-page-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
.form-page-header h1 { font-size: 1.5rem; font-weight: 700; }
.features-preview { display: flex; flex-wrap: wrap; gap: 0.375rem; margin-top: 0.5rem; }
.feature-tag { padding: 0.2rem 0.6rem; background: var(--primary-light); color: var(--primary); border-radius: var(--radius-full); font-size: 0.78rem; }
.checkbox-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--gray-700); cursor: pointer; }
.checkbox { width: 16px; height: 16px; cursor: pointer; }
.spinner-inline { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
