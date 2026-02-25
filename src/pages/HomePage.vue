<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { api } from '@/api/client';
import type { Prompt } from '@/types';
import PromptCard from '@/components/PromptCard.vue';
import { Search, Loader2 } from 'lucide-vue-next';

// State
const prompts = ref<Prompt[]>([]);
const loading = ref(false);
const searchQuery = ref('');
const sortOrder = ref('popularity'); // 'popularity' | 'newest'
const page = ref(1);
const totalPages = ref(1);

// Fetch Data
const fetchPrompts = async () => {
  loading.value = true;
  try {
    const res = await api.prompts.list({
      page: page.value,
      limit: 12,
      search: searchQuery.value,
      sort: sortOrder.value
    });
    prompts.value = res.data;
    totalPages.value = res.pagination.totalPages;
  } catch (error) {
    console.error('Failed to fetch prompts:', error);
  } finally {
    loading.value = false;
  }
};

// Handlers
const handleSearch = () => {
  page.value = 1;
  fetchPrompts();
};

const handleSortChange = (newSort: string) => {
  sortOrder.value = newSort;
  page.value = 1;
  fetchPrompts();
};

const handlePageChange = (newPage: number) => {
  if (newPage < 1 || newPage > totalPages.value) return;
  page.value = newPage;
  fetchPrompts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Initial Load
onMounted(() => {
  fetchPrompts();
});
</script>

<template>
  <div class="space-y-8">
    <!-- Hero / Search Section -->
    <section class="bg-black text-white p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(200,200,200,1)]">
      <h2 class="text-4xl md:text-5xl font-black mb-6 uppercase tracking-tighter">
        Discover <br/>
        <span class="text-blue-500">Powerful Prompts</span>
      </h2>
      
      <div class="flex flex-col md:flex-row gap-4">
        <div class="relative flex-grow">
          <input 
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            type="text" 
            placeholder="Search prompts, tags, description..." 
            class="w-full h-14 pl-12 pr-4 text-black text-lg font-bold border-4 border-white focus:outline-none focus:border-blue-500"
          />
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-black w-6 h-6" />
        </div>
        <button 
          @click="handleSearch"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 h-14 border-4 border-blue-600 hover:border-blue-700 transition-colors uppercase tracking-widest"
        >
          Search
        </button>
      </div>
    </section>
    
    <!-- Controls -->
    <div class="flex justify-between items-center border-b-2 border-black pb-4">
      <h3 class="text-2xl font-bold flex items-center gap-2">
        <span class="w-3 h-8 bg-black block"></span>
        Exploration
      </h3>
      
      <div class="flex gap-2">
        <button 
          @click="handleSortChange('popularity')"
          :class="[
            'px-4 py-2 font-bold border-2 border-black transition-all',
            sortOrder === 'popularity' ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'
          ]"
        >
          Hot
        </button>
        <button 
          @click="handleSortChange('newest')"
          :class="[
            'px-4 py-2 font-bold border-2 border-black transition-all',
            sortOrder === 'newest' ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'
          ]"
        >
          New
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-20">
      <Loader2 class="w-12 h-12 animate-spin text-black" />
    </div>

    <!-- Empty State -->
    <div v-else-if="prompts.length === 0" class="text-center py-20 bg-gray-100 border-2 border-dashed border-gray-300">
      <p class="text-xl text-gray-500 font-bold">No prompts found.</p>
      <button class="mt-4 text-blue-600 underline font-bold" @click="searchQuery = ''; fetchPrompts()">
        Clear Search
      </button>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <PromptCard 
        v-for="prompt in prompts" 
        :key="prompt.id" 
        :prompt="prompt" 
      />
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-12">
      <button 
        @click="handlePageChange(page - 1)"
        :disabled="page === 1"
        class="px-4 py-2 border-2 border-black font-bold disabled:opacity-30 hover:bg-gray-100"
      >
        Prev
      </button>
      
      <span class="px-4 py-2 font-mono font-bold self-center">
        {{ page }} / {{ totalPages }}
      </span>
      
      <button 
        @click="handlePageChange(page + 1)"
        :disabled="page === totalPages"
        class="px-4 py-2 border-2 border-black font-bold disabled:opacity-30 hover:bg-gray-100"
      >
        Next
      </button>
    </div>
  </div>
</template>
