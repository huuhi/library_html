<template>
  <div class="like-message" @click="$emit('click', message)">
    <div class="message-card">
      <div class="message-header">
        <div class="header-left">
          <el-avatar :size="32" :src="message.image"></el-avatar>
          <span class="message-title">{{ message.title }}</span>
        </div>
        <span class="message-time">{{ formatDate(message.time) }}</span>
      </div>
      
      <div class="message-content">
        <div class="liked-content">
          {{ message.content }}
        </div>
      </div>

      <div class="message-footer">
        <el-tag size="small" type="danger" effect="light">
          <el-icon><Star /></el-icon>
          <span>获赞</span>
        </el-tag>
        <el-button type="text" size="small" @click.stop="viewOriginal">
          查看原文
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Star } from '@element-plus/icons-vue';
import { formatDate } from '@/utils/dateFormat';

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['click', 'viewOriginal']);

const viewOriginal = () => {
  if (props.message.postId) {
    emit('viewOriginal', { type: 'post', id: props.message.postId });
  } else if (props.message.reviewId) {
    emit('viewOriginal', { type: 'review', id: props.message.reviewId });
  }
};
</script>

<style scoped>
.like-message {
  background-color: #fff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 16px;
}

.like-message:hover {
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

.liked-content {
  background-color: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  font-size: 14px;
}

.message-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-tag {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>

