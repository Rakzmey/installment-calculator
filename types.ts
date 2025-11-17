export enum CalculatorType {
  Loan = 'LOAN',
  Mortgage = 'MORTGAGE',
  Savings = 'SAVINGS',
  FixedDeposit = 'FIXED_DEPOSIT',
  Currency = 'CURRENCY',
  // New Loan Tools
  CarLoan = 'CAR_LOAN',
  // New Savings Tools
  SavingsGoal = 'SAVINGS_GOAL',
  // New Budgeting Tools
  BudgetPlanner = 'BUDGET_PLANNER',
  ExpenseVisualizer = 'EXPENSE_VISUALIZER',
  IncomeVisualizer = 'INCOME_VISUALIZER',
  // New Investment Tools
  ROI = 'ROI',
  StockGrowth = 'STOCK_GROWTH',
  Inflation = 'INFLATION',
  // New Business Tools
  ProfitMargin = 'PROFIT_MARGIN',
  BreakEven = 'BREAK_EVEN',
  // New Debt Management Tools
  DebtRepayment = 'DEBT_REPAYMENT',
  DebtConsolidation = 'DEBT_CONSOLIDATION',
  // New Retirement & Education Tools
  Retirement = 'RETIREMENT',
  EducationFund = 'EDUCATION_FUND',
  // Tax Tools
  SalaryTax = 'SALARY_TAX',
  CapitalGainTax = 'CAPITAL_GAIN_TAX',
  QuickTips = 'QUICK_TIPS',
  Glossary = 'GLOSSARY',
  FAQ = 'FAQ',
  NetWorth = 'NET_WORTH',
}

export type Currency = 'USD' | 'KHR' | 'THB' | 'VND';
export type Rates = Record<Currency, number>;
