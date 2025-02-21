import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faInfoCircle, faArrowUp, faBars } from '@fortawesome/free-solid-svg-icons';
import { ClipLoader } from 'react-spinners';
import UnderstandResult from './UnderstandResult';
import { formatCurrency } from './utils';

function CollapsibleCard({ title, children, isExpanded, onToggle }) {
  const cardRef = useRef(null);

  const handleToggle = (e) => {
    // Stop event propagation if the click is on an input or button
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') {
      return;
    }
    if (cardRef.current && cardRef.current.contains(e.target)) {
      onToggle();
    }
  };

  return (
    <div className="collapsible-card" onClick={handleToggle} ref={cardRef}>
      <div className="collapsible-card-header">
        {title}
        <FontAwesomeIcon
          icon={isExpanded ? faChevronUp : faChevronDown}
          className={`collapsible-card-icon ${isExpanded ? 'rotated' : ''}`}
        />
      </div>
      <div
        className={`collapsible-card-content ${isExpanded ? 'expanded' : 'collapsed'}`}
      >
        {children}
      </div>
    </div>
  );
}

function SimpleCalculator({ onCalculate }) {
  const [disposableIncome, setDisposableIncome] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [installmentAmount, setInstallmentAmount] = useState('');
  const [grossIncome, setGrossIncome] = useState('');
  const [existingDebt, setExistingDebt] = useState('');
  const [necessityExpenses, setNecessityExpenses] = useState('');
  const [monthlySaving, setMonthlySaving] = useState('');
  const [safePercentage, setEmergencySavings] = useState('');
  const [localErrors, setLocalErrors] = useState({
    disposableIncome: '',
    installmentAmount: '',
    grossIncome: '',
    existingDebt: '',
    necessityExpenses: '',
    emergencySavings: '',
    monthlySaving: '',
  });
  const [calculatedValues, setCalculatedValues] = useState({
    disposableLimit: 0,
    dtiLimit: 0,
    installmentAmount: 0
  });

  const handleInputChange = (setter, field) => (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0) {
      setter(value);
      setLocalErrors({...localErrors, [field]: ''});
    } else if (value === '') {
      setter('');
      setLocalErrors({...localErrors, [field]: ''});
    } else {
      setLocalErrors({...localErrors, [field]: 'Please input valid numbers only'});
    }
  };

  const handleEmergencySavingsChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0 && parseFloat(value) <= 100) {
      setEmergencySavings(value);
      setLocalErrors({...localErrors, emergencySavings: ''});
    } else if (value === '') {
      setEmergencySavings('');
      setLocalErrors({...localErrors, emergencySavings: ''});
    } else {
      setLocalErrors({...localErrors, emergencySavings: 'Please input valid numbers only (0-100)'});
    }
  };

  const calculateAffordability = () => {
    const income = parseFloat(disposableIncome) || 0;
    const gross = parseFloat(grossIncome) || 0;
    const expenses = parseFloat(necessityExpenses) || 0;
    const debt = parseFloat(existingDebt) || 0;
    const saving = parseFloat(monthlySaving) || 0;
    const emergency = parseFloat(safePercentage) / 100 || 0;
    const installment = parseFloat(installmentAmount) || 0;

    // Check if all required fields are filled
    if (!disposableIncome || !grossIncome || !existingDebt || !necessityExpenses || !monthlySaving || !safePercentage || !installmentAmount) {
      setError('Please fill in all the required fields.');
      setResult('');
      return;
    }

    const disposableLimit = ((income - expenses - saving) * emergency);
    const dtiLimit = (0.30 * gross) - debt;
    
    // Update calculated values
    setCalculatedValues({
      disposableLimit,
      dtiLimit,
      installmentAmount: installment
    });

    let response = ""; // Initialize as empty string

    if (installment > disposableLimit) {
      response = `
        <div style="text-align: center;">
          <span style="font-size: 4em;">🙅🏻‍♀️</span><br/>
          <h3>Cannot Afford</h3>
          <p>This installment exceeds your safe spending limit based on your disposable income.</p>
          <div class="details">
            <p>📊 Monthly Installment: ${formatCurrency(installment)}</p>
            <p>💡 Disposable Income Limit: ${formatCurrency(disposableLimit)}</p>
            <p>🚫 DTI Limit: ${formatCurrency(dtiLimit)}</p>
          </div>
          <p class="suggestion">Consider lowering the installment amount to stay within your disposable income limit.</p>
        </div>
      `;
    } else if (installment <= disposableLimit && installment <= dtiLimit) {
      response = `
        <div style="text-align: center;">
          <span style="font-size: 4em;">👍</span><br/>
          <h3>Affordable</h3>
          <p>This installment amount fits comfortably within your budget.</p>
          <div class="details">
            <p>📊 Monthly Installment: ${formatCurrency(installment)}</p>
            <p>✅ Disposable Income Limit: ${formatCurrency(disposableLimit)}</p>
            <p>✅ DTI Limit: ${formatCurrency(dtiLimit)}</p>
          </div>
          <p class="suggestion">You can proceed with confidence - this is within your safe spending limits.</p>
        </div>
      `;
    } else {
      response = `
        <div style="text-align: center;">
          <span style="font-size: 4em;">⚠️</span><br/>
          <h3>Proceed with Caution</h3>
          <p>While within DTI limits, this amount may strain your monthly budget.</p>
          <div class="details">
            <p>📊 Monthly Installment: ${formatCurrency(installment)}</p>
            <p>⚠️ Disposable Income Limit: ${formatCurrency(disposableLimit)}</p>
            <p>✅ DTI Limit: ${formatCurrency(dtiLimit)}</p>
          </div>
          <p class="suggestion">Consider staying closer to your DTI limit for better financial security.</p>
        </div>
      `;
    }

    setError('');
    setResult(response);
    // Pass both the response and calculatedValues
    onCalculate({
      result: response,
      calculatedValues: {  // Changed from 'details' to 'calculatedValues'
        disposableLimit,
        dtiLimit,
        installmentAmount: installment
      }
    });
  };

  return (
    <div className="calculator-card">
      <h2>Installment Affordability Calculator</h2>
      <div className="input-group">
        <label htmlFor="grossIncome">
          Gross Monthly Income:
          <span className="tooltip">
            <FontAwesomeIcon icon={faInfoCircle} />
            <span className="tooltiptext">
              Your total monthly income before taxes and deductions.
            </span>
          </span>
        </label>
        <input
          type="text"
          id="grossIncome"
          value={grossIncome}
          onChange={handleInputChange(setGrossIncome, 'grossIncome')}
          placeholder="$0"
          style={{ fontStyle: 'italic' }}
        />
        {localErrors.grossIncome && (
          <div className="error-message">{localErrors.grossIncome}</div>
        )}
      </div>
      <div className="input-group">
        <label htmlFor="disposableIncome">
          Monthly Net Income:
          <span className="tooltip">
            <FontAwesomeIcon icon={faInfoCircle} />
            <span className="tooltiptext">
              The amount of money left after tax deduction.
            </span>
          </span>
        </label>
        <input
          type="text"
          id="disposableIncome"
          value={disposableIncome}
          onChange={handleInputChange(setDisposableIncome, 'disposableIncome')}
          placeholder="$0"
          style={{ fontStyle: 'italic' }}
        />
        {localErrors.disposableIncome && (
          <div className="error-message">{localErrors.disposableIncome}</div>
        )}
      </div>
      <div className="input-group">
        <label htmlFor="existingDebt">
          Existing Monthly Debt Payment:
          <span className="tooltip">
            <FontAwesomeIcon icon={faInfoCircle} />
            <span className="tooltiptext">
              The total amount you pay monthly towards existing debts.
            </span>
          </span>
        </label>
        <input
          type="text"
          id="existingDebt"
          value={existingDebt}
          onChange={handleInputChange(setExistingDebt, 'existingDebt')}
          placeholder="$0"
          style={{ fontStyle: 'italic' }}
        />
        {localErrors.existingDebt && (
          <div className="error-message">{localErrors.existingDebt}</div>
        )}
      </div>
      <div className="input-group">
        <label htmlFor="necessityExpenses">
          Essential Monthly Expenses:
          <span className="tooltip">
            <FontAwesomeIcon icon={faInfoCircle} />
            <span className="tooltiptext">
              Your total monthly expenses on food, rent...etc, excluding any debt payments.
            </span>
          </span>
        </label>
        <input
          type="text"
          id="necessityExpenses"
          value={necessityExpenses}
          onChange={handleInputChange(setNecessityExpenses, 'necessityExpenses')}
          placeholder="$0"
          style={{ fontStyle: 'italic' }}
        />
        {localErrors.necessityExpenses && (
          <div className="error-message">{localErrors.necessityExpenses}</div>
        )}
      </div>
      <div className="input-group">
        <label htmlFor="monthlySaving">
          Monthly Saving:
          <span className="tooltip">
            <FontAwesomeIcon icon={faInfoCircle} />
            <span className="tooltiptext">
              The amount you plan to save each month.
            </span>
          </span>
        </label>
        <input
          type="text"
          id="monthlySaving"
          value={monthlySaving}
          onChange={handleInputChange(setMonthlySaving, 'monthlySaving')}
          placeholder="$0"
          style={{ fontStyle: 'italic' }}
        />
        {localErrors.monthlySaving && (
          <div className="error-message">{localErrors.monthlySaving}</div>
        )}
      </div>
      <div className="input-group">
        <label htmlFor="emergencySavings">
          Safe Percentage (%): Under 15% recommended
          <span className="tooltip">
            <FontAwesomeIcon icon={faInfoCircle} />
            <span className="tooltiptext">
              Portion of disposable income allocated to installments.
            </span>
          </span>
        </label>
        <input
          type="text"
          id="emergencySavings"
          value={safePercentage}
          onChange={handleEmergencySavingsChange}
          placeholder="0"
          style={{ fontStyle: 'italic' }}
        />
        {localErrors.emergencySavings && (
          <div className="error-message">{localErrors.emergencySavings}</div>
        )}
      </div>
      <div className="input-group">
        <label htmlFor="installmentAmount">
          Enter the Monthly Installment Amount:
          <span className="tooltip">
            <FontAwesomeIcon icon={faInfoCircle} />
            <span className="tooltiptext">
              The amount you plan to pay monthly for a new installment.
            </span>
          </span>
        </label>
        <input
          type="text"
          id="installmentAmount"
          value={installmentAmount}
          onChange={handleInputChange(setInstallmentAmount, 'installmentAmount')}
          placeholder="$0"
          style={{ fontStyle: 'italic' }}
        />
        {localErrors.installmentAmount && (
          <div className="error-message">{localErrors.installmentAmount}</div>
        )}
      </div>
      {error && <div className="error-message">{error}</div>}
      <button onClick={calculateAffordability}>Calculate</button>
    </div>
  );
}

