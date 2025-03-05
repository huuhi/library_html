<template>
    <div class="category-management">
      <!-- <h1>分类管理</h1> -->
  
      <!-- Search and Add button -->
      <div class="header-actions">
        <el-input
          v-model="searchQuery"
          placeholder="搜索分类"
          style="width: 300px;"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="showAddDialog">添加分类</el-button>
      </div>
  
      <!-- Category Table -->
      <el-table 
      :data="categories" 
      style="width: 100%"
      v-loading="loading"
      element-loading-text="Loading..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      element-loading-background="rgba(122, 122, 122, 0.8)"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="fullName" label="完整名称" />
        <el-table-column prop="parentId" label="父分类ID" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="showEditDialog(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="showDeleteDialog(scope.row.id)">删除</el-button>
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
  
      <!-- Add/Edit Category Dialog -->
      <el-dialog :title="dialogTitle" v-model="dialogVisible" width="50%">
        <el-form :model="categoryForm" :rules="rules" ref="categoryFormRef" label-width="100px">
          <el-form-item label="名称" prop="name">
            <el-input v-model="categoryForm.name" />
          </el-form-item>
          <el-form-item label="父分类ID" prop="parentId">
            <el-input v-model="categoryForm.parentId" />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitForm">确定</el-button>
          </span>
        </template>
      </el-dialog>

      <el-dialog
        v-model="dialogVisibleDelete"
        title="Tips"
        width="500"
        :before-close="handleClose"
        align-center
    >
        <span>确定要删除这个分类吗？</span>
        <template #footer>
        <div class="dialog-footer">
            <el-button @click="dialogVisibleDelete = false">取消</el-button>
            <el-button type="primary" @click="deleteCategory">
            确定
            </el-button>
        </div>
        </template>
    </el-dialog>

    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { ElMessage } from 'element-plus';
  import { Search } from '@element-plus/icons-vue';
  import { getClazzByPageApi , getClazzById ,addClazz,updateClazz,deleteClazz} from '@/api/clazzApi';


  const categories = ref([]);
  const total = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(10);
  const searchQuery = ref('');
  const dialogVisible = ref(false);
  const dialogTitle = ref('添加分类');
  const categoryFormRef = ref(null);
  const dialogVisibleDelete = ref(false)
  const clazzId=ref();
  
  const categoryForm = ref({
    id: null,
    name: '',
    parentId: null
  });
  
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
  const rules = {
    name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
  };
  
  const showDeleteDialog = (id) => {
    dialogVisibleDelete.value = true;
    console.log(id)
    clazzId.value=id;
  }

  const fetchCategories = async () => {
    try {
      const response = await getClazzByPageApi(currentPage.value, pageSize.value, searchQuery.value);
      if (response.code === 1) {
        categories.value = response.data.records;
        total.value = response.data.total;
      } else {
        ElMessage.error('获取分类列表失败');
      }
      loading.value = false
    } catch (error) {
      console.error('Error fetching categories:', error);
      ElMessage.error('获取分类列表时发生错误');
    }
  };
  
  const handleSizeChange = (val) => {
    pageSize.value = val;
    fetchCategories();
  };
  
  const handleCurrentChange = (val) => {
    currentPage.value = val;
    fetchCategories();
  };
  
  const handleSearch = () => {
    currentPage.value = 1;
    fetchCategories();
  };
  
  const showAddDialog = () => {
    dialogTitle.value = '添加分类';
    categoryForm.value = {
      name: '',
      parentId: null
    };
    dialogVisible.value = true;
  };
  
  const showEditDialog = async (row) => {
    dialogTitle.value = '编辑分类';
    try {
      const response = await getClazzById(row.id);
      if (response.code === 1) {
        categoryForm.value = response.data;
      } else {
        ElMessage.error('获取分类详情失败');
      }
    } catch (error) {
      console.error('Error fetching category details:', error);
      ElMessage.error('获取分类详情时发生错误');
    }
    dialogVisible.value = true;
  };
  
  const submitForm = async () => {
    if (!categoryFormRef.value) return;
    await categoryFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          const api = categoryForm.value.id ? updateClazz : addClazz;
          const response = await api(categoryForm.value);
          if (response.code === 1) {
            ElMessage.success(categoryForm.value.id ? '更新分类成功' : '添加分类成功');
            dialogVisible.value = false;
            fetchCategories();
          } else {
            ElMessage.error(categoryForm.value.id ? '更新分类失败' : '添加分类失败');
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
  
  const deleteCategory = async () => {
    try {
      const response = await deleteClazz(clazzId.value);
      if (response.code === 1) {
        ElMessage.success('删除分类成功');
        fetchCategories();
      } else {
        ElMessage.error('删除分类失败');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      ElMessage.error('删除分类时发生错误');
    }
    dialogVisibleDelete.value = false;
  };
  
  onMounted(() => {
    fetchCategories();
  });
  </script>
  
  <style scoped>
  .category-management {
    padding: 20px;
  }
  
  .header-actions {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
  </style>
  
  