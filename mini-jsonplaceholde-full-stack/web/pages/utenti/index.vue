<template>
  <div>
    <h2>👤 Utenti</h2>

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
          <th></th>
          <th>Nome</th>
          <th>Email</th>
          <th>Città</th>
          <th>CF</th>
          <th>Sesso</th>
          <th>Nato il</th>
          <th>Telefono</th>
          <th>Creato il</th>
          <th>Azioni</th>
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
            <span
              class="badge-sesso"
              :class="badgeClass(utente.sesso)"
              :data-tooltip="badgeDesc(utente.sesso)"
            >{{ utente.sesso }}</span>
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
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-if="!caricamento && !errore && utenti.length === 0" class="vuoto">Nessun utente trovato</p>
  </div>
</template>

<script setup>
const router = useRouter()
const { ottieniUtenti } = useApi()

const utenti = ref([])
const caricamento = ref(true)
const errore = ref(null)

onMounted(async () => {
  try {
    utenti.value = await ottieniUtenti()
  } catch (e) {
    errore.value = e.message
  } finally {
    caricamento.value = false
  }
})

function vediPost(utente) {
  router.push(`/utenti/${utente.id}/post`)
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
