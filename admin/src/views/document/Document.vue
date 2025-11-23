<template>
    <el-card>
        <div class="mt">
            <span class="title">文章类型：</span>
            <el-tag :type="currentIndex[0]==-1?'primary':'info'" class="mr" @click="handleSelect(-1,0,'')">全部</el-tag>
            <el-tag :type="currentIndex[0]==index?'primary':'info'" class="mr" v-for="(item,index) in typeList.type" :key="item" @click="handleSelect(index,0,item)">{{ item }}</el-tag>
        </div>
        <div class="mt">
            <span class="title">重要程度：</span>
            <el-tag :type="currentIndex[1]==-1?'primary':'info'" class="mr" @click="handleSelect(-1,1,'')">全部</el-tag>
            <el-tag :type="currentIndex[1]==index?'primary':'info'" class="mr" v-for="(item,index) in typeList.important" :key="item"  @click="handleSelect(index,1,item)">{{ item }}</el-tag>
        </div>
        <div class="mt">
            <span class="title">发布渠道：</span>
            <el-tag :type="currentIndex[2]==-1?'primary':'info'" class="mr" @click="handleSelect(-1,2,'')">全部</el-tag>
            <el-tag  :type="currentIndex[2]==index?'primary':'info'" class="mr" v-for="(item,index) in typeList.publish" :key="item" @click="handleSelect(index,2,item)">{{ item }}</el-tag>
        </div>
        <el-divider/>
        <div class="mt ">
            <span class="title">已选:</span>
            <el-tag 
                disable-transitions
                type="success" 
                class="mr" 
                closable
                v-for="item in selectedList"
                :key="item"
                @close="handleClose(item.num)"
            >{{ item.name }}</el-tag>
        </div>
    </el-card>
    <el-button type="primary" class="mt mb" @click="exportToHtml">导出富文本到HTML文件</el-button>
    <Editor
       v-model="editorContent"
       api-key="xvbamfm2vokka8qoim9r801qtdlldskjschd51yha7zhuusp"
      :init="{
        language:'zh_CN',
        plugins: 'lists link image table code help wordcount'
      }"
    />
    <el-button type="primary" @click="handleSubmit" class="mt"  v-permission="'user'">提交文章内容</el-button>
</template>

<script setup lang="ts">
import Editor from '@tinymce/tinymce-vue'
import {typeListApi} from "@/api/document"
import { onMounted,ref } from "vue";
interface ListType{
    type:string[],
    important:string[],
    publish:string[]
}
interface SelectType{
    name:string,
    num:number
}
const typeList=ref<ListType>({type:[],important:[],publish:[]})
onMounted(async ()=>{
    const {data}=await typeListApi();
    typeList.value=data
})
const currentIndex=ref([-1,-1,-1])
const handleSelect=(index:number,num:number,name:string)=>{
    console.log(index,num,name)
   const ind:number=selectedList.value.findIndex((item:SelectType)=>item.num===num)
    if(!name){ //如果点的是全部,要从已选中删掉对应这个类别的数据
        selectedList.value=selectedList.value.filter((item:SelectType)=>item.num!=num)
    }else{
        if(ind==-1){
            selectedList.value.push({name,num})
        }else{
            selectedList.value[ind]={name,num}
        }
    }
   currentIndex.value[num]=index
}

const selectedList=ref<SelectType[]>([])  //[{name:"招商类",num:0},{name:"二级",num:1}] 
const handleClose=(num:number)=>{
    selectedList.value=selectedList.value.filter((item:SelectType)=>item.num!=num);
    currentIndex.value[num]=-1
}

const editorContent=ref("");
const exportToHtml=()=>{
    const blob=new Blob([editorContent.value],{type:"text/html"})
    const link=document.createElement("a");
    link.href=URL.createObjectURL(blob);
    link.download="documnet.html";
    link.click();
    URL.revokeObjectURL(link.href)
}

const handleSubmit=()=>{
    console.log( selectedList.value.map(item=>item.name))
}




</script>

<style lang="less" scoped>
    .title{
        display: inline-block;
        width: 80px;
        font-size: 14px;
    }
    .el-tag{
        cursor: pointer;
    }
</style>