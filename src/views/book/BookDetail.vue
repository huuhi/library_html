<template>
  <div v-if="book" class="book-detail-container">
    <!-- 图书详情部分 -->
    <el-row :gutter="20" v-loading="loading">
      <el-col :span="8">
        <el-image :src="book.image" fit="cover" class="book-image">
          <template #error>
            <div class="image-placeholder">
              <el-icon><Picture /></el-icon>
            </div>
          </template>
        </el-image>
      </el-col>
      <el-col :span="16">
        <h1>{{ book.name }}</h1>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="作者">{{ book.author }}</el-descriptions-item>
          <el-descriptions-item label="分类">{{ book.clazz }}</el-descriptions-item>
          <el-descriptions-item label="出版社">{{ book.publish }}</el-descriptions-item>
          <el-descriptions-item label="ISBN">{{ book.isbn }}</el-descriptions-item>
          <el-descriptions-item label="出版日期">{{ formatDate(book.publishDate) }}</el-descriptions-item>
          <el-descriptions-item label="位置">{{ book.address }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="book.status === '可借' ? 'success' : 'danger'">
              {{ book.status }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
        <div class="book-actions">
          <el-button type="primary" @click="borrowBook" :disabled="book.status !== '可借'">
            借书
          </el-button>
          <el-button @click="goBack">返回</el-button>
        </div>
      </el-col>
    </el-row>

    <!-- 简介部分 -->
    <el-row>
      <el-col :span="24">
        <h2>简介</h2>
        <p>{{ book.profile }}</p>
      </el-col>
    </el-row>

    <!-- 评论部分 -->
    <el-row>
      <el-col :span="24">
        <div class="comment-section">
          <h2>评论</h2>

          <!-- 发表评论 -->
          <div class="comment-form">
            <el-input
              v-model="newComment"
              type="textarea"
              :rows="3"
              placeholder="写下你的评论..."
              :maxlength="200"
              show-word-limit
            />
            <div class="form-actions">
              <el-button type="primary" @click="submitComment" :disabled="!newComment.trim()">
                发表评论
              </el-button>
            </div>
          </div>

          <!-- 评论列表 -->
          <div class="comment-list">
            <div v-for="comment in comments" :key="comment.id" class="comment-item">
              <div class="comment-header">
                <div class="user-info">
                  <el-avatar :size="40" :src="comment.image || '/placeholder.svg'" />
                  <span class="username">{{ comment.userName }}</span>
                </div>
                <div class="comment-actions">
                  <div class="comment-interactions">
                    <el-button
                      type="text"
                      @click="toggleLike(comment)"
                      :class="{ 'liked': comment.isLike }"
                    >
                      <el-icon><StarFilled /></el-icon>
                      <span>点赞 {{ comment.likeCount || 0 }}</span>
                    </el-button>
                  </div>
                  <el-dropdown v-if="currentUserId === comment.userId">
                    <el-button type="text">
                      <el-icon><MoreFilled /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="handleDelete(comment.id)">
                          删除评论
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>
              <div class="comment-content">{{ comment.content }}</div>
              <div class="comment-footer">
                <span class="comment-time">{{ formatDateTime(comment.createTime) }}</span>
              </div>
            </div>
            <div v-if="comments.length === 0" class="no-comments">
              暂无评论，来发表第一条评论吧！
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getBookByIdApi,lendBookApi} from '@/api/booksApi'
import { likeReviewApi, cancelLikeReviewApi, addReviewApi ,getReviewApi,deleteReviewApi} from '@/api/reviewApi';
import parseJwt from '@/utils/parseJwt'

const route = useRoute()
const router = useRouter()
const book = ref(null)
const comments = ref([])
const newComment = ref('')
const loading = ref(true)
const currentUserId = ref(null)
const lend = ref({ userId: '', bookId: '', status: 0 })

// 获取图书详情
const fetchBookDetails = async () => {
  try {
    const response = await getBookByIdApi(route.params.id)
    if (response.code === 1) {
      book.value = response.data
      loading.value = false
    } else {
      ElMessage.error('获取图书详情失败')
    }
  } catch (error) {
    console.error('Error:', error)
    ElMessage.error('获取图书详情时发生错误')
  }
}

// 获取评论列表
const fetchComments = async () => {
  try {
    const res = await getReviewApi(route.params.id, currentUserId.value,null)
    if (res.code === 1) {
      comments.value = res.data
      console.log("图片："+comments.value.image);
    } else {
      ElMessage.error('获取评论失败')
    }
  } catch (error) {
    console.error('Error:', error)
    ElMessage.error('获取评论失败')
  }
}

// 提交评论
const submitComment = async () => {
  try {
    const commentData = {
      userId: currentUserId.value,
      content: newComment.value,
      bookId: parseInt(route.params.id), // Ensure bookId is a number
      image: ''
    };

    const response = await addReviewApi(commentData);
    if (response.code === 1) {
      ElMessage.success('评论发表成功');
      newComment.value = '';
      await fetchComments();
    } else {
      ElMessage.error('评论发表失败');
    }
  } catch (error) {
    console.error('Error submitting comment:', error);
    ElMessage.error('评论发表时发生错误');
  }
};

// 处理点赞
const toggleLike = async (comment) => {
  try {
    const res = await (comment.isLike ? cancelLikeReviewApi : likeReviewApi)(comment.id, currentUserId.value);
    if (res.code === 1) {
      comment.isLike = !comment.isLike;
      await fetchComments(); // Refresh comments to get updated like count
      ElMessage.success(comment.isLike ? '点赞成功' : '已取消点赞');
    } else {
      ElMessage.error('操作失败');
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    ElMessage.error('操作时发生错误');
  }
};

// 删除评论
const handleDelete = async (commentId) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res = await deleteReviewApi(commentId);
    if (res.code) {
      ElMessage.success('删除成功')
      await fetchComments()
    } else {
      ElMessage.error('删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Error:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 借书
const borrowBook = async () => {
  try {
    const res = await lendBookApi(lend.value)
    if (res.code) {
      ElMessage.success('借书成功')
      fetchBookDetails()
    } else {
      ElMessage.error('借书失败：' + res.msg)
    }
  } catch (error) {
    console.error('Error:', error)
    ElMessage.error('借书失败')
  }
}

const goBack = () => {
  router.back()
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  })
}

onMounted(async () => {
  const jwt = localStorage.getItem('user')
  const claim = parseJwt(jwt)
  currentUserId.value = parseInt(claim.userId)
  lend.value.userId = currentUserId.value
  lend.value.bookId = parseInt(route.params.id)

  await fetchBookDetails()
  await fetchComments()
})
</script>

<style scoped>
.book-detail-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.book-image {
  width: 100%;
  max-height: 500px;
  object-fit: cover;
}

.image-placeholder {
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  color: #909399;
  font-size: 24px;
}

.comment-section {
  margin-top: 40px;
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.comment-form {
  margin-bottom: 32px;
}

.form-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.comment-item {
  padding: 16px;
  border-radius: 8px;
  background: #f8f9fa;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.username {
  font-weight: 500;
  color: #333;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-actions .el-button {
  display: flex;
  align-items: center;
  gap: 4px;
}

.comment-actions .liked {
  color: #ff4757;
}

.comment-content {
  margin: 12px 0;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

.comment-footer {
  margin-top: 8px;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.no-comments {
  text-align: center;
  padding: 32px;
  color: #909399;
  background: #f8f9fa;
  border-radius: 8px;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
}

.book-actions {
  margin-top: 20px;
  display: flex;
  gap: 12px;
}
</style>