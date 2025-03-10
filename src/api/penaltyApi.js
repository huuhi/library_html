import request from "@/utils/request";

export const getPenaltyRecordsApi = (pageNum, pageSize, status) => {
    return request.get("/penalty/page", { params: { pageNum, pageSize, status } })
  }
  
  export const getPenaltyByIdApi = (id) => {
    return request.get(`/penalty/get/${id}`)
  }
  
  export const updatePenaltyApi = (data) => {
    return request.post("/penalty/update", data)
  }
  
  export const deletePenaltyApi = (id) => {
    return request.delete(`/penalty/${id}`)
  }
  export const payPenaltyApi = (id) => {
    return request.put(`/penalty/pay/${id}`)
  }
  export const getPenaltyByUserIdApi = (userId) => {
    return request.get(`/penalty/getUser/${userId}`)
  }
