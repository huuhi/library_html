import request from "@/utils/request";

export const addQuestionApi=(data)=>request.post('/question/add',data)

export const fetchUserFeedbacks = (pageNum, pageSize, status, type) => {
  return request.get("/question/list", { params: { pageNum, pageSize, status, type } })
}

export const getFeedbackDetail = (id) => {
  return request.get(`/question/${id}`)
}

export const updateFeedbackStatus = (data) => {
  return request.post("/question/workOut", data)
}

export const removeFeedback = (id) => {
  return request.delete(`/question/${id}`)
}
export const getUserMessages = (userId) => {
  return request.get(`/question/getUserQuestion/${userId}`)
}
export const getUserMessageCount=(userId)=>{
  return request.get(`/question/getCount/${userId}`)
}
export const getPendingFeedbacks = (pageNum, pageSize) => {
  return request.get("/question/user-feedback/pending", { params: { pageNum, pageSize } })
}

