import { CalculatorType } from '../types';

interface LocalizedMetaData {
    title: string;
    description: string;
    keywords: string[];
}

interface MetaData {
    en: LocalizedMetaData;
    kh: LocalizedMetaData;
}

interface CalculatorMetadata {
    [key: string]: MetaData;
}

export const calculatorMetadata: CalculatorMetadata = {
    [CalculatorType.QuickTips]: {
        en: {
            title: 'Financial Quick Tips | Cambodian Financial Calculators',
            description: 'Essential financial tips and best practices for managing your money in Cambodia. Learn budgeting rules, saving strategies, and smart financial decisions.',
            keywords: ['financial tips', 'money management', 'Cambodia finance', 'budgeting tips', 'saving money', 'financial advice'],
        },
        kh: {
            title: 'គន្លឹះហិរញ្ញវត្ថុខ្លីៗ | ឧបករណ៍ហិរញ្ញវត្ថុកម្ពុជា',
            description: 'គន្លឹះ និង​វិធីសាស្ត្រល្អៗ សម្រាប់គ្រប់គ្រងប្រាក់ នៅកម្ពុជា។ ស្វែងយល់ពីច្បាប់ថវិកា ការសន្សំ និងការសម្រេចចិត្តផ្នែកហិរញ្ញវត្ថុ។',
            keywords: ['គន្លឹះហិរញ្ញវត្ថុ', 'គ្រប់គ្រងលុយ', 'ហិរញ្ញវត្ថុកម្ពុជា', 'គ្រប់គ្រងថវិកា', 'សន្សំប្រាក់', 'ការណែនាំហិរញ្ញវត្ថុ'],
        }
    },
    [CalculatorType.Loan]: {
        en: {
            title: 'Loan Calculator | Calculate Monthly Payments in Cambodia',
            description: 'Calculate your monthly loan payments, total interest, and view detailed amortization schedules. Perfect for planning personal loans in Cambodia.',
            keywords: ['loan calculator', 'Cambodia loan', 'monthly payments', 'loan interest', 'amortization schedule', 'personal loan'],
        },
        kh: {
            title: 'ម៉ាស៊ីនគណនាកម្ចី | គណនាការបង់ប្រាក់ប្រចាំខែនៅកម្ពុជា',
            description: 'គណនាការបង់ប្រាក់កម្ចីប្រចាំខែ ការប្រាក់សរុប និងមើលកាលវិភាគបង់ប្រាក់លម្អិត។ ល្អសម្រាប់គ្រោងការណ៍កម្ចីផ្ទាល់ខ្លួននៅកម្ពុជា។',
            keywords: ['ម៉ាស៊ីនគណនាកម្ចី', 'កម្ចីកម្ពុជា', 'បង់ប្រាក់ប្រចាំខែ', 'ការប្រាក់កម្ចី', 'កាលវិភាគបង់ប្រាក់', 'កម្ចីផ្ទាល់ខ្លួន'],
        }
    },
    [CalculatorType.Mortgage]: {
        en: {
            title: 'Mortgage Calculator | Home Loan Planning in Cambodia',
            description: 'Plan your home purchase with our comprehensive mortgage calculator. Calculate monthly payments, including taxes and insurance for properties in Cambodia.',
            keywords: ['mortgage calculator', 'home loan', 'Cambodia property', 'house payment', 'real estate', 'property tax'],
        },
        kh: {
            title: 'ម៉ាស៊ីនគណនាកម្ចីទិញផ្ទះ | គ្រោងការណ៍ទិញផ្ទះនៅកម្ពុជា',
            description: 'គ្រោងការណ៍ទិញផ្ទះរបស់អ្នកដោយប្រើម៉ាស៊ីនគណនាកម្ចីទិញផ្ទះរបស់យើង។ គណនាការបង់ប្រាក់ប្រចាំខែ រួមមានពន្ធ និងធានារ៉ាប់រង។',
            keywords: ['ម៉ាស៊ីនគណនាកម្ចីទិញផ្ទះ', 'កម្ចីទិញផ្ទះ', 'អចលនទ្រព្យកម្ពុជា', 'ការបង់ប្រាក់ផ្ទះ', 'អចលនទ្រព្យ', 'ពន្ធផ្ទះ'],
        }
    },
    [CalculatorType.Savings]: {
        en: {
            title: 'Savings Calculator | Compound Interest Calculator Cambodia',
            description: 'See how your savings can grow with our compound interest calculator. Plan your financial future and calculate returns on your investments in Cambodia.',
            keywords: ['savings calculator', 'compound interest', 'Cambodia savings', 'investment returns', 'financial planning', 'interest rates'],
        },
        kh: {
            title: 'ម៉ាស៊ីនគណនាសន្សំ | ម៉ាស៊ីនគណនាការប្រាក់សមាសកម្ពុជា',
            description: 'មើលថាសន្សំរបស់អ្នកអាចកើនបានយ៉ាងណាដោយប្រើម៉ាស៊ីនគណនាការប្រាក់សមាស។ គ្រោងការណ៍ហិរញ្ញវត្ថុអនាគតរបស់អ្នក។',
            keywords: ['ម៉ាស៊ីនគណនាសន្សំ', 'ការប្រាក់សមាស', 'សន្សំកម្ពុជា', 'ផលចំណេញវិនិយោគ', 'គ្រោងការណ៍ហិរញ្ញវត្ថុ', 'អត្រាការប្រាក់'],
        }
    },
    [CalculatorType.FixedDeposit]: {
        en: {
            title: 'Fixed Deposit Calculator | Term Deposit Returns Cambodia',
            description: 'Calculate returns on your fixed deposits in Cambodian banks. Compare interest rates and estimate your maturity amount.',
            keywords: ['fixed deposit', 'term deposit', 'Cambodia banking', 'interest calculation', 'deposit returns', 'bank interest'],
        },
        kh: {
            title: 'ម៉ាស៊ីនគណនាបញ្ញើមានកាលកំណត់ | ផលចំណេញបញ្ញើកម្ពុជា',
            description: 'គណនាផលចំណេញលើបញ្ញើមានកាលកំណត់របស់អ្នកនៅធនាគារកម្ពុជា។ ប្រៀបធៀបអត្រាការប្រាក់ និងប៉ាន់ស្មានចំនួនទឹកប្រាក់នៅពេលផុតកំណត់។',
            keywords: ['បញ្ញើមានកាលកំណត់', 'ផលចំណេញបញ្ញើ', 'ធនាគារកម្ពុជា', 'គណនាការប្រាក់', 'ផលចំណេញបញ្ញើ', 'ការប្រាក់ធនាគារ'],
        }
    },
    [CalculatorType.SalaryTax]: {
        en: {
            title: 'Salary Tax Calculator | Cambodia Tax Calculator 2025',
            description: 'Calculate your monthly salary tax in Cambodia. Updated for 2025 tax rates, including resident and non-resident tax calculations.',
            keywords: ['salary tax', 'Cambodia tax', 'income tax', 'tax calculator', 'payroll tax', 'employee tax'],
        },
        kh: {
            title: 'ម៉ាស៊ីនគណនាពន្ធប្រាក់ខែ | ម៉ាស៊ីនគណនាពន្ធកម្ពុជា ២០២៥',
            description: 'គណនាពន្ធប្រាក់ខែរបស់អ្នកនៅកម្ពុជា។ ធ្វើបច្ចុប្បន្នភាពសម្រាប់អត្រាពន្ធឆ្នាំ ២០២៥ រួមមានការគណនាពន្ធសម្រាប់អ្នកជាប់ពន្ធ និងអ្នកមិនជាប់ពន្ធផងដែរ។',
            keywords: ['ពន្ធប្រាក់ខែ', 'ពន្ធកម្ពុជា', 'ពន្ធចំណូល', 'ម៉ាស៊ីនគណនាពន្ធ', 'ពន្ធបៀវត្ស', 'ពន្ធបុគ្គលិក'],
        }
    },
    [CalculatorType.Currency]: {
        en: {
            title: 'Currency Converter | KHR, USD, THB Exchange Rates',
            description: 'Convert between Cambodian Riel (KHR), US Dollar (USD), Thai Baht (THB), and other currencies with live exchange rates.',
            keywords: ['currency converter', 'exchange rate', 'KHR', 'USD', 'THB', 'Cambodia currency'],
        },
        kh: {
            title: 'កម្មវិធីបម្លែងរូបិយប័ណ្ណ | អត្រាប្តូរប្រាក់ KHR, USD, THB',
            description: 'បម្លែងរវាងរៀលកម្ពុជា (KHR), ដុល្លារអាមេរិក (USD), បាតថៃ (THB) និងរូបិយប័ណ្ណផ្សេងៗដោយប្រើអត្រាប្តូរប្រាក់បច្ចុប្បន្ន។',
            keywords: ['កម្មវិធីបម្លែងរូបិយប័ណ្ណ', 'អត្រាប្តូរប្រាក់', 'KHR', 'USD', 'THB', 'រូបិយប័ណ្ណកម្ពុជា'],
        }
    },
    // Add metadata for other calculators...
};

