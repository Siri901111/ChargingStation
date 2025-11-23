interface MenuItem{
    name:string;
    icon:string;
    url:string;
    children?:MenuItem[]
}

export type {MenuItem}