import request from "@/utils/request";

// 发送帖子
export const sendPostApi=(data)=>{
    return request.post('/post/send',data)
}
// 获取帖子列表
export const getPostListApi=(keyWords)=>{
    return request.get('/post/list',{params:{keyWords}})
}
// 删除帖子
export const deletePostApi=(id)=>{
    return request.delete(`/post/${id}`)
}
// 获取帖子详情
export const getPostDetailApi=(id)=>{
    return request.get(`/post/get/${id}`)
}
// 修改帖子
export const updatePostApi=(data)=>{
    return request.put('/post/update',data)
}
//根据用户id获取帖子列表
export const getPostListByUserIdApi=(userId)=>{
    return request.get(`/post/${userId}`)
}
// 点赞帖子
export const likePostApi=(postId,userId)=>{
    return request.post(`/post-like`,{postId,userId})
}
// 取消点赞帖子
export const cancelLikePostApi=(postId,userId)=>{
    return request.delete(`/unlike`,{params:{postId,userId}})
}
