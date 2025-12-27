import {defineStore} from "pinia";
import {ref} from "vue"
import type{MenuItem} from "@/types/user"
export const useTabsStore=defineStore("tabs",()=>{
    const tabs=ref<MenuItem[]>([]);
    const currentTab=ref<{name:string,url:string}>({name:"",url:""})

    const addTab=(name:string,url:string,icon:string)=>{
        if(!tabs.value.some((tab)=>tab.url===url)){
            tabs.value.push({name,url,icon})
        }
    }

    const setCurrentTab=(name:string,url:string)=>{
        currentTab.value={name,url}
    }

    const removeTab=(name:string)=>{
        //如果删除的是高亮的
        if(currentTab.value.name===name){
            const currentIndex=tabs.value.findIndex(tab=>tab.name===name);
            if(currentIndex!=0){
                currentTab.value=tabs.value[currentIndex-1]
            }else{
                return 
            }
           
        }

        tabs.value=tabs.value.filter(tab=>tab.name!==name)
    }


    return {tabs,addTab,currentTab,setCurrentTab,removeTab}
    
})
