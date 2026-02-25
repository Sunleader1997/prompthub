<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '@/api/client';

const router = useRouter();
const loading = ref(false);
const error = ref('');

const form = ref({
  title: '',
  description: '',
  content: '',
  tags: '', // Comma separated string for input
});

const handleSubmit = async () => {
  if (!form.value.title || !form.value.content) {
    error.value = '请填写标题和提示词内容';
    return;
  }
  
  loading.value = true;
  error.value = '';
  
  try {
    const tagsArray = form.value.tags
      .split(/[,，]/) // Split by comma (en or cn)
      .map(t => t.trim())
      .filter(t => t);
      
    const res = await api.prompts.create({
      title: form.value.title,
      description: form.value.description,
      content: form.value.content,
      tags: tagsArray,
    });
    
    router.push(`/prompt/${res.id}`);
  } catch (err: any) {
    error.value = err.message || '发布失败，请重试';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <h2 class="text-3xl font-black mb-8 border-l-8 border-black pl-4">发布新提示词</h2>
    
    <div class="bg-white border-2 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div v-if="error" class="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Title -->
        <div>
          <label class="block text-lg font-bold mb-2">提示词名称 *</label>
          <input 
            v-model="form.title"
            type="text" 
            class="w-full border-2 border-black p-3 focus:outline-none focus:ring-4 focus:ring-black/20"
            placeholder="给你的提示词起个响亮的名字"
          />
        </div>
        
        <!-- Description -->
        <div>
          <label class="block text-lg font-bold mb-2">简介</label>
          <textarea 
            v-model="form.description"
            class="w-full border-2 border-black p-3 h-24 focus:outline-none focus:ring-4 focus:ring-black/20"
            placeholder="简要描述这个提示词的用途"
          ></textarea>
        </div>
        
        <!-- Tags -->
        <div>
          <label class="block text-lg font-bold mb-2">标签</label>
          <input 
            v-model="form.tags"
            type="text" 
            class="w-full border-2 border-black p-3 focus:outline-none focus:ring-4 focus:ring-black/20"
            placeholder="使用逗号分隔，例如：写作, 代码, 效率"
          />
        </div>
        
        <!-- Content -->
        <div>
          <label class="block text-lg font-bold mb-2">提示词内容 *</label>
          <textarea 
            v-model="form.content"
            class="w-full border-2 border-black p-3 h-64 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-black/20"
            placeholder="在此输入完整的提示词内容..."
          ></textarea>
        </div>
        
        <!-- Submit -->
        <div class="pt-4">
          <button 
            type="submit" 
            class="w-full bg-black text-white text-xl font-bold py-4 hover:bg-gray-800 transition-colors disabled:opacity-50"
            :disabled="loading"
          >
            {{ loading ? '发布中...' : '确认发布' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
