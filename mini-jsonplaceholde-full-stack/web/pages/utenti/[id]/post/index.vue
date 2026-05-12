<template>
  <div>
    <div class="breadcrumb">
      <NuxtLink to="/utenti">Utenti</NuxtLink> → Post di {{ utente?.nome || '...' }}
    </div>

    <h2>📋 Post di {{ utente?.nome }}</h2>

    <div v-if="messaggio" class="toast-successo">✓ {{ messaggio }}</div>

    <details class="accordion-post">
      <summary>+ Nuovo Post</summary>
      <form @submit.prevent="inviaForm">
        <label>Titolo * <input v-model="form.titolo" required /></label>
        <label>Corpo * <textarea v-model="form.corpo" required></textarea></label>
        <button type="submit" class="btn-primario">Crea Post</button>
      </form>
    </details>

    <div v-if="caricamento">
      <table class="tabella-utenti">
        <tbody>
          <tr v-for="n in 4" :key="n" class="riga-scheletro">
            <td v-for="c in 5" :key="c"><div class="scheletro-blocco"></div></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="errore" class="errore">✕ {{ errore }}</div>

    <template v-else>
      <table class="tabella-utenti">
        <thead>
          <tr>
            <th>Autore</th><th>Titolo</th><th>Corpo</th><th>Creato il</th><th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(p, i) in post" :key="p.id">
            <tr
              class="riga-cliccabile riga-entrata"
              :style="{ animationDelay: `${i * 0.05}s` }"
              @click="toggleEspandi(p.id)"
            >
              <td><AvatarUtente v-if="utente" :utente="utente" /></td>
              <td class="td-nome">{{ p.titolo }}</td>
              <td class="td-corpo">{{ p.corpo }}</td>
              <td class="td-data td-data-multi">
                <span class="data-giorno">{{ formattaGiorno(p.creatoIl) }}</span>
                <span class="data-ora">{{ formattaOra(p.creatoIl) }}</span>
              </td>
              <td class="td-azioni" @click.stop>
                <div class="azioni-wrap">
                  <button class="btn-primario" title="Vedi commenti" @click="vediCommenti(p)">💬</button>
                  <button class="btn-pericolo" title="Elimina" @click="eliminaPost(p.id)">🗑️</button>
                </div>
              </td>
            </tr>
            <tr v-if="espansi.has(p.id)" class="riga-espansa">
              <td colspan="5">
                <div class="commento-espanso">
                  <span class="commento-espanso-label">📝 Testo completo</span>
                  <p>{{ p.corpo }}</p>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>

      <div v-if="meta && meta.pagine > 1" id="paginazione-post">
        <button :disabled="pagina <= 1" @click="cambiaPagina(pagina - 1)">← Precedente</button>
        <span>Pagina {{ pagina }} di {{ meta.pagine }}</span>
        <button :disabled="pagina >= meta.pagine" @click="cambiaPagina(pagina + 1)">Successiva →</button>
      </div>
    </template>

    <p v-if="!caricamento && !errore && post.length === 0" class="vuoto">Nessun post trovato</p>

    <ModalConferma ref="modal" />
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const { ottieniUtenti, ottieniPost, creaPost: creaPostApi, eliminaPost: eliminaPostApi } = useApi()

const userId = Number(route.params.id)
const utente = ref(null)
const post = ref([])
const meta = ref(null)
const pagina = ref(1)
const LIMITE = 3
const caricamento = ref(true)
const errore = ref(null)
const messaggio = ref(null)
const modal = ref(null)
const espansi = ref(new Set())

const form = reactive({ titolo: '', corpo: '' })

onMounted(async () => {
  try {
    const utenti = await ottieniUtenti()
    utente.value = utenti.find(u => u.id === userId) ?? null
    await caricaPost()
  } catch (e) {
    errore.value = e.message
    caricamento.value = false
  }
})

async function caricaPost() {
  caricamento.value = true
  errore.value = null
  try {
    const risultato = await ottieniPost(userId, pagina.value, LIMITE)
    post.value = risultato.dati ?? risultato
    meta.value = risultato.meta ?? null
  } catch (e) {
    errore.value = e.message
  } finally {
    caricamento.value = false
  }
}

async function cambiaPagina(n) {
  pagina.value = n
  await caricaPost()
}

function toggleEspandi(id) {
  const s = new Set(espansi.value)
  s.has(id) ? s.delete(id) : s.add(id)
  espansi.value = s
}

function vediCommenti(p) {
  router.push(`/utenti/${userId}/post/${p.id}/commenti`)
}

async function inviaForm() {
  errore.value = null
  try {
    await creaPostApi({ userId, titolo: form.titolo, corpo: form.corpo })
    form.titolo = ''; form.corpo = ''
    mostraMessaggio('Post creato con successo!')
    await caricaPost()
  } catch (e) { errore.value = e.message }
}

async function eliminaPost(id) {
  const ok = await modal.value.apri('Eliminare questo post?')
  if (!ok) return
  try {
    await eliminaPostApi(id)
    await caricaPost()
    mostraMessaggio('Post eliminato')
  } catch (e) { errore.value = e.message }
}

function mostraMessaggio(testo) {
  messaggio.value = testo
  setTimeout(() => messaggio.value = null, 3000)
}

function formattaGiorno(ts) {
  return new Date(ts).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
}
function formattaOra(ts) {
  return new Date(ts).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
}
</script>
