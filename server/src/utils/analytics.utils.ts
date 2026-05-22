export const getDateRange = (from?:string,to?:string)=>{
    if(from && to){
        return{
            from: new Date(from),
            to: new Date(to)
        }
    }
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const startOfMonth = new Date(year,month,1);
    return {
        from:startOfMonth,
        to:now
    }
}