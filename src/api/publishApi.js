import request from "@/utils/request";


export const getPublishersApi = () => {
  return request.get("/publish/list")
}