function LoanPaymentCalculator({ onCalculate }) {
  const [loanType, setLoanType] = useState('fixed');
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTerm, setLoanTerm] = useState('');
  const [adjustmentPeriod, setAdjustmentPeriod] = useState('');
  const [localErrors, setLocalErrors] = useState({
    loanAmount: '',
    interestRate: '',
    loanTerm: '',
    adjustmentPeriod: '',
  });

  const handleInputChange = (setter, field) => (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0) {
      setter(value);
      setLocalErrors({...localErrors, [field]: ''});
    } else if (value === '') {
      setter('');
      setLocalErrors({...localErrors, [field]: ''});
    } else {
      setLocalErrors({...localErrors, [field]: 'Please input valid numbers only'});
    }
  };

  const calculateLoanPayment = () => {
    const amount = parseFloat(loanAmount) || 0;
    const rate = parseFloat(interestRate) / 100 / 12 || 0;
    const term = parseFloat(loanTerm) * 12 || 0;

    if (amount <= 0 || rate <= 0 || term <= 0) {
      onCalculate('Please enter valid values for all fields.');
      return;
    }

    let payment, totalInterest;

    if (loanType === 'fixed') {
      const numerator = rate * Math.pow(1 + rate, term);
      const denominator = Math.pow(1 + rate, term) - 1;
      payment = amount * (numerator / denominator);
      totalInterest = (payment * term) - amount;
    } else if (loanType === 'arm') {
      const adjustmentPeriodMonths = parseFloat(adjustmentPeriod) * 12 || 0;
      if (adjustmentPeriodMonths <= 0) {
        onCalculate('Please enter a valid adjustment period.');
        return;
      }
      // Simplified ARM calculation for demonstration purposes
      payment = amount * rate / (1 - Math.pow(1 + rate, -adjustmentPeriodMonths));
      totalInterest = (payment * adjustmentPeriodMonths) - amount;
    } else {
      // Default to fixed-rate calculation if loan type is not recognized
      const numerator = rate * Math.pow(1 + rate, term);
      const denominator = Math.pow(1 + rate, term) - 1;
      payment = amount * (numerator / denominator);
      totalInterest = (payment * term) - amount;
    }

    onCalculate(
      <div className="calculation-result">
        <h4>Monthly Payment</h4>
        <p className="highlight">{formatCurrency(payment)}</p>
        <h4>Loan Details</h4>
        <p>Principal Amount: {formatCurrency(amount)}</p>
        <p>Total Interest: {formatCurrency(totalInterest)}</p>
        <p>Total Cost: {formatCurrency(amount + totalInterest)}</p>
        <p>Interest Rate: {interestRate}%</p>
        <p>Loan Term: {loanTerm} years</p>
        {loanType === 'arm' && <p>Adjustment Period: {adjustmentPeriod} years</p>}
      </div>
    );
  };

  return (
    <div className="calculator-card">
      <h2>Loan Payment Calculator</h2>
      <div className="input-group">
        <label htmlFor="loanType">
          Loan Type:
          <span className="tooltip">
            <FontAwesomeIcon icon={faInfoCircle} />
            <span className="tooltiptext">
              Select the type of loan.
            </span>
          </span>
        </label>
        <select
          id="loanType"
          value={loanType}
          onChange={(e) => setLoanType(e.target.value)}
        >
          <option value="fixed">Fixed-Rate Mortgage</option>
          <option value="arm">Adjustable-Rate Mortgage (ARM)</option>
          <option value="auto">Auto Loan</option>
          <option value="personal">Personal Loan</option>
        </select>
      </div>
      <div className="input-group">
        <label htmlFor="loanAmount">
          Loan Amount:
          <span className="tooltip">
            <FontAwesomeIcon icon={faInfoCircle} />
            <span className="tooltiptext">
              The total amount of the loan.
            </span>
          </span>
        </label>
        <input
          type="text"
          id="loanAmount"
          value={loanAmount}
          onChange={handleInputChange(setLoanAmount, 'loanAmount')}
        />
        {localErrors.loanAmount && (
          <div className="error-message">{localErrors.loanAmount}</div>
        )}
      </div>
      <div className="input-group">
        <label htmlFor="interestRate">
          Annual Interest Rate (%):
          <span className="tooltip">
            <FontAwesomeIcon icon={faInfoCircle} />
            <span className="tooltiptext">
              The annual interest rate for the loan.
            </span>
          </span>
        </label>
        <input
          type="text"
          id="interestRate"
          value={interestRate}
          onChange={handleInputChange(setInterestRate, 'interestRate')}
        />
        {localErrors.interestRate && (
          <div className="error-message">{localErrors.interestRate}</div>
        )}
      </div>
      <div className="input-group">
        <label htmlFor="loanTerm">
          Loan Term (Years):
          <span className="tooltip">
            <FontAwesomeIcon icon={faInfoCircle} />
            <span className="tooltiptext">
              The number of years to repay the loan.
            </span>
          </span>
        </label>
        <input
          type="text"
          id="loanTerm"
          value={loanTerm}
          onChange={handleInputChange(setLoanTerm, 'loanTerm')}
        />
        {localErrors.loanTerm && (
          <div className="error-message">{localErrors.loanTerm}</div>
        )}
      </div>
      {loanType === 'arm' && (
        <div className="input-group">
          <label htmlFor="adjustmentPeriod">
            Adjustment Period (Years):
            <span className="tooltip">
              <FontAwesomeIcon icon={faInfoCircle} />
              <span className="tooltiptext">
                The number of years before the interest rate adjusts.
              </span>
            </span>
          </label>
          <input
            type="text"
            id="adjustmentPeriod"
            value={adjustmentPeriod}
            onChange={handleInputChange(setAdjustmentPeriod, 'adjustmentPeriod')}
          />
          {localErrors.adjustmentPeriod && (
            <div className="error-message">{localErrors.adjustmentPeriod}</div>
          )}
        </div>
      )}
      <button onClick={calculateLoanPayment}>Calculate</button>
    </div>
  );
}

