
import React, { useState, useEffect } from 'react';
import CalculatorCard from './CalculatorCard';
import { useLanguage } from '../contexts/LanguageContext';
import { Rates, Currency } from '../types';

const currencyOptions: Currency[] = ['USD', 'KHR', 'THB', 'VND'];

interface CurrencyConverterProps {
    rates: Rates;
    ratesDate: string | null;
    isLoading: boolean;
}

const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ rates, ratesDate, isLoading }) => {
    const [amount, setAmount] = useState('1');
    const [fromCurrency, setFromCurrency] = useState<Currency>('USD');
    const [toCurrency, setToCurrency] = useState<Currency>('KHR');
    const [convertedAmount, setConvertedAmount] = useState<string>('');
    const [currentRate, setCurrentRate] = useState(rates.KHR);

    const { t } = useLanguage();
    const pageT = t.currencyConverter;

    // Perform conversion calculation whenever inputs change or rates are updated
    useEffect(() => {
        const fromRate = rates[fromCurrency];
        const toRate = rates[toCurrency];
        
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || !fromRate) {
            setConvertedAmount('');
            return;
        }

        const amountInUsd = numericAmount / fromRate;
        const result = amountInUsd * toRate;
        
        const singleUnitInUsd = 1 / fromRate;
        const liveRate = singleUnitInUsd * toRate;
        setCurrentRate(liveRate);

        let decimals = 2;
        if (toCurrency === 'KHR' || toCurrency === 'VND') {
            decimals = 0;
        }
        setConvertedAmount(result.toFixed(decimals));
        
    }, [amount, fromCurrency, toCurrency, rates]);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(e.target.value);
    };

    const swapCurrencies = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    };

    const formatRate = (rate: number) => {
        return new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 4,
        }).format(rate);
    }
    const formatCurrencyValue = (value: string, currency: Currency) => {
         const num = parseFloat(value);
         if(isNaN(num)) return '';
         const options: Intl.NumberFormatOptions = {
             style: 'decimal',
             maximumFractionDigits: (currency === 'KHR' || currency === 'VND') ? 0 : 2,
             minimumFractionDigits: (currency === 'KHR' || currency === 'VND') ? 0 : 2,
         };
         return new Intl.NumberFormat('en-US', options).format(num);
    }

    return (
        <CalculatorCard title={pageT.title} icon="🔄" description={pageT.description}>
            <div className="space-y-6">
                <div className="p-4 bg-teal-50 dark:bg-slate-700/50 rounded-lg text-center">
                    <p className="text-gray-600 dark:text-gray-300">{pageT.currentRate}:</p>
                     {isLoading ? (
                         <p className="font-bold text-2xl text-teal-700 dark:text-teal-300 animate-pulse">{pageT.loadingRates}</p>
                    ) : (
                        <p className="font-bold text-2xl text-teal-700 dark:text-teal-300">
                            1 {fromCurrency} = {formatRate(currentRate)} {toCurrency}
                        </p>
                    )}
                    {ratesDate && !isLoading && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {pageT.ratesFrom} {ratesDate}.
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-end">
                    <div className="md:col-span-5">
                        <label htmlFor="fromAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.from}</label>
                        <div className="mt-1 flex">
                           <select
                                value={fromCurrency}
                                onChange={e => setFromCurrency(e.target.value as Currency)}
                                className="z-10 inline-flex flex-shrink-0 items-center rounded-l-md border border-r-0 border-gray-300 dark:border-slate-500 bg-gray-100 dark:bg-slate-600 px-4 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:focus:ring-teal-400"
                                disabled={isLoading}
                            >
                                {currencyOptions.map(curr => <option key={curr} value={curr}>{curr}</option>)}
                           </select>
                           <input
                                id="fromAmount"
                                type="number"
                                value={amount}
                                onChange={handleAmountChange}
                                className="relative block w-full min-w-0 flex-1 rounded-none rounded-r-md bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-500 px-3 py-2 text-2xl font-bold focus:border-teal-500 focus:ring-teal-500 dark:text-gray-100"
                                disabled={isLoading}
                           />
                        </div>
                    </div>

                    <div className="md:col-span-1 flex justify-center items-center">
                       <button onClick={swapCurrencies} className="p-2 rounded-full bg-gray-200 dark:bg-slate-700 hover:bg-teal-100 dark:hover:bg-slate-600 text-teal-600 dark:text-teal-400 transition-colors disabled:opacity-50" disabled={isLoading}>
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                       </button>
                    </div>

                    <div className="md:col-span-5">
                        <label htmlFor="toAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.to}</label>
                         <div className="mt-1 flex">
                           <select
                                value={toCurrency}
                                onChange={e => setToCurrency(e.target.value as Currency)}
                                className="z-10 inline-flex flex-shrink-0 items-center rounded-l-md border border-r-0 border-gray-300 dark:border-slate-500 bg-gray-100 dark:bg-slate-600 px-4 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:focus:ring-teal-400"
                                disabled={isLoading}
                            >
                                {currencyOptions.map(curr => <option key={curr} value={curr}>{curr}</option>)}
                           </select>
                           <input
                                id="toAmount"
                                type="text"
                                readOnly
                                value={formatCurrencyValue(convertedAmount, toCurrency)}
                                className="relative block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 dark:border-slate-500 bg-gray-50 dark:bg-slate-800 px-3 py-2 text-2xl font-bold dark:text-gray-100 focus:outline-none"
                           />
                        </div>
                    </div>
                </div>
            </div>
        </CalculatorCard>
    );
};

export default CurrencyConverter;
