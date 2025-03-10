<template>
    <div class="post-detail-container" v-loading="loading">
      <div class="back-button">
        <el-button @click="goBack" icon="ArrowLeft">返回</el-button>
      </div>
      
      <el-card v-if="post" class="post-detail-card">
        <div class="post-header">
          <div class="user-info">
            <el-avatar :size="50" :src="post.userImage || '/placeholder.svg'"></el-avatar>
            <div class="user-details">
              <div class="username">{{ post.userName }}</div>
              <div class="post-time">{{ formatDate(post.updatedTime) }}</div>
            </div>
          </div>
          
          <div class="post-actions" v-if="post.isMy">
            <el-button type="primary" plain size="small" @click="editPost">编辑</el-button>
            <el-button type="danger" plain size="small" @click="confirmDelete">删除</el-button>
          </div>
        </div>
        
        <h1 class="post-title">{{ post.title }}</h1>
        
        <div class="post-tags">
          <el-tag 
            v-for="tag in post.tags" 
            :key="tag.name"
            :color="tag.themeColor"
            effect="plain"
            class="post-tag"
          >
            {{ tag.name }}
          </el-tag>
        </div>
        
        <div class="post-content">{{ post.content }}</div>
        
        <div v-if="post.image" class="post-image">
          <el-image :src="post.image" fit="cover" :preview-src-list="[post.image]"></el-image>
        </div>
        
        <div class="post-stats">
          <div class="like-button" @click="toggleLike">
            <el-icon :class="{ 'liked': isLiked }"><Star /></el-icon>
            <span>{{ post.likeCount || 0 }}</span>
          </div>
        </div>
      </el-card>
      
      <!-- Comments Section -->
      <div class="comments-section">
        <h2 class="section-title">评论 ({{ comments.length }})</h2>
        
        <!-- Comment Form -->
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
        
        <!-- Comments List -->
        <div class="comments-list">
          <div v-if="comments.length === 0" class="no-comments">
            暂无评论，来发表第一条评论吧！
          </div>
          
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
                    @click="toggleCommentLike(comment)"
                    :class="{ 'liked': comment.isLike }"
                  >
                    <el-icon><Star /></el-icon>
                    <span>点赞 {{ comment.likeCount || 0 }}</span>
                  </el-button>
                </div>
                <el-dropdown v-if="currentUserId === comment.userId">
                  <el-button type="text">
                    <el-icon><MoreFilled /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="deleteComment(comment.id)">
                        删除评论
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
            <div class="comment-content">{{ comment.content }}</div>
            <div class="comment-footer">
              <span class="comment-time">{{ formatDate(comment.createTime) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import { getPostDetailApi, deletePostApi, likePostApi, cancelLikePostApi} from '@/api/postApi';
  import { addReviewApi, likeReviewApi, cancelLikeReviewApi, deleteReviewApi,getReviewApi } from '@/api/reviewApi';
  import parseJwt from '@/utils/parseJwt';
  
  const route = useRoute();
  const router = useRouter();
  const postId = ref(parseInt(route.params.id));
  const post = ref(null);
  const comments = ref([]);
  const loading = ref(true);
  const newComment = ref('');
  const currentUserId = ref(null);
  const isLiked = ref(false);
  
  const fetchPostDetail = async () => {
    try {
      const response = await getPostDetailApi(postId.value);
      if (response.code === 1) {
        post.value = response.data;
        isLiked.value = post.value.isLike;
      } else {
        ElMessage.error('获取帖子详情失败');
      }
    } catch (error) {
      console.error('Error fetching post details:', error);
      ElMessage.error('获取帖子详情时发生错误');
    }
  };
  
  const fetchComments = async () => {
    try {
      const response = await getReviewApi(null,currentUserId.value,postId.value);
      if (response.code === 1) {
        comments.value = response.data;
      } else {
        ElMessage.error('获取评论失败');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      ElMessage.error('获取评论失败');
    } finally {
      loading.value = false;
    }
  };
  
  const goBack = () => {
    router.back();
  };
  
  const editPost = () => {
    router.push(`/forum/edit/${postId.value}`);
  };
  
  const confirmDelete = async () => {
    try {
      await ElMessageBox.confirm('确定要删除这篇帖子吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      });
      
      const response = await deletePostApi(postId.value);
      if (response.code === 1) {
        ElMessage.success('删除帖子成功');
        router.push('/forum');
      } else {
        ElMessage.error('删除帖子失败');
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('Error deleting post:', error);
        ElMessage.error('删除帖子时发生错误');
      }
    }
  };
  
  const toggleLike = async () => {
    try {
      if (isLiked.value) {
        const response = await cancelLikePostApi(postId.value, currentUserId.value);
        if (response.code === 1) {
          isLiked.value = false;
          post.value.likeCount--;
          ElMessage.success('取消点赞成功');
        } else {
          ElMessage.error('取消点赞失败');
        }
      } else {
        const response = await likePostApi(postId.value, currentUserId.value);
        if (response.code === 1) {
          isLiked.value = true;
          post.value.likeCount++;
          ElMessage.success('点赞成功');
        } else {
          ElMessage.error('点赞失败');
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      ElMessage.error('操作失败');
    }
  };
  
  const submitComment = async () => {
    if (!newComment.value.trim()) return;
    
    try {
      const commentData = {
        userId: currentUserId.value,
        content: newComment.value,
        postId: postId.value,
        bookId: null,
        image: ''
      };
      
      const response = await addReviewApi(commentData);
      if (response.code === 1) {
        ElMessage.success('评论发表成功');
        newComment.value = '';
        await fetchComments();
        // Update comment count in post
        post.value.reviewCount = (post.value.reviewCount || 0) + 1;
      } else {
        ElMessage.error('评论发表失败');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      ElMessage.error('评论发表时发生错误');
    }
  };
  
  const toggleCommentLike = async (comment) => {
    try {
      if (comment.isLike) {
        const response = await cancelLikeReviewApi(comment.id, currentUserId.value);
        if (response.code === 1) {
          comment.isLike = false;
          comment.likeCount--;
          ElMessage.success('取消点赞成功');
        } else {
          ElMessage.error('取消点赞失败');
        }
      } else {
        const response = await likeReviewApi(comment.id, currentUserId.value);
        if (response.code === 1) {
          comment.isLike = true;
          comment.likeCount++;
          ElMessage.success('点赞成功');
        } else {
          ElMessage.error('点赞失败');
        }
      }
    } catch (error) {
      console.error('Error toggling comment like:', error);
      ElMessage.error('操作失败');
    }
  };
  
  const deleteComment = async (commentId) => {
    try {
      await ElMessageBox.confirm('确定要删除这条评论吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      });
      
      const response = await deleteReviewApi(commentId);
      if (response.code === 1) {
        ElMessage.success('删除评论成功');
        await fetchComments();
        // Update comment count in post
        post.value.reviewCount = Math.max(0, (post.value.reviewCount || 0) - 1);
      } else {
        ElMessage.error('删除评论失败');
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('Error deleting comment:', error);
        ElMessage.error('删除评论时发生错误');
      }
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };
  
  onMounted(async () => {
    const jwt = localStorage.getItem('user');
    if (jwt) {
      const claim = parseJwt(jwt);
      currentUserId.value = parseInt(claim.userId);
    }
    
    await fetchPostDetail();
    await fetchComments();
  });
  </script>
  
  <style scoped>
  .post-detail-container {
    background-color: #f3e9d2; /* 报纸背景色 */
    min-height: 100vh;
    padding: 30px;
  }

  
  .back-button {
    margin-bottom: 20px;
  }
  
  .post-detail-card {
    margin-bottom: 30px;
    background-color: #fff5e6; /* 泛黄纸张颜色 */
    border: 1px solid #d4c4a6; /* 纸张边框 */
    color: #3e2723; /* 深棕色文字 */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .post-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  
  .user-details {
    display: flex;
    flex-direction: column;
  }
  
  .username {
    font-weight: 500;
    font-size: 16px;
  }
  
  .post-time {
    color: #909399;
    font-size: 14px;
  }
  
  .post-actions {
    display: flex;
    gap: 10px;
  }
  
  .post-title {
    color: #4e342e; /* 标题深棕色 */
    font-family: 'Georgia', serif;
    border-bottom: 1px solid #d4c4a6;
    padding-bottom: 10px;
  }
  
  .post-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 20px;
  }
  
  .post-content {
    font-size: 16px;
    line-height: 1.6;
    color: #5d4037; /* 正文稍浅的棕色 */
    margin-bottom: 20px;
    font-family: 'Times New Roman', serif;
    white-space: pre-wrap;
  }
  
  .post-image {
    margin-bottom: 20px;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .post-image .el-image {
    width: 100%;
    max-height: 500px;
    object-fit: contain;
  }
  .comments-section {
    background-color: #fbf4e9; /* 浅色纸张背景 */
    border: 1px solid #d4c4a6; /* 匹配主内容边框 */
    border-radius: 4px;
    padding: 20px;
  }
  
  .post-stats {
    display: flex;
    justify-content: flex-end;
    padding-top: 15px;
    border-top: 1px solid #ebeef5;
  }
  
  .like-button {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 4px;
    transition: background-color 0.3s;
  }
  
  .like-button:hover {
    background-color: #f5f7fa;
  }
  
  .like-button .liked {
    color: #f56c6c;
  }
  
  .section-title {
    font-size: 20px;
    margin-bottom: 20px;
    color: #303133;
  }
  
  .comment-form {
    margin-bottom: 30px;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }
  
  .comments-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .no-comments {
    text-align: center;
    padding: 30px;
    color: #909399;
    background: #f8f9fa;
    border-radius: 8px;
  }
  
  .comment-item {
    padding: 15px;
    border-radius: 8px;
    background: #f8f9fa;
  }
  
  .comment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .comment-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .comment-interactions .el-button {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  
  .comment-interactions .liked {
    color: #f56c6c;
  }
  
  .comment-content {
    font-size: 14px;
    line-height: 1.6;
    color: #5d4037; /* 与正文一致的颜色 */
    font-family: 'Times New Roman', serif; /* 统一字体 */
    margin-bottom: 10px;
  }
  
  .comment-footer {
    display: flex;
    justify-content: flex-end;
  }
  
  .comment-time {
    font-size: 12px;
    background-color: #fffcf5 !important; /* 更浅的纸张色 */
    border: 1px solid #e0d7c3 !important; /* 浅棕色边框 */
    color: #5d4037; /* 深棕色文字 */
  }
  .username {
    color: #4e342e; /* 用户名颜色 */
  }

  .post-time, .comment-time {
    color: #8d6e63; /* 时间颜色 */
  }

  .like-button {
    color: #6d4c41; /* 点赞按钮颜色 */
  }

  .el-button--primary {
    background-color: #8d6e63 !important; /* 按钮主色 */
    border-color: #6d4c41 !important;
  }

  .el-button--primary:hover {
    background-color: #6d4c41 !important;
  }
  </style>  