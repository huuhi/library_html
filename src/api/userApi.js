import request  from "@/utils/request";

export const loginApi=(data)=>request.post('/user/login',data)
export const registerApi=(data)=>request.post('/user/register',data)

export const changPassword = (id, oldPassword, newPassword) => {
    const data = {
        id: id,
        oldPassword: oldPassword,
        newPassword: newPassword
    };
    return request.put('/user/password', data);
};

export const getUserInfo = (id) => {
    return request.get(`/user/${id}`)
  };

export const updateUserApi=(data)=>request.put('/user',data)  