function formatNumberToThousands(num:number):string{
    if(isNaN(num)||(typeof(num)!="number")){
        throw new Error("必须是一个有效数字")
    }
    const [integerPart,decimalPart]=num.toString().split(".") //1234.7 length4 1
    let formatterInteger="" //  "34"
    for(let i=integerPart.length-1;i>=0;i--){
        formatterInteger=integerPart[i]+formatterInteger
        if((integerPart.length-i)%3===0&&i!==0){
            formatterInteger=","+formatterInteger
        }
    }
    return decimalPart?`${formatterInteger}.${decimalPart}`:formatterInteger

}


export default formatNumberToThousands