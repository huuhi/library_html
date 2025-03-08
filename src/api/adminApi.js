import request from "@/utils/request"

// 获取管理员信息
export const getAdminInfo = () => {
  return request.get("/admin/info")
}

// 获取管理员统计数据
export const getAdminStatistics = () => {
  return request.get("/admin/statistics")
}

// 获取借阅趋势数据
export const getBorrowingTrends = () => {
  return request.get("/admin/borrowing-trends")
}
export const getActivityApi = () => {
     return request.get("/admin/activity/recent")
}



