import React, { useState, useMemo } from 'react';
import CalculatorCard from './CalculatorCard';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Helper function to download CSV
const downloadCSV = (csvContent: string, filename: string) => {
    // Add BOM (Byte Order Mark) to indicate UTF-8 encoding for proper Unicode support
    const BOM = '\uFEFF';
    const blob = new Blob([BOM, csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

interface NetWorthCalculatorProps {
  onNavigateToGlossary: (targetId: string) => void;
}

const initialData = {
    assets: {
        cash: { checking: '', savings: '', emergencyFund: '', physicalCash: '' },
        investments: { stocks: '', bonds: '', mutualFunds: '', crypto: '', retirement: '', otherInvestments: '' },
        realEstate: { primaryResidence: '', rentalProperties: '', land: '', otherProperties: '' },
        personalProperty: { vehicles: '', jewelry: '', electronics: '', collectibles: '' },
        businessOwnership: { businessEquity: '' },
        otherAssets: { value: '' },
    },
    liabilities: {
        housingDebt: { mortgage: '', rentalPropertyLoans: '' },
        personalLoans: { carLoan: '', personalLoan: '' },
        creditDebt: { creditCard: '', buyNowPayLater: '', overdraft: '' },
        educationFamilyDebt: { studentLoan: '', familyLoan: '' },
        otherDebt: { businessLoan: '', taxPayable: '' },
        otherLiabilitiesCategory: { value: '' },
    }
};

const CHART_COLORS = ['#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#eab308'];

// Helper: Format number as currency string
const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

// Component: A single input row for a financial item
interface InputRowProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}
const InputRow: React.FC<InputRowProps> = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between space-x-2">
        <label className="text-sm text-gray-600 dark:text-gray-300 flex-1">{label}</label>
        <input
            type="number"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="0"
            className="w-32 px-2 py-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100"
        />
    </div>
);

// Component: An accordion section to group related inputs
const AccordionSection: React.FC<{ title: string; total: number; children: React.ReactNode }> = ({ title, total, children }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="border-b dark:border-slate-700">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center py-3 text-left">
                <span className="font-semibold text-gray-800 dark:text-gray-200">{title}</span>
                <div className="flex items-center space-x-4">
                   <span className="font-semibold text-teal-600 dark:text-teal-400">{formatCurrency(total)}</span>
                    <svg className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            </button>
            {isOpen && <div className="pb-4 space-y-3">{children}</div>}
        </div>
    );
};
    
