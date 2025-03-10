<template>
    <div class="forum-container">
      <div class="forum-header">
        <h1>社区讨论</h1>
        <div class="search-create">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索帖子标题"
            class="search-input"
            @keyup.enter="searchPosts"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" @click="navigateToCreate">
            <el-icon><Plus /></el-icon>发布帖子
          </el-button>
        </div>
      </div>
  
      <div class="post-list" v-loading="loading">
        <div v-if="posts.length === 0 && !loading" class="no-posts">
          <el-empty description="暂无帖子" />
        </div>
        
        <el-card v-for="post in posts" :key="post.id" class="post-card" @click="viewPostDetail(post.id)">
          <div class="post-header">
            <div class="user-info">
              <el-avatar :size="40" :src="post.userImage || '/placeholder.svg'"></el-avatar>
              <span class="username">{{ post.userName }}</span>
            </div>
            <div class="post-time">{{ formatDate(post.updatedTime) }}</div>
          </div>
          
          <h2 class="post-title">{{ post.title }}</h2>
          <p class="post-content">{{ truncateContent(post.content) }}</p>
          
          <div v-if="post.image" class="post-image">
            <el-image :src="post.image" fit="cover" :preview-src-list="[post.image]"></el-image>
          </div>
          
          <div class="post-footer">
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
            
            <div class="post-stats">
              <span class="stat-item">
                <el-icon><ChatDotRound /></el-icon>
                {{ post.reviewCount }}
              </span>
              <span class="stat-item">
                <el-icon><Star /></el-icon>
                {{ post.likeCount }}
              </span>
              <el-dropdown v-if="post.isMy" trigger="click" @click.stop>
                <span class="el-dropdown-link">
                  <el-icon><MoreFilled /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click.stop="editPost(post.id)">编辑</el-dropdown-item>
                    <el-dropdown-item @click.stop="confirmDelete(post.id)">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import { getPostListApi, deletePost } from '@/api/postApi';
  import parseJwt from '@/utils/parseJwt';
  const router = useRouter();
  const posts = ref([]);
  const loading = ref(false);
  const searchKeyword = ref('');
  const currentUserId = ref(null);
  
  const fetchPosts = async () => {
    loading.value = true;
    try {
      const response = await getPostListApi(searchKeyword.value || null);
      if (response.code === 1) {
        posts.value = response.data;
      } else {
        ElMessage.error('获取帖子列表失败');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      ElMessage.error('获取帖子列表时发生错误');
    } finally {
      loading.value = false;
    }
  };
  
  const searchPosts = () => {
    fetchPosts();
  };
  
  const navigateToCreate = () => {
    router.push('/forum/create');
  };
  
  const viewPostDetail = (postId) => {
    router.push(`/forum/post/${postId}`);
  };
  
  const editPost = (postId) => {
    router.push(`/forum/edit/${postId}`);
  };
  
  const confirmDelete = async (postId) => {
    try {
      await ElMessageBox.confirm('确定要删除这篇帖子吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      });
      
      const response = await deletePost(postId);
      if (response.code === 1) {
        ElMessage.success('删除帖子成功');
        fetchPosts(); // Refresh the list
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
  
  const truncateContent = (content) => {
    if (!content) return '';
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
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
  
  onMounted(() => {
    const jwt = localStorage.getItem('user');
    if (jwt) {
      const claim = parseJwt(jwt);
      currentUserId.value = parseInt(claim.userId);
    }
    fetchPosts();
  });
  </script>
  
  <style scoped>
  .forum-container {
    background-color: #f3e9d2; /* 报纸背景色 */
    min-height: 100vh;
    padding: 30px;
  }
  
  .forum-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .search-create {
    display: flex;
    gap: 10px;
  }
  
  .search-input {
    width: 250px;
  }
  
  .post-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .post-card {
    background-color: #fff5e6; /* 泛黄纸张颜色 */
    border: 1px solid #d4c4a6; /* 纸张边框 */
    color: #3e2723; /* 深棕色文字 */
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .post-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  }
  
  .post-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .username {
    font-weight: 500;
    color: #4e342e; /* 用户名颜色 */
  }
  
  .post-time {
    color: #8d6e63; /* 时间颜色 */
    font-size: 14px;
  }
  
  .post-title {
    font-size: 18px;
    margin-bottom: 10px;
    color: #4e342e; /* 标题深棕色 */
    font-family: 'Georgia', serif; /* 衬线字体 */
  }
  
  .post-content {
    color: #5d4037; /* 正文稍浅的棕色 */
    font-family: 'Times New Roman', serif;
    margin-bottom: 15px;
    line-height: 1.6;
  }
  
  .post-image {
    margin-bottom: 15px;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .post-image .el-image {
    width: 100%;
    max-height: 300px;
    object-fit: cover;
  }
  
  .post-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .post-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .post-tag {
    background-color: #d7ccc8 !important; /* 标签浅棕色 */
    color: #4e342e !important;
    border: 1px solid #bcaaa4;
    font-size: 12px;
  }
  
  .post-stats {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  
  .stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #6d4c41 !important; /* 统计信息颜色 */
    font-size: 14px;
  }
  
  .el-dropdown-link {
    cursor: pointer;
    display: flex;
    align-items: center;
    color: #909399;
  }
  
  .no-posts {
    padding: 40px 0;
  }
  </style>  