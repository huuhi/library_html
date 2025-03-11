import request from "@/utils/request";

export const getLikeMessageList = (userId) => request.get(`/message/like/${userId}`);

export const getCommentMessageList = (userId) => request.get(`/message/review/${userId}`);

export const getNotReadReviewMessageCount=(userId)=>request.get(`/message/not-read/review/${userId}`);

export const getNotReadLikeMessageCount=(userId)=>request.get(`/message/not-read/like/${userId}`);
