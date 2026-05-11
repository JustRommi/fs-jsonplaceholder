<template>
  <img v-if="src" :src="src" :alt="utente.nome" class="avatar-img" :class="{ personaggio: isPersonaggio }" />
  <div v-else class="avatar-iniziali" :style="{ '--av-bg': colore }">{{ iniziali }}</div>
</template>

<script setup>
const PERSONAGGI = {
  mario: 'img/characters/mario.png',
  luigi: 'img/characters/luigi.png',
  peach: 'img/characters/peach.png',
  bowser: 'img/characters/bowser.png',
  yoshi: 'img/characters/yoshi.png',
  toad: 'img/characters/toad.png',
  wario: 'img/characters/wario.png',
  waluigi: 'img/characters/waluigi.png',
}
const PALETTE = ['#c41e3a','#7b2fbe','#d4890a','#059669','#2563eb','#db2777','#0891b2','#b45309']

const props = defineProps({ utente: { type: Object, required: true } })

const primoNome = computed(() => props.utente.nome.trim().split(' ')[0].toLowerCase())
const isPersonaggio = computed(() => !!PERSONAGGI[primoNome.value])
const src = computed(() => {
  if (props.utente.avatar) return props.utente.avatar
  return PERSONAGGI[primoNome.value] ?? null
})
const parti = computed(() => props.utente.nome.trim().split(' '))
const iniziali = computed(() =>
  parti.value.length >= 2
    ? (parti.value[0][0] + parti.value[1][0]).toUpperCase()
    : props.utente.nome.slice(0, 2).toUpperCase()
)
const colore = computed(() => PALETTE[props.utente.nome.charCodeAt(0) % PALETTE.length])
</script>
