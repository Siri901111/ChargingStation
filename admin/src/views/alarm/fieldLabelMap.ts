const fieldLabelMap:Record<string,string>={
    description: "故障描述",
    address: "设备地址",
    equNo: "设备号",
    level: "告警级别",//1严重 2紧急 3一般
    time: "故障时间",
    code: "故障代码",//故障代码
    status: "当前状态",//1待指派 2处理中 处理异常
}

const getLabel=(key:string):string=>{
    return fieldLabelMap[key] || key
}

export {getLabel}