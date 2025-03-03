<template>
    <div class="borrow-record-management">
      <h1>借阅记录管理</h1>
  
      <!-- Search and Filter -->
      <div class="header-actions">
        <el-select v-model="userId" placeholder="选择用户" clearable @change="handleSearch">
          <el-option
            v-for="user in users"
            :key="user.id"
            :label="user.username"
            :value="user.id"
          />
        </el-select>
        <el-select v-model="status" placeholder="选择状态" clearable @change="handleSearch">
            <el-option label="全部" value='' />
            <el-option label="已还" :value="0" />
          <el-option label="在借" :value="1" />
          <el-option label="违规未还" :value="2" />
          <el-option label="丢失" :value="3" />
          <el-option label="损坏" :value="4" />
        </el-select>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>
  
      <!-- Borrow Records Table -->
      <el-table :data="borrowRecords" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="userName" label="用户名" width="80" />
        <el-table-column prop="bookName" label="书名" width="150"/>
        <el-table-column prop="statusName" label="状态" width="88">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.statusName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lendTime" label="借出时间"  width="120"/>
        <el-table-column prop="returnTime" label="归还时间"  width="120"/>
        <el-table-column prop="overdueDays" label="逾期天数" width="80"/>
        <el-table-column prop="violationReason" label="违规原因" width="80"/>
        <el-table-column prop="penaltyAmount" label="罚款金额" width="80"/>
        <el-table-column prop="note" label="备注" width="80"/>
        <el-table-column label="操作" >
          <template #default="scope">
            <el-button size="small" @click="showEditDialog(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteBorrowRecord(scope.row.id)">删除</el-button>
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
  
      <!-- Edit Borrow Record Dialog -->
      <el-dialog title="编辑借阅记录" v-model="dialogVisible" width="50%">
        <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="100px">
          <el-form-item label="状态" prop="status">
            <el-select v-model="editForm.status">
              <el-option label="已还" :value="0" />
              <el-option label="在借" :value="1" />
              <el-option label="违规未还" :value="2" />
              <el-option label="丢失" :value="3" />
              <el-option label="损坏" :value="4" />
            </el-select>
          </el-form-item>
          <el-form-item label="违规原因" prop="violationReason">
            <el-input v-model="editForm.violationReason" />
          </el-form-item>
          <el-form-item label="罚款金额" prop="penaltyAmount">
            <el-input-number v-model="editForm.penaltyAmount" :precision="2" :step="0.1" />
          </el-form-item>
          <el-form-item label="备注" prop="note">
            <el-input type="textarea" v-model="editForm.note" />
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
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { getUsernameAndIdApi} from '@/api/userApi';
  import { getBorrowingRecords, deleteBorrowRecordApi, updateBorrowRecordApi } from '@/api/borrowApi'
  
  const borrowRecords = ref([])
  const users = ref([])
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const userId = ref(null)
  const status = ref(null)
  const dialogVisible = ref(false)
  const editFormRef = ref(null)
  
  const editForm = ref({
    id: null,
    status: null,
    violationReason: '',
    penaltyAmount: null,
    note: ''
  })
  
  const rules = {
    status: [{ required: true, message: '请选择状态', trigger: 'change' }]
  }
  
  const fetchBorrowRecords = async () => {
    try {
      const response = await getBorrowingRecords(currentPage.value, pageSize.value, status.value,userId.value)
      if (response.code === 1) {
        borrowRecords.value = response.data.records
        total.value = response.data.total
      } else {
        ElMessage.error('获取借阅记录失败')
      }
    } catch (error) {
      console.error('Error fetching borrow records:', error)
      ElMessage.error('获取借阅记录时发生错误')
    }
  }
  
  const fetchUsers = async () => {
    try {
      const response = await getUsernameAndIdApi()
      if (response.code === 1) {
        users.value = response.data
      } else {
        ElMessage.error('获取用户列表失败')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      ElMessage.error('获取用户列表时发生错误')
    }
  }
  
  const handleSizeChange = (val) => {
    pageSize.value = val
    fetchBorrowRecords()
  }
  
  const handleCurrentChange = (val) => {
    currentPage.value = val
    fetchBorrowRecords()
  }
  
  const handleSearch = () => {
    currentPage.value = 1
    fetchBorrowRecords()
  }
  
  const showEditDialog = (row) => {
    editForm.value = {
      id: row.id,
      status: row.status,
      violationReason: row.violationReason || '',
      penaltyAmount: row.penaltyAmount || null,
      note: row.note || ''
    }
    dialogVisible.value = true
  }
  
  const submitForm = async () => {
    if (!editFormRef.value) return
    await editFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          const response = await updateBorrowRecordApi(editForm.value)
          if (response.code === 1) {
            ElMessage.success('更新借阅记录成功')
            dialogVisible.value = false
            fetchBorrowRecords()
          } else {
            ElMessage.error('更新借阅记录失败')
          }
        } catch (error) {
          console.error('Error updating borrow record:', error)
          ElMessage.error('更新借阅记录时发生错误')
        }
      } else {
        console.log('error submit!')
        return false
      }
    })
  }
  
  const deleteBorrowRecord = async (id) => {
    try {
      await ElMessageBox.confirm('确定要删除这条借阅记录吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      const response = await deleteBorrowRecordApi(id)
      if (response.code === 1) {
        ElMessage.success('删除借阅记录成功')
        fetchBorrowRecords()
      } else {
        ElMessage.error('删除借阅记录失败')
      }
    } catch (error) {
      console.error('Error deleting borrow record:', error)
      ElMessage.error('删除借阅记录时发生错误')
    }
  }
  
  const formatDate = (row, column, cellValue) => {
    if (!cellValue) return ''
    const date = new Date(cellValue)
    return date.toLocaleString('zh-CN')
  }
  
  const getStatusType = (status) => {
    const statusMap = {
      0: 'success',
      1: 'warning',
      2: 'danger',
      3: 'info',
      4: 'danger'
    }
    return statusMap[status] || 'info'
  }
  
  onMounted(() => {
    fetchBorrowRecords()
    fetchUsers()
  })
  </script>
  
  <style scoped>
  .borrow-record-management {
    padding: 20px;
  }
  
  .header-actions {
    display: flex;
    justify-content: flex-start;
    gap: 10px;
    margin-bottom: 20px;
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
  </style>
  
  