<template>
    <div class="admin-dashboard">
      <!-- 欢迎区域 -->
      <div class="welcome-section">
        <el-card class="welcome-card">
          <div class="admin-info">
            <el-avatar :size="64" :src="adminInfo.image || '/placeholder.svg'" />
            <div class="admin-details">
              <h2>欢迎回来，{{ adminInfo.name || '管理员' }}</h2>
              <p>您已经入职 <span class="highlight">{{ daysSinceJoining }}</span> 天</p>
              <p>今天是 {{ currentDate }}</p>
            </div>
          </div>
        </el-card>
      </div>
  
      <!-- 统计卡片 -->
      <div class="stats-section">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6">
            <el-card class="stat-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>总用户数</span>
                  <el-icon><User /></el-icon>
                </div>
              </template>
              <div class="stat-value">{{ statistics.totalUsers }}</div>
              <div class="stat-trend" :class="{ 'positive': statistics.userGrowth > 0 }">
                <el-icon v-if="statistics.userGrowth > 0"><ArrowUp /></el-icon>
                <el-icon v-else><ArrowDown /></el-icon>
                {{ Math.abs(statistics.userGrowth)*100 }}% 较上月
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-card class="stat-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>总图书数</span>
                  <el-icon><Reading /></el-icon>
                </div>
              </template>
              <div class="stat-value">{{ statistics.totalBooks }}</div>
              <div class="stat-trend" :class="{ 'positive': statistics.bookGrowth > 0 }">
                <el-icon v-if="statistics.bookGrowth > 0"><ArrowUp /></el-icon>
                <el-icon v-else><ArrowDown /></el-icon>
                {{ Math.abs(statistics.bookGrowth)*100 }}% 较上月
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-card class="stat-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>本月借阅</span>
                  <el-icon><Document /></el-icon>
                </div>
              </template>
              <div class="stat-value">{{ statistics.monthlyBorrows }}</div>
              <div class="stat-trend" :class="{ 'positive': statistics.borrowGrowth > 0 }">
                <el-icon v-if="statistics.borrowGrowth > 0"><ArrowUp /></el-icon>
                <el-icon v-else><ArrowDown /></el-icon>
                {{ Math.abs(statistics.borrowGrowth)*100 }}% 较上月
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-card class="stat-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>已处理问题</span>
                  <el-icon><ChatDotRound /></el-icon>
                </div>
              </template>
              <div class="stat-value">{{ statistics.resolvedIssues }}</div>
              <div class="stat-trend positive">
                <el-icon><Check /></el-icon>
                解决率 {{ statistics.issueResolutionRate }}00%
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
  
      <!-- 图表区域 -->
      <div class="charts-section">
        <el-row :gutter="20">
          <el-col :xs="24" :md="12">
            <el-card class="chart-card">
              <template #header>
                <div class="card-header">
                  <span>借阅趋势</span>
                </div>
              </template>
              <div ref="borrowingTrendsChart" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :xs="24" :md="12">
            <el-card class="chart-card">
              <template #header>
                <div class="card-header">
                  <span>图书分类统计</span>
                </div>
              </template>
              <div ref="bookCategoriesChart" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>
      </div>
  
      <!-- 待处理事项 -->
      <div class="tasks-section">
        <el-row :gutter="20">
          <el-col :xs="24" :md="12">
            <el-card class="task-card">
              <template #header>
                <div class="card-header">
                  <span>待审核评论</span>
                  <el-button type="primary" link @click="navigateTo('/manager/review')">
                    查看全部
                  </el-button>
                </div>
              </template>
              <div v-if="pendingComments.length > 0">
                <el-table :data="pendingComments" style="width: 100%">
                  <el-table-column prop="username" label="用户" width="100" />
                  <el-table-column prop="content" label="内容" show-overflow-tooltip />
                  <el-table-column prop="createTime" label="时间" width="180">
                    <template #default="scope">
                      {{ formatDateTime(scope.row.createTime) }}
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="100">
                    <template #default="scope">
                      <el-button type="primary" link @click="navigateToCommentAudit(scope.row.id)">
                        审核
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <div v-else class="empty-state">
                <el-icon><CircleCheckFilled /></el-icon>
                <span>没有待审核的评论</span>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :md="12">
            <el-card class="task-card">
              <template #header>
                <div class="card-header">
                  <span>用户反馈</span>
                  <el-button type="primary" link @click="navigateTo('/manager/appeal')">
                    查看全部
                  </el-button>
                </div>
              </template>
              <div v-if="userFeedbacks.length > 0">
                <el-table :data="userFeedbacks" style="width: 100%">
                  <el-table-column prop="userId" label="用户ID" width="80" />
                  <el-table-column prop="appealTypeName" label="类型" width="100" />
                  <el-table-column prop="note" label="内容" show-overflow-tooltip />
                  <el-table-column label="操作" width="100">
                    <template #default="scope">
                      <el-button type="primary" link @click="navigateToFeedbackDetail(scope.row.id)">
                        处理
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <div v-else class="empty-state">
                <el-icon><CircleCheckFilled /></el-icon>
                <span>没有待处理的用户反馈</span>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
  
      <!-- 快速操作 -->
      <div class="quick-actions-section">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>快速操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary" @click="navigateTo('/manager/usermanage')">
              <el-icon><User /></el-icon>
              用户管理
            </el-button>
            <el-button type="success" @click="navigateTo('/manager/bookmanage')">
              <el-icon><Reading /></el-icon>
              图书管理
            </el-button>
            <el-button type="warning" @click="navigateTo('/manager/borrow')">
              <el-icon><Document /></el-icon>
              借阅记录
            </el-button>
            <el-button type="danger" @click="navigateTo('/manager/penalty')">
              <el-icon><Warning /></el-icon>
              罚款管理
            </el-button>
            <el-button type="info" @click="navigateTo('/manager/log')">
              <el-icon><List /></el-icon>
              系统日志
            </el-button>
          </div>
        </el-card>
      </div>
  
      <!-- 最近活动 -->
      <div class="recent-activity-section">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近活动</span>
            </div>
          </template>
          <div class="timeline">
            <el-timeline>
              <el-timeline-item
                v-for="activity in recentActivities"
                :key="activity.id"
                :timestamp="formatDateTime(activity.time)"
                :type="activity.type"
              >
                {{ activity.content }}
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, nextTick } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import * as echarts from 'echarts'
  import { getAdminInfo, getAdminStatistics } from '@/api/adminApi'
  import { getPendingComments } from '@/api/reviewApi'
  import { getPendingFeedbacks } from '@/api/questionApi'
  import { getClazzAndCount } from '@/api/clazzApi' // 确保这个接口对应图书分类统计接口
  import { getBorrowingTrends ,getActivityApi} from '@/api/adminApi'
  
  const router = useRouter()
  const adminInfo = ref({})
  const daysSinceJoining = ref(0)
  const currentDate = ref('')
  const statistics = ref({
    totalUsers: 0,
    userGrowth: 0,
    totalBooks: 0,
    bookGrowth: 0,
    monthlyBorrows: 0,
    borrowGrowth: 0,
    resolvedIssues: 0,
    issueResolutionRate: 0
  })
  const pendingComments = ref([])
  const userFeedbacks = ref([])
  const recentActivities = ref([])
  const borrowingTrendsChart = ref(null)
  const bookCategoriesChart = ref(null)
  
  // 获取管理员信息
  const fetchAdminInfo = async () => {
    try {
      // 这里应该调用实际的API，现在使用模拟数据
      const response = await getAdminInfo()
      if (response.code === 1) {
        adminInfo.value = response.data
      }
      
      // 计算入职天数
      const regDate = new Date(adminInfo.value.regTime)
      const today = new Date()
      const diffTime = Math.abs(today - regDate)
      daysSinceJoining.value = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      // 设置当前日期
      currentDate.value = today.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      })
    } catch (error) {
      console.error('Error fetching admin info:', error)
      ElMessage.error('获取管理员信息失败')
    }
  }
  
  // 获取统计数据
  const fetchStatistics = async () => {
    try {
      const response = await getAdminStatistics()
      if (response.code === 1) {
        statistics.value = response.data
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
      ElMessage.error('获取统计数据失败')
    }
  }
  
  // 获取待审核评论
  const fetchPendingComments = async () => {
    try {
      // 这里应该调用实际的API，现在使用模拟数据
      const response = await getPendingComments(1, 5)
      if (response.code) {
        pendingComments.value = response.data.records
      }else{
        ElMessage.error('获取待审核评论失败')
      }
    } catch (error) {
      console.error('Error fetching pending comments:', error)
      ElMessage.error('获取待审核评论失败')
    }
  }
  
  // 获取用户反馈
  const fetchUserFeedbacks = async () => {
    try {
      const response = await getPendingFeedbacks(1, 5)
      if (response.code ) {
        userFeedbacks.value = response.data.records
      }else{
        ElMessage.error('获取用户反馈失败')
      }
    } catch (error) {
      console.error('Error fetching user feedbacks:', error)
      ElMessage.error('获取用户反馈失败')
    }
  }
  
  // 获取最近活动
  const fetchRecentActivities = async () => {
    try {
      // 这里应该调用实际的API，现在使用模拟数据
      const response = await getActivityApi()
      if (response) {
        recentActivities.value = response.data
      }else{
        ElMessage.error('获取最近活动失败')
      }
      
      // 模拟数据
    //   recentActivities.value = [
    //     {
    //       id: 1,
    //       type: 'primary',
    //       content: '用户ID 123 借阅了《JavaScript高级程序设计》',
    //       time: '2025-03-08T14:30:00'
    //     },
    //     {
    //       id: 2,
    //       type: 'success',
    //       content: '管理员审核通过了3条评论',
    //       time: '2025-03-08T13:45:22'
    //     },
    //     {
    //       id: 3,
    //       type: 'warning',
    //       content: '用户ID 456 的借阅已逾期',
    //       time: '2025-03-08T12:10:05'
    //     },
    //     {
    //       id: 4,
    //       type: 'info',
    //       content: '系统添加了10本新书',
    //       time: '2025-03-08T11:05:30'
    //     },
    //     {
    //       id: 5,
    //       type: 'danger',
    //       content: '用户ID 789 报告图书损坏',
    //       time: '2025-03-08T10:20:15'
    //     }
    //   ]
    } catch (error) {
      console.error('Error fetching recent activities:', error)
      ElMessage.error('获取最近活动失败')
    }
  }
  
  // 初始化借阅趋势图表
  const initBorrowingTrendsChart = async () => {
    const chartDom = borrowingTrendsChart.value
    const myChart = echarts.init(chartDom)
    
    try {
      // 调用后端API获取真实数据
      const response = await getBorrowingTrends()
      if (response.code === 1) {
        const chartData = response.data

        const option = {
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data: ['借出', '归还']
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: chartData.months
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              name: '借出',
              type: 'line',
              data: chartData.borrowed,
              smooth: true,
              lineStyle: {
                width: 3,
                color: '#409EFF'
              },
              areaStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
                    { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
                  ]
                }
              }
            },
            {
              name: '归还',
              type: 'line',
              data: chartData.returned,
              smooth: true,
              lineStyle: {
                width: 3,
                color: '#67C23A'
              },
              areaStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
                    { offset: 1, color: 'rgba(103, 194, 58, 0.1)' }
                  ]
                }
              }
            }
          ]
        }
        
        myChart.setOption(option)
      }
    } catch (error) {
      console.error('获取借阅趋势数据失败:', error)
      ElMessage.error('获取借阅趋势数据失败')
    }
    
    // 响应窗口大小变化
    window.addEventListener('resize', () => {
      myChart.resize()
    })
  }
  // 初始化图书分类统计图表
  const initBookCategoriesChart = async () => {
    const chartDom = bookCategoriesChart.value
    const myChart = echarts.init(chartDom)
    
    try {
      // 调用接口获取真实数据
      const response = await getClazzAndCount()
      if (response.code === 1) {
        const categories = response.data

        const option = {
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            left: 10,
            data: categories.map(item => item.name)
          },
          series: [
            {
              name: '图书分类',
              type: 'pie',
              radius: ['50%', '70%'],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
              },
              label: {
                show: false,
                position: 'center'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: 16,
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: false
              },
              data: categories.map(item => ({
                value: item.value,
                name: item.name
              }))
            }
          ]
        }
        
        myChart.setOption(option)
      }
    } catch (error) {
      console.error('获取分类数据失败:', error)
      ElMessage.error('获取图书分类数据失败')
    }

    // 响应窗口大小变化
    window.addEventListener('resize', () => {
      myChart.resize()
    })
  }
  
  // 导航到指定页面
  const navigateTo = (path) => {
    router.push(path)
  }
  
  // 导航到评论审核页面
  const navigateToCommentAudit = (id) => {
    router.push({
      path: '/manager/review',
      query: { id }
    })
  }
  
  // 导航到反馈详情页面
  const navigateToFeedbackDetail = (id) => {
    router.push({
      path: '/manager/appeal',
      query: { id }
    })
  }
  
  // 格式化日期时间
  const formatDateTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }
  
  onMounted(async () => {
    await fetchAdminInfo()
    await fetchStatistics()
    await fetchPendingComments()
    await fetchUserFeedbacks()
    await fetchRecentActivities()
    
    // 等待DOM更新后初始化图表
    nextTick(() => {
      initBorrowingTrendsChart()
      initBookCategoriesChart()
    })
  })
  </script>
  
  <style scoped>
  .admin-dashboard {
    padding: 20px;
  }
  
  .welcome-section {
    margin-bottom: 20px;
  }
  
  .welcome-card {
    background: linear-gradient(135deg, #3a7bd5, #00d2ff);
    color: white;
  }
  
  .admin-info {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  
  .admin-details h2 {
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 24px;
  }
  
  .admin-details p {
    margin: 5px 0;
    font-size: 14px;
  }
  
  .highlight {
    font-weight: bold;
    font-size: 16px;
  }
  
  .stats-section {
    margin-bottom: 20px;
  }
  
  .stat-card {
    height: 100%;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .stat-value {
    font-size: 28px;
    font-weight: bold;
    margin: 10px 0;
  }
  
  .stat-trend {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 14px;
    color: #f56c6c;
  }
  
  .stat-trend.positive {
    color: #67c23a;
  }
  
  .charts-section {
    margin-bottom: 20px;
  }
  
  .chart-container {
    height: 300px;
  }
  
  .tasks-section {
    margin-bottom: 20px;
  }
  
  .task-card {
    height: 100%;
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
    color: #909399;
  }
  
  .empty-state .el-icon {
    font-size: 48px;
    margin-bottom: 10px;
    color: #67c23a;
  }
  
  .quick-actions-section {
    margin-bottom: 20px;
  }
  
  .quick-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .quick-actions .el-button {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  
  .recent-activity-section {
    margin-bottom: 20px;
  }
  
  .timeline {
    padding: 10px;
  }
  
  @media (max-width: 768px) {
    .stat-card {
      margin-bottom: 20px;
    }
    
    .chart-card {
      margin-bottom: 20px;
    }
    
    .task-card {
      margin-bottom: 20px;
    }
  }
  </style>
  
  