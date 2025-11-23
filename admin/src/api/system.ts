import {post} from "@/utils/http"
enum Api{
    auth="/userAuth",
    setAuth="/setAuth"
}

function getAuthApi(pageAuthority:string){
    return post(Api.auth,{pageAuthority})
}

function setAuthApi(account:string,btnList:string[],pageList:string[]){
    return post(Api.setAuth,{account,btnList,pageList})
}

export {getAuthApi,setAuthApi}