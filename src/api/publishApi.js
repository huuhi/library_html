import request from "@/utils/request";


export const getPublishersApi = () => {
  return request.get("/publish/list")
}
export const getPublisherApi = (pageNum, pageSize, name) => {
  return request.get("/publish/page", { params: { pageNum, pageSize, name } })
}

export const getPublishByIdApi = (id) => {
  return request.get(`/publish/get/${id}`)
}

export const addPublishApi = (data) => {
  return request.post("/publish/add", data)
}

export const updatePublishApi = (data) => {
  return request.put("/publish/update", data)
}

export const deletePublishApi= (id) => {
  return request.delete(`/publish/delete/${id}`)
}