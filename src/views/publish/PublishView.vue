<template>
  <div class="publisher-management">
    <h1>出版社管理</h1>

    <!-- Search and Add button -->
    <div class="header-actions">
      <el-input
        v-model="searchQuery"
        placeholder="搜索出版社"
        style="width: 300px;"
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="showAddDialog">添加出版社</el-button>
    </div>

    <!-- Publisher Table -->
    <el-table :data="publishers" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="address" label="地址" />
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

    <!-- Add/Edit Publisher Dialog -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="50%">
      <el-form :model="publisherForm" :rules="rules" ref="publisherFormRef" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="publisherForm.name" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="publisherForm.address" />
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
        title="警告！"
        width="500"
        :before-close="handleClose"
         align-center 
    >
        <span>确定要删除这个分类吗？</span>
        <template #footer>
        <div class="dialog-footer">
            <el-button @click="dialogVisibleDelete = false">取消</el-button>
            <el-button type="primary" @click="deletePublish ">
            确定
            </el-button>
        </div>
        </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { getPublisherApi,getPublishByIdApi, addPublishApi,updatePublishApi,deletePublishApi} from '@/api/publishApi';

const publishers = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');
const dialogVisible = ref(false);
const dialogTitle = ref('添加出版社');
const publisherFormRef = ref(null);
const deleteId=ref();
const dialogVisibleDelete = ref(false);

const showDeleteDialog = (id) => {
  dialogVisibleDelete.value = true;
  deleteId.value=id;
}


const publisherForm = ref({
  id: null,
  name: '',
  address: ''
});

const rules = {
  name: [{ required: true, message: '请输入出版社名称', trigger: 'blur' }],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }]
};

const fetchPublishers = async () => {
  try {
    const response = await getPublisherApi(currentPage.value, pageSize.value, searchQuery.value);
    if (response.code === 1) {
      publishers.value = response.data.records;
      total.value = response.data.total;
    } else {
      ElMessage.error('获取出版社列表失败');
    }
  } catch (error) {
    console.error('Error fetching publishers:', error);
    ElMessage.error('获取出版社列表时发生错误');
  }
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  fetchPublishers();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchPublishers();
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchPublishers();
};

const showAddDialog = () => {
  dialogTitle.value = '添加出版社';
  publisherForm.value = {
    name: '',
    address: ''
  };
  dialogVisible.value = true;
};

const showEditDialog = async (row) => {
  dialogTitle.value = '编辑出版社';
  try {
    const response = await getPublishByIdApi(row.id);
    if (response.code === 1) {
      publisherForm.value = response.data;
    } else {
      ElMessage.error('获取出版社详情失败');
    }
  } catch (error) {
    console.error('Error fetching publisher details:', error);
    ElMessage.error('获取出版社详情时发生错误');
  }
  dialogVisible.value = true;
};

const submitForm = async () => {
  if (!publisherFormRef.value) return;
  await publisherFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const api = publisherForm.value.id ? updatePublishApi : addPublishApi;
        const response = await api(publisherForm.value);
        if (response.code === 1) {
          ElMessage.success(publisherForm.value.id ? '更新出版社成功' : '添加出版社成功');
          dialogVisible.value = false;
          fetchPublishers();
        } else {
          ElMessage.error(publisherForm.value.id ? '更新出版社失败' : '添加出版社失败');
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

const deletePublish = async () => {
  try {
    const response = await deletePublishApi(deleteId.value);
    if (response.code === 1) {
      ElMessage.success('删除出版社成功');
      fetchPublishers();
    } else {
      ElMessage.error('删除出版社失败');
    }
  } catch (error) {
    console.error('Error deleting publisher:', error);
    ElMessage.error('删除出版社时发生错误');
  }
  dialogVisibleDelete.value = false;
};

onMounted(() => {
  fetchPublishers();
});
</script>

<style scoped>
.publisher-management {
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

