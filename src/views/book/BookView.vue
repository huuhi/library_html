<template>
  <div class="book-display-container">
    <!-- <h1>图书列表</h1> -->
    <div class="category-container">
      <div class="category-tags">
        <el-tag 
          :class="{ 'active-tag': selectedCategory === '' }" 
          @click="handleCategoryClick('')"
          class="category-tag"
        >
          全部
        </el-tag>
        <el-tag 
          v-for="category in categories" 
          :key="category.id"
          :class="{ 'active-tag': selectedCategory === category.id }"
          @click="handleCategoryClick(category.id)"
          class="category-tag"
        >
          {{ category.name }}
        </el-tag>
      </div>
    </div>

    <div class="search-filter-container">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索图书"
        class="search-input"
        @input="fetchBooks"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="statusFilter" placeholder="图书状态" @change="fetchBooks">
        <el-option label="全部" value='' />
        <el-option label="可借" value=1 />
        <el-option label="已借出" value=0 />
      </el-select>
    </div>

    <div 
    class="book-grid"
    v-loading="loading"
    element-loading-text="Loading..."
    :element-loading-spinner="svg"
    element-loading-svg-view-box="-10, -10, 50, 50"
    element-loading-background="rgba(122, 122, 122, 0.8)"
    >
      <div v-for="book in books" :key="book.id" class="book-card" @click="navigateToBookDetail(book.id)">
        <el-image :src="book.image" fit="cover" class="book-image">
          <template #error>
            <div class="image-placeholder">
              <el-icon><Picture /></el-icon>
            </div>
          </template>
        </el-image>
        <div class="book-info">
          <h3 class="book-title">{{ book.name }}</h3>
          <p class="book-author">{{ book.author }}</p>
          <p class="book-class">分类：{{ book.clazz }}</p>
          <p class="book-status" :class="{ 'status-available': book.status === '可借' }">
            状态：{{ book.status }}
          </p>
          <el-tooltip :content="book.address" placement="top" effect="light">
            <p class="book-address">位置：{{ truncateAddress(book.address) }}</p>
          </el-tooltip>
        </div>
      </div>
    </div>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { searchBooksApi } from '@/api/booksApi';
import { getClazzApi } from '@/api/clazzApi';

const router = useRouter();
const books = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(20);
const searchKeyword = ref('');
const statusFilter = ref();
const categories = ref([]);
const selectedCategory = ref('');
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
const fetchCategories = async () => {
  try {
    const response = await getClazzApi();
    if (response.code === 1) {
      categories.value = response.data;
    } else {
      ElMessage.error('获取分类列表失败');
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    ElMessage.error('获取分类列表时发生错误');
  }
};

const handleCategoryClick = (categoryId) => {
  selectedCategory.value = categoryId;
  fetchBooks();
};

const fetchBooks = async () => {
  try {
    const response = await searchBooksApi(
      searchKeyword.value, 
      statusFilter.value,
      currentPage.value, 
      pageSize.value,
      selectedCategory.value 
    ); 
    if (response.code) {
      books.value = response.data.records;
      total.value = response.data.total;
    } else {
      ElMessage.error('获取图书列表失败'+response.msg);
    }
    loading.value=false;
  } catch (error) {
    console.error('Error fetching books:', error);
    ElMessage.error('获取图书列表时发生错误');
  }
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  fetchBooks();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchBooks();
};

const truncateAddress = (address) => {
  return address.length > 20 ? address.substring(0, 20) + '...' : address;
};

const navigateToBookDetail = (bookId) => {
  router.push({ name: 'BookDetail', params: { id: bookId } });
};

onMounted(() => {
  fetchCategories();
  fetchBooks();
});
</script>


<style scoped>
.book-display-container {
  padding: 20px;
}

.category-container {
  margin-bottom: 20px;
  background: linear-gradient(to right, #1e3c72, #2a5298);
  padding: 20px;
  border-radius: 8px;
}

.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category-tag {
  cursor: pointer;
  font-size: 14px;
  padding: 8px 16px;
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  transition: all 0.3s ease;
}

.category-tag:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.active-tag {
  background-color: #fff !important;
  color: #1e3c72 !important;
}

.search-filter-container {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.search-input {
  flex-grow: 1;
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.book-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  /* overflow: hidden;
  transition: box-shadow 0.3s ease; */
  position: relative; 
  overflow: hidden; 
  cursor: pointer;
  transition: transform 0.3s ease;

}

.book-card:hover {
  /* box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); */
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.book-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  transition: transform 0.3s ease; /* 新增 */
}
.book-card:hover .book-image {
  transform: scale(1.05);
}

.image-placeholder {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  color: #909399;
  font-size: 24px;
}

.book-info {
  padding: 15px;
}

.book-title {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: bold;
}

.book-author {
  margin: 0 0 5px;
  color: #606266;
}

.book-class, .book-status, .book-address {
  margin: 5px 0;
  font-size: 14px;
  color: #909399;
}

.status-available {
  color: #67C23A;
  font-weight: bold;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>

