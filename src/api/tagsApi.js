import request from "@/utils/request";

export const addTag=(data)=>{
    return request.post('/tag/add',data);
}

export const getTagList=(name)=>{
    return request.get('/tag/getTag',{params:{name}});
}


