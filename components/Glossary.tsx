
import React, { useEffect } from 'react';
import CalculatorCard from './CalculatorCard';
import { useLanguage } from '../contexts/LanguageContext';

interface GlossaryProps {
  scrollToId: string | null;
  setScrollToId: (id: string | null) => void;
}

const Glossary: React.FC<GlossaryProps> = ({ scrollToId, setScrollToId }) => {
  const { t } = useLanguage();
  const title = t.tools.glossary;
  const description = t.glossaryTool.description;
  const glossaryTerms = t.glossary;

  useEffect(() => {
    if (scrollToId) {
      const element = document.getElementById(scrollToId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setScrollToId(null);
    }
  }, [scrollToId, setScrollToId]);

  return (
    <CalculatorCard title={title} icon="📖" description={description}>
      <div className="space-y-8">
        {glossaryTerms.map(item => (
          <div key={item.id} id={item.id} className="scroll-mt-24">
            {/* FIX: Added dark mode classes for consistent styling */}
            <h3 className="text-xl font-bold text-teal-700 dark:text-teal-300">{item.term}</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">{item.definition}</p>
          </div>
        ))}
      </div>
    </CalculatorCard>
  );
};

export default Glossary;
