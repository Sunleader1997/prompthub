<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '@/api/client';
import type { Prompt, Comment } from '@/types';
import { Copy, Edit, Save, X, Flame, Clock, User, MessageSquare } from 'lucide-vue-next';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Shanghai');

const route = useRoute();
const router = useRouter();
const promptId = parseInt(route.params.id as string);

const prompt = ref<Prompt | null>(null);
const comments = ref<Comment[]>([]);
const loading = ref(true);
const isEditing = ref(false);
const editContent = ref('');
const commentContent = ref('');
const submittingComment = ref(false);
const saving = ref(false);
const copied = ref(false);

// Load Data
const loadData = async () => {
  loading.value = true;
  try {
    const [promptRes, commentsRes] = await Promise.all([
      api.prompts.get(promptId),
      api.comments.list(promptId)
    ]);
    prompt.value = promptRes;
    comments.value = commentsRes;
    editContent.value = promptRes.content;
  } catch (error) {
    console.error(error);
    // router.push('/'); // Optional: redirect on error
  } finally {
    loading.value = false;
  }
};

// Actions
const handleCopy = async () => {
  if (!prompt.value) return;
  
  try {
    await navigator.clipboard.writeText(prompt.value.content);
    await api.prompts.copy(promptId);
    prompt.value.popularity++;
    copied.value = true;
    setTimeout(() => copied.value = false, 2000);
  } catch (error) {
    console.error('Copy failed', error);
  }
};

const toggleEdit = () => {
  if (isEditing.value) {
    // Cancel edit
    isEditing.value = false;
    editContent.value = prompt.value?.content || '';
  } else {
    // Start edit
    isEditing.value = true;
    editContent.value = prompt.value?.content || '';
  }
};

const saveEdit = async () => {
  if (!editContent.value) return;
  saving.value = true;
  try {
    await api.prompts.update(promptId, { content: editContent.value });
    // Refresh data to get updated time and system log
    await loadData();
    isEditing.value = false;
  } catch (error) {
    console.error('Update failed', error);
  } finally {
    saving.value = false;
  }
};

const postComment = async () => {
  if (!commentContent.value.trim()) return;
  submittingComment.value = true;
  try {
    await api.comments.create(promptId, { content: commentContent.value });
    commentContent.value = '';
    // Refresh comments
    comments.value = await api.comments.list(promptId);
  } catch (error) {
    console.error('Post comment failed', error);
  } finally {
    submittingComment.value = false;
  }
};

onMounted(() => {
  loadData();
});

const formattedTime = (time: string) => dayjs(time).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss');
</script>

