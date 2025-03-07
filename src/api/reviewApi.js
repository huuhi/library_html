import request from "@/utils/request";

export const addReviewApi=(data)=>{
    return  request.post('/review/send',data);
}

export const getReviewApi=(bookId,userId)=>{
    return request.get(`/review/get/${bookId}/${userId}`)
}
export const deleteReviewApi=(id)=>{
    return request.delete(`/review/delete/${id}`)
}

export const likeReviewApi=(reviewId,userId)=>{
    const data={"reviewId":reviewId,"userId":userId};
    return request.post(`/review-like/like`,data)
}
export const cancelLikeReviewApi=(reviewId,userId)=>{
    const data={"reviewId":reviewId,"userId":userId};
    return request.delete(`/review-like/cancel-like/${reviewId}/${userId}`)
}

export const getComments = (pageNum, pageSize, isAudit) => {
  return request.get("/review/page", { params: { pageNum, pageSize, isAudit } })
}

export const auditComment = (data) => {
  return request.put("/review/audit", data)
}

export const deleteComment = (id) => {
  return request.delete(`/review/delete/${id}`)
}

