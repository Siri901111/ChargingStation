<template>
    <el-card>
        <el-select style="width: 300px;" placeholder="选择站点名称" v-model="value" filterable>
            <el-option v-for="item in options" :key="item.id" :value="item.name" :label="item.name"></el-option>
        </el-select>
    </el-card>

    <el-card class="mt">
        <el-radio-group size="large" v-model="radio" @change="handleChange">
            <el-radio-button :label="`全部(${allCount})`" :value="0" />
            <el-radio-button :label="`空闲中(${checkCount(1)})`" :value="1" />
            <el-radio-button :label="`充电中(${checkCount(2)})`" :value="2" />
            <el-radio-button :label="`连接中(${checkCount(3)})`" :value="3" />
            <el-radio-button :label="`排队中(${checkCount(4)})`" :value="4" />
            <el-radio-button :label="`已预约(${checkCount(5)})`" :value="5" />
            <el-radio-button :label="`故障/离线(${checkCount(6)})`" :value="6" />
        </el-radio-group>
    </el-card>
    <el-card class="mt">
        <el-row :gutter="20">
            <el-col :span="6" v-for="item in dataListCopy" :key="item.id">
                <div class="item">
                    <div class="pic">
                        <p v-if="item.status === 1">空闲中</p>
                        <p v-else-if="item.status === 2">充电中</p>
                        <p v-else-if="item.status === 3">连接中</p>
                        <p v-else-if="item.status === 4">排队中</p>
                        <p v-else-if="item.status === 5">已预约</p>
                        <p v-else-if="item.status === 6">故障/离线</p>
                        <img :src="item.status == 1 ? free : (item.status == 6 ? outline : ing)" width="100px">
                        <p v-if="item.status == 2">{{ item.percent }}</p>
                        <p v-else>0%</p>
                    </div>
                    <div class="info">
                        <h3>{{ item.id }}</h3>
                        <hr class="mb">
                        <p>电压：{{ item.voltage }}</p>
                        <p>电流：{{ item.current }}</p>
                        <p>功率：{{ item.power }}</p>
                        <p>温度：{{ item.tem }}</p>
                    </div>
                </div>
                <div class="btn">
                    <div class="divder"></div>
                    <div>
                        <p class="fl ml" style="font-size: 12px;color: #999;">暂无预警</p>
                        <div class="fr" style="text-align: right;">
                            <el-button size="small">维保记录</el-button>

                            <el-popover placement="right" :width="300" trigger="click">
                                <template #reference>
                                    <el-button size="small" type="primary" class="mr">使用记录</el-button>
                                </template>
                                <h3 class="mb">使用记录</h3>
                                <el-timeline style="max-width: 600px">
                                    <el-timeline-item :timestamp="j.time" v-for="j in item.record" :key="j.time" :hollow="true" type="primary">
                                        {{ j.msg }}
                                    </el-timeline-item>
                                </el-timeline>
                            </el-popover>
                        </div>
                    </div>
                </div>
            </el-col>
        </el-row>
    </el-card>
</template>
<script setup lang="ts">
import free from "@/assets/free.png"
import outline from "@/assets/outline.png";
import ing from "@/assets/ing.png"
import { getCurrentListApi } from "@/api/chargingstation"
import { onMounted, ref } from "vue";
import { computed, watch } from "vue";


const options = ref<any>([]) //下拉菜单数据
const dataList = ref<any>([]) //渲染列表数据
const dataListCopy = ref<any>([])
const loadData = async () => {
    const { data } = await getCurrentListApi();
    options.value = data;
    dataList.value = data[0].list //原始数据
    dataListCopy.value = data[0].list //做列表渲染
}
onMounted(() => {
    loadData()
})
const value = ref<string>("");
const radio = ref<number>(0)
function checkCount(num: number) {
    return dataList.value.filter((item: any) => item.status == num).length
}
const allCount = computed(() => checkCount(1) + checkCount(2) + checkCount(3) + checkCount(4) + checkCount(5) + checkCount(6))

const handleChange = () => {
    dataListCopy.value = dataList.value
    if (radio.value != 0) {
        dataListCopy.value = dataListCopy.value.filter((item: any) => item.status == radio.value)
    }
}

watch(value, () => {
    const res = options.value.filter((item: any) => item.name === value.value);
    dataListCopy.value = res[0].list;
    dataList.value = res[0].list;
    radio.value = 0
})

</script>

<style lang="less" scoped>
.item {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    background-color: rgb(247, 251, 254);
    padding: 20px;
    border-radius: 10px 10px 0 0;
    margin-top: 20px;

    .pic {
        p {
            width: 76px;
            text-align: center;
            margin-bottom: 10px;
            color: rgb(61, 187, 146);
        }
    }

    .info {
        color: #999;
        margin-left: 30px;
        line-height: 26px;
        margin-top: -10px;
    }
}

.btn {
    width: 100%;
    height: 50px;
    line-height: 50px;
    background-color: #f7fbfe;

    .divder {
        background-color: #f4f4f4;
        height: 2px;
        width: 95%;
        margin: auto;
    }
}
</style>