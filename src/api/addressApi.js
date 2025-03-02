import request from "@/utils/request";

export const getAddressApi=()=>request.get('/address/get')

export const getAddressesApi = (pageNum, pageSize, address) => {
    return request.get("/address/page", { params: { pageNum, pageSize, address } })
  }
  
  export const getAddressByIdApi = (id) => {
    return request.get(`/address/get/${id}`)
  }
  
  export const addAddressApi = (data) => {
    return request.post("/address/add", data)
  }
  
  export const updateAddressApi = (data) => {
    return request.put("/address/update", data)
  }
  
  export const deleteAddressApi = (id) => {
    return request.delete(`/address/delete/${id}`)
  }
  
