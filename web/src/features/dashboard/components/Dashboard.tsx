import { useMonthlyAnalytics } from "@/features/analytics/hooks/useMonthlyAnalytics";
import { CashFlowChart } from "./CashFlowChart";
import { HeaderTitle } from "./HeaderTitle";
import OverallCardRow from "./OverallCardRow";

const Dashboard = () =>{
   const now = new Date();
    const query = {
           from: new Date(now.getUTCFullYear(),now.getUTCMonth(),1).toISOString(),
           to: new Date(now.getUTCFullYear(),now.getUTCMonth()+1,1).toISOString(),
    }
    const {data,isPending,isError,isFetching} = useMonthlyAnalytics(query);
    const { monthly = [], recentTransactions = [] } = data ?? {};
    console.log(monthly,recentTransactions)
    return (
        <section className="p-8 flex flex-col justify-start gap-8">
            <HeaderTitle/>
            <OverallCardRow isPending={isPending} isError={isError} isFetching={isFetching} expense={monthly[0]?.expense} 
                income={monthly[0]?.income}
                balance={monthly[0]?.balance}
            />
            <CashFlowChart transactions={recentTransactions}/>
        </section>
    );
}
export default Dashboard;