<template>
  <div class="sezione-login">
    <h2>🔑 Login</h2>
    <div v-if="errore" class="errore">✕ {{ errore }}</div>
    <form @submit.prevent="inviaLogin">
      <label>Email * <input v-model="form.email" type="email" required /></label>
      <label>Password * <input v-model="form.password" type="password" required /></label>
      <button type="submit" class="btn-primario">Accedi</button>
    </form>
  </div>
</template>

<script setup>
const router = useRouter()
const { login } = useApi()
const { setUtente } = useAuth()

const form = reactive({ email: '', password: '' })
const errore = ref(null)

async function inviaLogin() {
  errore.value = null
  try {
    const { accessToken, refreshToken, utente } = await login(form.email, form.password)
    localStorage.setItem('token', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    setUtente(utente)
    router.push('/utenti')
  } catch (e) {
    errore.value = e.message
  }
}
</script>
