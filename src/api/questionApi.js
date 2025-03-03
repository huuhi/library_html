import request from "@/utils/request";

export const addQuestionApi=(data)=>request.post('/question/add',data)
