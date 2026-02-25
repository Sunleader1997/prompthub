<script setup lang="ts">
import NavBar from '@/components/NavBar.vue';
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-black font-sans selection:bg-black selection:text-white">
    <NavBar />
    <main class="container mx-auto p-4 md:p-8">
      <router-view />
    </main>
  </div>
</template>
