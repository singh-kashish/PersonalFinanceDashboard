import { useMonthlyAnalytics } from "@/features/analytics/hooks/useMonthlyAnalytics"
import { CardTemplate } from "./CardTemplate"
import { SkeletonCard } from "./SkeletonCard";
import {  LucideBanknoteArrowDown, LucideBanknoteArrowUp, Wallet } from "lucide-react";

function OverallCardRow(){
    const now = new Date();
    const query = {
        from: new Date(now.getUTCFullYear(),now.getUTCMonth(),1).toISOString(),
        to: new Date(now.getUTCFullYear(),now.getUTCMonth()+1,1).toISOString(),
    }
    console.log('query>',query);
    const {data,isPending,refetch,isError,isFetching} = useMonthlyAnalytics(query);
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
                <CardTemplate title="TOTAL BALANCE" amount={data.monthly[0].balance} icon={<Wallet color="#3C4A42"/>}/>
                <CardTemplate title="THIS MONTH'S INCOME" type="INCOME" amount={data.monthly[0].income} icon={<LucideBanknoteArrowDown color="#10b981"/>} />
                <CardTemplate title="THIS MONTH'S EXPENSE" type="EXPENSE" amount={data.monthly[0].expense} icon={<LucideBanknoteArrowUp color="#f43f5e"/>}/>
                </>
            ))}
            
        </div>
    )
}
export default OverallCardRow