<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { Prompt } from '@/types';
import { Flame, Clock } from 'lucide-vue-next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('zh-cn');
dayjs.tz.setDefault('Asia/Shanghai');

const props = defineProps<{
  prompt: Prompt
}>();

const router = useRouter();

const timeAgo = computed(() => {
  return dayjs(props.prompt.updated_at).fromNow();
});

const navigateToDetail = () => {
  router.push(`/prompt/${props.prompt.id}`);
};
</script>

<template>
  <div 
    class="group relative flex flex-col bg-white border-2 border-black p-5 transition-all hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 cursor-pointer"
    @click="navigateToDetail"
  >
    <!-- Header -->
    <div class="flex justify-between items-start mb-3">
      <h3 class="text-xl font-bold truncate pr-4 group-hover:underline decoration-4 underline-offset-4">
        {{ prompt.title }}
      </h3>
      <div class="flex items-center text-red-600 font-bold bg-red-50 px-2 py-1 border border-red-200 text-xs">
        <Flame class="w-4 h-4 mr-1" />
        {{ prompt.popularity }}
      </div>
    </div>
    
    <!-- Description -->
    <p class="text-gray-600 mb-4 line-clamp-3 flex-grow text-sm">
      {{ prompt.description || prompt.content }}
    </p>
    
    <!-- Footer -->
    <div class="mt-auto">
      <!-- Tags -->
      <div class="flex flex-wrap gap-2 mb-3">
        <span 
          v-for="tag in prompt.tags.slice(0, 3)" 
          :key="tag"
          class="text-xs bg-gray-100 px-2 py-1 font-medium border border-gray-300"
        >
          #{{ tag }}
        </span>
        <span v-if="prompt.tags.length > 3" class="text-xs text-gray-400 self-center">...</span>
      </div>
      
      <!-- Time -->
      <div class="flex items-center text-xs text-gray-400 border-t border-dashed border-gray-300 pt-3">
        <Clock class="w-3 h-3 mr-1" />
        <span>{{ timeAgo }} 更新</span>
      </div>
    </div>
  </div>
</template>
