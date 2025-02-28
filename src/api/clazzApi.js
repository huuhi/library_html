import request  from "@/utils/request";

export const getClazzApi = () => request.get("/class");

export const getAllClazzApi = () => request.get("/class/all");