function DownPaymentCalculator({ onCalculate }) {
  const [totalPrice, setTotalPrice] = useState('');
  const [downPaymentPercent, setDownPaymentPercent] = useState('');
  const [downPaymentAmount, setDownPaymentAmount] = useState('');
  const [localErrors, setLocalErrors] = useState({
    totalPrice: '',
    downPaymentPercent: '',
  });

  const handleInputChange = (setter, field) => (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0) {
      setter(value);
      setLocalErrors({...localErrors, [field]: ''});
    } else if (value === '') {
      setter('');
      setLocalErrors({...localErrors, [field]: ''});
    } else {
      setLocalErrors({...localErrors, [field]: 'Please input valid numbers only'});
    }
  };

  const calculateDownPayment = () => {
    const price = parseFloat(totalPrice) || 0;
    const percent = parseFloat(downPaymentPercent) / 100 || 0;

    if (price <= 0 || percent <= 0) {
      onCalculate('Please enter valid values for all fields.');
      return;
    }

    const downPayment = price * percent;
    const remainingAmount = price - downPayment;

    onCalculate(
      <div className="calculation-result">
        <h4>Down Payment Required</h4>
        <p className="highlight">{formatCurrency(downPayment)}</p>
        <h4>Purchase Details</h4>
        <p>Total Price: {formatCurrency(price)}</p>
        <p>Down Payment: {downPaymentPercent}%</p>
        <p>Remaining Amount: {formatCurrency(remainingAmount)}</p>
      </div>
    );
  };

  return (
    <div className="calculator-card">
      <h2>Down Payment Calculator</h2>
      <div className="input-group">
        <label htmlFor="totalPrice">
          Total Price:
          <span className="tooltip">
            <FontAwesomeIcon icon={faInfoCircle} />
            <span className="tooltiptext">
              The total price of the item or property.
            </span>
          </span>
        </label>
        <input
          type="text"
          id="totalPrice"
          value={totalPrice}
          onChange={handleInputChange(setTotalPrice, 'totalPrice')}
        />
        {localErrors.totalPrice && (
          <div className="error-message">{localErrors.totalPrice}</div>
        )}
      </div>
      <div className="input-group">
        <label htmlFor="downPaymentPercent">
          Down Payment Percentage (%):
          <span className="tooltip">
            <FontAwesomeIcon icon={faInfoCircle} />
            <span className="tooltiptext">
              The percentage of the total price you plan to pay as a down payment.
            </span>
          </span>
        </label>
        <input
          type="text"
          id="downPaymentPercent"
          value={downPaymentPercent}
          onChange={handleInputChange(setDownPaymentPercent, 'downPaymentPercent')}
        />
        {localErrors.downPaymentPercent && (
          <div className="error-message">{localErrors.downPaymentPercent}</div>
        )}
      </div>
      <button onClick={calculateDownPayment}>Calculate</button>
      {downPaymentAmount && <div className="result">{downPaymentAmount}</div>}
    </div>
  );
}

