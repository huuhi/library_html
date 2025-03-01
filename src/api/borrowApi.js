import request  from "@/utils/request";

export const getTotalBorrowed = (userId) => {
    return request.get(`/borrow/user/count/${userId}`)
  }
  
  export const getCurrentlyBorrowed = (userId) => {
    return request.get(`/borrow/count/${userId}`)
  }
  
  export const getBorrowingRecords = (pageNum,pageSize,status,userId) => {
    const params = new URLSearchParams()
    if (userId) params.append("userId", userId)
    if (status !== undefined) params.append("status", status)
    params.append("pageNum", pageNum)
    params.append("pageSize", pageSize)


    return request.get(`/borrow?${params.toString()}`)
  }