// Default metadata for unknown routes
export const defaultMetadata: MetaData = {
    en: {
        title: 'Cambodian Financial Calculators | Free Financial Planning Tools',
        description: 'Free financial calculators and tools designed for Cambodia. Plan your loans, savings, investments, and taxes with our easy-to-use calculators.',
        keywords: ['financial calculator', 'Cambodia finance', 'money management', 'financial planning', 'calculator tools', 'Cambodia'],
    },
    kh: {
        title: 'ឧបករណ៍ហិរញ្ញវត្ថុកម្ពុជា | ឧបករណ៍គ្រោងការណ៍ហិរញ្ញវត្ថុឥតគិតថ្លៃ',
        description: 'ឧបករណ៍គណនាហិរញ្ញវត្ថុ និងឧបករណ៍ផ្សេងទៀតដែលត្រូវបានរចនាឡើងសម្រាប់ប្រទេសកម្ពុជា។ គ្រោងការណ៍កម្ចី សន្សំ វិនិយោគ និងពន្ធដោយប្រើឧបករណ៍ងាយស្រួលរបស់យើង។',
        keywords: ['ឧបករណ៍គណនាហិរញ្ញវត្ថុ', 'ហិរញ្ញវត្ថុកម្ពុជា', 'គ្រប់គ្រងលុយ', 'គ្រោងការណ៍ហិរញ្ញវត្ថុ', 'ឧបករណ៍គណនា', 'កម្ពុជា'],
    }
};