function SavingsGoalCalculator({ onCalculate }) {
  const [savingsGoal, setSavingsGoal] = useState('');
  const [timeFrame, setTimeFrame] = useState('');
  const [monthlySavings, setMonthlySavings] = useState('');
  const [localErrors, setLocalErrors] = useState({
    savingsGoal: '',
    timeFrame: '',
  });

  const handleInputChange = (setter, field) => (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0) {
      setter(value);
      setLocalErrors({...localErrors, [field]: ''});
    } else if (value === '') {
      setter('');
      setLocalErrors({...localErrors, [field]: ''});
    } else {
      setLocalErrors({...localErrors, [field]: 'Please input valid numbers only'});
    }
  };

  const calculateMonthlySavings = () => {
    const goal = parseFloat(savingsGoal) || 0;
    const months = parseFloat(timeFrame) * 12 || 0;

    if (goal <= 0 || months <= 0) {
      onCalculate('Please enter valid values for all fields.');
      return;
    }

    const monthlySavings = goal / months;
    const weeklySavings = monthlySavings / 4.33;
    const dailySavings = monthlySavings / 30.44;

    onCalculate(
      <div className="calculation-result">
        <h4>Required Savings</h4>
        <p className="highlight">{formatCurrency(monthlySavings)} per month</p>
        <h4>Alternative Breakdowns</h4>
        <p>Weekly: {formatCurrency(weeklySavings)}</p>
        <p>Daily: {formatCurrency(dailySavings)}</p>
        <h4>Goal Details</h4>
        <p>Target Amount: {formatCurrency(goal)}</p>
        <p>Time Frame: {timeFrame} years</p>
      </div>
    );
  };

  return (
    <div className="calculator-card">
      <h2>Savings Goal Calculator</h2>
      <div className="input-group">
        <label htmlFor="savingsGoal">
          Savings Goal:
          <span className="tooltip">
            <FontAwesomeIcon icon={faInfoCircle} />
            <span className="tooltiptext">
              The total amount you want to save.
            </span>
          </span>
        </label>
        <input
          type="text"
          id="savingsGoal"
          value={savingsGoal}
          onChange={handleInputChange(setSavingsGoal, 'savingsGoal')}
        />
        {localErrors.savingsGoal && (
          <div className="error-message">{localErrors.savingsGoal}</div>
        )}
      </div>
      <div className="input-group">
        <label htmlFor="timeFrame">
          Time Frame (Years):
          <span className="tooltip">
            <FontAwesomeIcon icon={faInfoCircle} />
            <span className="tooltiptext">
              The number of years to reach your savings goal.
            </span>
          </span>
        </label>
        <input
          type="text"
          id="timeFrame"
          value={timeFrame}
          onChange={handleInputChange(setTimeFrame, 'timeFrame')}
        />
        {localErrors.timeFrame && (
          <div className="error-message">{localErrors.timeFrame}</div>
        )}
      </div>
      <button onClick={calculateMonthlySavings}>Calculate</button>
      {monthlySavings && <div className="result">{monthlySavings}</div>}
    </div>
  );
}

