<template>
  <div>
    <div class="breadcrumb">
      <NuxtLink to="/utenti">Utenti</NuxtLink> →
      <NuxtLink :to="`/utenti/${userId}/post`">Post di {{ nomeUtente }}</NuxtLink> →
      Commenti
    </div>

    <h2>💬 Commenti — {{ titoloPost }}</h2>

    <div v-if="messaggio" class="toast-successo">✓ {{ messaggio }}</div>

    <details class="accordion-commento">
      <summary>+ Nuovo Commento</summary>
      <form @submit.prevent="inviaForm">
        <label>Nome * <input v-model="form.nome" required /></label>
        <label>Email * <input v-model="form.email" type="email" required /></label>
        <label>Corpo * <textarea v-model="form.corpo" required></textarea></label>
        <button type="submit" class="btn-primario">Aggiungi Commento</button>
      </form>
    </details>

    <div v-if="caricamento">
      <table class="tabella-utenti">
        <tbody>
          <tr v-for="n in 4" :key="n" class="riga-scheletro">
            <td v-for="c in 6" :key="c"><div class="scheletro-blocco"></div></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="errore" class="errore">✕ {{ errore }}</div>

    <template v-else>
      <table class="tabella-utenti">
        <thead>
          <tr>
            <th>Autore</th><th>Nome</th><th>Email</th><th>Corpo</th><th>Creato il</th><th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(c, i) in commenti" :key="c.id">
            <tr
              class="riga-cliccabile riga-entrata"
              :style="{ animationDelay: `${i * 0.05}s` }"
              @click="toggleEspandi(c.id)"
            >
              <td><div class="avatar-iniziali" :style="{ '--av-bg': coloreAvatar(c.nome) }">{{ iniziali(c.nome) }}</div></td>
              <td class="td-nome">{{ c.nome }}</td>
              <td>{{ c.email }}</td>
              <td class="td-corpo">{{ c.corpo }}</td>
              <td class="td-data td-data-multi">
                <span class="data-giorno">{{ formattaGiorno(c.creatoIl) }}</span>
                <span class="data-ora">{{ formattaOra(c.creatoIl) }}</span>
              </td>
              <td class="td-azioni" @click.stop>
                <div class="azioni-wrap">
                  <button class="btn-pericolo" title="Elimina" @click="eliminaCommento(c.id)">🗑️</button>
                </div>
              </td>
            </tr>
            <tr v-if="espansi.has(c.id)" class="riga-espansa">
              <td colspan="6">
                <div class="commento-espanso">
                  <span class="commento-espanso-label">💬 Commento completo</span>
                  <p>{{ c.corpo }}</p>
                  <small>— {{ c.nome }} &lt;{{ c.email }}&gt;</small>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </template>

    <p v-if="!caricamento && !errore && commenti.length === 0" class="vuoto">Nessun commento trovato</p>

    <ModalConferma ref="modal" />
  </div>
</template>

<script setup>
const route = useRoute()
const { ottieniUtenti, ottieniPost, ottieniCommenti, creaCommento, eliminaCommento: eliminaCommentoApi } = useApi()

const userId = Number(route.params.id)
const postId = Number(route.params.postId)

const commenti = ref([])
const nomeUtente = ref('')
const titoloPost = ref('')
const caricamento = ref(true)
const errore = ref(null)
const messaggio = ref(null)
const modal = ref(null)
const espansi = ref(new Set())

const form = reactive({ nome: '', email: '', corpo: '' })

onMounted(async () => {
  try {
    const [utenti, risultatoPost] = await Promise.all([
      ottieniUtenti(),
      ottieniPost(userId)
    ])
    const utente = utenti.find(u => u.id === userId)
    nomeUtente.value = utente?.nome ?? ''
    const postList = risultatoPost.dati ?? risultatoPost
    const post = postList.find(p => p.id === postId)
    titoloPost.value = post?.titolo ?? `Post #${postId}`
    await caricaCommenti()
  } catch (e) {
    errore.value = e.message
    caricamento.value = false
  }
})

async function caricaCommenti() {
  caricamento.value = true
  errore.value = null
  try {
    commenti.value = await ottieniCommenti(postId)
  } catch (e) {
    errore.value = e.message
  } finally {
    caricamento.value = false
  }
}

function toggleEspandi(id) {
  const s = new Set(espansi.value)
  s.has(id) ? s.delete(id) : s.add(id)
  espansi.value = s
}

async function inviaForm() {
  errore.value = null
  try {
    await creaCommento({ postId, nome: form.nome, email: form.email, corpo: form.corpo })
    form.nome = ''; form.email = ''; form.corpo = ''
    mostraMessaggio('Commento aggiunto!')
    await caricaCommenti()
  } catch (e) { errore.value = e.message }
}

async function eliminaCommento(id) {
  const ok = await modal.value.apri('Eliminare questo commento?')
  if (!ok) return
  try {
    await eliminaCommentoApi(id)
    await caricaCommenti()
    mostraMessaggio('Commento eliminato')
  } catch (e) { errore.value = e.message }
}

function mostraMessaggio(testo) {
  messaggio.value = testo
  setTimeout(() => messaggio.value = null, 3000)
}

const PALETTE = ['#c41e3a','#7b2fbe','#d4890a','#059669','#2563eb','#db2777','#0891b2','#b45309']
function coloreAvatar(nome) { return PALETTE[nome.charCodeAt(0) % PALETTE.length] }
function iniziali(nome) {
  const p = nome.trim().split(' ')
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : nome.slice(0, 2).toUpperCase()
}
function formattaGiorno(ts) {
  return new Date(ts).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
}
function formattaOra(ts) {
  return new Date(ts).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
}
</script>
