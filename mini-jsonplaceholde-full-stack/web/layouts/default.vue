<template>
  <div>
    <header>
      <div class="contenitore">
        <h1>⚡ Mini JSONPlaceholder</h1>
        <p>Frontend per le nostre API REST</p>
      </div>
    </header>
    <div class="contenitore">
      <nav>
        <button :class="['nav-link', { attivo: tab === 'utenti' }]" @click="setTab('utenti')">Utenti</button>
        <button :class="['nav-link', { attivo: tab === 'post' }]" @click="setTab('post')">Post</button>
        <button :class="['nav-link', { attivo: tab === 'commenti' }]" @click="setTab('commenti')">Commenti</button>
        <NuxtLink to="/login" class="nav-link">Login</NuxtLink>
        <button v-if="utente" class="btn-logout-nav" @click="logout">Logout</button>
      </nav>
      <p class="stato-login" :class="{ autenticato: utente }">
        <template v-if="utente">Loggato come {{ utente.nome }}<span class="badge-ruolo">{{ utente.ruolo }}</span></template>
        <template v-else>Non sei autenticato</template>
      </p>
      <main><slot /></main>
    </div>
  </div>
</template>

<script setup>
const router = useRouter()
const route = useRoute()
const { utente, eseguiLogout } = useAuth()
const tab = useTab()

function setTab(t) {
  tab.value = t
  if (route.path !== '/') router.push('/')
}

async function logout() {
  const { logout: logoutApi } = useApi()
  const refreshToken = localStorage.getItem('refreshToken')
  if (refreshToken) await logoutApi(refreshToken).catch(() => {})
  eseguiLogout()
  tab.value = 'utenti'
  router.push('/')
}
</script>
