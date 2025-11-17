import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Head from 'next/head';
import { CalculatorType, Rates } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../translations';
import SEO from '../seo/SEO';

// Import existing calculators
import LoanCalculator from '../components/LoanCalculator';
import MortgageCalculator from '../components/MortgageCalculator';
import SavingsCalculator from '../components/SavingsCalculator';
import FixedDepositCalculator from '../components/FixedDepositCalculator';
import CurrencyConverter from '../components/CurrencyConverter';

// Import new calculators
import CarLoanCalculator from '../components/CarLoanCalculator';
import SavingsGoalPlanner from '../components/SavingsGoalPlanner';
import MonthlyBudgetPlanner from '../components/MonthlyBudgetPlanner';
import ExpenseBreakdownVisualizer from '../components/ExpenseBreakdownVisualizer';
import IncomeVisualizer from '../components/IncomeVisualizer';
import RoiCalculator from '../components/RoiCalculator';
import StockGrowthEstimator from '../components/StockGrowthEstimator';
import InflationCalculator from '../components/InflationCalculator';
import ProfitMarginCalculator from '../components/ProfitMarginCalculator';
import BreakEvenCalculator from '../components/BreakEvenCalculator';
import DebtRepaymentTracker from '../components/DebtRepaymentTracker';
import DebtConsolidationEstimator from '../components/DebtConsolidationEstimator';
import RetirementPlanner from '../components/RetirementPlanner';
import EducationFundCalculator from '../components/EducationFundCalculator';
import SalaryTaxCalculator from '../components/SalaryTaxCalculator';
import CapitalGainTaxCalculator from '../components/CapitalGainTaxCalculator';
import QuickTips from '../components/QuickTips';
import Glossary from '../components/Glossary';
import FAQ from '../components/FAQ';
import NetWorthCalculator from '../components/NetWorthCalculator';

const calculatorCategories = [
  {
    categoryKey: 'quickTips',
    tools: [
      { id: CalculatorType.QuickTips, toolKey: 'quickFinancialTips' },
    ]
  },
  {
    categoryKey: 'loanTools',
    tools: [
      { id: CalculatorType.Loan, toolKey: 'loanCalculator' },
      { id: CalculatorType.Mortgage, toolKey: 'mortgageCalculator' },
      { id: CalculatorType.CarLoan, toolKey: 'carLoanCalculator' },
    ]
  },
  {
    categoryKey: 'savingsTools',
    tools: [
      { id: CalculatorType.Savings, toolKey: 'compoundInterestCalculator' },
      { id: CalculatorType.SavingsGoal, toolKey: 'savingsGoalPlanner' },
      { id: CalculatorType.FixedDeposit, toolKey: 'fixedDepositCalculator' },
    ]
  },
  {
    categoryKey: 'budgetingTools',
    tools: [
      { id: CalculatorType.BudgetPlanner, toolKey: 'monthlyBudgetPlanner' },
      { id: CalculatorType.ExpenseVisualizer, toolKey: 'expenseVisualizer' },
      { id: CalculatorType.IncomeVisualizer, toolKey: 'incomeVisualizer' },
      { id: CalculatorType.NetWorth, toolKey: 'netWorthCalculator' },
    ]
  },
  {
    categoryKey: 'investmentTools',
    tools: [
      { id: CalculatorType.ROI, toolKey: 'roiCalculator' },
      { id: CalculatorType.StockGrowth, toolKey: 'stockGrowthEstimator' },
      { id: CalculatorType.Inflation, toolKey: 'inflationCalculator' },
    ]
  },
  {
    categoryKey: 'businessTools',
    tools: [
      { id: CalculatorType.ProfitMargin, toolKey: 'profitMarginCalculator' },
      { id: CalculatorType.BreakEven, toolKey: 'breakEvenCalculator' },
    ]
  },
  {
    categoryKey: 'debtManagement',
    tools: [
      { id: CalculatorType.DebtRepayment, toolKey: 'debtRepaymentTracker' },
      { id: CalculatorType.DebtConsolidation, toolKey: 'debtConsolidationEstimator' },
    ]
  },
  {
    categoryKey: 'retirementAndEducation',
    tools: [
      { id: CalculatorType.Retirement, toolKey: 'retirementPlanner' },
      { id: CalculatorType.EducationFund, toolKey: 'educationFundPlanner' },
    ]
  },
  {
    categoryKey: 'taxTools',
    tools: [
      { id: CalculatorType.SalaryTax, toolKey: 'salaryTaxCalculator' },
      { id: CalculatorType.CapitalGainTax, toolKey: 'capitalGainTaxCalculator' },
    ]
  },
  {
    categoryKey: 'currencyTools',
    tools: [
      { id: CalculatorType.Currency, toolKey: 'currencyConverter' },
    ]
  },
  {
    categoryKey: 'resources',
    tools: [
      { id: CalculatorType.Glossary, toolKey: 'glossary' },
      { id: CalculatorType.FAQ, toolKey: 'faq' },
    ]
  }
];

