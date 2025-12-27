import router from "./index";
import { useUserStore } from "@/store/auth";
router.beforeEach((to)=>{
    const userStore=useUserStore();
    const isLogin=userStore.token;
    if(!isLogin){
        //未登录
        if(to.path!=="/login"){
            return {path:"/login"}
        }
    }else{
        //登录
        if(to.path==="/login"){
            return {path:"/"}
        }

        if(to.meta?.needAuth&& !userStore.roles.some((role:string)=>(to.meta.needAuth as string[]).includes(role)) ){
            return {path:"/"}
        }


    }
})

/*
    1.前端默认不创建完整路由表，后端会给我们返回权限的名称,前端路由表文件中每个路由写明该路由需要的权限名称，addRoute
    2.前端默认创建完整路由表，后端会给我们返回权限的名称，路由表文件中可以设置meta,用来写明该页面是否需要权限访问，以及需要哪种权限
*/ 