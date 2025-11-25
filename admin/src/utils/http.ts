import service from "./axios";
interface ResponseData{
    code:number,
    data:any,
    message:string
}

function get(url:string,params?:any):Promise<ResponseData>{
    return service.get(url,{params})
}

function post(url:string,data?:any):Promise<ResponseData>{
    return service.post(url,data)
}

function put(url:string,data?:any):Promise<ResponseData>{
    return service.put(url,data)
}

function del(url:string,params?:any):Promise<ResponseData>{
    return service.delete(url,{params})
}

export {get,post,put,del}