const initialRates: Rates = {
  USD: 1,
  KHR: 4100, 
  THB: 36.5, 
  VND: 25400,
};

const HomePage: React.FC = () => {
  const [openCategories, setOpenCategories] = useState<string[]>([calculatorCategories[0].categoryKey]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [glossaryScrollTarget, setGlossaryScrollTarget] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchVisible, setSearchVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  // State for dynamic rates, lifted from CurrencyConverter
  const [rates, setRates] = useState(initialRates);
  const [ratesDate, setRatesDate] = useState<string | null>(null);
  const [isLoadingRates, setIsLoadingRates] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch live rates on component mount
  useEffect(() => {
    const fetchRates = async () => {
      setIsLoadingRates(true);
      try {
        const response = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        
        setRates(prevRates => ({
          ...prevRates,
          KHR: data.usd.khr,
          THB: data.usd.thb,
          VND: data.usd.vnd,
        }));
        setRatesDate(data.date);
      } catch (error) {
        console.error("Error fetching currency rates:", error);
        // Component will proceed with default rates if fetch fails.
      } finally {
        setIsLoadingRates(false);
      }
    };
    fetchRates();
  }, []);

 const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) {
      return calculatorCategories;
    }

    const lowercasedTerm = searchTerm.toLowerCase();

    return calculatorCategories
      .map(category => {
        const filteredTools = category.tools.filter(tool =>
          t.tools[tool.toolKey as keyof typeof t.tools].toLowerCase().includes(lowercasedTerm)
        );
        return { ...category, tools: filteredTools };
      })
      .filter(category => category.tools.length > 0);
  }, [searchTerm, t.tools]);
  
  useEffect(() => {
    if (searchTerm.trim()) {
      // When searching, show all categories with matches
      setOpenCategories(filteredCategories.map(c => c.categoryKey));
    } else {
      // When search is cleared, collapse all categories
      setOpenCategories([]);
    }
  }, [searchTerm, filteredCategories]);

  const toggleCategory = (categoryKey: string) => {
    setOpenCategories(prev =>
      prev.includes(categoryKey)
        ? prev.filter(c => c !== categoryKey)
        : [categoryKey] // Only keep the newly opened category
    );
  };
  
  const handleSelectCalculator = useCallback((id: CalculatorType) => {
    window.location.href = `/${id.toLowerCase()}`;
    if(window.innerWidth < 768) { // Close sidebar on mobile after selection
        setSidebarOpen(false);
    }
    setSearchVisible(false);
    setSearchTerm('');
  }, []);
  
  const handleNavigateToGlossary = useCallback((targetId: string) => {
    window.location.href = `/glossary`;
    setGlossaryScrollTarget(targetId);
    if (window.innerWidth < 768) {
        setSidebarOpen(false);
    }
  }, []);

  const renderCalculator = useCallback(() => {
    const commonProps = { onNavigateToGlossary: handleNavigateToGlossary };
    
    // Default to QuickTips on the home page
    return <QuickTips onNavigateToTool={handleSelectCalculator} />;
  }, [glossaryScrollTarget, handleNavigateToGlossary, handleSelectCalculator]);

  const SidebarNav = ({ categories }: { categories: typeof calculatorCategories }) => (
    <nav className="p-4">
      {categories.length > 0 ? (
        categories.map(category => (
          <div key={category.categoryKey} className="mb-2">
            <button
              onClick={() => toggleCategory(category.categoryKey)}
              className="w-full text-left flex justify-between items-center px-3 py-2 font-bold text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-slate-700 rounded-md"
            >
              <span className={language === 'kh' ? 'text-lg' : 'text-base'}>{t.categories[category.categoryKey as keyof typeof t.categories]}</span>
              <svg
                className={`w-5 h-5 transition-transform ${openCategories.includes(category.categoryKey) ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openCategories.includes(category.categoryKey) && (
              <ul className="mt-2 space-y-1 pl-4 border-l-2 border-teal-200 dark:border-teal-800">
                {category.tools.map(tool => (
                  <li key={tool.id}>
                    <button
                      onClick={() => handleSelectCalculator(tool.id)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-200 ${
                        CalculatorType.QuickTips === tool.id // Using default calculator for now
                          ? 'bg-teal-500 dark:bg-teal-60 text-white font-semibold'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                      } ${language === 'kh' ? 'text-base' : 'text-sm'}`}
                    >
                      {t.tools[tool.toolKey as keyof typeof t.tools]}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))
      ) : (
        <div className="px-3 py-2 text-gray-500 dark:text-gray-400 italic">{t.search.noResults}</div>
      )}
    </nav>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-gray-200">
      <SEO calculatorType={CalculatorType.QuickTips} />
      <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-20 border-b border-transparent dark:border-slate-700">
        <div className="container mx-auto px-4 flex justify-between items-center min-h-[80px] py-2">
          {isSearchVisible ? (
            <div className="flex items-center w-full md:hidden">
              <div className="relative flex-grow">
                <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </span>
                <input
                  type="search"
                  placeholder={t.search.placeholder}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full text-sm pl-8 pr-2 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-200"
                  autoFocus
                />
              </div>
              <button onClick={() => { setSearchVisible(false); setSearchTerm(''); }} className="p-1.5 ml-1 text-gray-600 dark:text-gray-30 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md" aria-label="Close search">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!isSidebarOpen)}
                  className="md:hidden mr-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-70"
                  aria-label="Toggle navigation"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
                <div className="flex items-center">
                  <button
                    onClick={() => window.location.href = '/'}
                    className="flex items-center hover:opacity-80 transition-opacity"
                    aria-label="Go to home page"
                  >
                    <img
                      src="/logo.png"
                      alt="Opakor Logo"
                      className="h-12 w-12 md:h-20 md:w-20 mr-2 md:mr-3"
                    />
                    <h1 className="text-xl md:text-3xl font-bold text-teal-600 dark:text-teal-400 leading-tight text-center">
                      {language === 'kh' ? (
                        <>
                          <div className="text-base md:text-3xl mb-0 md:mb-1">ឧបករណ៍</div>
                          <div className="text-base md:text-3xl">ហិរញ្ញវត្ថុ</div>
                        </>
                      ) : (
                        <>
                          <div className="text-base md:text-3xl mb-0 md:mb-1">Financial</div>
                          <div className="text-base md:text-3xl">Tools</div>
                        </>
                      )}
                    </h1>
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="hidden md:block relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  </span>
                  <input 
                    type="search"
                    placeholder={t.search.placeholder}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-48 lg:w-64 pl-10 pr-4 py-2 border rounded-md bg-gray-50 focus:bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-gray-200 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 transition-all"
                  />
                </div>
                <button onClick={() => setSearchVisible(true)} className="md:hidden p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-70" aria-label="Open search">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </button>
                {mounted && (
                  <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-70 text-gray-600 dark:text-gray-300 transition-colors"
                    aria-label="Toggle theme"
                  >
                    {theme === 'light' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/200/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                  </button>
                )}
                <button 
                  onClick={toggleLanguage}
                  className="px-4 py-2 text-sm font-semibold text-teal-600 dark:text-teal-300 bg-teal-50 dark:bg-slate-700 rounded-md hover:bg-teal-100 dark:hover:bg-slate-60 transition-colors"
                >
                  {language === 'kh' ? t.englishLanguage : t.khmerLanguage}
                </button>
              </div>
            </>
          )}
        </div>
      </header>
      
      <div className="flex flex-grow">
        {/* Mobile Sidebar */}
        <div className={`fixed inset-0 z-30 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
          <div className="absolute inset-0 bg-black opacity-50" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative w-72 max-w-[80vw] h-full bg-white dark:bg-slate-800 shadow-xl overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            <div className="p-4 border-b dark:border-slate-700">
              <h2 className="font-bold text-teal-600 dark:text-teal-400">{t.calculators}</h2>
            </div>
            <SidebarNav categories={filteredCategories} />
          </div>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-72 bg-white dark:bg-slate-800 border-r dark:border-slate-70 flex-shrink-0 h-screen sticky top-[72px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          <SidebarNav categories={filteredCategories} />
        </aside>

        <main className="flex-grow p-4 md:p-8 overflow-y-auto">
          {renderCalculator()}
        </main>
      </div>
      <footer className="bg-gray-10 dark:bg-slate-800 text-center p-6 text-gray-600 dark:text-gray-400">
        <div className="max-w-4xl mx-auto text-sm">
          <p className="mb-2">{t.footer.disclaimer}</p>
          <p className="font-semibold">{t.footer.copyright}</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;