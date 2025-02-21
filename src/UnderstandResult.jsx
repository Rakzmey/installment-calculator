import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function UnderstandResult({ disposableLimit, dtiLimit, installmentAmount }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="understand-result-card">
      <div 
        className="understand-result-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3>Understanding Your Result</h3>
        <FontAwesomeIcon
          icon={isExpanded ? faChevronUp : faChevronDown}
          className={`card-icon ${isExpanded ? 'rotated' : ''}`}
        />
      </div>
      {isExpanded && (
        <div className="explanation-content">
          <p>
            Your <strong>Disposable Income Limit</strong> is <strong>{formatCurrency(disposableLimit)}</strong>. 
            This represents the maximum amount you can safely allocate to a new installment without compromising 
            your financial stability. It's calculated based on your net income, expenses, and savings.
          </p>
          <p>
            Your <strong>Debt-to-Income (DTI) Limit</strong> is <strong>{formatCurrency(dtiLimit)}</strong>. 
            This is the maximum amount lenders typically allow for debt payments, calculated as 30% of your 
            gross income minus existing debts.
          </p>
          <p>
            Your desired installment amount is <strong>{formatCurrency(installmentAmount)}</strong>.
          </p>
          <p>
            If this amount is higher than your Disposable Income limit, then you obviously <em>CANNOT</em> afford the 
            new installment. If it falls anywhere between your Disposable Income Limit and DTI Limit, 
            it's <strong>safer to stay closer to your DTI Limit</strong>. This ensures:
          </p>
          <ul>
            <li>No unexpected financial strain</li>
            <li>Room for emergencies or unexpected expenses</li>
            <li>Long-term peace of mind</li>
          </ul>
          <p>
            Remember, just because you <em>can</em> afford something doesn't always mean you <em>should</em>. 
            Prioritize financial stability over short-term gains!
          </p>
          <p>
            If, however, the installment amount is equal to, or lower than, the Disposable Income Limit 
            then you can afford it without putting a strain on your financial health.
          </p>
        </div>
      )}
    </div>
  );
}

export default UnderstandResult;
