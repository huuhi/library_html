import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

const request=axios.create({  
  baseURL:'/api',
  //超时时间 5s
  timeout:5000,
  withCredentials: true // 关键配置
})
// axios的请求request拦截器
request.interceptors.request.use(
  (config) => {
    const token=JSON.parse(localStorage.getItem('user'))
    if(token){
      config.headers.token=token
    }
    return config
  },
  (error)=>{
    return Promise.reject(error)
  }
)

// reponse 拦截器 需要判断返回的错误信息
request.interceptors.response.use(
  (response)=>{
    if(response.data.msg==='NOT_LOGIN'){
      ElMessage.error('请先登录')
      localStorage.removeItem('user')
      localStorage.removeItem('role')
      window.location.href = '/login'
    }
    return response.data
  },
  (error)=>{
    return Promise.reject(error)
  }
)
export default request