import {get} from "@/utils/http"
enum Api{
    TypeList="/document"
}

function typeListApi(){
    return get(Api.TypeList)
}

export {typeListApi}