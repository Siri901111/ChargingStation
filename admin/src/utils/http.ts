import service from "./axios";
interface ResponseData{
    code:number,
    data:any,
    message:string
}

function get<T = any>(url:string,params?:any):Promise<ResponseData & { data: T }>{
    return service.get(url,params)
}

function post<T = any>(url:string,data?:any):Promise<ResponseData & { data: T }>{
    return service.post(url,data)
}

function put<T = any>(url:string,data?:any):Promise<ResponseData & { data: T }>{
    return service.put(url,data)
}

function del<T = any>(url:string,params?:any):Promise<ResponseData & { data: T }>{
    return service.delete(url,params)
}

export {get,post,put,del}

// 默认导出
export default {
    get,
    post,
    put,
    delete: del
}