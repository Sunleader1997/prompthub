<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <nav class="border-b-4 border-black bg-white p-4">
    <div class="container mx-auto flex items-center justify-between">
      <h1 
        class="cursor-pointer text-2xl font-black uppercase tracking-tighter"
        @click="router.push('/')"
      >
        Prompt Hub
      </h1>
      
      <button 
        class="bg-black px-6 py-2 text-white font-bold hover:bg-gray-800 transition-colors"
        @click="router.push('/publish')"
      >
        我要发布
      </button>
    </div>
  </nav>
</template>
