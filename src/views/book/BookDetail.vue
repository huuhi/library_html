<template>
    <div v-if="book" class="book-detail-container">
      <el-row :gutter="20">
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
      <el-row>
        <el-col :span="24">
          <h2>简介</h2>
          <p>{{ book.profile }}</p>
        </el-col>
      </el-row>
      <!-- 评论功能占位，后续实现 -->
      <el-row>
        <el-col :span="24">
          <h2>评论</h2>
          <p>评论功能即将推出...</p>
        </el-col>
      </el-row>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { Picture } from '@element-plus/icons-vue';
  import { getBookByIdApi , lendBookApi} from '@/api/booksApi';
  import parseJwt from '@/utils/parseJwt';
  
  const route = useRoute();
  const router = useRouter();
  const book = ref(null);
  const lend=ref({userId:'',bookId:'',status:0})
  
  const fetchBookDetails = async () => {
    try {
      const response = await getBookByIdApi(route.params.id);
      if (response.code === 1) {
        book.value = response.data;
      } else {
        ElMessage.error('获取图书详情失败');
      }
    } catch (error) {
      console.error('Error fetching book details:', error);
      ElMessage.error('获取图书详情时发生错误');
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  const borrowBook =async () => {
    //获取图书的id，用户的id
    // ElMessage.success('借书功能即将推出');
    const res=await lendBookApi(lend.value);
    if(res.code){
      ElMessage.success('借书成功');
      // 重新查询
      fetchBookDetails();
    }else{
      ElMessage.error('借书失败'+res.msg);
    }
  };
  
  const goBack = () => {
    router.back();
  };
  
  onMounted(() => {
    fetchBookDetails();
    const claim=parseJwt(localStorage.getItem('user'))
    lend.value.userId=claim.userId;
    lend.value.bookId=route.params.id;
    console.log(lend.value);
  });
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
  
  .book-actions {
    margin-top: 20px;
    display: flex;
    justify-content: flex-start;
    gap: 10px;
  }
  
  h1 {
    margin-bottom: 20px;
  }
  
  h2 {
    margin-top: 30px;
    margin-bottom: 15px;
  }
  </style>
  
  