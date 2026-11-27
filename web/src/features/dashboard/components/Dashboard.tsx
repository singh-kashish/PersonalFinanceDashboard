import { useMonthlyAnalytics } from "@/features/analytics/hooks/useMonthlyAnalytics";
import { CashFlowChart } from "./CashFlowChart";
import { HeaderTitle } from "./HeaderTitle";
import OverallCardRow from "./OverallCardRow";
import { toChartNumber } from "@/lib/money";
import type { ChartTransaction } from "../dashboard.types";

const Dashboard = () => {
  const now = new Date();
  const query = {
    from: new Date(now.getUTCFullYear(), now.getUTCMonth(), 1).toISOString(),
    to: new Date(now.getUTCFullYear(), now.getUTCMonth() + 1, 1).toISOString(),
  };
  const { data, isPending, isError, isFetching } = useMonthlyAnalytics(query);
  const { monthly = [], recentTransactions = [] } = data ?? {};

  const currentMonth = monthly[0];
  const incomeStr = currentMonth?.income ?? '0.00';
  const expenseStr = currentMonth?.expense ?? '0.00';
  const balanceStr = currentMonth?.balance ?? '0.00';

  const chartTransactions: ChartTransaction[] = recentTransactions.map((t) => ({
    id: t.id,
    amount: toChartNumber(t.amount),
    type: t.type,
    category: t.category,
    description: t.description ?? null,
    date: t.date,
    userId: 0,
    createdAt: t.date,
    updatedAt: t.date,
  }));

  return (
    <section className="p-8 flex flex-col justify-start gap-8">
      <HeaderTitle />
      <OverallCardRow
        isPending={isPending}
        isError={isError}
        isFetching={isFetching}
        expense={expenseStr}
        income={incomeStr}
        balance={balanceStr}
      />
      <CashFlowChart transactions={chartTransactions} />
    </section>
  );
};
export default Dashboard;
