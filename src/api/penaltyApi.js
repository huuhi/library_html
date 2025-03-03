import request from "@/utils/request";

export const getPenaltyRecordsApi = (pageNum, pageSize, status) => {
    return request.get("/penalty/page", { params: { pageNum, pageSize, status } })
  }
  
  export const getPenaltyByIdApi = (id) => {
    return request.get(`/penalty/get/${id}`)
  }
  
  export const updatePenaltyApi = (data) => {
    return request.put("/penalty/update", data)
  }
  
  export const deletePenaltyApi = (id) => {
    return request.delete(`/penalty/${id}`)
  }