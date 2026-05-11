<template>
  <div>
    <nav class="navbar">
      <NuxtLink to="/utenti" class="nav-link">👤 Utenti</NuxtLink>
      <NuxtLink to="/login" class="nav-link">🔑 Login</NuxtLink>
      <span v-if="utente" class="stato-login autenticato">
        {{ utente.nome }}
        <span class="badge-ruolo">{{ utente.ruolo }}</span>
      </span>
      <button v-if="utente" class="btn-secondario" @click="logout">Logout</button>
    </nav>
    <main class="contenuto-principale">
      <slot />
    </main>
  </div>
</template>

<script setup>
const router = useRouter()
const { utente, eseguiLogout } = useAuth()

async function logout() {
  const { logout: logoutApi } = useApi()
  const refreshToken = localStorage.getItem('refreshToken')
  if (refreshToken) await logoutApi(refreshToken).catch(() => {})
  eseguiLogout()
  router.push('/utenti')
}
</script>