function DtiRatioCalculator({ onCalculate }) {
  const [grossIncome, setGrossIncome] = useState('');
  const [monthlyDebt, setMonthlyDebt] = useState('');
  const [dtiRatio, setDtiRatio] = useState('');
  const [localErrors, setLocalErrors] = useState({
    grossIncome: '',
    monthlyDebt: '',
  });

  const handleInputChange = (setter, field) => (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0) {
      setter(value);
      setLocalErrors({...localErrors, [field]: ''});
    } else if (value === '') {
      setter('');
      setLocalErrors({...localErrors, [field]: ''});
    } else {
      setLocalErrors({...localErrors, [field]: 'Please input valid numbers only'});
    }
  };

  const calculateDtiRatio = () => {
    const income = parseFloat(grossIncome) || 0;
    const debt = parseFloat(monthlyDebt) || 0;

    if (income <= 0) {
      onCalculate('Please enter a valid gross monthly income.');
      return;
    }

    const ratio = (debt / income) * 100;
    const maxRecommendedDebt = income * 0.36;
    const additionalDebtCapacity = maxRecommendedDebt - debt;

    onCalculate(
      <div className="calculation-result">
        <h4>DTI Ratio</h4>
        <p className={`highlight ${ratio > 36 ? 'warning' : 'good'}`}>
          {ratio.toFixed(1)}%
        </p>
        <h4>Analysis</h4>
        <p>Current Monthly Debt: {formatCurrency(debt)}</p>
        <p>Gross Monthly Income: {formatCurrency(income)}</p>
        <p>Maximum Recommended Debt: {formatCurrency(maxRecommendedDebt)}</p>
        <p>Additional Debt Capacity: {formatCurrency(additionalDebtCapacity)}</p>
        <div className="dti-status">
          {ratio <= 36 ? 
            <p className="good">✅ Your DTI ratio is within recommended limits</p> :
            <p className="warning">⚠️ Your DTI ratio is above recommended limits</p>
          }
        </div>
      </div>
    );
  };

  return (
    <div className="calculator-card">
      <h2>Debt-to-Income Ratio (DTI) Calculator</h2>
      <div className="input-group">
        <label htmlFor="grossIncome">
          Gross Monthly Income:
          <span className="tooltip">
            <FontAwesomeIcon icon={faInfoCircle} />
            <span className="tooltiptext">
              Your total monthly income before taxes and deductions.
            </span>
          </span>
        </label>
        <input
          type="text"
          id="grossIncome"
          value={grossIncome}
          onChange={handleInputChange(setGrossIncome, 'grossIncome')}
        />
        {localErrors.grossIncome && (
          <div className="error-message">{localErrors.grossIncome}</div>
        )}
      </div>
      <div className="input-group">
        <label htmlFor="monthlyDebt">
          Monthly Debt Payments:
          <span className="tooltip">
            <FontAwesomeIcon icon={faInfoCircle} />
            <span className="tooltiptext">
              The total amount you pay monthly towards debts.
            </span>
          </span>
        </label>
        <input
          type="text"
          id="monthlyDebt"
          value={monthlyDebt}
          onChange={handleInputChange(setMonthlyDebt, 'monthlyDebt')}
        />
        {localErrors.monthlyDebt && (
          <div className="error-message">{localErrors.monthlyDebt}</div>
        )}
      </div>
      <button onClick={calculateDtiRatio}>Calculate</button>
      {dtiRatio && <div className="result">{dtiRatio}</div>}
      <p>
        Experts recommend keeping your DTI ratio to 30% or lower. If your result is higher than 30%, please be cautious with your spending.
      </p>
    </div>
  );
}

