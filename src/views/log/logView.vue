<template>
    <div class="log-management">
      <h1>系统日志管理</h1>
  
      <!-- 筛选和操作 -->
      <div class="filter-container">
        <el-select v-model="user" placeholder="请选择用户">
          <el-option label="全部" value="" />
          <el-option v-for="item in userOptions" :key="item.id" :label="item.username" :value="item.id"></el-option>
        </el-select>
        <el-button type="primary" @click="handleFilter">筛选</el-button>
        <el-button 
          type="danger" 
          :disabled="selectedLogs.length === 0"
          @click="handleBatchDelete"
        >
          批量删除
        </el-button>
      </div>
  
      <!-- 日志列表 -->
      <el-table 
        :data="logs" 
        style="width: 100%" 
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="userName" label="用户名" width="100" />
        <el-table-column prop="userId" label="用户ID" width="80" />
        <el-table-column prop="methodName" label="操作方法" width="150" />
        <el-table-column prop="operationTime" label="操作时间" width="170">
          <template #default="scope">
            {{ formatDateTime(scope.row.operationTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="costTime" label="耗时(ms)" width="100" />
        <el-table-column prop="note" label="备注" width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button 
              size="small" 
              @click="handleViewDetails(scope.row.id)"
            >
              详情
            </el-button>
            <el-button 
              size="small" 
              type="primary" 
              @click="handleAddNote(scope.row)"
            >
              添加备注
            </el-button>
          </template>
        </el-table-column>
      </el-table>
  
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10,20, 50, 100, 200,500]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
  
      <!-- 日志详情对话框 -->
      <el-dialog v-model="detailsDialogVisible" title="日志详情" width="60%">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="ID">{{ currentLog.id }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ currentLog.userName }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ currentLog.userId }}</el-descriptions-item>
          <el-descriptions-item label="操作时间">{{ formatDateTime(currentLog.operationTime) }}</el-descriptions-item>
          <el-descriptions-item label="方法名">{{ currentLog.methodName }}</el-descriptions-item>
          <el-descriptions-item label="耗时(ms)">{{ currentLog.costTime }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ currentLog.note || '无' }}</el-descriptions-item>
          <el-descriptions-item label="类名">
            <div class="code-block">{{ currentLog.className || '无' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="方法参数">
            <div class="code-block">{{ currentLog.methodParams || '无' }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </el-dialog>
  
      <!-- 添加备注对话框 -->
      <el-dialog v-model="noteDialogVisible" title="添加备注" width="30%">
        <el-form :model="noteForm">
          <el-form-item label="备注" label-width="50px">
            <el-input 
              v-model="noteForm.note" 
              type="textarea" 
              :rows="3" 
              placeholder="请输入备注内容"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="noteDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitNote">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { getLogs, getLogById, deleteLogs, addLogNote } from '@/api/logManagementApi'
  import {getUsernameAndIdApi} from '@/api/userApi';
  
  const logs = ref([])
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const user = ref('')
  const loading = ref(false)
  const detailsDialogVisible = ref(false)
  const noteDialogVisible = ref(false)
  const currentLog = ref({})
  const selectedLogs = ref([])
  const noteForm = ref({
    id: null,
    note: ''
  })
  const userOptions = ref([])
  
  // 获取日志列表
  const fetchLogs = async () => {
    loading.value = true
    try {
      const response = await getLogs(
        currentPage.value, 
        pageSize.value, 
        user.value || undefined 
      )
      if (response.code === 1) {
        logs.value = response.data.records
        total.value = response.data.total
      } else {
        ElMessage.error('获取日志列表失败')
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
      ElMessage.error('获取日志列表时发生错误')
    } finally {
      loading.value = false
    }
  }
  
  // 筛选
  const handleFilter = () => {
    currentPage.value = 1
    fetchLogs()
  }
  
  // 分页大小变化
  const handleSizeChange = (val) => {
    pageSize.value = val
    fetchLogs()
  }
  
  // 页码变化
  const handleCurrentChange = (val) => {
    currentPage.value = val
    fetchLogs()
  }
  
  // 选择变化
  const handleSelectionChange = (selection) => {
    selectedLogs.value = selection
  }
  
  // 查看详情
  const handleViewDetails = async (id) => {
    try {
      const response = await getLogById(id)
      if (response.code === 1) {
        currentLog.value = response.data
        detailsDialogVisible.value = true
      } else {
        ElMessage.error('获取日志详情失败')
      }
    } catch (error) {
      console.error('Error fetching log details:', error)
      ElMessage.error('获取日志详情时发生错误')
    }
  }
  
  // 添加备注
  const handleAddNote = (log) => {
    noteForm.value = {
      id: log.id,
      note: log.note || ''
    }
    noteDialogVisible.value = true
  }
  
  // 提交备注
  const submitNote = async () => {
    try {
      const response = await addLogNote(noteForm.value)
      if (response.code === 1) {
        ElMessage.success('添加备注成功')
        noteDialogVisible.value = false
        fetchLogs()
      } else {
        ElMessage.error('添加备注失败')
      }
    } catch (error) {
      console.error('Error adding note:', error)
      ElMessage.error('添加备注时发生错误')
    }
  }
  
  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedLogs.value.length === 0) {
      ElMessage.warning('请选择要删除的日志')
      return
    }
  
    try {
      await ElMessageBox.confirm(`确定要删除选中的 ${selectedLogs.value.length} 条日志吗？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
  
      const ids = selectedLogs.value.map(log => log.id).join(',')
      const response = await deleteLogs(ids)
      
      if (response.code === 1) {
        ElMessage.success('删除成功')
        fetchLogs()
      } else {
        ElMessage.error('删除失败')
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('Error deleting logs:', error)
        ElMessage.error('删除日志时发生错误')
      }
    }
  }
  
  // 格式化日期时间
  const formatDateTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }
  
  // 获取用户列表
  const getUser = async () => {
    const res = await getUsernameAndIdApi()
    if (res.code) {
      userOptions.value = res.data
    } else {
      ElMessage.error('获取用户信息失败')
    }
  }
  
  onMounted(() => {
    fetchLogs()
    getUser()
  })
  </script>
  
  <style scoped>
  .log-management {
    padding: 20px;
  }
  
  .filter-container {
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
  
  .code-block {
    background-color: #f5f7fa;
    border-radius: 4px;
    padding: 12px;
    font-family: monospace;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 200px;
    overflow-y: auto;
  }
  
  :deep(.el-descriptions__label) {
    width: 120px;
  }
  </style>
  