<template>
  <div v-if="loading" class="flex justify-center py-20">
    <div class="animate-spin w-12 h-12 border-4 border-black border-t-transparent rounded-full"></div>
  </div>
  
  <div v-else-if="prompt" class="max-w-4xl mx-auto space-y-8">
    <!-- Header Card -->
    <div class="bg-white border-2 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div class="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <h1 class="text-3xl md:text-4xl font-black">{{ prompt.title }}</h1>
        <div class="flex items-center gap-2 self-start">
          <span class="bg-red-50 text-red-600 border border-red-200 px-3 py-1 font-bold flex items-center">
            <Flame class="w-4 h-4 mr-1" /> {{ prompt.popularity }}
          </span>
        </div>
      </div>
      
      <div class="flex flex-wrap gap-4 text-sm text-gray-500 mb-6 border-b border-gray-200 pb-6">
        <div class="flex items-center">
          <User class="w-4 h-4 mr-1" />
          发布者 IP: {{ prompt.creator_ip }}
        </div>
        <div class="flex items-center">
          <Clock class="w-4 h-4 mr-1" />
          最后修改: {{ formattedTime(prompt.updated_at) }}
        </div>
      </div>
      
      <p class="text-lg text-gray-700 mb-4">{{ prompt.description }}</p>
      
      <div class="flex flex-wrap gap-2">
        <span 
          v-for="tag in prompt.tags" 
          :key="tag"
          class="bg-gray-100 px-3 py-1 border border-gray-300 font-medium"
        >
          #{{ tag }}
        </span>
      </div>
    </div>
    
    <!-- Content Section -->
    <div class="bg-white border-2 border-black p-6 md:p-8 relative">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-black flex items-center">
          <span class="w-2 h-6 bg-black mr-2"></span>
          Prompt Content
        </h2>
        
        <div class="flex gap-2">
          <button 
            v-if="!isEditing"
            @click="handleCopy"
            class="flex items-center px-4 py-2 bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
          >
            <Copy class="w-4 h-4 mr-2" />
            {{ copied ? 'Copied!' : 'Copy' }}
          </button>
          
          <button 
            v-if="!isEditing"
            @click="toggleEdit"
            class="flex items-center px-4 py-2 bg-gray-100 text-black border-2 border-black font-bold hover:bg-gray-200 transition-colors"
          >
            <Edit class="w-4 h-4 mr-2" />
            Edit
          </button>
          
          <template v-else>
            <button 
              @click="toggleEdit"
              class="flex items-center px-4 py-2 bg-gray-100 text-black border-2 border-black font-bold hover:bg-gray-200"
              :disabled="saving"
            >
              <X class="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button 
              @click="saveEdit"
              class="flex items-center px-4 py-2 bg-black text-white font-bold hover:bg-gray-800"
              :disabled="saving"
            >
              <Save class="w-4 h-4 mr-2" />
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </template>
        </div>
      </div>
      
      <div v-if="isEditing">
        <textarea 
          v-model="editContent"
          class="w-full h-96 p-4 font-mono text-sm border-2 border-black focus:outline-none focus:ring-4 focus:ring-black/20"
        ></textarea>
      </div>
      <div v-else class="bg-gray-50 p-6 border border-gray-200 font-mono text-sm whitespace-pre-wrap leading-relaxed select-text">
        {{ prompt.content }}
      </div>
    </div>
    
    <!-- Comments Section -->
    <div class="bg-white border-2 border-black p-6 md:p-8">
      <h2 class="text-2xl font-black mb-6 flex items-center">
        <MessageSquare class="w-6 h-6 mr-2" />
        Comments & History
      </h2>
      
      <!-- Comment Form -->
      <div class="mb-8">
        <textarea 
          v-model="commentContent"
          class="w-full border-2 border-black p-3 h-24 focus:outline-none focus:ring-4 focus:ring-black/20 mb-2"
          placeholder="Leave an anonymous comment..."
        ></textarea>
        <div class="flex justify-end">
          <button 
            @click="postComment"
            :disabled="submittingComment || !commentContent.trim()"
            class="bg-black text-white px-6 py-2 font-bold hover:bg-gray-800 disabled:opacity-50"
          >
            Post Comment
          </button>
        </div>
      </div>
      
      <!-- Comment List -->
      <div class="space-y-4">
        <div 
          v-for="comment in comments" 
          :key="comment.id"
          :class="[
            'p-4 border-l-4',
            comment.type === 'system' ? 'bg-gray-50 border-gray-400' : 'bg-white border-black border shadow-sm'
          ]"
        >
          <div class="flex justify-between items-center mb-2 text-xs text-gray-500">
            <span class="font-bold text-black">
              {{ comment.type === 'system' ? 'System Log' : `User (${comment.user_ip})` }}
            </span>
            <span>{{ formattedTime(comment.created_at) }}</span>
          </div>
          <p class="text-sm">{{ comment.content }}</p>
        </div>
        
        <div v-if="comments.length === 0" class="text-center text-gray-500 py-8">
          No comments yet. Be the first to share your thoughts!
        </div>
      </div>
    </div>
  </div>
  
  <div v-else class="text-center py-20">
    <h2 class="text-2xl font-bold">Prompt not found</h2>
    <button @click="router.push('/')" class="mt-4 text-blue-600 underline">Return Home</button>
  </div>
</template>
