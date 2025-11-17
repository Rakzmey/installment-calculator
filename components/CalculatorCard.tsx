import React from 'react';

interface CalculatorCardProps {
  title: string;
  icon: string;
  description?: string;
  children: React.ReactNode;
}

const CalculatorCard: React.FC<CalculatorCardProps> = ({ title, icon, description, children }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden w-full max-w-4xl mx-auto">
      <div className="p-6 md:p-8 bg-teal-50 dark:bg-slate-700/50 border-b border-teal-200 dark:border-slate-600">
        <div className="flex items-center space-x-4">
          <span className="text-3xl md:text-4xl">{icon}</span>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-teal-700 dark:text-teal-300">{title}</h2>
            {description && <p className="mt-1 text-sm text-teal-600 dark:text-teal-400">{description}</p>}
          </div>
        </div>
      </div>
      <div className="p-6 md:p-8">
        {children}
      </div>
    </div>
  );
};

export default CalculatorCard;
