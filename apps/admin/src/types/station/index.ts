interface RowType {
    name: string
    id: string
    city: string
    address: string
    longitude: string
    latitude: string
    fast: string
    slow: string
    status: number
    now: string
    fault: string
    person: string
    tel: string
    remarks?: string
}

export type { RowType }

export const emptyStationForm = (): RowType => ({
    name: "",
    id: "",
    city: "",
    address: "",
    longitude: "",
    latitude: "",
    fast: "",
    slow: "",
    status: 3,
    now: "0",
    fault: "0",
    person: "",
    tel: "",
    remarks: ""
})
