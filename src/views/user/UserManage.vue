<template>
  <div class="user-management">
    <h1 class="page-title">用户管理</h1>

    <!-- 搜索和筛选 -->
    <div class="filter-container">
      <el-input
        v-model="filters.username"
        placeholder="用户名"
        style="width: 200px;"
        class="filter-item"
      />
      <el-select v-model="filters.role" placeholder="角色" clearable class="filter-item">
        <el-option label="普通用户" :value="0" />
        <el-option label="管理员" :value="1" />
      </el-select>
      <el-select v-model="filters.status" placeholder="状态" clearable class="filter-item">
        <el-option label="正常" :value="1" />
        <el-option label="封禁" :value="0" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <!-- 用户表格 -->
    <el-table :data="users" style="width: 100%" @row-click="showUserDetails">
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="phone" label="电话" />
      <el-table-column prop="role" label="角色" />
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <el-tag :type="scope.row.status === '启用' ? 'success' : 'danger'">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="confine" label="借阅上限" />
      <el-table-column label="操作" width="300">
        <template #default="scope">
          <el-button 
            size="small" 
            :type="scope.row.status === '启用' ? 'danger' : 'success'"
            @click.stop="handleStatusChange(scope.row)"
          >
            {{ scope.row.status === '启用' ? '封禁' : '解封' }}
          </el-button>
          <el-button size="small" type="warning" @click.stop="showConfineDialog(scope.row)">修改借阅上限</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
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

    <!-- 用户详情对话框 -->
    <el-dialog v-model="detailsDialogVisible" title="用户详情" width="50%">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ currentUser.name }}</el-descriptions-item>
        <el-descriptions-item label="电话">{{ currentUser.phone }}</el-descriptions-item>
        <el-descriptions-item label="角色">{{ currentUser.role === '0' ? '普通用户' : '管理员' }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ currentUser.status === '1' ? '正常' : '封禁' }}</el-descriptions-item>
        <el-descriptions-item label="借阅上限">{{ currentUser.confine }}</el-descriptions-item>
        <el-descriptions-item label="地址">{{ currentUser.address }}</el-descriptions-item>
        <el-descriptions-item label="身份证号">{{ currentUser.cardId }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ currentUser.gender === '1' ? '男' : '女' }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ formatDate(currentUser.regTime) }}</el-descriptions-item>
        <el-descriptions-item label="最后登录">{{ formatDate(currentUser.lastLogin) }}</el-descriptions-item>
        <el-descriptions-item label="违规原因">{{ currentUser.violationReason || '无' }}</el-descriptions-item>
      </el-descriptions>
      <el-image :src="currentUser.image" fit="cover" style="width: 100px; height: 100px; margin-top: 20px;" />
    </el-dialog>

    <!-- 状态更改对话框 -->
    <el-dialog v-model="statusDialogVisible" :title="statusDialogTitle" width="30%">
      <el-form :model="statusForm" label-width="100px">
        <el-form-item label="原因" v-if="statusForm.status === '0'">
          <el-input v-model="statusForm.reason" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="statusDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmStatusChange">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 借阅上限更改对话框 -->
    <el-dialog v-model="confineDialogVisible" title="修改借阅上限" width="30%">
      <el-form :model="confineForm" label-width="100px">
        <el-form-item label="借阅上限">
          <el-input-number v-model="confineForm.confine" :min="1" :max="20" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="confineDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmConfineChange">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage} from 'element-plus'
import { fetchUsers, getUserById, updateUserStatus, updateUserConfine } from '@/api/userApi'

const users = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const detailsDialogVisible = ref(false)
const statusDialogVisible = ref(false)
const confineDialogVisible = ref(false)
const currentUser = ref({})
const statusDialogTitle = ref('')

const filters = reactive({
  username: '',
  role: '',
  status: ''
})

const statusForm = reactive({
  userId: '',
  status: '',
  reason: ''
})

const confineForm = reactive({
  userId: '',
  confine: 5
})

const fetchUserList = async () => {
  try {
    const response = await fetchUsers(currentPage.value, pageSize.value, filters.username, filters.role, filters.status)
    if (response.code === 1) {
      users.value=response.data.records;
      total.value = response.data.total
    } else {
      ElMessage.error('获取用户列表失败')
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    ElMessage.error('获取用户列表时发生错误')
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchUserList()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchUserList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchUserList()
}

const showUserDetails = async (row) => {
  try {
    const response = await getUserById(row.id)
    if (response.code === 1) {
      currentUser.value = response.data
      detailsDialogVisible.value = true
    } else {
      ElMessage.error('获取用户详情失败')
    }
  } catch (error) {
    console.error('Error fetching user details:', error)
    ElMessage.error('获取用户详情时发生错误')
  }
}

const handleStatusChange = (user) => {
  statusForm.userId = user.id
  statusForm.status = user.status === '启用' ? '0' : '1'
  statusForm.reason = ''
  statusDialogTitle.value = user.status === '启用' ? '封禁用户' : '解封用户'
  statusDialogVisible.value = true
}

const confirmStatusChange = async () => {
  if (statusForm.status === '0' && !statusForm.reason.trim()) {
    ElMessage.warning('请填写封禁原因')
    return
  }
  try {
    console.log(statusForm)
    const response = await updateUserStatus(statusForm.status, statusForm.userId, statusForm.reason)
    if (response.code === 1) {
      ElMessage.success('更新用户状态成功')
      statusDialogVisible.value = false
      fetchUserList()
    } else {
      ElMessage.error('更新用户状态失败')
    }
  } catch (error) {
    console.error('Error updating user status:', error)
    ElMessage.error('更新用户状态时发生错误')
  }
}

const showConfineDialog = (user) => {
  confineForm.userId = user.id
  confineForm.confine = user.confine
  confineDialogVisible.value = true
}

const confirmConfineChange = async () => {
  try {
    const response = await updateUserConfine(confineForm.confine, confineForm.userId)
    if (response.code === 1) {
      ElMessage.success('更新借阅上限成功')
      confineDialogVisible.value = false
      fetchUserList()
    } else {
      ElMessage.error('更新借阅上限失败')
    }
  } catch (error) {
    console.error('Error updating user confine:', error)
    ElMessage.error('更新借阅上限时发生错误')
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '未登录'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', { hour12: false })
}

onMounted(() => {
  fetchUserList()
})
</script>

<style scoped>
.user-management {
  padding: 20px;
}

.page-title {
  font-size: 24px;
  color: #303133;
  margin-bottom: 20px;
}

.filter-container {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filter-item {
  width: 200px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>

