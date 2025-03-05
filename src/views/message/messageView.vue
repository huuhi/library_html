<template>
<div class="message-center">
        <!-- 消息列表 -->
        <div class="message-list">
        <div class="system-avatar">
        <el-avatar :size="48" src="/placeholder.svg">系统</el-avatar>
        <div class="avatar-name">系统通知</div>
        </div>
        <div 
        class="messages-container" 
        v-loading="loading"
        element-loading-text="Loading..."
        :element-loading-spinner="svg"
        element-loading-svg-view-box="-10, -10, 50, 50"
        element-loading-background="rgba(122, 122, 122, 0.8)"
        >
        <div

        v-for="message in messages"
        :key="message.id"
        class="message-item"
        :class="{ 'active': selectedMessage?.id === message.id }"
        @click="selectMessage(message)"
        >
        <div class="message-card">
                <div class="message-header">
                <div class="header-left">
                <span class="message-type">{{ message.appealTypeName }}</span>
                <el-tag 
                :type="message.status === 1 ? 'success' : 'warning'"
                size="small"
                >
                {{ message.statusName }}
                </el-tag>
                </div>
                <span class="message-time">{{ formatDate(message.createTime) }}</span>
                </div>
                
                <div class="message-content">
                <div class="content-item">
                <span class="label">问题描述：</span>
                <span class="value">{{ message.note }}</span>
                </div>
                
                <template v-if="message.status === 1">
                <div class="content-item">
                <span class="label">处理人：</span>
                <span class="value">{{ message.managerName }}</span>
                </div>
                <div class="content-item">
                <span class="label">处理说明：</span>
                <span class="value">{{ message.processNote }}</span>
                </div>
                <div class="content-item">
                <span class="label">处理时间：</span>
                <span class="value">{{ formatDate(message.endTime) }}</span>
                </div>
                </template>
                </div>

                <div class="message-footer">
                <div class="read-status" v-if="!message.isRead">
                <el-tag size="small" type="danger" effect="plain">未读</el-tag>
                </div>
                <el-button 
                type="primary" 
                link 
                class="detail-link"
                @click.stop="showDetailDialog(message)"
                >
                查看详情 <el-icon class="el-icon--right"><ArrowRight /></el-icon>
                </el-button>
                </div>
        </div>
        </div>
        </div>
        </div>

        <!-- Detail Dialog -->
        <el-dialog 
        v-model="detailDialogVisible" 
        :title="selectedMessage?.appealTypeName" 
        width="500px"
        destroy-on-close
        >
        <div class="detail-card">
        <div class="info-item">
        <div class="info-label">提交时间：</div>
        <div class="info-value">{{ formatDate(selectedMessage?.createTime) }}</div>
        </div>

        <div class="info-item">
        <div class="info-label">问题描述：</div>
        <div class="info-value">{{ selectedMessage?.note }}</div>
        </div>

        <template v-if="selectedMessage?.status === 1">
        <div class="info-item">
                <div class="info-label">处理时间：</div>
                <div class="info-value">{{ formatDate(selectedMessage?.endTime) }}</div>
        </div>

        <div class="info-item">
                <div class="info-label">处理人：</div>
                <div class="info-value">{{ selectedMessage?.managerName }}</div>
        </div>

        <div class="info-item">
                <div class="info-label">处理说明：</div>
                <div class="info-value">{{ selectedMessage?.processNote }}</div>
        </div>
        </template>
        </div>
        </el-dialog>
</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowRight } from '@element-plus/icons-vue'
import { getUserMessages,getFeedbackDetail } from '@/api/questionApi'
import parseJwt from '@/utils/parseJwt'

const messages = ref([])
const selectedMessage = ref(null)
const userId = ref(null)
const detailDialogVisible = ref(false)

const loading = ref(true)
const svg = `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `
const fetchMessages = async () => {
        try {
                const response = await getUserMessages(userId.value)
                if (response.code === 1) {
                messages.value = response.data
                        loading.value=false;
        }
        } catch (error) {
                ElMessage.error('获取消息列表失败')
        }
}

const selectMessage = async (message) => {
try {
        const response = await getFeedbackDetail(message.id)
        if (response.code === 1) {
        selectedMessage.value = response.data
        }
} catch (error) {
        ElMessage.error('获取消息详情失败')
}
}

const showDetailDialog = async (message) => {
await selectMessage(message)
detailDialogVisible.value = true
}

const formatDate = (dateString) => {
if (!dateString) return ''
const date = new Date(dateString)
return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
})
}

onMounted(() => {
const jwt = localStorage.getItem('user')
const claim = parseJwt(jwt)
userId.value = parseInt(claim.userId)
fetchMessages()
})
</script>

<style scoped>
.message-center {
padding: 20px;
background-color: #f6f7f8;
min-height: 100%;
}

.message-list {
background-color: #fff;
border-radius: 8px;
box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
padding: 20px;
}

.system-avatar {
display: flex;
flex-direction: column;
align-items: center;
margin-bottom: 24px;
}

.avatar-name {
margin-top: 8px;
font-size: 14px;
color: #18191c;
font-weight: 500;
}

.messages-container {
display: flex;
flex-direction: column;
gap: 16px;
}

.message-card {
background-color: #e3f6ff;
border-radius: 8px;
padding: 16px;
transition: all 0.3s ease;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.message-card:hover {
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
gap: 8px;
}

.message-type {
font-size: 15px;
font-weight: 500;
color: #18191c;
}

.message-time {
font-size: 13px;
color: #86909c;
}

.message-content {
padding: 12px 0;
border-top: 1px solid rgba(0, 0, 0, 0.06);
border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.content-item {
margin-bottom: 8px;
font-size: 14px;
line-height: 1.6;
}

.content-item:last-child {
margin-bottom: 0;
}

.label {
color: #4e5969;
margin-right: 8px;
}

.value {
color: #18191c;
}

.message-footer {
display: flex;
justify-content: space-between;
align-items: center;
margin-top: 12px;
}

.detail-link {
font-size: 14px;
display: flex;
align-items: center;
}

.detail-link:hover {
opacity: 0.8;
}

.read-status {
margin-right: 16px;
}

.el-icon--right {
margin-left: 4px;
}

.detail-card {
background-color: #f6f7f8;
border-radius: 8px;
padding: 16px;
}

.info-item {
display: flex;
margin-bottom: 12px;
}

.info-item:last-child {
margin-bottom: 0;
}

.info-label {
width: 80px;
color: #4e5969;
font-weight: 500;
}

.info-value {
flex: 1;
color: #18191c;
}
</style>

