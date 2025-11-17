import html2canvas from 'html2canvas';
import React, { useRef, createRef, useState } from 'react';
import CalculatorCard from './CalculatorCard';
import { useLanguage } from '../contexts/LanguageContext';
import { CalculatorType } from '../types';

interface QuickTipsProps {
  onNavigateToTool: (tool: CalculatorType) => void;
}

const QuickTips: React.FC<QuickTipsProps> = ({ onNavigateToTool }) => {
  const { t } = useLanguage();
  const pageT = t.quickTips;
  const tipRefs = useRef<Array<React.RefObject<HTMLDivElement>>>([]);

  const handleShare = (element: HTMLDivElement | null, index: number) => {
    if (element) {
      const shareButton = element.querySelector(`.share-button-${index}`) as HTMLElement;
      if (shareButton) {
        shareButton.style.display = 'none';
      }

      const originalWidth = element.style.width;
      element.style.width = '375px';

      html2canvas(element, {
        useCORS: true,
        scale: 2,
        backgroundColor: '#1e293b',
      }).then(canvas => {
        element.style.width = originalWidth;
        
        const context = canvas.getContext('2d');
        if (context) {
          const newCanvas = document.createElement('canvas');
          newCanvas.width = canvas.width;
          newCanvas.height = canvas.height + 60;
          const newContext = newCanvas.getContext('2d');
          if (newContext) {
            newContext.fillStyle = '#1e293b';
            newContext.fillRect(0, 0, newCanvas.width, newCanvas.height);
            newContext.drawImage(canvas, 0, 0);
            newContext.font = 'bold 24px Hanuman, Arial, sans-serif';
            newContext.fillStyle = '#ffffff';
            newContext.textAlign = 'center';
            newContext.fillText('👉 www.opakor.com 👈', newCanvas.width / 2, canvas.height + 40);
            newCanvas.toBlob(async (blob) => {
              if (blob) {
                const file = new File([blob], 'quick-tip.png', { type: 'image/png' });
                if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                  try {
                    await navigator.share({
                      files: [file],
                      title: t.common.shareTitle,
                      url: 'https://www.opakor.com/quick-tips',
                    });
                  } catch (error) {
                    console.error('Error sharing:', error);
                  }
                } else {
                  // Fallback for browsers that do not support Web Share API
                  const dataUrl = newCanvas.toDataURL('image/png');
                  const link = document.createElement('a');
                  link.href = dataUrl;
                  link.download = 'quick-tip.png';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              }
              if (shareButton) {
                shareButton.style.display = 'block';
              }
            }, 'image/png');
          }
        }
      });
    }
  };

  const promptParts = pageT.tryToolsPrompt.split(/(\{savingsGoalLink\}|\{mortgageLink\}|\{budgetPlannerLink\})/);

  return (
    <CalculatorCard title={pageT.title} icon="💡" description={pageT.description}>
      <div className="space-y-4">
        {pageT.tips.map((tip, index) => {
          const [isOpen, setIsOpen] = React.useState(false);
          const tipRef = createRef<HTMLDivElement>();
          tipRefs.current[index] = tipRef;

          return (
            <div key={index} ref={tipRef} className="border dark:border-slate-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 flex justify-between items-center bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="text-left text-sm md:text-base font-semibold text-teal-800 dark:text-teal-200">
                    {tip.rule}
                  </h3>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isOpen && (
                <div className="px-6 py-4 bg-gray-50 dark:bg-slate-700/50 border-t dark:border-slate-700">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                        {pageT.headers.explanation}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {tip.explanation}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                        {pageT.headers.example}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {tip.example}
                      </p>
                    </div>
                  </div>
                  <div className={`mt-4 text-right share-button-${index}`}>
                    <button
                      onClick={() => handleShare(tipRefs.current[index].current, index)}
                      className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700"
                    >
                      {t.common.share}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* FIX: Added dark mode classes for consistent styling */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-600 text-center">
        <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
           {promptParts.map((part, index) => {
                if (part === '{savingsGoalLink}') {
                    return (
                        <button key={index} onClick={() => onNavigateToTool(CalculatorType.SavingsGoal)} className="font-semibold text-teal-600 dark:text-teal-400 hover:underline focus:outline-none">
                            {`🎯 ${t.tools.savingsGoalPlanner}`}
                        </button>
                    );
                }
                if (part === '{mortgageLink}') {
                    return (
                        <button key={index} onClick={() => onNavigateToTool(CalculatorType.Mortgage)} className="font-semibold text-teal-600 dark:text-teal-400 hover:underline focus:outline-none">
                            {`🏠 ${t.tools.mortgageCalculator}`}
                        </button>
                    );
                }
                if (part === '{budgetPlannerLink}') {
                    return (
                        <button key={index} onClick={() => onNavigateToTool(CalculatorType.BudgetPlanner)} className="font-semibold text-teal-600 dark:text-teal-400 hover:underline focus:outline-none">
                            {`📊 ${t.tools.monthlyBudgetPlanner}`}
                        </button>
                    );
                }
                return part;
            })}
        </p>
      </div>
    </CalculatorCard>
  );
};

export default QuickTips;
