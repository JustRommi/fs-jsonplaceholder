<template>
  <div>
    <h2>👤 Utenti</h2>

    <div v-if="messaggio" class="toast-successo">✓ {{ messaggio }}</div>

    <details ref="accordionRef" class="accordion-utente">
      <summary>{{ utenteInModifica ? '✏️ Modifica Utente' : '+ Nuovo Utente' }}</summary>
      <form @submit.prevent="inviaForm">
        <label>Nome * <input v-model="form.nome" required /></label>
        <label>Email * <input v-model="form.email" type="email" required /></label>
        <label>Città <input v-model="form.citta" /></label>
        <label>Codice Fiscale <input v-model="form.codiceFiscale" /></label>
        <label>Sesso
          <select v-model="form.sesso">
            <option value="">—</option>
            <option value="M">Maschio</option>
            <option value="F">Femmina</option>
            <option value="Altro">Altro</option>
          </select>
        </label>
        <label>Data Nascita <input v-model="form.dataNascita" type="date" /></label>
        <label>Telefono <input v-model="form.telefono" /></label>
        <label v-if="!utenteInModifica">Password <input v-model="form.password" type="password" /></label>
        <div class="azioni-wrap">
          <button type="submit" class="btn-primario">{{ utenteInModifica ? 'Salva Modifiche' : 'Crea Utente' }}</button>
          <button v-if="utenteInModifica" type="button" class="btn-secondario" @click="annullaModifica">Annulla</button>
        </div>
      </form>
    </details>

    <div v-if="caricamento">
      <table class="tabella-utenti">
        <tbody>
          <tr v-for="n in 4" :key="n" class="riga-scheletro">
            <td v-for="c in 10" :key="c"><div class="scheletro-blocco"></div></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="errore" class="errore">✕ {{ errore }}</div>

    <table v-else class="tabella-utenti">
      <thead>
        <tr>
          <th></th><th>Nome</th><th>Email</th><th>Città</th><th>CF</th>
          <th>Sesso</th><th>Nato il</th><th>Telefono</th><th>Creato il</th><th>Azioni</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(utente, i) in utenti"
          :key="utente.id"
          class="riga-entrata"
          :style="{ animationDelay: `${i * 0.05}s` }"
        >
          <td><AvatarUtente :utente="utente" /></td>
          <td class="td-nome">{{ utente.nome }}</td>
          <td>{{ utente.email }}</td>
          <td>{{ utente.citta || '—' }}</td>
          <td class="td-cf">{{ utente.codiceFiscale }}</td>
          <td>
            <span class="badge-sesso" :class="badgeClass(utente.sesso)" :data-tooltip="badgeDesc(utente.sesso)">
              {{ utente.sesso }}
            </span>
          </td>
          <td>{{ utente.dataNascita ? utente.dataNascita.slice(0, 10) : '—' }}</td>
          <td>{{ utente.telefono || '—' }}</td>
          <td class="td-data td-data-multi">
            <span class="data-giorno">{{ formattaGiorno(utente.creatoIl) }}</span>
            <span class="data-ora">{{ formattaOra(utente.creatoIl) }}</span>
          </td>
          <td class="td-azioni">
            <div class="azioni-wrap">
              <button class="btn-primario" title="Vedi post" @click="vediPost(utente)">📋</button>
              <button class="btn-secondario" title="Modifica" @click="avviaModifica(utente)">✏️</button>
              <button v-if="utenteLoggato?.ruolo === 'admin'" class="btn-pericolo" title="Elimina" @click="eliminaUtente(utente.id)">🗑️</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-if="!caricamento && !errore && utenti.length === 0" class="vuoto">Nessun utente trovato</p>

    <ModalConferma ref="modal" />
  </div>
</template>

<script setup>
const router = useRouter()
const { ottieniUtenti, creaUtente, modificaUtente, eliminaUtente: eliminaUtenteApi } = useApi()

const utenti = ref([])
const caricamento = ref(true)
const errore = ref(null)
const messaggio = ref(null)
const modal = ref(null)
const accordionRef = ref(null)
const utenteInModifica = ref(null)
const utenteLoggato = ref(null)

const form = reactive({
  nome: '', email: '', citta: '', codiceFiscale: '',
  sesso: '', dataNascita: '', telefono: '', password: ''
})

onMounted(async () => {
  utenteLoggato.value = JSON.parse(localStorage.getItem('utente') || 'null')
  try {
    utenti.value = await ottieniUtenti()
  } catch (e) {
    errore.value = e.message
  } finally {
    caricamento.value = false
  }
})

function vediPost(utente) { router.push(`/utenti/${utente.id}/post`) }

function avviaModifica(utente) {
  utenteInModifica.value = utente
  Object.assign(form, {
    nome: utente.nome || '', email: utente.email || '', citta: utente.citta || '',
    codiceFiscale: utente.codiceFiscale || '', sesso: utente.sesso || '',
    dataNascita: utente.dataNascita?.slice(0, 10) || '', telefono: utente.telefono || '', password: ''
  })
  accordionRef.value?.setAttribute('open', '')
  accordionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function annullaModifica() {
  utenteInModifica.value = null
  Object.assign(form, { nome: '', email: '', citta: '', codiceFiscale: '', sesso: '', dataNascita: '', telefono: '', password: '' })
}

async function inviaForm() {
  errore.value = null
  const regexCF = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/
  if (form.codiceFiscale && !regexCF.test(form.codiceFiscale.toUpperCase())) {
    errore.value = 'Codice fiscale non valido'; return
  }
  try {
    if (utenteInModifica.value) {
      await modificaUtente(utenteInModifica.value.id, { ...form })
      mostraMessaggio('Utente modificato con successo!')
      annullaModifica()
    } else {
      await creaUtente({ ...form })
      mostraMessaggio('Utente creato con successo!')
      annullaModifica()
    }
    utenti.value = await ottieniUtenti()
  } catch (e) { errore.value = e.message }
}

async function eliminaUtente(id) {
  const ok = await modal.value.apri('Eliminare questo utente?')
  if (!ok) return
  try {
    await eliminaUtenteApi(id)
    utenti.value = await ottieniUtenti()
    mostraMessaggio('Utente eliminato')
  } catch (e) { errore.value = e.message }
}

function mostraMessaggio(testo) {
  messaggio.value = testo
  setTimeout(() => messaggio.value = null, 3000)
}

const BADGE_CLASS = { M: 'badge-m', F: 'badge-f', Altro: 'badge-altro' }
const BADGE_DESC  = { M: 'Maschio', F: 'Femmina', Altro: 'Altro' }
const badgeClass = (s) => BADGE_CLASS[s] ?? 'badge-altro'
const badgeDesc  = (s) => BADGE_DESC[s] ?? s

function formattaGiorno(ts) {
  return new Date(ts).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
}
function formattaOra(ts) {
  return new Date(ts).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
}
</script>
