<script setup>
import { ref, computed, watch } from 'vue';
import Login from './views/Login.vue';
import ParentDashboard from './views/ParentDashboard.vue';
import ChildDashboard from './views/ChildDashboard.vue';

const user = ref(null);
const error = ref(null);

// 登入成功後觸發
const handleLoginSuccess = (loggedInUser) => {
  user.value = loggedInUser;
  error.value = null;
};

// 登出
const handleLogout = () => {
  user.value = null;
  localStorage.removeItem('medals-user');
};

// 根據登入狀態決定要顯示哪個元件 [cite: 64]
const currentView = computed(() => {
  if (user.value) {
    if (user.value.Role === 'parent') {
      return ParentDashboard;
    } else if (user.value.Role === 'child') {
      return ChildDashboard;
    }
  }
  return Login;
});

// 在元件掛載時，嘗試從 localStorage 讀取使用者資訊以保持登入狀態
onMounted(() => {
  const savedUser = localStorage.getItem('medals-user');
  if (savedUser) {
    user.value = JSON.parse(savedUser);
  }
});

// 當 user 資訊改變時，將其存入 localStorage
watch(user, (newUser) => {
  if (newUser) {
    localStorage.setItem('medals-user', JSON.stringify(newUser));
  } else {
    localStorage.removeItem('medals-user');
  }
}, { deep: true });
</script>

<template>
  <div class="bg-slate-50 min-h-screen font-sans">
    <header class="bg-white shadow-sm sticky top-0 z-10">
      <nav class="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 class="text-xl font-bold text-slate-700">親子任務獎章系統 [cite: 1]</h1>
        <button v-if="user" @click="handleLogout" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors">
          登出
        </button>
      </nav>
    </header>
    
    <main class="container mx-auto p-4">
       <component :is="currentView" :user-data="user" @login-success="handleLoginSuccess" />
    </main>
  </div>
</template>
