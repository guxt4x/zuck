export interface CategoryExpenseItem {
  slug: string;
  name: string;
  totalCents: number;
  formattedTotal: string;
  percentage: number;
}

export interface DashboardSummary {
  totalIncomeCents: number;
  totalExpenseCents: number;
  balanceCents: number;
  formattedIncome: string;
  formattedExpense: string;
  formattedBalance: string;
  topCategory: CategoryExpenseItem | null;
  categories: CategoryExpenseItem[];
}

export interface DashboardTransaction {
  id: string;
  type: "expense" | "income" | "transfer";
  amountCents: number;
  description: string;
  date: string | Date;
  categoryName: string;
  categorySlug: string;
  formattedAmount: string;
}

export interface DashboardGoal {
  id: string;
  title: string;
  targetAmountCents: number;
  currentAmountCents: number;
  targetDate: string | Date;
  progressPercent: number;
  formattedTarget: string;
  formattedCurrent: string;
  monthlySavings: {
    remainingCents: number;
    monthsRemaining: number;
    monthlyAmountCents: number;
    formattedMonthly: string;
  };
}

export interface DashboardData {
  summary: DashboardSummary;
  transactions: DashboardTransaction[];
  goals: DashboardGoal[];
}
