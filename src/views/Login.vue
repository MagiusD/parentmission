<script setup>
import { ref } from 'vue';
import { callGoogleScript } from '../api';

const emit = defineEmits(['login-success']);
const userId = ref('');
const isLoading = ref(false);
const error = ref(null);

const handleLogin = async () => {
  if (!userId.value) {
    error.value = "請輸入您的代碼。"; // [cite: 63]
    return;
  }
  isLoading.value = true;
  error.value = null;
  try {
    const user = await callGoogleScript('login', { userId: userId.value });
    emit('login-success', user);
  } catch (err) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="max-w-md mx-auto mt-10 p-8 bg-white rounded-lg shadow-md">
    <h2 class="text-2xl font-bold text-center text-slate-800 mb-6">歡迎回來！</h2>
    <form @submit.prevent="handleLogin">
      <div class="mb-4">
        <label for="userId" class="block text-slate-700 text-sm font-bold mb-2">請輸入您的代碼</label> <input
          id="userId"
          type="text"
          v-model="userId"
          class="shadow appearance-none border rounded w-full py-3 px-4 text-slate-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="例如: 101 (家長), 201 (小朋友)"
        />
      </div>
      <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
        {{ error }}
      </div>
      <button
        type="submit"
        :disabled="isLoading"
        class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition-colors disabled:bg-blue-300"
      >
        {{ isLoading ? '登入中...' : '登入' }}
      </button>
    </form>
  </div>
</template>
