<template>
  <div class="message-center">
    <!-- Left Sidebar -->
    <div class="sidebar">
      <div class="sidebar-header">
        <h2>消息中心</h2>
      </div>
      <div class="sidebar-menu">
        <div 
          class="menu-item"
          :class="{ active: activeType === 'system' }"
          @click="activeType = 'system'"
        >
          <el-badge :value="unreadCounts.system" :hidden="!unreadCounts.system">
            <div class="menu-item-content">
              <el-icon><Bell /></el-icon>
              <span>系统通知</span>
            </div>
          </el-badge>
        </div>
        <div 
          class="menu-item"
          :class="{ active: activeType === 'likes' }"
          @click="activeType = 'likes'"
        >
          <el-badge :value="unreadCounts.likes" :hidden="!unreadCounts.likes">
            <div class="menu-item-content">
              <el-icon><Star /></el-icon>
              <span>收到的赞</span>
            </div>
          </el-badge>
        </div>
        <div 
          class="menu-item"
          :class="{ active: activeType === 'comments' }"
          @click="activeType = 'comments'"
        >
          <el-badge :value="unreadCounts.comments" :hidden="!unreadCounts.comments">
            <div class="menu-item-content">
              <el-icon><ChatDotRound /></el-icon>
              <span>评论回复</span>
            </div>
          </el-badge>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <div class="content-header">
        <h3>{{ contentTitle }}</h3>
        <el-button type="primary" link @click="markAllRead">
          全部已读
        </el-button>
      </div>

      <!-- Message List -->
      <div class="message-list" v-loading="loading">
        <TransitionGroup name="fade" tag="div">
          <template v-if="activeType === 'system'">
            <SystemMessage 
              v-for="message in messages" 
              :key="message.id" 
              :message="message"
              @showDetails="showSystemMessageDetails"
            />
          </template>

          <template v-else-if="activeType === 'likes'">
            <LikeMessage 
              v-for="message in messages" 
              :key="message.id" 
              :message="message"
              @viewOriginal="viewOriginalContent"
            />
          </template>

          <template v-else-if="activeType === 'comments'">
            <CommentMessage 
              v-for="message in messages" 
              :key="message.id" 
              :message="message"
              @viewOriginal="viewOriginalContent"
            />
          </template>
        </TransitionGroup>

        <div v-if="!loading && messages.length === 0" class="empty-state">
          <el-empty description="暂无消息" />
        </div>
      </div>
    </div>

    <!-- System Message Details Dialog -->
    <el-dialog
      v-model="systemMessageDetailsVisible"
      title="系统消息详情"
      width="50%"
    >
      <div v-if="selectedSystemMessage">
        <p><strong>申诉类型：</strong>{{ selectedSystemMessage.appealTypeName }}</p>
        <p><strong>状态：</strong>{{ selectedSystemMessage.statusName }}</p>
        <p><strong>处理人：</strong>{{ selectedSystemMessage.managerName }}</p>
        <p><strong>申诉内容：</strong>{{ selectedSystemMessage.note }}</p>
        <p><strong>处理备注：</strong>{{ selectedSystemMessage.processNote }}</p>
        <p><strong>创建时间：</strong>{{ formatDate(selectedSystemMessage.createTime) }}</p>
        <p><strong>处理时间：</strong>{{ formatDate(selectedSystemMessage.endTime) }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import parseJwt from '@/utils/parseJwt';
import { formatDate } from '@/utils/dateFormat';
import SystemMessage from './SystemNotifications.vue';
import LikeMessage from './LikeNotifications.vue';
import CommentMessage from './CommentNotifications.vue';
import { getLikeMessageList, getCommentMessageList, getNotReadReviewMessageCount, getNotReadLikeMessageCount } from '@/api/messageApi';
import { getUserMessages,getFeedbackDetail } from '@/api/questionApi';

const router = useRouter();
const userId = ref(null);
const activeType = ref('system');
const loading = ref(false);
const messages = ref([]);
const unreadCounts = ref({
  system: 0,
  likes: 0,
  comments: 0
});

const systemMessageDetailsVisible = ref(false);
const selectedSystemMessage = ref(null);

const contentTitle = computed(() => {
  const titles = {
    system: '系统通知',
    likes: '收到的赞',
    comments: '评论回复'
  };
  return titles[activeType.value];
});

const fetchMessages = async () => {
  loading.value = true;
  try {
    let response;
    switch (activeType.value) {
      case 'system':
        response = await getUserMessages(userId.value);
        break;
      case 'likes':
        response = await getLikeMessageList(userId.value);
        break;
      case 'comments':
        response = await getCommentMessageList(userId.value);
        break;
    }
    
    if (response.code) {
      messages.value = response.data;
    } else {
      ElMessage.error('获取消息失败');
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    ElMessage.error('获取消息时发生错误');
  } finally {
    loading.value = false;
  }
};

const fetchUnreadCounts = async () => {
  try {
    const likesResponse = await getNotReadLikeMessageCount(userId.value);
    if (likesResponse.data.code === 1) {
      unreadCounts.value.likes = likesResponse.data.data;
    }
    
    // Add similar calls for system and comment unread counts when APIs are available
  } catch (error) {
    console.error('Error fetching unread counts:', error);
  }
};

const showSystemMessageDetails = (message) => {
  selectedSystemMessage.value = message;
  systemMessageDetailsVisible.value = true;
};

const viewOriginalContent = ({ type, id }) => {
  if (type === 'post') {
    router.push(`/forum/post/${id}`);
  } else if (type === 'review') {
    console.log('View review:', id);
  }
};

const markAllRead = () => {
  ElMessage.success('已将全部消息标记为已读');
};

watch(activeType, () => {
  fetchMessages();
});

onMounted(() => {
  const jwt = localStorage.getItem('user');
  if (jwt) {
    const claim = parseJwt(jwt);
    userId.value = parseInt(claim.userId);
    fetchMessages();
    fetchUnreadCounts();
  }
});
</script>
  <style scoped>
  .message-center {
    display: flex;
    min-height: 100vh;
    background-color: #f6f7f8;
  }
  
  .sidebar {
    width: 240px;
    background-color: #fff;
    border-right: 1px solid #e4e7ed;
    padding: 20px 0;
  }
  
  .sidebar-header {
    padding: 0 20px 20px;
    border-bottom: 1px solid #e4e7ed;
  }
  
  .sidebar-header h2 {
    margin: 0;
    font-size: 18px;
    color: #303133;
  }
  
  .sidebar-menu {
    padding: 12px 0;
  }
  
  .menu-item {
    padding: 12px 20px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .menu-item:hover {
    background-color: #f5f7fa;
  }
  
  .menu-item.active {
    background-color: #ecf5ff;
    color: #409eff;
  }
  
  .menu-item-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .main-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
  }
  
  .content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 16px;
    background-color: #fff;
    border-radius: 8px;
  }
  
  .content-header h3 {
    margin: 0;
    font-size: 16px;
    color: #303133;
  }
  
  .message-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .empty-state {
    padding: 40px 0;
    background-color: #fff;
    border-radius: 8px;
  }
  </style>
  
  