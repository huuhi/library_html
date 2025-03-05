<template>
    <div class="address-management">
      <h1>地址管理</h1>
  
      <!-- Search and Add button -->
      <div class="header-actions">
        <el-input
          v-model="searchQuery"
          placeholder="搜索地址"
          style="width: 300px;"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="showAddDialog">添加地址</el-button>
      </div>
  
      <!-- Address Table -->
      <el-table
       :data="addresses"
        style="width: 100%"
        v-loading="loading"
      :element-loading-svg="svg"
      class="custom-loading-svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
        >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="address" label="地址" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="showEditDialog(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteAddress(scope.row.id)">删除</el-button>
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
  
      <!-- Add/Edit Address Dialog -->
      <el-dialog :title="dialogTitle" v-model="dialogVisible" width="50%">
        <el-form :model="addressForm" :rules="rules" ref="addressFormRef" label-width="100px">
          <el-form-item label="地区" prop="area">
            <el-input v-model="addressForm.area" @input="Address" />
          </el-form-item>
          <el-form-item label="楼层" prop="floor">
            <el-input-number v-model="addressForm.floor" :min="1" @change="Address" />
          </el-form-item>
          <el-form-item label="书架编号" prop="shelf">
            <el-input v-model="addressForm.shelf" @input="Address" />
          </el-form-item>
          <el-form-item label="架层" prop="rackLayer">
            <el-input-number v-model="addressForm.rackLayer" :min="1" @change="Address" />
          </el-form-item>
          <el-form-item label="完整地址">
            <el-input v-model="addressForm.address" disabled />
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
  import { ref, onMounted } from 'vue';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import { Search } from '@element-plus/icons-vue';
  import { getAddressesApi, getAddressByIdApi, addAddressApi, updateAddressApi, deleteAddressApi } from '@/api/addressApi';
  
  const addresses = ref([]);
  const total = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(10);
  const searchQuery = ref('');
  const dialogVisible = ref(false);
  const dialogTitle = ref('添加地址');
  const addressFormRef = ref(null);
  
  const addressForm = ref({
    id: null,
    area: '',
    shelf: '',
    floor: 1,
    rackLayer: 1,
    address: ''
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
    area: [{ required: true, message: '请输入地区', trigger: 'blur' }],
    shelf: [{ required: true, message: '请输入书架编号', trigger: 'blur' }],
    floor: [{ required: true, message: '请输入楼层', trigger: 'blur' }],
    rackLayer: [{ required: true, message: '请输入架层', trigger: 'blur' }]
  };
  
  const fetchAddresses = async () => {
    try {
      const response = await getAddressesApi(currentPage.value, pageSize.value, searchQuery.value);
      if (response.code === 1) {
        addresses.value = response.data.records;
        total.value = response.data.total;
      } else {
        ElMessage.error('获取地址列表失败');
      }
      loading.value = false
    } catch (error) {
      console.error('Error fetching addresses:', error);
      ElMessage.error('获取地址列表时发生错误');
    }
  };
  
  const handleSizeChange = (val) => {
    pageSize.value = val;
    fetchAddresses();
  };
  
  const handleCurrentChange = (val) => {
    currentPage.value = val;
    fetchAddresses();
  };
  
  const handleSearch = () => {
    currentPage.value = 1;
    fetchAddresses();
  };
  
  const showAddDialog = () => {
    dialogTitle.value = '添加地址';
    addressForm.value = {
      area: '',
      shelf: '',
      floor: 1,
      rackLayer: 1,
      address: ''
    };
    dialogVisible.value = true;
  };
  
  const showEditDialog = async (row) => {
    dialogTitle.value = '编辑地址';
    try {
      const response = await getAddressByIdApi(row.id);
      if (response.code === 1) {
        addressForm.value = response.data;
      } else {
        ElMessage.error('获取地址详情失败');
      }
    } catch (error) {
      console.error('Error fetching address details:', error);
      ElMessage.error('获取地址详情时发生错误');
    }
    dialogVisible.value = true;
  };
  
  const Address = () => {
    const { area, floor, shelf, rackLayer } = addressForm.value;
    addressForm.value.address = `${area} ${floor}楼 ${shelf}架 ${rackLayer}层`;
  };
  
  const submitForm = async () => {
    if (!addressFormRef.value) return;
    await addressFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          const api = addressForm.value.id ? updateAddressApi : addAddressApi;
          const response = await api(addressForm.value);
          if (response.code === 1) {
            ElMessage.success(addressForm.value.id ? '更新地址成功' : '添加地址成功');
            dialogVisible.value = false;
            fetchAddresses();
          } else {
            ElMessage.error(addressForm.value.id ? '更新地址失败' : '添加地址失败');
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
  
  const deleteAddress = async (id) => {
    try {
      await ElMessageBox.confirm('确定要删除这个地址吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      });
      const response = await deleteAddressApi(id);
      if (response.code === 1) {
        ElMessage.success('删除地址成功');
        fetchAddresses();
      } else {
        ElMessage.error('删除地址失败');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      ElMessage.error('删除地址时发生错误');
    }
  };
  
  onMounted(() => {
    fetchAddresses();
  });
  </script>
  
  <style scoped>
  .example-showcase .el-loading-mask {
    z-index: 9;
  }
  .address-management {
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
  
  