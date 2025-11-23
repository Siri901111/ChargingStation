import { useUserStore } from "@/store/auth"
export  default{
    beforeMount(el:any,binding:any){
        const userStore=useUserStore();
        const {roles}=userStore;
        const requirePermission=binding.value;
        if(!roles.includes(requirePermission)){
            el.style.display="none"
        }
    }
}