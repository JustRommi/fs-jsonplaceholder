<template>
  <div>
    <NuxtPage v-if="isDrillDown" />
    <template v-else>
      <NuxtPage v-if="tab === 'utenti'" />
      <SezionePost v-else-if="tab === 'post'" />
      <SezioneCommenti v-else-if="tab === 'commenti'" />
    </template>
  </div>
</template>

<script setup>
const route = useRoute()
const tab = useTab()
const isDrillDown = computed(() => route.path !== '/' && route.path !== '/utenti')
</script>
