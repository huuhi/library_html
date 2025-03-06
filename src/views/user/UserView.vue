<template>
  <div class="user-homepage">
    <el-card class="user-info-card">
      <template #header>
        <div class="user-header" style="display: flex; align-items: center; gap: 20px; justify-content: space-between">
          <div style="display: flex; align-items: center; gap: 12px">
            <el-avatar :size="64" :src="userInfo.image" />
            <h2 style="margin: 0">{{ userInfo.username }}</h2>
          </div>
          <el-button type="primary" @click="showEditDialog" round size="small">修改个人信息</el-button>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="姓名">{{ userInfo.name }}</el-descriptions-item>
        <el-descriptions-item label="电话">{{ userInfo.phone }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ userInfo.gender === '1' ? '男' : '女' }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ formatDate(userInfo.regTime) }}</el-descriptions-item>
        <el-descriptions-item label="最大借阅数量">{{ userInfo.confine }}</el-descriptions-item>
        <el-descriptions-item label="账户状态">
          <el-tag :type="userInfo.status === '1' ? 'success' : 'danger'">
            {{ userInfo.status === '1' ? '正常' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-row :gutter="20" class="statistics-row">
      <el-col :span="8">
        <el-card class="statistic-card">
          <template #header>
            <div class="card-header">
              <span>借阅上限</span>
            </div>
          </template>
          <div class="statistic-value">{{ userInfo.confine }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="statistic-card">
          <template #header>
            <div class="card-header">
              <span>总共借阅</span>
            </div>
          </template>
          <div class="statistic-value">{{ totalBorrowed }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="statistic-card">
          <template #header>
            <div class="card-header">
              <span>当前借阅</span>
            </div>
          </template>
          <div class="statistic-value">{{ currentlyBorrowed }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="borrowing-records-card">
      <template #header>
        <div class="card-header">
          <span>借阅记录</span>
          <el-select v-model="status" placeholder="选择状态" @change="fetchBorrowingRecords">
            <el-option label="全部" value='' />
            <el-option label="在借" value="1" />
            <el-option label="已还" value="0" />
          </el-select>
        </div>
      </template>
      <el-table :data="borrowingRecords" style="width: 100%">
        <el-table-column prop="bookName" label="书名" width="100"/>
        <el-table-column prop="lendTime" label="借阅时间"  />
        <el-table-column prop="mustReturnTime" label="应还时间"  />
        <el-table-column prop="returnTime" label="归还时间"  />
        <el-table-column prop="statusName" label="状态">
          <template #default="scope">
            <el-tag 
              :type="{
                0: 'warning',  // 已还
                1: 'success',  // 在借
                2: 'danger',   // 违规未还
                3: 'info',     // 丢失
                4: 'danger'    // 损坏
              }[scope.row.status]"
            >
              {{ scope.row.statusName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button type="primary" @click="returnBook(scope.row)" :disabled="scope.row.status !== 1 &&scope.row.status!==2 " round>
              还书
            </el-button>
            <el-button type="primary" @click="openQuestionForm(scope.row.id)" :disabled="scope.row.status === 1 || scope.row.status ===0" round>
              申述
            </el-button>
          </template>
        </el-table-column>
      </el-table>
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
    </el-card>


    <el-dialog v-model="editDialogVisible" title="修改个人信息" width="50%">
      <el-form :model="editForm" :rules="rules" ref="ruleFormRef" label-width="120px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="身份证号" prop="cardId">
          <el-input v-model="editForm.cardId" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="editForm.phone" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="editForm.gender">
            <el-option label="男" :value="1" />
            <el-option label="女" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="editForm.address" />
        </el-form-item>
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            action="/api/common/upload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="editForm.image" :src="editForm.image" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEditForm(ruleFormRef)">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="dialogFormVisible" title="反馈" width="500" align-center>
    <el-form :model="question" :rules="rules" ref="ruleFormRef">
      <!-- 0=罚款申诉 1=借阅申诉 2=评论申诉 3=其他 -->
      <el-form-item label="问题类型" :label-width="formLabelWidth" prop="type">
        <el-select v-model="question.questionType" placeholder="请选择申诉类型">
          <el-option label="罚款申诉" value="0" />
          <el-option label="借阅申诉" value="1" />
          <el-option label="评论申诉" value="2" />
          <el-option label="其他" value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="反馈内容" :label-width="formLabelWidth" prop="note">
        <el-input v-model="question.note" autocomplete="off" type="textarea"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="submitQuestion()">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>

  </div>


</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { getUserInfo ,updateUserApi} from '@/api/userApi';
import { getTotalBorrowed, getCurrentlyBorrowed, getBorrowingRecords} from '@/api/borrowApi'
import parseJwt from '@/utils/parseJwt';
import {lendBookApi} from '@/api/booksApi';
import { addQuestionApi } from '@/api/questionApi';


const userInfo = ref({});
const totalBorrowed = ref(0);
const currentlyBorrowed = ref(0);
const borrowingRecords = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const status = ref('');
const lend=ref({userId:'',bookId:'',status:1})
const dialogFormVisible = ref(false)
const formLabelWidth = '140px'
const question=reactive({
  userId:'',
  borrowRecordId:'',
  questionType:'',
  note:''
})


const userId=ref(); // This should be dynamically set based on the logged-in user

const fetchUserInfo = async () => {
  try {
    const response = await getUserInfo(userId.value);
    if (response.code === 1) {
      userInfo.value = response.data;
    } else {
      ElMessage.error('获取用户信息失败');
    }
  } catch (error) {
    console.error('Error fetching user info:', error);
    ElMessage.error('获取用户信息时发生错误');
  }
};

const fetchTotalBorrowed = async () => {
  try {
    const response = await getTotalBorrowed(userId.value);
    if (response.code) {
      console.log('这是总借'+response.data);
      totalBorrowed.value = response.data;
    } else {
      ElMessage.error('获取总借阅数失败');
    }
  } catch (error) {
    console.error('Error fetching total borrowed:', error);
    ElMessage.error('获取总借阅数时发生错误');
  }
};

const fetchCurrentlyBorrowed = async () => {
  try {
    const response = await getCurrentlyBorrowed(userId.value);
    if (response.code === 1) {
      currentlyBorrowed.value = response.data;
    } else {
      ElMessage.error('获取当前借阅数失败');
    }
  } catch (error) {
    console.error('Error fetching currently borrowed:', error);
    ElMessage.error('获取当前借阅数时发生错误');
  }
};

const fetchBorrowingRecords = async () => {
  try {

    const response = await getBorrowingRecords(currentPage.value, pageSize.value, status.value,userId.value);
    console.log(response);
    if (response.code === 1) {
      borrowingRecords.value = response.data.records;
      total.value = response.data.total;
    } else {
      ElMessage.error('获取借阅记录失败');
    }
  } catch (error) {
    console.error('Error fetching borrowing records:', error);
    ElMessage.error('获取借阅记录时发生错误');
  }
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  fetchBorrowingRecords();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchBorrowingRecords();
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN');
};

const formatDateTime = (row, column, cellValue) => {
  if (!cellValue) return '';
  const date = new Date(cellValue);
  return date.toLocaleString('zh-CN');
};
const ruleFormRef = ref(null);
// 校验
const rules = {
  username: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  cardId: [
    { required: true, message: '请输入身份证号码', trigger: 'blur' },
    {
      pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
      message: '请输入正确的身份证号码',
      trigger: 'blur'
    }
  ],
  phone: [
    { required: true, message: '请输入电话号码', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号码',
      trigger: 'blur'
    }
  ],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
  type:[{ required: true, message: '请选择反馈类型', trigger: 'change' }],
  note:[{ required:true,max:200,message:'最多输入200个字符' ,trigger: 'blur'}] 
};

// 还书
const returnBook = async (row) => {
  lend.value.bookId= row.bookId;
  lend.value.userId=row.userId;
  lend.value.status=row.status;
  const res=await lendBookApi(lend.value);
  if(res.code){
    ElMessage.success('还书成功');
    fetchUserInfo();
    fetchTotalBorrowed();
    fetchCurrentlyBorrowed();
    fetchBorrowingRecords();
  }else{
    ElMessage.error('还书失败'+res.msg);
  }
}

const editDialogVisible = ref(false);
const editForm = ref({
  id: '',
  username: '',
  name: '',
  cardId: '',
  phone: '',
  gender: '',
  image: '',
  address: ''
});

const showEditDialog = () => {
  editForm.value = { 
    ...userInfo.value, 
    gender: userInfo.value.gender === '1' ? 1 : 2 
  }
  editDialogVisible.value = true;
};

const handleAvatarSuccess = (response, file) => {
  editForm.value.image =response.data;
};

const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg';
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPG) {
    ElMessage.error('Avatar picture must be JPG format!');
  }
  if (!isLt2M) {
    ElMessage.error('Avatar picture size can not exceed 2MB!');
  }
  return isJPG && isLt2M;
};

const submitEditForm = async (formEl) => {
  if(!formEl) return;
  await formEl.validate(async (valid) => {
    if(valid){
      try {
        const response = await updateUserApi(editForm.value);
        if (response.code ) {
          ElMessage.success('个人信息更新成功');
          editDialogVisible.value = false;
          await fetchUserInfo(); // Refresh user info after update
        } else {
          ElMessage.error('更新个人信息失败');
        }
      } catch (error) {
        console.error('Error updating user info:', error);
        ElMessage.error('更新个人信息时发生错误');
      }
    }

  })

};
const openQuestionForm=(id)=>{
  question.borrowRecordId=id;
  question.userId=userId.value;
  dialogFormVisible.value=true;
}
const submitQuestion=async()=>{
  const res=await addQuestionApi(question);
  if(res.code){
    ElMessage.success('反馈成功')
  }else{
    ElMessage.error(res.msg)
  }
  dialogFormVisible.value=false;
}


onMounted(() => {
  const jwt=localStorage.getItem('user');
  const claim=parseJwt(jwt);
  userId.value=parseInt(claim.userId);
  console.log(userId.value)

  fetchUserInfo();
  fetchTotalBorrowed();
  fetchCurrentlyBorrowed();
  fetchBorrowingRecords();
});
</script>

<style scoped>
.user-homepage {
  padding: 20px;
}

.user-info-card {
  margin-bottom: 20px;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.statistics-row {
  margin-bottom: 20px;
}

.statistic-card {
  text-align: center;
}

.statistic-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.borrowing-records-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
</style>