function FAQSection() {
  return (
    <div className="faq-content">
      <h2>Frequently Asked Questions (FAQ) ❓</h2>
      <div className="faq-item">
        <h3>1. What is the Installment Affordability Calculator? 💰</h3>
        <p>The Installment Affordability Calculator is a tool designed to help you determine if you can comfortably afford an installment plan for a purchase. It considers your income, expenses, and savings goals to provide a recommendation on a safe monthly installment amount.</p>
      </div>
      <div className="faq-item">
        <h3>2. How does the calculator work? 🛠️</h3>
        <p>The calculator uses the information you provide (gross monthly income, net monthly income, existing debt payments, essential expenses, target savings, and proposed monthly installment amount) to assess your financial situation. It then compares your proposed installment amount to a recommended safe level based on your overall budget.</p>
      </div>
      <div className="faq-item">
        <h3>3. What is the "Safe Percentage (%)"? 📊</h3>
        <p>The "Safe Percentage (%)" represents a recommended maximum portion of your income that should be allocated to debt repayments, including installment plans. A lower percentage indicates a more comfortable financial buffer. We generally recommend keeping this under 15% to avoid overstretching your budget.</p>
      </div>
      <div className="faq-item">
        <h3>4. Why is the "Safe Percentage (%)" important? ❗</h3>
        <p>Sticking to a recommended safe percentage helps ensure you can comfortably manage your debt obligations without jeopardizing your essential expenses, savings goals, or overall financial well-being. It acts as a guideline to prevent taking on more debt than you can realistically handle.</p>
      </div>
      <div className="faq-item">
        <h3>5. What if my proposed installment amount is higher than the calculator's recommendation? ⚠️</h3>
        <p>If your proposed amount exceeds the recommended level, it suggests that the installment plan might put a strain on your finances. You may want to reconsider the purchase, explore less expensive alternatives, or adjust your budget to accommodate the higher payment.</p>
      </div>
      <div className="faq-item">
        <h3>6. Can I still afford the installment plan if it's slightly higher than the recommendation? 🤔</h3>
        <p>While the recommendation provides a good guideline, individual circumstances vary. If the difference is small, and you have a clear plan for managing your finances, you might still be able to afford it. However, it's essential to carefully review your budget and ensure you have a sufficient financial cushion for unexpected expenses.</p>
      </div>
      <div className="faq-item">
        <h3>7. What if my income or expenses change after using the calculator? 🔄</h3>
        <p>If your financial situation changes significantly, it's crucial to revisit the calculator and update the information. This will ensure the recommendation remains relevant to your current circumstances.</p>
      </div>
      <div className="faq-item">
        <h3>8. Is the calculator's recommendation a guarantee that I can afford the installment plan? 🛡️</h3>
        <p>The calculator provides a helpful assessment based on the data you input, but it's not a financial guarantee. It's essential to use your own judgment and consider all relevant factors, including potential changes in income or expenses, before making a financial decision.</p>
      </div>
      <div className="faq-item">
        <h3>9. Is my data secure when using the calculator? 🔒</h3>
        <p>This calculator operates within your browser and does not transmit your personal financial data to any external servers. Your information remains private and secure.</p>
      </div>
      <div className="faq-item">
        <h3>10. Who should use this calculator? 🙋</h3>
        <p>Anyone considering an installment plan for a significant purchase can benefit from using this calculator. It's particularly helpful for individuals who want to make informed financial decisions and avoid taking on excessive debt.</p>
      </div>
    </div>
  );
}

