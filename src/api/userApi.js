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


export const getUsernameAndIdApi=()=>request.get('/user/all')


export const fetchUsers = (page, pageSize, username, role, status) => {
    return request.get("/user/list", { params: { page, pageSize, username, role, status } })
  }
  
  export const getUserById = (id) => {
    return request.get(`/user/${id}`)
  }
  
  export const updateUserStatus = (status, id, violationReason) => {
    return request.put(`/user/status/${status}`,  null, { params: { id, violationReason } })
  }
  
  export const updateUserConfine = (confine, id) => {
    return request.put(`/user/confine/${confine}`, null, { params: { id } })
  }
  export const exitApi=(id)=>{
    return request.put(`/user/exit/${id}`)
  }