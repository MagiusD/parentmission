<script setup>
import { ref, onMounted } from 'vue';
import { callGoogleScript } from '../api';

const props = defineProps({
  userData: Object,
});

const dashboardData = ref({
  userName: '',
  totalMedals: 0,
  rewards: [],
  taskHistory: [],
});
const isLoading = ref(true);
const error = ref(null);
const notification = ref({ message: '', type: '' });

const fetchData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const data = await callGoogleScript('getChildData', { userId: props.userData.UserID });
    dashboardData.value = data;
  } catch (err) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
};

const handleRedeem = async (reward) => {
  // 點擊「我要兌換」按鈕後，前端發送請求給 Google Apps Script [cite: 87]
  try {
    const result = await callGoogleScript('redeemReward', {
      childId: props.userData.UserID,
      rewardId: reward.RewardID,
    });
    showNotification(result.message, 'success');
    fetchData(); // 成功後刷新資料以更新獎章數和按鈕狀態 [cite: 81]
  } catch (err) {
    showNotification(err.message, 'error'); // 顯示如「獎章不夠喔！」的錯誤訊息 [cite: 89]
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

    <div class="bg-white p-6 rounded-lg shadow mb-8 text-center">
      <h2 class="text-3xl font-bold text-slate-800">
        {{ dashboardData.userName }}，你現在有
        <span class="text-amber-500">{{ dashboardData.totalMedals }}</span> 個獎章！
      </h2>
    </div>

    <div class="bg-white p-6 rounded-lg shadow">
      <h2 class="text-2xl font-bold text-slate-800 mb-4">獎品商店 [cite: 83]</h2>
      <div v-if="isLoading">載入中...</div>
      <div v-else-if="error" class="text-red-500">{{ error }}</div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="reward in dashboardData.rewards" :key="reward.RewardID" class="border p-4 rounded-lg flex flex-col justify-between bg-slate-50">
          <div>
            <p class="font-bold text-lg">{{ reward.RewardName }}</p>
            <p class="text-amber-600 font-bold my-2">需要: {{ reward.Cost }} 獎章</p>
          </div>
          <button
            @click="handleRedeem(reward)"
            :disabled="dashboardData.totalMedals < reward.Cost"
            class="w-full mt-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {{ dashboardData.totalMedals < reward.Cost ? '獎章不足' : '我要兌換' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
