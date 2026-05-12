<template>
  <div>
    <h2>💬 Commenti</h2>
    <div v-if="caricamento"><table class="tabella-utenti"><tbody>
      <tr v-for="n in 4" :key="n" class="riga-scheletro">
        <td v-for="c in 5" :key="c"><div class="scheletro-blocco"></div></td>
      </tr>
    </tbody></table></div>
    <div v-else-if="errore" class="errore">✕ {{ errore }}</div>
    <table v-else class="tabella-utenti">
      <thead><tr><th>Nome</th><th>Email</th><th>Corpo</th><th>Creato il</th></tr></thead>
      <tbody>
        <tr v-for="(c, i) in commenti" :key="c.id" class="riga-entrata" :style="{ animationDelay: `${i * 0.05}s` }">
          <td class="td-nome">{{ c.nome }}</td>
          <td>{{ c.email }}</td>
          <td class="td-corpo">{{ c.corpo }}</td>
          <td class="td-data td-data-multi">
            <span class="data-giorno">{{ formattaGiorno(c.creatoIl) }}</span>
            <span class="data-ora">{{ formattaOra(c.creatoIl) }}</span>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-if="!caricamento && !errore && commenti.length === 0" class="vuoto">Nessun commento trovato</p>
  </div>
</template>
<script setup>
const { ottieniCommenti } = useApi()
const commenti = ref([])
const caricamento = ref(true)
const errore = ref(null)
onMounted(async () => {
  try { commenti.value = await ottieniCommenti() }
  catch (e) { errore.value = e.message }
  finally { caricamento.value = false }
})
function formattaGiorno(ts) { return new Date(ts).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) }
function formattaOra(ts) { return new Date(ts).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) }
</script>
