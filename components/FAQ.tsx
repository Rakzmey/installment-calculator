import React from 'react';
import CalculatorCard from './CalculatorCard';
import { useLanguage } from '../contexts/LanguageContext';

const FAQ: React.FC = () => {
  const { t } = useLanguage();
  const pageT = t.faq;

  const renderSection = (section: { title: string; questions: { q: string; a: string }[] }) => (
    <div key={section.title} className="mb-8">
      {/* FIX: Added dark mode classes for consistent styling */}
      <h3 className="text-xl font-bold text-teal-700 dark:text-teal-300 mb-4 pb-2 border-b-2 border-teal-100 dark:border-slate-700">{section.title}</h3>
      <div className="space-y-6">
        {section.questions.map((item, index) => (
          <div key={index}>
            {/* FIX: Added dark mode classes for consistent styling */}
            <h4 className="font-semibold text-gray-800 dark:text-gray-100">{item.q}</h4>
            <p className="mt-1 text-gray-600 dark:text-gray-300 leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <CalculatorCard title={pageT.title} icon="❓" description={pageT.description}>
      {renderSection(pageT.general)}
      {renderSection(pageT.usage)}
      {renderSection(pageT.terms)}
    </CalculatorCard>
  );
};

export default FAQ;
