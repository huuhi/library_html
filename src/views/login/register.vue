<script setup>
import { ref, reactive, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { registerApi } from '@/api/userApi';

const router = useRouter();
const activeStep = ref(0);
const ruleFormRef = ref(null);
const carousel = ref(null);

const registerForm = reactive({
  username: '',
  name: '',
  password: '',
  confirmPassword: '',
  cardId: '',
  phone: '',
  gender: '',
  address: '',
  image: ''
});

const rules = {
  username: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度必须在6到20个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
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
  image: [{ required: true, message: '请上传头像', trigger: 'change' }]
};

const isStepValid = computed(() => {
  switch (activeStep.value) {
    case 0:
      return registerForm.username && registerForm.name && registerForm.image;
    case 1:
      return registerForm.password && registerForm.confirmPassword && registerForm.password === registerForm.confirmPassword;
    case 2:
      return registerForm.cardId && registerForm.phone && registerForm.gender;
    default:
      return true;
  }
});

const submitForm = async (formEl) => {
  if (!formEl) return;
  await formEl.validate(async (valid) => {
    if (valid) {
      const res=await registerApi(registerForm);
      if(res.code){
        console.log('注册表单提交', registerForm);
        ElMessage.success('注册成功');
        router.push('/login');
      }else{
        ElMessage.error('注册失败'+res.msg);
      }
    } else {
      console.log('表单验证失败');
      return false;
    }
  });
};


const nextStep = async (formEl) => {
  if (!formEl) return;
  if (activeStep.value === 0 || activeStep.value === 1 || await formEl.validate()) {
    activeStep.value++;
    carousel.value.next();
  }
};

const prevStep = () => {
  activeStep.value--;
  carousel.value.prev();
};

const resetForm = (formEl) => {
  if (!formEl) return;
  formEl.resetFields();
  activeStep.value = 0;
  carousel.value.setActiveItem(0);
};

const goToLogin = () => {
  router.push('/login');
};

const handleAvatarSuccess = (response, uploadFile) => {
  console.log(response.code+''+response.data)
  if (response.code) {
    registerForm.image = response.data;
    console.log(registerForm.image);
    ElMessage.success('头像上传成功');
  } else {
    ElMessage.error('头像上传失败');
  }
};

const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error('上传头像图片只能是图片格式!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!');
    return false;
  }
  return true;
};
</script>

<template>
  <div class="register-container">
    <div class="register-box">
      <h1 class="register-title">图书馆用户注册</h1>
      <el-steps :active="activeStep" finish-status="success" simple style="margin-top: 20px">
        <el-step title="基本信息" />
        <el-step title="账户安全" />
        <el-step title="个人信息" />
      </el-steps>
      <el-form
        ref="ruleFormRef"
        :model="registerForm"
        :rules="rules"
        label-position="top"
        class="register-form"
      >
        <el-carousel
          :autoplay="false"
          indicator-position="none"
          :loop="false"
          height="400px"
          ref="carousel"
          :initial-index="activeStep"
        >
          <el-carousel-item>
            <el-form-item label="头像" prop="image">
              <el-upload
                class="avatar-uploader"
                action="api/common/upload"
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload"
              >
                <img v-if="registerForm.image" :src="registerForm.image" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
            <el-form-item label="昵称" prop="username">
              <el-input v-model="registerForm.username" />
            </el-form-item>
            <el-form-item label="姓名" prop="name">
              <el-input v-model="registerForm.name" />
            </el-form-item>

          </el-carousel-item>
          <el-carousel-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="registerForm.password" type="password" show-password />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="registerForm.confirmPassword" type="password" show-password />
            </el-form-item>
          </el-carousel-item>
          <el-carousel-item>
            <el-form-item label="身份证号码" prop="cardId">
              <el-input v-model="registerForm.cardId" />
            </el-form-item>
            <el-form-item label="电话号码" prop="phone">
              <el-input v-model="registerForm.phone" />
            </el-form-item>
            <el-form-item label="性别" prop="gender">
              <el-select v-model="registerForm.gender" placeholder="请选择性别">
                <el-option label="男" value="1" />
                <el-option label="女" value="2" />
              </el-select>
            </el-form-item>
            <el-form-item label="地址">
              <el-input v-model="registerForm.address" />
            </el-form-item>
          </el-carousel-item>
        </el-carousel>
        <div class="form-actions">
          <el-button v-if="activeStep > 0" @click="prevStep">上一步</el-button>
          <el-button
            v-if="activeStep < 2"
            type="primary"
            @click="nextStep(ruleFormRef)"
            :disabled="!isStepValid"
          >
            下一步
          </el-button>
          <el-button
            v-if="activeStep === 2"
            type="primary"
            @click="submitForm(ruleFormRef)"
            :disabled="!isStepValid"
          >
            注册
          </el-button>
          <el-button @click="resetForm(ruleFormRef)">重置</el-button>
        </div>
      </el-form>
      <div class="login-link">
        已有账号？<el-button type="text" @click="goToLogin">立即登录</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.register-box {
  width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
}

.register-title {
  color: #3a7bd5;
  font-size: 28px;
  margin-bottom: 20px;
  text-align: center;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.register-form {
  margin-top: 20px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
}

:deep(.el-step__title) {
  font-size: 14px;
}

:deep(.el-carousel__container) {
  height: 400px !important;
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

:deep(.el-step.is-simple .el-step__title) {
  font-size: 14px;
  color: #606266;
}

:deep(.el-step.is-simple .el-step__head.is-process .el-step__icon-inner) {
  background-color: #3a7bd5;
}

:deep(.el-step__head.is-process .el-step__icon.is-text) {
  background-color: #3a7bd5;
  border-color: #3a7bd5;
}

.avatar-uploader {
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
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}

.avatar {
  width: 100px;
  height: 100px;
  display: block;
}
</style>