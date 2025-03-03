<template>
    <div class="penalty-management">
      <h1>罚款跟踪管理</h1>
  
      <!-- Search and Filter -->
      <div class="header-actions">
        <el-select v-model="status" placeholder="选择状态" clearable @change="handleSearch">
          <el-option label="未缴纳" :value="0" />
          <el-option label="已缴纳" :value="1" />
        </el-select>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>
  
      <!-- Penalty Records Table -->
      <el-table :data="penaltyRecords" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="userName" label="用户名" />
        <el-table-column prop="bookName" label="书名" />
        <el-table-column prop="penaltyAmount" label="罚款金额" />
        <el-table-column prop="statusName" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.statusName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="note" label="备注" />
        <el-table-column label="操作" width="250">
          <template #default="scope">
            <el-button size="small" @click="showDetailDialog(scope.row.id)">查看</el-button>
            <el-button size="small" type="primary" @click="showEditDialog(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deletePenaltyRecord(scope.row.id)">删除</el-button>
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
  
      <!-- Detail Dialog -->
      <el-dialog title="罚款记录详情" v-model="detailDialogVisible" width="50%">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="ID">{{ detailForm.id }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ detailForm.userName }}</el-descriptions-item>
          <el-descriptions-item label="书名">{{ detailForm.bookName }}</el-descriptions-item>
          <el-descriptions-item label="罚款金额">{{ detailForm.penaltyAmount }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ detailForm.statusName }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ detailForm.note }}</el-descriptions-item>
        </el-descriptions>
      </el-dialog>
  
      <!-- Edit Dialog -->
      <el-dialog title="编辑罚款记录" v-model="editDialogVisible" width="50%">
        <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="100px">
          <el-form-item label="状态" prop="status">
            <el-select v-model="editForm.status">
              <el-option label="未缴纳" :value="0" />
              <el-option label="已缴纳" :value="1" />
            </el-select>
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
            <el-button @click="editDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitForm">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { getPenaltyRecordsApi, getPenaltyByIdApi, updatePenaltyApi, deletePenaltyApi } from '@/api/penaltyApi'
  
  const penaltyRecords = ref([])
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const status = ref(null)
  const detailDialogVisible = ref(false)
  const editDialogVisible = ref(false)
  const editFormRef = ref(null)
  
  const detailForm = ref({})
  const editForm = ref({
    id: null,
    status: null,
    penaltyAmount: null,
    note: ''
  })
  
  const rules = {
    status: [{ required: true, message: '请选择状态', trigger: 'change' }],
    penaltyAmount: [{ required: true, message: '请输入罚款金额', trigger: 'blur' }]
  }
  
  const fetchPenaltyRecords = async () => {
    try {
      const response = await getPenaltyRecordsApi(currentPage.value, pageSize.value, status.value)
      if (response.code === 1) {
        penaltyRecords.value = response.data.records
        total.value = response.data.total
      } else {
        ElMessage.error('获取罚款记录失败')
      }
    } catch (error) {
      console.error('Error fetching penalty records:', error)
      ElMessage.error('获取罚款记录时发生错误')
    }
  }
  
  const handleSizeChange = (val) => {
    pageSize.value = val
    fetchPenaltyRecords()
  }
  
  const handleCurrentChange = (val) => {
    currentPage.value = val
    fetchPenaltyRecords()
  }
  
  const handleSearch = () => {
    currentPage.value = 1
    fetchPenaltyRecords()
  }
  
  const showDetailDialog = async (id) => {
    try {
      const response = await getPenaltyByIdApi(id)
      if (response.code === 1) {
        detailForm.value = response.data
        detailDialogVisible.value = true
      } else {
        ElMessage.error('获取罚款记录详情失败')
      }
    } catch (error) {
      console.error('Error fetching penalty detail:', error)
      ElMessage.error('获取罚款记录详情时发生错误')
    }
  }
  
  const showEditDialog = (row) => {
    editForm.value = {
      id: row.id,
      status: row.status,
      penaltyAmount: row.penaltyAmount,
      note: row.note || ''
    }
    editDialogVisible.value = true
  }
  
  const submitForm = async () => {
    if (!editFormRef.value) return
    await editFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          const response = await updatePenaltyApi(editForm.value)
          if (response.code === 1) {
            ElMessage.success('更新罚款记录成功')
            editDialogVisible.value = false
            fetchPenaltyRecords()
          } else {
            ElMessage.error('更新罚款记录失败')
          }
        } catch (error) {
          console.error('Error updating penalty record:', error)
          ElMessage.error('更新罚款记录时发生错误')
        }
      } else {
        console.log('error submit!')
        return false
      }
    })
  }
  
  const deletePenaltyRecord = async (id) => {
    try {
      await ElMessageBox.confirm('确定要删除这条罚款记录吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      const response = await deletePenaltyApi(id)
      if (response.code === 1) {
        ElMessage.success('删除罚款记录成功')
        fetchPenaltyRecords()
      } else {
        ElMessage.error('删除罚款记录失败')
      }
    } catch (error) {
      console.error('Error deleting penalty record:', error)
      ElMessage.error('删除罚款记录时发生错误')
    }
  }
  
  onMounted(() => {
    fetchPenaltyRecords()
  })
  </script>
  
  <style scoped>
  .penalty-management {
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
  
  