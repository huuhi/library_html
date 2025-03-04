<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
// import { changPassword } from '@/api/use'

const router = useRouter()
const centerDialogVisible = ref(false)
const id = ref('')
const username = ref('')
const image=ref('')

// 退出登录
const login = () => {
  centerDialogVisible.value = false
  localStorage.removeItem('user')
  localStorage.removeItem('role')
  router.push('/login')
}

const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join('')
    )

    return JSON.parse(jsonPayload)
  } catch (err) {
    console.error('Failed to parse JWT:', err)
    return null
  }
}

onMounted(() => {
  // 获取用户信息
  const token=localStorage.getItem('user')
  const claim=parseJwt(token)
  console.log(claim)
  id.value=claim.userId;
  image.value=claim.userImage;
  console.log(image.value)
  username.value=claim.username;
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
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
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
    if (pwdFormRef.value) {
      await pwdFormRef.value.validate()
      
      // 这里应该调用实际的API
      // const res = await changPassword(id.value, pwdForm.oldPassword, pwdForm.newPassword)
      
      // 模拟成功响应
      ElMessage.success('修改成功，请重新登录')
      pwdDialogVisible.value = false
      
      // 跳转登录
      setTimeout(() => {
        localStorage.removeItem('user')
        localStorage.removeItem('role')
        router.push('/login')
      }, 1000)
    }
  } catch (e) {
    console.log('表单验证失败', e)
  }
}

// 重置表单
const resetForm = () => {
  if (pwdFormRef.value) {
    pwdFormRef.value.resetFields()
  }
}

// 处理菜单导航
const handleMenuSelect = (path) => {
  router.push(path)
}
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <el-page-header icon="">
          <template #content>
            <div class="flex items-center justify-center">
              <el-avatar
                :size="32"
                class="mr-3"
                :src=image
              />
              <span class="text-large font-600 mr-3"> {{ username || '管理员' }} </span>
              <el-tag>管理员</el-tag>
            </div>
          </template>
          <template #extra>
            <div class="flex items-center justify-center">
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
        <el-aside width="200px">
          <!-- 左侧菜单栏 -->
          <el-menu 
            router 
            :default-active="$route.path"
          >
            <!-- 图书管理菜单 -->
            <el-sub-menu index="/manager">
              <template #title>
                <el-icon><Setting /></el-icon>图书管理
              </template>
              <el-menu-item index="/manager/bookmanage">
                <el-icon><Notebook /></el-icon>图书管理
              </el-menu-item>
              <el-menu-item index="/manager/address">
                <el-icon><Location /></el-icon>地址管理
              </el-menu-item>
              <el-menu-item index="/manager/clazz">
                <el-icon><Folder /></el-icon>分类管理
              </el-menu-item>
              <el-menu-item index="/manager/publish">
                <el-icon><Reading /></el-icon>出版社管理
              </el-menu-item>
              <el-menu-item index="/manager/borrow">
                <el-icon><Files /></el-icon>借阅记录
              </el-menu-item>
              <el-menu-item index="/manager/penalty">
                <el-icon><Files /></el-icon>罚款跟踪
              </el-menu-item>
            
            </el-sub-menu>



            <!-- 用户管理 -->
            <el-sub-menu index="/manager/user">
              <template #title>
                <el-icon><UserFilled /></el-icon>用户管理
              </template>
              <el-menu-item index="/manager/usermanage">
                <el-icon><Avatar /></el-icon>用户管理
              </el-menu-item>
              <el-menu-item index="/manager/appeal">
                <el-icon><QuestionFilled /></el-icon>用户反馈
              </el-menu-item>
            </el-sub-menu>

            <el-menu-item index="/manager/index">
              <el-icon><HomeFilled /></el-icon>
              <span>我的</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main>
          <!-- 动态路由 -->
          <router-view></router-view>
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
.el-header {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.el-aside {
  border-right: 1px solid #eee;
}

.el-menu {
  border-right: none;
}
</style>