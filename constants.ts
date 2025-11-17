import { CalculatorType } from './types';

export const calculatorSections = [
  {
    titleKey: 'categories.loanTools',
    calculators: [
      CalculatorType.Loan,
      CalculatorType.Mortgage,
      CalculatorType.CarLoan,
    ],
  },
  {
    titleKey: 'categories.savingsTools',
    calculators: [
      CalculatorType.Savings,
      CalculatorType.FixedDeposit,
      CalculatorType.SavingsGoal,
    ],
  },
  {
    titleKey: 'categories.budgetingTools',
    calculators: [
      CalculatorType.BudgetPlanner,
      CalculatorType.ExpenseVisualizer,
      CalculatorType.IncomeVisualizer,
    ],
  },
  {
    titleKey: 'categories.investmentTools',
    calculators: [
      CalculatorType.ROI,
      CalculatorType.StockGrowth,
      CalculatorType.Inflation,
    ],
  },
  {
    titleKey: 'categories.businessTools',
    calculators: [
      CalculatorType.ProfitMargin,
      CalculatorType.BreakEven,
    ],
  },
  {
    titleKey: 'categories.debtManagement',
    calculators: [
      CalculatorType.DebtRepayment,
      CalculatorType.DebtConsolidation,
    ],
  },
  {
    titleKey: 'categories.retirementAndEducation',
    calculators: [
      CalculatorType.Retirement,
      CalculatorType.EducationFund,
    ],
  },
  {
    titleKey: 'categories.taxTools',
    calculators: [
      CalculatorType.SalaryTax,
      CalculatorType.CapitalGainTax,
    ],
  },
  {
    titleKey: 'categories.currencyTools',
    calculators: [
      CalculatorType.Currency,
    ],
  },
  {
    titleKey: 'categories.resources',
    calculators: [
      CalculatorType.QuickTips,
      CalculatorType.Glossary,
      CalculatorType.FAQ,
    ],
  },
];
