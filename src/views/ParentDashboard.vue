<script setup>
import { ref, onMounted } from 'vue';
import { callGoogleScript } from '../api';
import dayjs from 'dayjs'; // [cite: 94]

const props = defineProps({
  userData: Object,
});

const dashboardData = ref({
  children: [],
  allTasks: [],
  todayCompletedTasks: [],
});
const isLoading = ref(true);
const error = ref(null);
const selectedChildId = ref(null);
const notification = ref({ message: '', type: '' });

const fetchData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const data = await callGoogleScript('getParentData');
    dashboardData.value = data;
    if (data.children.length > 0) {
      selectedChildId.value = data.children[0].UserID;
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
};

const handleApproveTask = async (taskId) => {
  if (!selectedChildId.value) return;
  
  try {
    const result = await callGoogleScript('approveTask', {
      childId: selectedChildId.value,
      taskId: taskId,
    }); // [cite: 73]
    showNotification(result.message, 'success');
    fetchData(); // 成功後刷新資料以更新儀表板 [cite: 67, 68]
  } catch (err) {
    showNotification(err.message, 'error'); // 顯示如「今日次數已滿」的錯誤訊息 [cite: 74]
  }
};

const showNotification = (message, type) => {
    notification.value = { message, type };
    setTimeout(() => {
        notification.value = { message: '', type: '' };
    }, 3000);
};

onMounted(fetchData);
</script>

<template>
  <div>
    <div v-if="notification.message" :class="[notification.type === 'success' ? 'bg-green-500' : 'bg-red-500', 'text-white', 'text-center', 'p-2', 'rounded-md', 'mb-4', 'transition-all']">
        {{ notification.message }}
    </div>

    <div class="bg-white p-6 rounded-lg shadow mb-8">
      <h2 class="text-2xl font-bold text-slate-800 mb-4">儀表板 [cite: 66]</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="child in dashboardData.children" :key="child.UserID" class="bg-slate-100 p-4 rounded-lg">
          <h3 class="text-lg font-bold text-slate-700">{{ child.UserName }}</h3>
          <p class="text-3xl font-bold text-amber-500 mt-2">{{ child.Medals }} <span class="text-lg">個獎章</span></p> </div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow">
      <h2 class="text-2xl font-bold text-slate-800 mb-4">任務批准 [cite: 69]</h2>
      <div v-if="isLoading">載入中...</div>
      <div v-else-if="error" class="text-red-500">{{ error }}</div>
      <div v-else>
        <div class="mb-4">
          <label class="font-bold mr-2">選擇小朋友:</label> <select v-model="selectedChildId" class="p-2 border rounded">
            <option v-for="child in dashboardData.children" :key="child.UserID" :value="child.UserID">
              {{ child.UserName }}
            </option>
          </select>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="task in dashboardData.allTasks" :key="task.TaskID" class="border p-4 rounded-lg flex justify-between items-center bg-slate-50">
            <div>
              <p class="font-bold">{{ task.TaskName }}</p>
              <p class="text-sm text-gray-600">獎勵: {{ task.MedalValue }} 獎章 | 每日上限: {{ task.DailyLimit }} 次</p>
            </div>
            <button @click="handleApproveTask(task.TaskID)" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 rounded transition-colors whitespace-nowrap">
              完成一次 </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
