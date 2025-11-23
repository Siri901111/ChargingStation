import {post} from "@/utils/http";
enum Api{
    MapList="/mapList"
}

function mapListApi(){
    return post(Api.MapList)
}

export {mapListApi}