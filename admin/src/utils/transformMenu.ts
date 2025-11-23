function transformMenu(nodes:any){
    return nodes.map((node:any)=>{
        const newNode:any={
            label:node.name,
            url:node.url,
        }
        if(node.children){
            newNode.children=transformMenu(node.children);
        };
        return newNode
    })
}

export {transformMenu}