// Component: A pie chart for visualizing asset/liability breakdowns
const BreakdownPieChart: React.FC<{ data: { [key: string]: number }, title: string, categoryTranslations: { [key: string]: string } }> = ({ data, title, categoryTranslations }) => {
    const { theme } = useTheme();
    const chartData = Object.entries(data)
        .map(([key, value]) => ({ name: categoryTranslations[key] || key, value: value as number }))
        .filter(({ value }) => value > 0);
        
    return (
         <div>
            <h4 className="text-lg font-semibold text-teal-800 dark:text-teal-200 mb-2">{title}</h4>
             {chartData.length > 0 ? (
                <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            {/* FIX: Add 'any' type to Pie label props to resolve type inference errors during arithmetic operations. */}
                            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} cornerRadius="20%" labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => { const radius = innerRadius + (outerRadius - innerRadius) * 1.2; const x = cx + radius * Math.cos(-midAngle * Math.PI / 180); const y = cy + radius * Math.sin(-midAngle * Math.PI / 180); return ( <text x={x} y={y} fill={theme === 'dark' ? '#cbd5e1' : '#475569'} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12px"> {`${(percent * 100).toFixed(0)}%`} </text> ); }}>
                                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#374151' : '#d1d5db' }}/>
                            <Legend formatter={(value) => <span className="text-gray-700 dark:text-gray-300 text-sm">{value}</span>} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
             ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-500 dark:text-gray-400 italic">No data to display.</div>
             )}
        </div>
    )
};


const NetWorthCalculator: React.FC<NetWorthCalculatorProps> = ({ onNavigateToGlossary }) => {
    const { t } = useLanguage();
    const pageT = t.netWorthCalculator;

    const [data, setData] = useState(initialData);

    const handleValueChange = (type: 'assets' | 'liabilities', category: string, field: string, value: string) => {
        setData(prevData => ({
            ...prevData,
            [type]: {
                ...prevData[type],
                [category]: {
                    ...(prevData[type] as any)[category],
                    [field]: value
                }
            }
        }));
    };

    const calculations = useMemo(() => {
        let totalAssets = 0;
        const assetCategoryTotals: { [key: string]: number } = {};
        for (const category in data.assets) {
            let categorySum = 0;
            for (const field in (data.assets as any)[category]) {
                const value = parseFloat((data.assets as any)[category][field]) || 0;
                categorySum += value;
            }
            assetCategoryTotals[category] = categorySum;
            totalAssets += categorySum;
        }

        let totalLiabilities = 0;
        const liabilityCategoryTotals: { [key: string]: number } = {};
        for (const category in data.liabilities) {
            let categorySum = 0;
            for (const field in (data.liabilities as any)[category]) {
                const value = parseFloat((data.liabilities as any)[category][field]) || 0;
                categorySum += value;
            }
            liabilityCategoryTotals[category] = categorySum;
            totalLiabilities += categorySum;
        }
        
        const netWorth = totalAssets - totalLiabilities;
        const assetToDebtRatio = totalLiabilities > 0 ? totalAssets / totalLiabilities : Infinity;
        const debtPercentage = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

        return { totalAssets, totalLiabilities, netWorth, assetToDebtRatio, debtPercentage, assetCategoryTotals, liabilityCategoryTotals };
    }, [data]);

    return (
        <CalculatorCard title={pageT.title} icon="💰" description={pageT.description}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Inputs Column */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-bold text-teal-700 dark:text-teal-300 mb-2">{pageT.assets}</h3>
                        <AccordionSection title={pageT.cash} total={calculations.assetCategoryTotals.cash}>
                            <InputRow label={pageT.checking} value={data.assets.cash.checking} onChange={v => handleValueChange('assets', 'cash', 'checking', v)} />
                            <InputRow label={pageT.savings} value={data.assets.cash.savings} onChange={v => handleValueChange('assets', 'cash', 'savings', v)} />
                            <InputRow label={pageT.emergencyFund} value={data.assets.cash.emergencyFund} onChange={v => handleValueChange('assets', 'cash', 'emergencyFund', v)} />
                            <InputRow label={pageT.physicalCash} value={data.assets.cash.physicalCash} onChange={v => handleValueChange('assets', 'cash', 'physicalCash', v)} />
                        </AccordionSection>
                        <AccordionSection title={pageT.investments} total={calculations.assetCategoryTotals.investments}>
                            <InputRow label={pageT.stocks} value={data.assets.investments.stocks} onChange={v => handleValueChange('assets', 'investments', 'stocks', v)} />
                            <InputRow label={pageT.bonds} value={data.assets.investments.bonds} onChange={v => handleValueChange('assets', 'investments', 'bonds', v)} />
                            <InputRow label={pageT.mutualFunds} value={data.assets.investments.mutualFunds} onChange={v => handleValueChange('assets', 'investments', 'mutualFunds', v)} />
                            <InputRow label={pageT.crypto} value={data.assets.investments.crypto} onChange={v => handleValueChange('assets', 'investments', 'crypto', v)} />
                            <InputRow label={pageT.retirement} value={data.assets.investments.retirement} onChange={v => handleValueChange('assets', 'investments', 'retirement', v)} />
                            <InputRow label={pageT.otherInvestments} value={data.assets.investments.otherInvestments} onChange={v => handleValueChange('assets', 'investments', 'otherInvestments', v)} />
                        </AccordionSection>
                        <AccordionSection title={pageT.realEstate} total={calculations.assetCategoryTotals.realEstate}>
                            <InputRow label={pageT.primaryResidence} value={data.assets.realEstate.primaryResidence} onChange={v => handleValueChange('assets', 'realEstate', 'primaryResidence', v)} />
                            <InputRow label={pageT.rentalProperties} value={data.assets.realEstate.rentalProperties} onChange={v => handleValueChange('assets', 'realEstate', 'rentalProperties', v)} />
                            <InputRow label={pageT.land} value={data.assets.realEstate.land} onChange={v => handleValueChange('assets', 'realEstate', 'land', v)} />
                            <InputRow label={pageT.otherProperties} value={data.assets.realEstate.otherProperties} onChange={v => handleValueChange('assets', 'realEstate', 'otherProperties', v)} />
                        </AccordionSection>
                        <AccordionSection title={pageT.personalProperty} total={calculations.assetCategoryTotals.personalProperty}>
                            <InputRow label={pageT.vehicles} value={data.assets.personalProperty.vehicles} onChange={v => handleValueChange('assets', 'personalProperty', 'vehicles', v)} />
                            <InputRow label={pageT.jewelry} value={data.assets.personalProperty.jewelry} onChange={v => handleValueChange('assets', 'personalProperty', 'jewelry', v)} />
                            <InputRow label={pageT.electronics} value={data.assets.personalProperty.electronics} onChange={v => handleValueChange('assets', 'personalProperty', 'electronics', v)} />
                            <InputRow label={pageT.collectibles} value={data.assets.personalProperty.collectibles} onChange={v => handleValueChange('assets', 'personalProperty', 'collectibles', v)} />
                        </AccordionSection>
                        <AccordionSection title={pageT.businessOwnership} total={calculations.assetCategoryTotals.businessOwnership}>
                            <InputRow label={pageT.businessEquity} value={data.assets.businessOwnership.businessEquity} onChange={v => handleValueChange('assets', 'businessOwnership', 'businessEquity', v)} />
                        </AccordionSection>
                        <AccordionSection title={pageT.otherAssets} total={calculations.assetCategoryTotals.otherAssets}>
                            <InputRow label={pageT.otherAssetsValue} value={data.assets.otherAssets.value} onChange={v => handleValueChange('assets', 'otherAssets', 'value', v)} />
                        </AccordionSection>
                    </div>
                     <div>
                        <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mt-8 mb-2">{pageT.liabilities}</h3>
                        <AccordionSection title={pageT.housingDebt} total={calculations.liabilityCategoryTotals.housingDebt}>
                            <InputRow label={pageT.mortgage} value={data.liabilities.housingDebt.mortgage} onChange={v => handleValueChange('liabilities', 'housingDebt', 'mortgage', v)} />
                            <InputRow label={pageT.rentalPropertyLoans} value={data.liabilities.housingDebt.rentalPropertyLoans} onChange={v => handleValueChange('liabilities', 'housingDebt', 'rentalPropertyLoans', v)} />
                        </AccordionSection>
                        <AccordionSection title={pageT.personalLoans} total={calculations.liabilityCategoryTotals.personalLoans}>
                             <InputRow label={pageT.carLoan} value={data.liabilities.personalLoans.carLoan} onChange={v => handleValueChange('liabilities', 'personalLoans', 'carLoan', v)} />
                             <InputRow label={pageT.personalLoan} value={data.liabilities.personalLoans.personalLoan} onChange={v => handleValueChange('liabilities', 'personalLoans', 'personalLoan', v)} />
                        </AccordionSection>
                        <AccordionSection title={pageT.creditDebt} total={calculations.liabilityCategoryTotals.creditDebt}>
                             <InputRow label={pageT.creditCard} value={data.liabilities.creditDebt.creditCard} onChange={v => handleValueChange('liabilities', 'creditDebt', 'creditCard', v)} />
                             <InputRow label={pageT.buyNowPayLater} value={data.liabilities.creditDebt.buyNowPayLater} onChange={v => handleValueChange('liabilities', 'creditDebt', 'buyNowPayLater', v)} />
                             <InputRow label={pageT.overdraft} value={data.liabilities.creditDebt.overdraft} onChange={v => handleValueChange('liabilities', 'creditDebt', 'overdraft', v)} />
                        </AccordionSection>
                        <AccordionSection title={pageT.educationFamilyDebt} total={calculations.liabilityCategoryTotals.educationFamilyDebt}>
                             <InputRow label={pageT.studentLoan} value={data.liabilities.educationFamilyDebt.studentLoan} onChange={v => handleValueChange('liabilities', 'educationFamilyDebt', 'studentLoan', v)} />
                             <InputRow label={pageT.familyLoan} value={data.liabilities.educationFamilyDebt.familyLoan} onChange={v => handleValueChange('liabilities', 'educationFamilyDebt', 'familyLoan', v)} />
                        </AccordionSection>
                        <AccordionSection title={pageT.otherDebt} total={calculations.liabilityCategoryTotals.otherDebt}>
                            <InputRow label={pageT.businessLoan} value={data.liabilities.otherDebt.businessLoan} onChange={v => handleValueChange('liabilities', 'otherDebt', 'businessLoan', v)} />
                            <InputRow label={pageT.taxPayable} value={data.liabilities.otherDebt.taxPayable} onChange={v => handleValueChange('liabilities', 'otherDebt', 'taxPayable', v)} />
                        </AccordionSection>
                        <AccordionSection title={pageT.otherLiabilitiesCategory} total={calculations.liabilityCategoryTotals.otherLiabilitiesCategory}>
                            <InputRow label={pageT.otherLiabilities} value={data.liabilities.otherLiabilitiesCategory.value} onChange={v => handleValueChange('liabilities', 'otherLiabilitiesCategory', 'value', v)} />
                        </AccordionSection>
                    </div>
                </div>

                {/* Results Column */}
                <div className="lg:sticky top-24">
                     <div className="bg-teal-50 dark:bg-slate-700/50 p-6 rounded-lg space-y-4">
                        <h3 className="text-xl font-bold text-teal-800 dark:text-teal-200 text-center">{pageT.results}</h3>
                        <div className="flex justify-between text-lg"><span className="font-medium text-gray-600 dark:text-gray-300">{pageT.totalAssets}:</span> <span className="font-semibold text-green-600">{formatCurrency(calculations.totalAssets)}</span></div>
                        <div className="flex justify-between text-lg"><span className="font-medium text-gray-600 dark:text-gray-300">{pageT.totalLiabilities}:</span> <span className="font-semibold text-red-600">{formatCurrency(calculations.totalLiabilities)}</span></div>
                        <hr className="dark:border-slate-600" />
                        <div className="flex justify-between items-center text-2xl"><span className="font-bold text-gray-700 dark:text-gray-200">{pageT.netWorth}:</span> <span className={`font-bold ${calculations.netWorth >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-700 dark:text-red-500'}`}>{formatCurrency(calculations.netWorth)}</span></div>
                         <div className="pt-2 text-sm space-y-2">
                             <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">{pageT.assetToDebtRatio}:</span> <span className="font-semibold text-gray-700 dark:text-gray-200">{isFinite(calculations.assetToDebtRatio) ? calculations.assetToDebtRatio.toFixed(2) : 'N/A'}</span></div>
                             <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">{pageT.debtPercentage}:</span> <span className="font-semibold text-gray-700 dark:text-gray-200">{calculations.debtPercentage.toFixed(1)}%</span></div>
                         </div>
                    <div className="mt-6">
                       <BreakdownPieChart data={calculations.assetCategoryTotals} title={pageT.assetBreakdown} categoryTranslations={{cash: pageT.cash, investments: pageT.investments, realEstate: pageT.realEstate, personalProperty: pageT.personalProperty, businessOwnership: pageT.businessOwnership, otherAssets: pageT.otherAssets}} />
                    </div>
                     <div className="mt-6">
                       <BreakdownPieChart data={calculations.liabilityCategoryTotals} title={pageT.liabilityBreakdown} categoryTranslations={{housingDebt: pageT.housingDebt, personalLoans: pageT.personalLoans, creditDebt: pageT.creditDebt, educationFamilyDebt: pageT.educationFamilyDebt, otherDebt: pageT.otherDebt, otherLiabilitiesCategory: pageT.otherLiabilitiesCategory}} />
                    </div>
                </div>
                
                {/* Download Button */}
                <div className="mt-6">
                    <button
                        onClick={() => {
                            // Prepare CSV content with proper headings and labels
                            const csvContent = [
                                ['Category', 'Subcategory', 'Item', 'Value'],
                                // Assets
                                ['Assets', 'Cash', pageT.checking, data.assets.cash.checking || '0'],
                                ['Assets', 'Cash', pageT.savings, data.assets.cash.savings || '0'],
                                ['Assets', 'Cash', pageT.emergencyFund, data.assets.cash.emergencyFund || '0'],
                                ['Assets', 'Cash', pageT.physicalCash, data.assets.cash.physicalCash || '0'],
                                ['Assets', 'Investments', pageT.stocks, data.assets.investments.stocks || '0'],
                                ['Assets', 'Investments', pageT.bonds, data.assets.investments.bonds || '0'],
                                ['Assets', 'Investments', pageT.mutualFunds, data.assets.investments.mutualFunds || '0'],
                                ['Assets', 'Investments', pageT.crypto, data.assets.investments.crypto || '0'],
                                ['Assets', 'Investments', pageT.retirement, data.assets.investments.retirement || '0'],
                                ['Assets', 'Investments', pageT.otherInvestments, data.assets.investments.otherInvestments || '0'],
                                ['Assets', 'Real Estate', pageT.primaryResidence, data.assets.realEstate.primaryResidence || '0'],
                                ['Assets', 'Real Estate', pageT.rentalProperties, data.assets.realEstate.rentalProperties || '0'],
                                ['Assets', 'Real Estate', pageT.land, data.assets.realEstate.land || '0'],
                                ['Assets', 'Real Estate', pageT.otherProperties, data.assets.realEstate.otherProperties || '0'],
                                ['Assets', 'Personal Property', pageT.vehicles, data.assets.personalProperty.vehicles || '0'],
                                ['Assets', 'Personal Property', pageT.jewelry, data.assets.personalProperty.jewelry || '0'],
                                ['Assets', 'Personal Property', pageT.electronics, data.assets.personalProperty.electronics || '0'],
                                ['Assets', 'Personal Property', pageT.collectibles, data.assets.personalProperty.collectibles || '0'],
                                ['Assets', 'Business Ownership', pageT.businessEquity, data.assets.businessOwnership.businessEquity || '0'],
                                ['Assets', 'Other Assets', pageT.otherAssetsValue, data.assets.otherAssets.value || '0'],
                                // Liabilities
                                ['Liabilities', 'Housing Debt', pageT.mortgage, data.liabilities.housingDebt.mortgage || '0'],
                                ['Liabilities', 'Housing Debt', pageT.rentalPropertyLoans, data.liabilities.housingDebt.rentalPropertyLoans || '0'],
                                ['Liabilities', 'Personal Loans', pageT.carLoan, data.liabilities.personalLoans.carLoan || '0'],
                                ['Liabilities', 'Personal Loans', pageT.personalLoan, data.liabilities.personalLoans.personalLoan || '0'],
                                ['Liabilities', 'Credit Debt', pageT.creditCard, data.liabilities.creditDebt.creditCard || '0'],
                                ['Liabilities', 'Credit Debt', pageT.buyNowPayLater, data.liabilities.creditDebt.buyNowPayLater || '0'],
                                ['Liabilities', 'Credit Debt', pageT.overdraft, data.liabilities.creditDebt.overdraft || '0'],
                                ['Liabilities', 'Education/Family Debt', pageT.studentLoan, data.liabilities.educationFamilyDebt.studentLoan || '0'],
                                ['Liabilities', 'Education/Family Debt', pageT.familyLoan, data.liabilities.educationFamilyDebt.familyLoan || '0'],
                                ['Liabilities', 'Other Debt', pageT.businessLoan, data.liabilities.otherDebt.businessLoan || '0'],
                                ['Liabilities', 'Other Debt', pageT.taxPayable, data.liabilities.otherDebt.taxPayable || '0'],
                                ['Liabilities', 'Other Liabilities', pageT.otherLiabilities, data.liabilities.otherLiabilitiesCategory.value || '0'],
                                // Results
                                ['', '', 'Total Assets', calculations.totalAssets],
                                ['', '', 'Total Liabilities', calculations.totalLiabilities],
                                ['', '', 'Net Worth', calculations.netWorth],
                                ['', '', 'Asset to Debt Ratio', calculations.assetToDebtRatio],
                                ['', '', 'Debt Percentage', calculations.debtPercentage + '%']
                            ].map(row => row.join(',')).join('\n');
                            
                            downloadCSV(csvContent, 'net-worth-calculator-data.csv');
                        }}
                        className="w-full mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:bg-teal-700 dark:hover:bg-teal-800"
                    >
                         {pageT.downloadAsExcel}
                    </button>
                </div>
            </div>
        </div>
    </CalculatorCard>
);
};

export default NetWorthCalculator;