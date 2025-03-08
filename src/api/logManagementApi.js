import request from "@/utils/request"

// 分页查询日志
export const getLogs = (pageNum, pageSize, userId) => {
  return request.get("/log/page", {
    params: {
      pageNum,
      pageSize,
      userId: userId || undefined,
    },
  })
}

// 根据ID获取日志详情
export const getLogById = (id) => {
  return request.get(`/log/${id}`)
}

// 批量删除日志
export const deleteLogs = (ids) => {
  return request.delete(`/log/delete/${ids}`)
}

// 添加日志备注
export const addLogNote = (data) => {
  return request.put("/log/note", data)
}

