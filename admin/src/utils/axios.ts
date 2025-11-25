import axios,{AxiosInstance,InternalAxiosRequestConfig,AxiosError,AxiosResponse} from "axios";
import { ElNotification } from 'element-plus'

const service:AxiosInstance=axios.create({
    baseURL:import.meta.env.VITE_API_URL || 'http://localhost:3001', // 从环境变量读取，默认localhost:3001
    timeout:5000
});

//请求拦截器
service.interceptors.request.use((config:InternalAxiosRequestConfig)=>{
    // 从sessionStorage获取token
    const token = sessionStorage.getItem('token');
    if (token) {
        // 在请求头中添加token
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
        // 兼容性：也支持token字段
        config.headers['token'] = token;
    }
    return config
},(error:AxiosError)=>{
    ElNotification({
        title:"Error",
        message:error.message,
        type: 'error',
    });
    return Promise.reject(error)
  }
)

//响应拦截器
service.interceptors.response.use((response:AxiosResponse)=>{
    // 如果响应数据格式正确，直接返回
    if(response.data && typeof response.data === 'object' && 'code' in response.data){
        if(response.data.code !== 200){
            ElNotification({
                title:"Error",
                message:response.data.message || '请求失败',
                type: 'error',
            });
            // 如果是401未授权，清除token并跳转到登录页
            if(response.data.code === 401){
                sessionStorage.clear();
                window.location.href = '/login';
            }
            return Promise.reject(response.data);
        }
        return response.data;
    }
    // 如果响应数据格式不符合预期，直接返回
    return response.data;
},(error:AxiosError)=>{
    // 处理HTTP错误（网络错误、超时等）
    let errorMessage = '请求失败';
    if(error.response){
        // 服务器返回了错误响应
        const status = error.response.status;
        switch(status){
            case 401:
                errorMessage = '未授权，请重新登录';
                sessionStorage.clear();
                window.location.href = '/login';
                break;
            case 403:
                errorMessage = '拒绝访问';
                break;
            case 404:
                errorMessage = '请求的资源不存在';
                break;
            case 500:
                errorMessage = '服务器内部错误';
                break;
            default:
                errorMessage = (error.response.data as any)?.message || `请求失败 (${status})`;
        }
    } else if(error.request){
        // 请求已发出但没有收到响应
        errorMessage = '网络错误，请检查网络连接';
    } else{
        // 请求配置出错
        errorMessage = error.message || '请求配置错误';
    }
    
    ElNotification({
        title:"Error",
        message:errorMessage,
        type: 'error',
    });
    return Promise.reject(error)
})

export default service