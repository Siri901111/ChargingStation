import { Ref,onBeforeUnmount,onMounted,ref,markRaw } from "vue";
import * as echarts from 'echarts';

export  function useChart(chartRef:Ref<HTMLElement|null>,setChartData:any){
    const chartInstance=ref<echarts.ECharts|null>(null);

    const initChart=async ()=>{
        if(chartRef.value){
            chartInstance.value=markRaw(echarts.init(chartRef.value)) ;
           const  options=await setChartData()

            chartInstance.value.setOption(options)

        }
    }

    const resizeChart=()=>{
        chartInstance.value?.resize()
    }

    onMounted(()=>{
        initChart()
        window.addEventListener("resize",resizeChart)
    })

    onBeforeUnmount(()=>{
        window.removeEventListener("resize",resizeChart)
        if(chartInstance.value){
            chartInstance.value.dispose()
        }
    })

}