import { defineStore } from "pinia";
import type { RowType } from "@/types/station"
import { emptyStationForm } from "@/types/station"
import { ref } from "vue"

export const useStationStore = defineStore("station", () => {
    const rowData = ref<RowType>(emptyStationForm());

    const setRowData = (row: RowType) => {
        rowData.value = row
    }
    return {
        rowData, setRowData
    }
})
