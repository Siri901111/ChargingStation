import {get} from "@/utils/http"

enum Api{
    ChartData="/chartData",
    ChartData2="/chartData2",
    ChartData3="/chartData3"
}

function chartDataApi(){
    return get(Api.ChartData)
}

function chartDataApi2(){
    return get(Api.ChartData2)
}
function chartDataApi3(){
    return get(Api.ChartData3)
}
export {chartDataApi,chartDataApi2,chartDataApi3}