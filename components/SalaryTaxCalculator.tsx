
import React, { useState, useMemo, useEffect } from 'react';
import CalculatorCard from './CalculatorCard';
import { useLanguage } from '../contexts/LanguageContext';
import { Rates } from '../types';

interface SalaryTaxCalculatorProps {
  onNavigateToGlossary: (targetId: string) => void;
  rates: Rates;
}

const SalaryTaxCalculator: React.FC<SalaryTaxCalculatorProps> = ({ onNavigateToGlossary, rates }) => {
    const { t } = useLanguage();
    const pageT = t.salaryTaxCalculator;
    const helperT = t.calculatorHelpers;

    const [residency, setResidency] = useState<'resident' | 'non-resident'>('resident');
    const [currency, setCurrency] = useState<'USD' | 'KHR'>('USD');
    const [salary, setSalary] = useState('1000');
    const [hasSpouse, setHasSpouse] = useState(false);
    const [children, setChildren] = useState('0');
    const [exchangeRate, setExchangeRate] = useState(4100);

    useEffect(() => {
        if (rates.KHR) {
            setExchangeRate(rates.KHR);
        }
    }, [rates.KHR]);

    const { monthlyTaxKhr, monthlyTaxUsd, netSalaryKhr, netSalaryUsd, breakdown } = useMemo(() => {
        const salaryNum = parseFloat(salary) || 0;
        const numChildren = parseInt(children, 10) || 0;
        const salaryInKhr = currency === 'USD' ? salaryNum * exchangeRate : salaryNum;

        let tax = 0;
        const breakdownSteps: { label: string; value: string; isBold?: boolean, isHeader?: boolean }[] = [];
        breakdownSteps.push({ label: pageT.grossSalaryKhr, value: new Intl.NumberFormat('en-US').format(salaryInKhr) + ' KHR' });

        if (residency === 'resident') {
            const spouseDeduction = hasSpouse ? 150000 : 0;
            const childrenDeduction = numChildren * 150000;
            const totalDeductions = spouseDeduction + childrenDeduction;
            const taxableSalary = Math.max(0, salaryInKhr - totalDeductions);
            
            breakdownSteps.push({ label: pageT.deductions, value: '', isHeader: true });
            if(hasSpouse) breakdownSteps.push({ label: pageT.spouseDeduction, value: `- ${new Intl.NumberFormat('en-US').format(spouseDeduction)} KHR` });
            if(numChildren > 0) breakdownSteps.push({ label: pageT.childrenDeduction.replace('{count}', numChildren.toString()), value: `- ${new Intl.NumberFormat('en-US').format(childrenDeduction)} KHR` });
            if(totalDeductions > 0) breakdownSteps.push({ label: pageT.totalDeductions, value: `- ${new Intl.NumberFormat('en-US').format(totalDeductions)} KHR` });

            breakdownSteps.push({ label: pageT.taxableSalary, value: `${new Intl.NumberFormat('en-US').format(taxableSalary)} KHR`, isBold: true });
            breakdownSteps.push({ label: pageT.taxCalculation, value: '', isHeader: true });

            const brackets = [
                { limit: 1500000, rate: 0.00 },
                { limit: 2000000, rate: 0.05 },
                { limit: 8500000, rate: 0.10 },
                { limit: 12500000, rate: 0.15 },
                { limit: Infinity, rate: 0.20 }
            ];

            let lastLimit = 0;
            for (const bracket of brackets) {
                if (taxableSalary <= lastLimit) break;
                
                const taxableInBracket = Math.min(taxableSalary, bracket.limit) - lastLimit;
                const taxForBracket = taxableInBracket * bracket.rate;
                tax += taxForBracket;
                
                if (taxableInBracket > 0 && bracket.rate > 0) {
                     const bracketLabel = lastLimit === 0 ? `0 - ${bracket.limit.toLocaleString()}` : `${lastLimit.toLocaleString()} - ${bracket.limit.toLocaleString()}`;
                     breakdownSteps.push({ label: `  ${bracketLabel} @ ${bracket.rate * 100}%`, value: `+ ${new Intl.NumberFormat('en-US').format(taxForBracket)} KHR`});
                }

                lastLimit = bracket.limit;
            }

        } else { // Non-resident
            tax = salaryInKhr * 0.20;
            breakdownSteps.push({ label: pageT.nonResidentTax, value: `+ ${new Intl.NumberFormat('en-US').format(tax)} KHR` });
        }
        
        const netSalaryInKhr = salaryInKhr - tax;

        return {
            monthlyTaxKhr: tax,
            monthlyTaxUsd: tax / exchangeRate,
            netSalaryKhr: netSalaryInKhr,
            netSalaryUsd: netSalaryInKhr / exchangeRate,
            breakdown: breakdownSteps
        };
    }, [residency, currency, salary, hasSpouse, children, pageT, exchangeRate]);
    
    const formatCurrencyDisplay = (value: number, curr: 'USD' | 'KHR') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: curr,
            maximumFractionDigits: curr === 'KHR' ? 0 : 2
        }).format(value);
    }
    
    const salaryNum = parseFloat(salary) || 0;
    const displayedMonthlyTax = currency === 'USD' ? monthlyTaxUsd : monthlyTaxKhr;
    const displayedNetSalary = salaryNum - displayedMonthlyTax;
    
    return (
        <CalculatorCard title={pageT.title} icon="🧾" description={pageT.description}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{pageT.residencyStatus}</label>
                        <div className="flex items-center space-x-1 bg-gray-200 dark:bg-slate-700 rounded-lg p-1">
                            <button onClick={() => setResidency('resident')} className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${residency === 'resident' ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}>{pageT.resident}</button>
                            <button onClick={() => setResidency('non-resident')} className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${residency === 'non-resident' ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}>{pageT.nonResident}</button>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{pageT.monthlySalary}</label>
                        <div className="flex">
                            <select value={currency} onChange={e => setCurrency(e.target.value as 'USD' | 'KHR')} className="z-10 inline-flex flex-shrink-0 items-center rounded-l-md border border-r-0 border-gray-300 dark:border-slate-500 bg-gray-100 dark:bg-slate-600 px-4 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:focus:ring-teal-400">
                                <option value="USD">USD</option>
                                <option value="KHR">KHR</option>
                            </select>
                            <input type="number" value={salary} onChange={e => setSalary(e.target.value)} className="relative block w-full min-w-0 flex-1 rounded-none rounded-r-md bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-500 px-3 py-2 text-lg focus:border-teal-500 focus:ring-teal-500 dark:text-gray-100" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="exchangeRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.exchangeRateLabel}</label>
                        <input 
                            id="exchangeRate"
                            type="number" 
                            value={exchangeRate} 
                            onChange={e => setExchangeRate(parseFloat(e.target.value) || 0)} 
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" 
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {pageT.exchangeRateHelper}
                        </p>
                    </div>
                    {residency === 'resident' && (
                        <div className="p-4 border dark:border-slate-600 rounded-lg space-y-4">
                             <h4 className="font-semibold text-gray-800 dark:text-gray-200">{pageT.dependents}</h4>
                             <div className="flex items-center">
                                <input id="spouse" type="checkbox" checked={hasSpouse} onChange={e => setHasSpouse(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                                <label htmlFor="spouse" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">{pageT.spouse}</label>
                             </div>
                             <div>
                                 <label htmlFor="children" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.children}</label>
                                 <input id="children" type="number" value={children} onChange={e => setChildren(e.target.value)} min="0" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
                             </div>
                        </div>
                    )}
                    <div className="pt-2 text-sm">
                        <div className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border dark:border-slate-700">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">{pageT.residentTaxpayerTitle}</h4>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">{pageT.residentTaxpayerDef}</p>
                        </div>
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border dark:border-slate-700">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">{pageT.nonResidentTaxpayerTitle}</h4>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">{pageT.nonResidentTaxpayerDef}</p>
                        </div>
                    </div>
                </div>
                {/* Results and Breakdown */}
                <div className="bg-teal-50 dark:bg-slate-700/50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-teal-800 dark:text-teal-200 border-b dark:border-slate-600 pb-2 mb-4">{pageT.results}</h3>
                     <div className="space-y-3">
                        <div className="flex justify-between items-baseline"><span className="font-medium text-gray-600 dark:text-gray-300">{pageT.monthlyTax}:</span><span className="font-bold text-red-600 dark:text-red-400 text-xl">{formatCurrencyDisplay(displayedMonthlyTax, currency)}</span></div>
                        <div className="flex justify-between items-baseline"><span className="font-medium text-gray-600 dark:text-gray-300">{pageT.netSalary}:</span><span className="font-bold text-teal-600 dark:text-teal-400 text-xl">{formatCurrencyDisplay(displayedNetSalary, currency)}</span></div>
                        <div className="flex justify-between items-baseline"><span className="font-medium text-gray-600 dark:text-gray-300">{pageT.annualTax}:</span><span className="font-bold text-gray-700 dark:text-gray-200">{formatCurrencyDisplay(displayedMonthlyTax * 12, currency)}</span></div>
                    </div>
                    <div className="mt-6">
                        <h4 className="font-semibold text-teal-800 dark:text-teal-200 mb-2">{pageT.calculationBreakdown}</h4>
                        <div className="text-sm space-y-1 bg-white dark:bg-slate-800 p-3 rounded-md border dark:border-slate-600">
                           {breakdown.map((step, i) => (
                               <div key={i} className={`flex justify-between ${step.isHeader ? 'mt-2 pt-2 border-t dark:border-slate-600' : ''}`}>
                                   <span className={`${step.isBold ? 'font-semibold' : ''} text-gray-600 dark:text-gray-300`}>{step.label}</span>
                                   <span className={`font-mono ${step.isBold ? 'font-semibold' : ''} text-gray-800 dark:text-gray-100`}>{step.value}</span>
                               </div>
                           ))}
                           <div className="flex justify-between font-bold mt-2 pt-2 border-t dark:border-slate-600">
                               <span className="text-gray-800 dark:text-gray-100">{pageT.monthlyTax}</span>
                               <span className="font-mono text-red-600 dark:text-red-500">{new Intl.NumberFormat('en-US').format(monthlyTaxKhr)} KHR</span>
                           </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t dark:border-slate-600">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">{pageT.additionalInfo}</h3>
                <div className="space-y-6 text-sm">
                    <div>
                        <h4 className="font-semibold text-lg text-teal-700 dark:text-teal-300">{pageT.residentRates}</h4>
                         <div className="overflow-x-auto mt-2"><table className="min-w-full text-left">
                             <thead className="bg-gray-100 dark:bg-slate-700"><tr><th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">{pageT.taxableSalaryKhr}</th><th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">{pageT.taxRate}</th></tr></thead>
                             <tbody className="bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200">
                                <tr className="border-b dark:border-slate-700"><td className="px-4 py-2">0 – 1,500,000</td><td className="px-4 py-2">0%</td></tr>
                                <tr className="border-b dark:border-slate-700"><td className="px-4 py-2">1,500,001 – 2,000,000</td><td className="px-4 py-2">5%</td></tr>
                                <tr className="border-b dark:border-slate-700"><td className="px-4 py-2">2,000,001 – 8,500,000</td><td className="px-4 py-2">10%</td></tr>
                                <tr className="border-b dark:border-slate-700"><td className="px-4 py-2">8,500,001 – 12,500,000</td><td className="px-4 py-2">15%</td></tr>
                                <tr><td className="px-4 py-2">{'>'} 12,500,000</td><td className="px-4 py-2">20%</td></tr>
                             </tbody>
                         </table></div>
                    </div>
                     <div><h4 className="font-semibold text-lg text-teal-700 dark:text-teal-300">{pageT.nonResidentInfoTitle}</h4><p className="text-gray-600 dark:text-gray-300 mt-1">{pageT.nonResidentInfoText}</p></div>
                     <div><h4 className="font-semibold text-lg text-teal-700 dark:text-teal-300">{pageT.fringeBenefitsTitle}</h4><p className="text-gray-600 dark:text-gray-300 mt-1">{pageT.fringeBenefitsText}</p></div>
                     <div><h4 className="font-semibold text-lg text-teal-700 dark:text-teal-300">{pageT.minimumWageTitle}</h4><p className="text-gray-600 dark:text-gray-300 mt-1">{pageT.minimumWageText}</p></div>
                </div>
            </div>

             <div className="mt-8 pt-4 border-t border-gray-200 dark:border-slate-600 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {helperT.prompt}{' '}
                    <button onClick={() => onNavigateToGlossary('interest-rate')} className="text-teal-600 dark:text-teal-400 font-semibold underline hover:text-teal-800 dark:hover:text-teal-300 focus:outline-none">{helperT.linkText}</button>
                </p>
            </div>
        </CalculatorCard>
    );
};

export default SalaryTaxCalculator;