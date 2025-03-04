<template>
    <div class="user-feedback-management">
      <h1 class="page-title">用户反馈处理</h1>
  
      <!-- 搜索和筛选 -->
      <div class="filter-container">
        <el-select v-model="status" placeholder="状态" clearable @change="handleSearch">
          <el-option label="未解决" :value="0" />
          <el-option label="已解决" :value="1" />
        </el-select>
        <el-select v-model="type" placeholder="类型" clearable @change="handleSearch">
          <el-option label="罚款申诉" :value="0" />
          <el-option label="借阅申诉" :value="1" />
          <el-option label="评论申诉" :value="2" />
          <el-option label="其他" :value="3" />
        </el-select>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button type="default" @click="clear">清除</el-button>
      </div>
      <el-button type="danger" @click="handleBatchDelete" :disabled="selectedFeedbacks.length === 0">批量删除</el-button>
  
      <!-- 反馈列表 -->
      <el-table 
        :data="feedbacks" 
        style="width: 100%" 
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="appealTypeName" label="类型" width="120" />
        <el-table-column prop="statusName" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 0 ? 'warning' : 'success'">
              {{ scope.row.statusName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="note" label="反馈内容" :show-overflow-tooltip="true"  width="180"/>
        <el-table-column prop="processNote" label="管理员回复" width="160"></el-table-column>
        <el-table-column label="操作" >
          <template #default="scope">
            <el-button size="small" @click="handleRowClick(scope.row)">查看</el-button>
            <el-button size="small" type="primary" @click="showEditDialog(scope.row)">处理反馈</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
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
  
      <!-- 详情对话框 -->
      <el-dialog v-model="detailDialogVisible" title="反馈详情" width="50%">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="用户ID">{{ currentFeedback.userId }}</el-descriptions-item>
          <el-descriptions-item label="类型">{{ currentFeedback.appealTypeName }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ currentFeedback.statusName }}</el-descriptions-item>
          <el-descriptions-item label="反馈内容">{{ currentFeedback.note }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(currentFeedback.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="处理时间">{{ formatDate(currentFeedback.endTime) }}</el-descriptions-item>
          <el-descriptions-item label="处理备注">{{ currentFeedback.processNote }}</el-descriptions-item>
        </el-descriptions>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="detailDialogVisible = false">关闭</el-button>
          </span>
        </template>
      </el-dialog>
  
      <!-- 编辑对话框 -->
      <el-dialog v-model="editDialogVisible" title="处理反馈" width="40%">
        <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="100px">
          <el-form-item label="状态" prop="status">
            <el-select v-model="editForm.status">
              <el-option label="未解决" :value="0" />
              <el-option label="已解决" :value="1" />
            </el-select>
          </el-form-item>
          <el-form-item label="处理备注" prop="processNote">
            <el-input type="textarea" v-model="editForm.processNote" rows="4" />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="editDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitEdit">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { fetchUserFeedbacks, getFeedbackDetail, updateFeedbackStatus, removeFeedback } from '@/api/questionApi'
  import parseJwt from '@/utils/parseJwt'

  
  const feedbacks = ref([])
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const status = ref(null)
  const type = ref(null)
  const detailDialogVisible = ref(false)
  const editDialogVisible = ref(false)
  const currentFeedback = ref({})
  const editFormRef = ref(null)
  const selectedFeedbacks = ref([])
  const userId=ref();
  
  const editForm = reactive({
    id: null,
    status: null,
    managerId: null,
    processNote: ''
  })
  
  const rules = {
    status: [{ required: true, message: '请选择状态', trigger: 'change' }],
    processNote: [{ required: true, message: '请输入处理备注', trigger: 'blur' }]
  }
  
  const fetchFeedbacks = async () => {
    try {
      const response = await fetchUserFeedbacks(currentPage.value, pageSize.value, status.value, type.value)
      if (response.code === 1) {
        feedbacks.value = response.data.records
        total.value = response.data.total
      } else {
        ElMessage.error('获取反馈列表失败')
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error)
      ElMessage.error('获取反馈列表时发生错误')
    }
  }
  
  const handleSearch = () => {
    currentPage.value = 1
    fetchFeedbacks()
  }
  
  const handleSizeChange = (val) => {
    pageSize.value = val
    fetchFeedbacks()
  }
  
  const handleCurrentChange = (val) => {
    currentPage.value = val
    fetchFeedbacks()
  }
  const clear=()=>{
    type.value=''
    status.value=''
  }
  
  const handleRowClick = async (row) => {
    try {
      const response = await getFeedbackDetail(row.id)
      if (response.code === 1) {
        currentFeedback.value = response.data
        detailDialogVisible.value = true
      } else {
        ElMessage.error('获取反馈详情失败')
      }
    } catch (error) {
      console.error('Error fetching feedback detail:', error)
      ElMessage.error('获取反馈详情时发生错误')
    }
  }
  
  const showEditDialog = (row) => {
    editForm.id = row.id
    editForm.status = row.status
    editForm.processNote = row.processNote || ''
    editForm.managerId = userId.value
    editDialogVisible.value = true
  }
  
  const submitEdit = async () => {
    if (!editFormRef.value) return
    await editFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          const response = await updateFeedbackStatus(editForm)
          if (response.code === 1) {
            ElMessage.success('处理完成，感谢你的奉献！')
            editDialogVisible.value = false
            fetchFeedbacks()
          } else {
            ElMessage.error('更新反馈状态失败')
          }
        } catch (error) {
          console.error('Error updating feedback status:', error)
          ElMessage.error('更新反馈状态时发生错误')
        }
      } else {
        console.log('error submit!')
        return false
      }
    })
  }
  
  const handleDelete = async (id) => {
    try {
      await ElMessageBox.confirm('确定要删除这条反馈吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      const response = await removeFeedback(id)
      if (response.code === 1) {
        ElMessage.success('删除反馈成功')
        fetchFeedbacks()
      } else {
        ElMessage.error('删除反馈失败')
      }
    } catch (error) {
      console.error('Error deleting feedback:', error)
      ElMessage.error('删除反馈时发生错误')
    }
  }
  
  const handleSelectionChange = (val) => {
    selectedFeedbacks.value = val
  }
  
  const handleBatchDelete = async () => {
    if (selectedFeedbacks.value.length === 0) {
      ElMessage.warning('请选择要删除的反馈')
      return
    }
    try {
      await ElMessageBox.confirm(`确定要删除选中的 ${selectedFeedbacks.value.length} 条反馈吗？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      const ids = selectedFeedbacks.value.map(feedback => feedback.id)
      const response = await removeFeedback(    ids)
      if (response.code === 1) {
        ElMessage.success('批量删除反馈成功')
        fetchFeedbacks()
      } else {
        ElMessage.error('批量删除反馈失败')
      }
    } catch (error) {
      console.error('Error batch deleting feedbacks:', error)
      ElMessage.error('批量删除反馈时发生错误')
    }
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', { hour12: false })
  }
  
  onMounted(() => {
    const token= localStorage.getItem('user');
    const claim= parseJwt(token);
    userId.value=claim.userId;
    fetchFeedbacks()
  })
  </script>
  
  <style scoped>
  .user-feedback-management {
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
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
  
  .el-descriptions {
    margin-bottom: 20px;
  }
  </style>  