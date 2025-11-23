import {post,get} from "@/utils/http";
enum Api{
    BatchDelete="/batchDelete",
    CityList="/cityList"
}

function batchDeleteApi(order:string[]){
    return post(Api.BatchDelete,{order})
}

function cityListApi(){
    return get(Api.CityList)
}

export {batchDeleteApi,cityListApi}