<template>
  <div v-if="visibile" class="modal-overlay" @click.self="annulla">
    <div class="modal-box">
      <p>{{ testo }}</p>
      <div class="modal-azioni">
        <button class="btn-pericolo" @click="conferma">Sì</button>
        <button class="btn-secondario" @click="annulla">No</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const visibile = ref(false)
const testo = ref('')
let resolve = null

function apri(messaggio) {
  testo.value = messaggio
  visibile.value = true
  return new Promise(r => resolve = r)
}
function conferma() { visibile.value = false; resolve(true) }
function annulla()  { visibile.value = false; resolve(false) }

defineExpose({ apri })
</script>
