<template>
    <div class="comment-management">
      <h1>评论管理</h1>
  
      <!-- 筛选和搜索 -->
      <div class="filter-container">
        <el-select v-model="isAudit" placeholder="审核状态" @change="handleFilter">
          <el-option label="全部" value="" />
          <el-option label="未审核" value="0" />
          <el-option label="已审核" value="1" />
        </el-select>
        <el-button type="primary" @click="handleFilter">筛选</el-button>
      </div>
  
      <!-- 评论列表 -->
      <el-table :data="comments" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="content" label="评论内容" />
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="statusName" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.isAudit === 1 ? 'success' : 'danger'">
              {{ scope.row.statusName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button 
              size="small" 
              :type="scope.row.isAudit === 0 ? 'primary' : 'info'"
              @click="handleAudit(scope.row)"
            >
              {{ scope.row.isAudit === 0 ? '审核' : '修改审核' }}
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="handleDelete(scope.row.id)"
            >
              删除
            </el-button>
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
  
      <!-- 审核对话框 -->
      <el-dialog v-model="auditDialogVisible" title="评论审核" width="30%">
        <el-form :model="auditForm" label-width="80px">
          <el-form-item label="评论内容">
            <el-input v-model="auditForm.content" type="textarea" :rows="3" disabled />
          </el-form-item>
          <el-form-item label="审核结果">
            <el-radio-group v-model="auditForm.status">
              <el-radio :label="1">通过</el-radio>
              <el-radio :label="0">违规</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="审核说明">
            <el-input v-model="auditForm.description" type="textarea" :rows="3" />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="auditDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitAudit">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { getComments, auditComment, deleteComment } from '@/api/reviewApi'
  
  const comments = ref([])
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const isAudit = ref('')
  const loading = ref(false)
  const auditDialogVisible = ref(false)
  const auditForm = ref({
    id: null,
    content: '',
    status: 1,
    description: ''
  })
  
  const fetchComments = async () => {
    loading.value = true
    try {
      const response = await getComments(currentPage.value, pageSize.value, isAudit.value)
      if (response.code === 1) {
        comments.value = response.data.records
        total.value = response.data.total
      } else {
        ElMessage.error('获取评论列表失败')
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
      ElMessage.error('获取评论列表时发生错误')
    } finally {
      loading.value = false
    }
  }
  
  const handleFilter = () => {
    currentPage.value = 1
    fetchComments()
  }
  
  const handleSizeChange = (val) => {
    pageSize.value = val
    fetchComments()
  }
  
  const handleCurrentChange = (val) => {
    currentPage.value = val
    fetchComments()
  }
  
  const handleAudit = (row) => {
    auditForm.value = {
      id: row.id,
      content: row.content,
      status: row.isAudit,
      description: row.description || ''
    }
    auditDialogVisible.value = true
  }
  
  const submitAudit = async () => {
    if (!auditForm.value.description) {
      ElMessage.warning('请填写审核说明')
      return
    }
    try {
      const response = await auditComment(auditForm.value)
      if (response.code === 1) {
        ElMessage.success('审核成功')
        auditDialogVisible.value = false
        fetchComments()
      } else {
        ElMessage.error('审核失败')
      }
    } catch (error) {
      console.error('Error auditing comment:', error)
      ElMessage.error('审核评论时发生错误')
    }
  }
  
  const handleDelete = async (id) => {
    try {
      await ElMessageBox.confirm('确定要删除这条评论吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      const response = await deleteComment(id)
      if (response.code === 1) {
        ElMessage.success('删除成功')
        fetchComments()
      } else {
        ElMessage.error('删除失败')
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('Error deleting comment:', error)
        ElMessage.error('删除评论时发生错误')
      }
    }
  }
  
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
  
  onMounted(() => {
    fetchComments()
  })
  </script>
  
  <style scoped>
  .comment-management {
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
  </style>
  
  