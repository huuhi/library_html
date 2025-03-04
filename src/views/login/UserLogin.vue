<script setup>
import { ref, reactive } from "vue";
import { loginApi } from "@/api/userApi";
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

const router = useRouter();
const ruleFormRef = ref(null);

const loginForm = ref({ username: '', password: '' });
const rules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 3, max: 20, message: '密码长度必须在6到20个字符之间', trigger: 'blur' }
  ]
});

const submitForm = async (formEl) => {
  if (!formEl) return;
  await formEl.validate(async (valid) => {
    if (valid) {
      try {
        const res = await loginApi(loginForm.value);
        if (res.code) {
          ElMessage.success('登录成功');
          localStorage.setItem('user', JSON.stringify(res.data.token));
          const role = res.data.role === 0 ? 'user' : 'admin';
          localStorage.setItem('role', role);
          router.push('/');
        } else {
          ElMessage.error('登录失败');
        }
      } catch (err) {
        if (err.response?.status === 500) {
          ElMessage.error('用户不存在或密码错误');
        } else {
          ElMessage.error('登录失败，请稍后再试');
        }
      }
    }
  });
};

const resetForm = (formEl) => {
  if (!formEl) return;
  formEl.resetFields();
};

const goToRegister = () => {
  router.push('/register');
};
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="login-title">图书馆登录</h1>
      <el-form
        ref="ruleFormRef"
        :model="loginForm"
        :rules="rules"
        label-position="top"
        class="login-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" prefix-icon="el-icon-user" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" prefix-icon="el-icon-lock" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm(ruleFormRef)" class="login-button">
            登录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="register-link">
        还没有账号？<el-button type="text" @click="goToRegister">立即注册</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
}

.login-title {
  color: #3a7bd5;
  font-size: 28px;
  margin-bottom: 30px;
  text-align: center;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.login-form {
  margin-top: 20px;
}

.login-button {
  width: 100%;
  margin-top: 20px;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
}

:deep(.el-form-item__label) {
  line-height: 20px;
  padding-bottom: 4px;
  font-weight: bold;
}

:deep(.el-button--primary) {
  background-color: #3a7bd5;
  border-color: #3a7bd5;
}

:deep(.el-button--primary:hover) {
  background-color: #4a8be5;
  border-color: #4a8be5;
}

:deep(.el-input__inner) {
  border-radius: 4px;
}

:deep(.el-button--text) {
  color: #3a7bd5;
}

:deep(.el-button--text:hover) {
  color: #4a8be5;
}
</style>