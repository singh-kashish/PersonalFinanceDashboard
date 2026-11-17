import { CardTemplate } from "./CardTemplate"
import { SkeletonCard } from "./SkeletonCard";
import {  LucideBanknoteArrowDown, LucideBanknoteArrowUp, Wallet } from "lucide-react";

type OverallCardRowTypes = {
    isFetching:boolean;
    isError: boolean;
    isPending:boolean;
    income: number;
    expense:number;
    balance: number;
}
function OverallCardRow({isFetching,isError,isPending,income,expense,balance}:OverallCardRowTypes){
    
    return(
        <div className="grid grid-cols-1 md:grid-cols-3  gap-6">
            {(isFetching && (<>
                <SkeletonCard/>
                <SkeletonCard/>
                <SkeletonCard/>
                </>
            ))}
            {(!isPending && !isError && (
                <>
                <CardTemplate title="TOTAL BALANCE" amount={balance} icon={<Wallet color="#3C4A42"/>}/>
                <CardTemplate title="THIS MONTH'S INCOME" type="INCOME" amount={income} icon={<LucideBanknoteArrowDown color="#10b981"/>} />
                <CardTemplate title="THIS MONTH'S EXPENSE" type="EXPENSE" amount={expense} icon={<LucideBanknoteArrowUp color="#f43f5e"/>}/>
                </>
            ))}
            
        </div>
    )
}
export default OverallCardRow