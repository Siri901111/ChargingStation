import {get} from "@/utils/http"

enum Api{
    AlarmList="/alarmList"
}

function alarmListApi(){
    return get(Api.AlarmList)
}

export {alarmListApi}