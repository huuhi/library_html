<script lang="js" setup>
import { ref, reactive ,onMounted,nextTick ,computed} from 'vue'
import { ElMessage } from 'element-plus'
import { changPassword } from '@/api/userApi'
import  parseJwt  from '@/utils/parseJwt';
import {Message} from '@element-plus/icons-vue'
import { useRoute } from 'vue-router' 
import { getUserMessageCount } from '@/api/questionApi';
const route = useRoute();
const centerDialogVisible = ref(false)
const id=ref();
const username=ref();
const image=ref('');
const messageCount=ref(0);

const showSidebar = computed(() => {
  return !route.path.startsWith('/message') // 根据路由路径判断
})

const handleOpen = (key, keyPath) => {
  console.log(key, keyPath)
}
const handleClose = (key, keyPath) => {
  console.log(key, keyPath)
}
// 退出登录
const login = () => {
  // 跳转登录页面
  centerDialogVisible.value=false;

  localStorage.removeItem('user');
  localStorage.removeItem('role');
  window.location.href = '/login'

  //
}
// localStorage.getItem('user')
// const parseJwt=(token)=> {
//     try {
//         const base64Url = token.split('.')[1];
//         const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//         const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
//             return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
//         }).join(''));

//         return JSON.parse(jsonPayload);
//     } catch (err) {
//         console.error('Failed to parse JWT:', err);
//         return null;
//     }
// }
// 修改密码
const onBack=()=>{
  window.history.back();
}
const getMessageCount=async()=>{
  const res= await getUserMessageCount(id.value)
  messageCount.value=res.data;

}


onMounted(()=>{
  const token=localStorage.getItem('user')
  const claim=parseJwt(token)
  console.log(claim)
  id.value=claim.userId;
  image.value=claim.userImage;
  console.log(image.value)
  username.value=claim.username;
  getMessageCount();
})
// 修改密码对话框状态
const pwdDialogVisible = ref(false)

// 表单数据
const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单引用
const pwdFormRef = ref(null)

// 校验规则
const pwdRules = reactive({
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { max: 32, message: '密码长度不能超过32位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== pwdForm.newPassword) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

// 提交修改
const submitPwd = async () => {
  try {
    await nextTick();
    console.log('提交修改', pwdForm)
    // 表单验证
    await pwdFormRef.value.validate()

    console.log(id.value,pwdForm.oldPassword,pwdForm.newPassword,id.value)
    const res = await changPassword(id.value,pwdForm.oldPassword,pwdForm.newPassword)

    if (res.code) {
      ElMessage.success('修改成功，请重新登录')
      pwdDialogVisible.value = false
      // 跳转登录
      setTimeout(() => {
        window.location.href = '/login'
      }, 1000)
    } else {
      ElMessage.error(res.msg)
    }
  } catch (e) {
    console.log('表单验证失败', e)
  }
}
const toMessageView=()=>{
  getMessageCount();
  window.location.href = '/message'

}

// 模拟修改密码API

// 重置表单
const resetForm = () => {
  pwdFormRef.value?.resetFields()
}
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <el-page-header @back="onBack">
            <template #content>
            <div class="flex items-center justify-center" style="align-items: center">
              <el-avatar :size="32" class="mr-3" :src="image" />
              <span class="text-large font-600 mr-3"> {{ username }} </span>
              <!-- <span class="text-sm mr-2" style="color: var(--el-text-color-regular)">
                    的小项目
                    </span> -->
            </div>
          </template>
          <template #extra>
            <div class="flex items-center justify-center">
              <el-badge :value=messageCount :max="99" hidden="messageCount==0" class="item">
                <el-button type="info" :icon="Message" circle  @click="toMessageView"/>
              </el-badge>
              <el-button @click="pwdDialogVisible = true">修改密码</el-button>
              <el-button
                type="primary"
                class="ml-2"
                plain
                @click="centerDialogVisible = true"
                >退出登录</el-button
              >
            </div>
          </template>
        </el-page-header>
      </el-header>
      <el-container>
        <el-aside v-if="showSidebar" width="200px">
          <!-- 左侧菜单栏 -->
          <el-menu router="true">
            <!-- 首页菜单 -->
            <el-menu-item index="/user/books">
              <el-icon><Reading /></el-icon>
              <span>首页</span>
            </el-menu-item>

            <!-- 班级管理菜单 -->
            <!-- <el-sub-menu index="/profile">
               <template #title>
                <el-icon><Menu /></el-icon> 班级学员管理
              </template> 
               <el-menu-item index="/clazz">
                <el-icon><HomeFilled /></el-icon>班级管理
              </el-menu-item>
               <el-menu-item index="/stu">
                <el-icon><UserFilled /></el-icon>学员管理
              </el-menu-item> 
            </el-sub-menu>  -->
            <el-menu-item index="/user/profile">
              <el-icon><House /></el-icon>
              <span>我的</span>
            </el-menu-item>

            <!-- 系统信息管理 -->
            <!-- <el-sub-menu index="/system">
              <template #title>
                <el-icon><Tools /></el-icon>系统信息管理
              </template>
              <el-menu-item index="/dept">
                <el-icon><HelpFilled /></el-icon>部门管理
              </el-menu-item>
              <el-menu-item index="/emp">
                <el-icon><Avatar /></el-icon>员工管理
              </el-menu-item>
            </el-sub-menu> -->

            <!-- 数据统计管理 -->
            <!-- <el-sub-menu index="/report">
              <template #title>
                <el-icon><Histogram /></el-icon>数据统计管理
              </template>
              <el-menu-item index="/empReport">
                <el-icon><InfoFilled /></el-icon>员工信息统计
              </el-menu-item>
              <el-menu-item index="/stuReport">
                <el-icon><Share /></el-icon>学员信息统计
              </el-menu-item>
              <el-menu-item index="/log">
                <el-icon><Document /></el-icon>日志信息统计
              </el-menu-item>
            </el-sub-menu> -->
          </el-menu>
        </el-aside>
        <el-main :class="{ 'full-width': !showSidebar }" id="main">
          <!-- 动态路由 -->
          <router-view></router-view>
          <!-- 页面 -->
        </el-main>
      </el-container>
    </el-container>

    <!-- 提示框 -->
    <el-dialog
      v-model="centerDialogVisible"
      title="提示"
      width="500"
      align-center
    >
      <span>确定退出登录吗？</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="centerDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="login()"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>
  

    <!-- 修改密码 -->
    <el-dialog
      v-model="pwdDialogVisible"
      title="修改密码"
      width="500px"
      @closed="resetForm"
    >
      <el-form
        ref="pwdFormRef"
        :model="pwdForm"
        :rules="pwdRules"
        label-width="100px"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="pwdForm.oldPassword"
            type="password"
            show-password
            placeholder="请输入原密码"
          />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="pwdForm.newPassword"
            type="password"
            show-password
            placeholder="请输入新密码（最长32位）"
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="pwdForm.confirmPassword"
            type="password"
            show-password
            placeholder="请再次输入新密码"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="pwdDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPwd">确认修改</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.hover-icon {
  transition: transform 0.2s ease-in-out;
  margin-top: 15px;
}
.hover-icon:hover {
  transform: scale(1.1);
  color: var(--el-color-primary); /* 悬停变色 */
}
.full-width {
  margin-left: 0 !important; /* 隐藏侧边栏时铺满宽度 */
}
.item {
  margin-top: 10px;
  margin-right: 40px;
}
:deep(#main) {
  margin-top: 0px; /* 根据 header 高度调整 */
  overflow: auto;
  height: calc(100vh - 60px);
}
</style>
