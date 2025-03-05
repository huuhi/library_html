<script setup>
import { ref, onMounted, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { searchBooksApi, addBookApi, updateBookApi, deleteBookApi } from '@/api/booksApi';
import { getAllClazzApi } from '@/api/clazzApi';
import { getPublishersApi } from '@/api/publishApi';
import { getAddressApi } from '@/api/addressApi';

const books = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const dialogVisible = ref(false);
const dialogTitle = ref('添加图书');
const bookFormRef = ref(null);
const categories = ref([]);
const publishers = ref([]);
const addresses = ref([]);
const selectedCategory = ref('');
const searchKeyword = ref('');
const statusFilter = ref();



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

const bookForm = reactive({
  id: null,
  name: '',
  author: '',
  clazzId: null,
  publishId: null,
  isbn: '',
  profile: '',
  publishDate: '',
  addressId: null,
  status: 1,
  image: ''
});

const rules = {
  name: [{ required: true, message: '请输入书名', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  clazzId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  publishDate: [{ required: true, message: '请选择出版日期', trigger: 'change' }],
  addressId: [{ required: true, message: '请选择位置', trigger: 'change' }]
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
    loading.value = false
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

const showAddBookDialog = () => {
  dialogTitle.value = '添加图书';
  Object.keys(bookForm).forEach(key => bookForm[key] = '');
  bookForm.status = 1;
  dialogVisible.value = true;
};

const editBook = (book) => {
  dialogTitle.value = '编辑图书';
  const statusValue = book.status === '可借' ? 1 : 0;
  Object.assign(bookForm, {
    ...book,
    clazzId: Number(book.clazzId),
    publishId: Number(book.publishId),
    addressId: Number(book.addressId),
    status:  statusValue
  });
  dialogVisible.value = true;
};

const deleteBook = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这本书吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    const response = await deleteBookApi(id);
    if (response.code) {
      ElMessage.success('删除成功');
      fetchBooks();
    } else {
      ElMessage.error('删除失败');
    }
  } catch (error) {
    console.error('Error deleting book:', error);
    ElMessage.error('删除图书时发生错误');
  }
};

const submitForm = async () => {
  if (!bookFormRef.value) return;
  await bookFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const api = bookForm.id ? updateBookApi : addBookApi;
        const formData = { ...bookForm };
        formData.clazzId = Number(formData.clazzId);
        formData.publishId = Number(formData.publishId);
        formData.addressId = Number(formData.addressId);
        formData.status = Number(formData.status);

        console.log('Submitting form data:', formData);

        const response = await api(formData);
        if (response.code ) {
          ElMessage.success(bookForm.id ? '更新成功' : '添加成功');
          dialogVisible.value = false;
          fetchBooks();
        } else {
          ElMessage.error(bookForm.id ? '更新失败' : '添加失败');
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        ElMessage.error('提交表单时发生错误');
      }
    } else {
      console.log('error submit!');
      return false;
    }
  });
};

const handleAvatarSuccess = (response, file) => {
  bookForm.image = response.data;
};
const handleCategoryClick = (categoryId) => {
  selectedCategory.value = categoryId;
  fetchBooks();
};
const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg';
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPG) {
    ElMessage.error('上传头像图片只能是 JPG 格式!');
  }
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!');
  }
  return isJPG && isLt2M;
};

const fetchCategories = async () => {
  try {
    const response = await getAllClazzApi();
    if (response.code) {
      categories.value = response.data;
    } else {
      ElMessage.error('获取分类列表失败');
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    ElMessage.error('获取分类列表时发生错误');
  }
};

const fetchPublishers = async () => {
  try {
    const response = await getPublishersApi();
    if (response.code) {
      publishers.value = response.data;
    } else {
      ElMessage.error('获取出版社列表失败');
    }
  } catch (error) {
    console.error('Error fetching publishers:', error);
    ElMessage.error('获取出版社列表时发生错误');
  }
};

const fetchAddresses = async () => {
  try {
    const response = await getAddressApi();
    if (response.code === 1) {
      addresses.value = response.data;
    } else {
      ElMessage.error('获取位置列表失败');
    }
  } catch (error) {
    console.error('Error fetching addresses:', error);
    ElMessage.error('获取位置列表时发生错误');
  }
};

onMounted(() => {
  fetchBooks();
  fetchCategories();
  fetchPublishers();
  fetchAddresses();
});
</script>

<template>
  <div class="admin-book-management">
    <h1>图书管理</h1>



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

    <!-- Book List -->
    <el-table
     :data="books"
      style="width: 100%"
      v-loading="loading"
    element-loading-text="Loading..."
    :element-loading-spinner="svg"
    element-loading-svg-view-box="-10, -10, 50, 50"
    element-loading-background="rgba(122, 122, 122, 0.8)"
      
      >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="书名" width="180" />
      <el-table-column prop="author" label="作者" width="120" />
      <el-table-column prop="clazz" label="分类" width="120" />
      <el-table-column prop="publish" label="出版社" width="150" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === '可借' ? 'success' : 'danger'">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" >
        <template #default="scope">
          <el-button size="small" @click="editBook(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteBook(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
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

    <!-- Add Book Button -->
    <el-button type="primary" @click="showAddBookDialog">添加图书</el-button>

    <!-- Add/Edit Book Dialog -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="50%">
      <el-form :model="bookForm" :rules="rules" ref="bookFormRef" label-width="100px">
        <el-form-item label="书名" prop="name">
          <el-input v-model="bookForm.name" />
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="bookForm.author" />
        </el-form-item>
        <el-form-item label="分类" prop="clazzId">
          <el-select v-model.number="bookForm.clazzId" placeholder="请选择分类">
            <el-option v-for="category in categories" :key="category.id" :label="category.name" :value="category.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="出版社" prop="publishId">
          <el-select v-model.number="bookForm.publishId" placeholder="请选择出版社">
            <el-option v-for="publisher in publishers" :key="publisher.id" :label="publisher.name" :value="publisher.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="ISBN" prop="isbn">
          <el-input v-model="bookForm.isbn" />
        </el-form-item>
        <el-form-item label="简介" prop="profile">
          <el-input type="textarea" v-model="bookForm.profile" />
        </el-form-item>
        <el-form-item label="出版日期" prop="publishDate">
          <el-date-picker v-model="bookForm.publishDate" type="date" placeholder="选择日期" />
        </el-form-item>
        <el-form-item label="位置" prop="addressId">
          <el-select v-model.number="bookForm.addressId" placeholder="请选择位置">
            <el-option v-for="address in addresses" :key="address.id" :label="address.address" :value="address.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model.number="bookForm.status" placeholder="请选择状态">
            <el-option label="可借" :value="1" />
            <el-option label="已借出" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="封面图片" prop="image">
          <el-upload
            class="avatar-uploader"
            action="/api/common/upload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="bookForm.image" :src="bookForm.image" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.admin-book-management {
  padding: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
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
</style>