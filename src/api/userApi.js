import request  from "@/utils/request";

export const loginApi=(data)=>request.post('/user/login',data)
export const registerApi=(data)=>request.post('/user/register',data)