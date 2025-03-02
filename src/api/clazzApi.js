import request  from "@/utils/request";

export const getClazzApi = () => request.get("/class");

export const getAllClazzApi = () => request.get("/class/all");

export const getClazzByPageApi = (pageNum, pageSize, className) => {
    return request.get("/class/page", { params: { pageNum, pageSize, className } })
  }
  
  export const getClazzById = (id) => {
    return request.get(`/class/${id}`)
  }
  
  export const addClazz = (data) => {
    return request.post("/class/add", data)
  }
  
  export const updateClazz = (data) => {
    return request.put("/class/update", data)
  }
  
  export const deleteClazz = (id) => {
    return request.delete(`/class/${id}`)
  }

