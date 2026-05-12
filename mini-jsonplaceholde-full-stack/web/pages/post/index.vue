<template>
  <div>
    <h2>📝 Post</h2>
    <div v-if="caricamento"><table class="tabella-utenti"><tbody>
      <tr v-for="n in 4" :key="n" class="riga-scheletro">
        <td v-for="c in 4" :key="c"><div class="scheletro-blocco"></div></td>
      </tr>
    </tbody></table></div>
    <div v-else-if="errore" class="errore">✕ {{ errore }}</div>
    <table v-else class="tabella-utenti">
      <thead><tr><th>Titolo</th><th>Corpo</th><th>Creato il</th></tr></thead>
      <tbody>
        <tr v-for="(p, i) in post" :key="p.id" class="riga-entrata" :style="{ animationDelay: `${i * 0.05}s` }">
          <td class="td-nome">{{ p.titolo }}</td>
          <td class="td-corpo">{{ p.corpo }}</td>
          <td class="td-data td-data-multi">
            <span class="data-giorno">{{ formattaGiorno(p.creatoIl) }}</span>
            <span class="data-ora">{{ formattaOra(p.creatoIl) }}</span>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-if="!caricamento && !errore && post.length === 0" class="vuoto">Nessun post trovato</p>
  </div>
</template>
<script setup>
const { ottieniPost } = useApi()
const post = ref([])
const caricamento = ref(true)
const errore = ref(null)
onMounted(async () => {
  try {
    const r = await ottieniPost()
    post.value = r.dati ?? r
  } catch (e) { errore.value = e.message }
  finally { caricamento.value = false }
})
function formattaGiorno(ts) { return new Date(ts).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) }
function formattaOra(ts) { return new Date(ts).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) }
</script>
