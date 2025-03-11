<template>
  <div class="system-message">
    <div class="message-card">
      <div class="message-header">
        <div class="header-left">
          <el-avatar :size="32" src="/placeholder.svg">系统</el-avatar>
          <span class="message-title">系统通知</span>
        </div>
        <span class="message-time">{{ formatDate(message.createTime) }}</span>
      </div>
      
      <div class="message-content">
        <p><strong>申诉类型：</strong>{{ message.appealTypeName }}</p>
        <p><strong>状态：</strong>{{ message.statusName }}</p>
        <p><strong>处理人：</strong>{{ message.managerName }}</p>
        <p><strong>申诉内容：</strong>{{ message.note }}</p>
        <p><strong>处理备注：</strong>{{ message.processNote }}</p>
      </div>

      <div class="message-footer">
        <el-button type="primary" size="small" @click="showDetails">查看详情</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatDate } from '@/utils/dateFormat';

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['showDetails']);

const showDetails = () => {
  emit('showDetails', props.message);
};
</script>

<style scoped>
.system-message {
  background-color: #fff;
  border-radius: 8px;
  transition: all 0.3s ease;
  margin-bottom: 16px;
}

.system-message:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.message-card {
  padding: 16px;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.message-title {
  font-weight: 500;
  color: #303133;
}

.message-time {
  font-size: 13px;
  color: #909399;
}

.message-content {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 12px;
}

.message-content p {
  margin: 8px 0;
}

.message-footer {
  display: flex;
  justify-content: flex-end;
}
</style>

