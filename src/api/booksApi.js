import request  from "@/utils/request";

export const searchBooksApi = (name = "", status, page = 1, pageSize = 10,categoryId="") => {
    const params = new URLSearchParams()
    if (name) params.append("name", name)
    if (status !== undefined) params.append("status", status)
    if (categoryId) params.append("categoryId", categoryId)
    params.append("page", page)
    params.append("pageSize", pageSize)

  
    return request.get(`/books/page?${params.toString()}`)
  };

export const getBookByIdApi=(id)=>request.get(`/books/${id}`);

export const lendBookApi=(data)=>request.put('/books/status',data);

export const addBookApi=(data)=>request.post('/books/add',data);

export const updateBookApi=(data)=>request.put('/books/change',data);

export const deleteBookApi=(id)=>request.delete(`/books/${id}`);
  
  