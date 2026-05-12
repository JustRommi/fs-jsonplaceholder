<template>
  <div class="breadcrumb">
    <template v-for="(item, i) in items" :key="i">
      <NuxtLink v-if="item.to" :to="item.to">{{ item.label }}</NuxtLink>
      <span v-else>{{ item.label }}</span>
      <span v-if="i < items.length - 1"> → </span>
    </template>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, required: true }
})
</script>
