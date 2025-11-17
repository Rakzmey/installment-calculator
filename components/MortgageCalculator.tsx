import React, { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import CalculatorCard from './CalculatorCard';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface AmortizationEntry {
  month: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

interface MortgageCalculatorProps {
  onNavigateToGlossary: (targetId: string) => void;
}

const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({ onNavigateToGlossary }) => {
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple');
  const [propertyPrice, setPropertyPrice] = useState('150000');
  const [downPayment, setDownPayment] = useState('30000');
  const [interestRate, setInterestRate] = useState('7.5');
  const [loanTerm, setLoanTerm] = useState('30');
  const [propertyTax, setPropertyTax] = useState('2000');
  const [homeInsurance, setHomeInsurance] = useState('1000');
  // Advanced fields
  const [extraPayment, setExtraPayment] = useState('100');
  const [hoa, setHoa] = useState('50');
  const [pmiRate, setPmiRate] = useState('0.5');

  const [showAmortization, setShowAmortization] = useState(false);
  const [isAmortizationFullscreen, setIsAmortizationFullscreen] = useState(false);
  const { t } = useLanguage();
  const { theme } = useTheme();
  const pageT = t.mortgageCalculator;
  const loanPageT = t.loanCalculator;
  const helperT = t.calculatorHelpers;
  
  useEffect(() => {
    const handleAfterPrint = () => {
      document.body.classList.remove('printing');
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);
  
  useEffect(() => {
    if (isAmortizationFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isAmortizationFullscreen]);

  const handlePrint = () => {
    document.body.classList.add('printing');
    window.print();
  };

  const { monthlyPayment, totalPayment, loanAmount, totalInterest, monthlyPI, amortizationSchedule, monthlyPMI } = useMemo(() => {
    const price = parseFloat(propertyPrice);
    const down = parseFloat(downPayment);
    const P = price - down;
    const annualRate = parseFloat(interestRate);
    const years = parseFloat(loanTerm);
    const annualTax = parseFloat(propertyTax) || 0;
    const annualInsurance = parseFloat(homeInsurance) || 0;
    const monthlyHoa = (mode === 'advanced') ? (parseFloat(hoa) || 0) : 0;
    const annualPmiRate = (mode === 'advanced') ? (parseFloat(pmiRate) || 0) : 0;
    
    let pmi = 0;
    if (mode === 'advanced' && P > 0 && price > 0 && down / price < 0.2) {
        pmi = (P * (annualPmiRate / 100)) / 12;
    }

    if (P > 0 && annualRate > 0 && years > 0) {
      const i = annualRate / 100 / 12;
      const n = years * 12;
      const M = P * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);

      if (isFinite(M)) {
        const totalPaidOnLoan = M * n;
        const interestPaid = totalPaidOnLoan - P;
        const monthlyTaxesAndInsurance = (annualTax / 12) + (annualInsurance / 12);
        const totalMonthly = M + monthlyTaxesAndInsurance + monthlyHoa + pmi;
        const totalCost = totalPaidOnLoan + down + (annualTax * years) + (annualInsurance * years) + (monthlyHoa * n);
        
        const schedule: AmortizationEntry[] = [];
        let balance = P;
        for (let month = 1; month <= n; month++) {
          const interestForMonth = balance * i;
          const principalForMonth = M - interestForMonth;
          balance -= principalForMonth;
          schedule.push({
            month,
            principal: principalForMonth,
            interest: interestForMonth,
            remainingBalance: balance < 0 ? 0 : balance,
          });
        }

        return {
          monthlyPayment: totalMonthly,
          totalPayment: totalCost,
          loanAmount: P,
          totalInterest: interestPaid,
          monthlyPI: M,
          amortizationSchedule: schedule,
          monthlyPMI: pmi,
        };
      }
    }
    return { monthlyPayment: 0, totalPayment: 0, loanAmount: P > 0 ? P : 0, totalInterest: 0, monthlyPI: 0, amortizationSchedule: [], monthlyPMI: 0 };
  }, [propertyPrice, downPayment, interestRate, loanTerm, propertyTax, homeInsurance, mode, hoa, pmiRate]);
  
  const acceleratedPayoff = useMemo(() => {
    if (mode !== 'advanced' || parseFloat(extraPayment) <= 0 || loanAmount <= 0) return null;

    const P = loanAmount;
    const i = parseFloat(interestRate) / 100 / 12;
    const M = monthlyPI;
    const extra = parseFloat(extraPayment) || 0;
    const totalMonthlyPayment = M + extra;

    if (totalMonthlyPayment <= P * i) return null; // Extra payment not enough to cover interest
    
    let balance = P;
    let months = 0;
    let totalInterestPaid = 0;

    while (balance > 0) {
      const interestForMonth = balance * i;
      const principalForMonth = totalMonthlyPayment - interestForMonth;
      balance -= principalForMonth;
      totalInterestPaid += interestForMonth;
      months++;
    }

    const originalTermMonths = parseFloat(loanTerm) * 12;
    const yearsSaved = (originalTermMonths - months) / 12;
    const interestSaved = totalInterest - totalInterestPaid;
    const newPayoffDate = new Date();
    newPayoffDate.setMonth(newPayoffDate.getMonth() + months);

    return {
      payoffDate: newPayoffDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long' }),
      yearsShorter: yearsSaved.toFixed(1),
      interestSaved: interestSaved,
    };
  }, [mode, extraPayment, loanAmount, interestRate, monthlyPI, loanTerm, totalInterest]);


  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  
  const renderAmortizationTable = (isModal: boolean) => {
    const containerClasses = isModal
        ? "flex-grow overflow-auto"
        : "overflow-y-auto max-h-96 border dark:border-slate-600 rounded-lg";
    
    return (
        <div className={containerClasses}>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-600">
                <thead className="bg-gray-50 dark:bg-slate-700 sticky top-0 z-10">
                    <tr>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{loanPageT.month}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{loanPageT.principal}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{loanPageT.interest}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{loanPageT.balance}</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-48">{loanPageT.paymentBreakdown}</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                    {amortizationSchedule.map(row => {
                        const totalPayment = row.principal + row.interest;
                        const principalPercent = totalPayment > 0 ? (row.principal / totalPayment) * 100 : 0;
                        const interestPercent = totalPayment > 0 ? (row.interest / totalPayment) * 100 : 0;
                        const pieData = [
                            { name: loanPageT.principal, value: row.principal },
                            { name: loanPageT.interest, value: row.interest },
                        ];
                        const COLORS = ['#10B981', '#F87171']; // teal-500, red-400
                        
                        return (
                            <tr key={row.month}>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-center font-medium text-gray-500 dark:text-gray-400">{row.month}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-teal-600 dark:text-teal-400">{formatCurrency(row.principal)}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-red-500 dark:text-red-400">{formatCurrency(row.interest)}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{formatCurrency(row.remainingBalance)}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm w-48">
                                   <div className="flex items-center justify-center space-x-3">
                                        <div className="w-12 h-12 flex-shrink-0" title={`Principal: ${principalPercent.toFixed(1)}%, Interest: ${interestPercent.toFixed(1)}%`}>
                                            <PieChart width={48} height={48}>
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: theme === 'dark' ? 'rgb(30 41 59 / 0.9)' : 'rgba(255, 255, 255, 0.9)',
                                                        border: '1px solid #475569',
                                                        borderRadius: '4px',
                                                        fontSize: '12px',
                                                        padding: '4px 8px',
                                                    }}
                                                    formatter={(value: number, name: string) => [formatCurrency(value), name]}
                                                    itemStyle={{ padding: 0 }}
                                                />
                                                <Pie
                                                    data={pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={15}
                                                    outerRadius={24}
                                                    dataKey="value"
                                                    stroke="none"
                                                    cornerRadius="20%"
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                            </PieChart>
                                        </div>
                                        <div className="text-xs text-left">
                                            <div className="flex items-center">
                                                <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span>
                                                <span className="text-gray-600 dark:text-gray-300">{`${principalPercent.toFixed(1)}%`}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="w-2 h-2 rounded-full bg-red-400 mr-2"></span>
                                                <span className="text-gray-600 dark:text-gray-300">{`${interestPercent.toFixed(1)}%`}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
      );
    }
    
    const renderAmortizationSection = () => {
        if (!showAmortization) return null;

        if (isAmortizationFullscreen) {
            return (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-2 sm:p-4" aria-modal="true" role="dialog">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-6xl h-[95vh] flex flex-col" id="printable-amortization">
                        <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                            <h3 className="text-xl font-semibold text-teal-800 dark:text-teal-200">{loanPageT.amortizationSchedule}</h3>
                            <div className="flex items-center space-x-2">
                                <button onClick={handlePrint} className="no-print px-4 py-2 text-sm font-semibold text-teal-600 dark:text-teal-300 bg-teal-50 dark:bg-slate-700 rounded-md hover:bg-teal-100 dark:hover:bg-slate-600 transition-colors">
                                    {loanPageT.downloadPDF}
                                </button>
                                <button onClick={() => setIsAmortizationFullscreen(false)} className="no-print p-2 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600" title={loanPageT.collapseView}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        </div>
                        {renderAmortizationTable(true)}
                    </div>
                </div>
            );
        }

        return (
            <div className="mt-8" id="printable-amortization">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-teal-800 dark:text-teal-200">{loanPageT.amortizationSchedule}</h3>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setIsAmortizationFullscreen(true)} className="no-print p-2 text-teal-600 dark:text-teal-400 rounded-md hover:bg-teal-100 dark:hover:bg-slate-700 transition-colors" title={loanPageT.expandView}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 1v4m0 0h-4m4 0l-5-5" /></svg>
                        </button>
                        <button onClick={handlePrint} className="no-print px-4 py-2 text-sm font-semibold text-teal-600 dark:text-teal-300 bg-teal-50 dark:bg-slate-700 rounded-md hover:bg-teal-100 dark:hover:bg-slate-600 transition-colors">
                            {loanPageT.downloadPDF}
                        </button>
                    </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{loanPageT.amortizationDisclaimer}</p>
                {renderAmortizationTable(false)}
            </div>
        );
    };

    const simpleInputs = (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.propertyPrice}</label>
          <input type="number" value={propertyPrice} onChange={e => setPropertyPrice(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.downPayment}</label>
          <input type="number" value={downPayment} onChange={e => setDownPayment(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.interestRate}</label>
          <input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.loanTerm}</label>
          <input type="number" value={loanTerm} onChange={e => setLoanTerm(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
        </div>
        <div className="pt-4 border-t dark:border-slate-600">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{pageT.optional}</h4>
        </div>
          <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.propertyTax}</label>
          <input type="number" value={propertyTax} onChange={e => setPropertyTax(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
        </div>
          <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.homeInsurance}</label>
          <input type="number" value={homeInsurance} onChange={e => setHomeInsurance(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
        </div>
      </>
    );

  return (
    <CalculatorCard title={pageT.title} icon="🏠" description={pageT.description}>
      <div className="flex justify-end mb-4">
        <div className="flex items-center space-x-1 bg-gray-200 dark:bg-slate-700 rounded-lg p-1">
          <button onClick={() => setMode('simple')} className={`px-4 py-1 text-sm font-semibold rounded-md transition-colors ${mode === 'simple' ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}>
            {t.roiCalculator.simple}
          </button>
          <button onClick={() => setMode('advanced')} className={`px-4 py-1 text-sm font-semibold rounded-md transition-colors ${mode === 'advanced' ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}>
            {t.roiCalculator.advanced}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Inputs */}
        <div className="space-y-4">
          {simpleInputs}
          {mode === 'advanced' && (
             <>
                <div className="pt-4 border-t dark:border-slate-600">
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{pageT.advanced.title}</h4>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.advanced.extraPayment}</label>
                    <input type="number" value={extraPayment} onChange={e => setExtraPayment(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.advanced.hoa}</label>
                    <input type="number" value={hoa} onChange={e => setHoa(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.advanced.pmi}</label>
                    <input type="number" value={pmiRate} onChange={e => setPmiRate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
                </div>
             </>
          )}
        </div>

        {/* Results */}
        <div className="bg-teal-50 dark:bg-slate-700/50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-teal-800 dark:text-teal-200 border-b dark:border-slate-600 pb-2 mb-4">{pageT.summary}</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-300">{pageT.loanAmount}:</span>
                <span className="font-bold text-gray-700 dark:text-gray-200">{formatCurrency(loanAmount)}</span>
            </div>
             <hr className="dark:border-slate-600"/>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600 dark:text-gray-300">{pageT.monthlyPayment}:</span>
              <span className="font-bold text-teal-600 dark:text-teal-400 text-xl">{formatCurrency(monthlyPayment)}</span>
            </div>
             <div className="pl-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex justify-between">
                    <span>{pageT.principalAndInterest}:</span>
                    <span>{formatCurrency(monthlyPI)}</span>
                </div>
                <div className="flex justify-between">
                    <span>{pageT.taxAndInsurance}:</span>
                    <span>{formatCurrency((parseFloat(propertyTax)/12) + (parseFloat(homeInsurance)/12))}</span>
                </div>
                {mode === 'advanced' && monthlyPMI > 0 && (
                     <div className="flex justify-between">
                        <span>PMI:</span>
                        <span>{formatCurrency(monthlyPMI)}</span>
                    </div>
                )}
                 {mode === 'advanced' && parseFloat(hoa) > 0 && (
                     <div className="flex justify-between">
                        <span>HOA:</span>
                        <span>{formatCurrency(parseFloat(hoa))}</span>
                    </div>
                )}
             </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600 dark:text-gray-300">{pageT.totalInterest}:</span>
              <span className="font-bold text-gray-700 dark:text-gray-200">{formatCurrency(totalInterest)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600 dark:text-gray-300">{pageT.totalCost}:</span>
              <span className="font-bold text-gray-700 dark:text-gray-200">{formatCurrency(totalPayment)}</span>
            </div>
          </div>

          {mode === 'advanced' && acceleratedPayoff && (
            <div className="mt-6 pt-4 border-t border-teal-200 dark:border-slate-600">
                <h3 className="text-lg font-semibold text-teal-800 dark:text-teal-200 mb-2">{pageT.advanced.acceleratedPayoff}</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">{pageT.advanced.newPayoffDate}:</span><span className="font-semibold dark:text-gray-100">{acceleratedPayoff.payoffDate}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">{pageT.advanced.yearsShorter}:</span><span className="font-semibold text-green-600">{acceleratedPayoff.yearsShorter}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">{pageT.advanced.interestSaved}:</span><span className="font-semibold text-green-600">{formatCurrency(acceleratedPayoff.interestSaved)}</span></div>
                </div>
            </div>
          )}

           <button 
                onClick={() => setShowAmortization(!showAmortization)}
                className="mt-6 w-full text-teal-600 dark:text-teal-400 font-semibold hover:underline focus:outline-none"
            >
                {showAmortization ? loanPageT.hideSchedule : loanPageT.showSchedule}
            </button>
        </div>
      </div>
      {renderAmortizationSection()}
       <div className="mt-8 pt-4 border-t border-gray-200 dark:border-slate-600 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
            {helperT.prompt}{' '}
            <button 
                onClick={() => onNavigateToGlossary('down-payment')}
                className="text-teal-600 dark:text-teal-400 font-semibold underline hover:text-teal-800 dark:hover:text-teal-300 focus:outline-none"
            >
                {helperT.linkText}
            </button>
        </p>
      </div>
    </CalculatorCard>
  );
};

export default MortgageCalculator;