function App() {
  const [selectedCalculator, setSelectedCalculator] = useState('installment');
  const [calculationResult, setCalculationResult] = useState(null);
  const [isMobileMenuActive, setIsMobileMenuActive] = useState(false);

  const handleCalculatorChange = (calculatorId) => {
    setSelectedCalculator(calculatorId);
    setCalculationResult(null); // Clear results when switching calculators
    setIsMobileMenuActive(false); // Close the mobile menu when a calculator is selected
  };

  const calculators = [
    { id: 'installment', name: 'Installment Check', icon: '💰', description: 'Use this calculator to determine if you can afford a new installment plan based on your income and expenses.' },
    { id: 'loan', name: 'Loan Payment', icon: '💵', description: 'Calculate your monthly loan payments and total interest based on the loan amount, interest rate, and loan term.' },
    { id: 'downPayment', name: 'Down Payment', icon: '🏠', description: 'Determine the down payment required for a purchase based on the total price and down payment percentage.' },
    { id: 'savings', name: 'Savings Goal', icon: '🎯', description: 'Plan your savings goal by calculating the monthly savings required to reach your target amount within a specified time frame.' },
    { id: 'dti', name: 'DTI Ratio', icon: '📊', description: 'Calculate your Debt-to-Income (DTI) ratio to assess your financial health and determine if you can take on additional debt.' },
    { id: 'faq', name: 'FAQ', icon: '❓', description: 'Find answers to frequently asked questions about the calculators and how to use them effectively.' }
  ];

  const renderCalculator = () => {
    switch(selectedCalculator) {
      case 'installment':
        return <SimpleCalculator onCalculate={setCalculationResult} />;
      case 'loan':
        return <LoanPaymentCalculator onCalculate={setCalculationResult} />;
      case 'downPayment':
        return <DownPaymentCalculator onCalculate={setCalculationResult} />;
      case 'savings':
        return <SavingsGoalCalculator onCalculate={setCalculationResult} />;
      case 'dti':
        return <DtiRatioCalculator onCalculate={setCalculationResult} />;
      case 'faq':
        return <FAQSection />;
      default:
        return null;
    }
  };

  const getCalculatorDescription = () => {
    const calculator = calculators.find(calc => calc.id === selectedCalculator);
    return calculator ? calculator.description : '';
  };

  return (
    <div className={isMobileMenuActive ? 'mobile-menu-active' : ''}>
      <h1 className="header">Can you pay for it?</h1>
      <h2 className="subheader">Financial Calculators for Smart Decision Making</h2>
      <div className="container">
        {/* Mobile Menu Toggle Button */}
        <div className="mobile-menu-toggle" onClick={() => setIsMobileMenuActive(!isMobileMenuActive)}>
          <FontAwesomeIcon icon={faBars} /> Menu
        </div>

        {/* Left Column - Calculator List */}
        <div className="sidebar">
          {calculators.map(calc => (
            <div 
              key={calc.id}
              className={`calculator-item ${selectedCalculator === calc.id ? 'active' : ''}`}
              onClick={() => handleCalculatorChange(calc.id)}
            >
              <span className="calculator-icon">{calc.icon}</span>
              <span className="calculator-name">{calc.name}</span>
            </div>
          ))}
        </div>

        {/* Middle Column - Active Calculator */}
        <div className="main-content">
          {renderCalculator()}
        </div>

        {/* Right Column - Results */}
        <div className="result-panel">
          {calculationResult ? (
            <>
              {selectedCalculator === 'installment' ? (
                // Installment calculator results
                <>
                  <div className="result-card">
                    <div className="result" dangerouslySetInnerHTML={{ __html: calculationResult.result }} />
                  </div>
                  {calculationResult.calculatedValues && (
                    <UnderstandResult 
                      disposableLimit={calculationResult.calculatedValues.disposableLimit}
                      dtiLimit={calculationResult.calculatedValues.dtiLimit}
                      installmentAmount={calculationResult.calculatedValues.installmentAmount}
                    />
                  )}
                </>
              ) : (
                // Results for other calculators
                <div className="result-card">
                  <div className="result">
                    {React.isValidElement(calculationResult) ? (
                      calculationResult
                    ) : (
                      <div>{typeof calculationResult === 'string' ? calculationResult : ''}</div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            // Display introductory text if no calculation result
            <div className="result-card">
              <div className="result">
                <p>{getCalculatorDescription()}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
