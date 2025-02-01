import React, { useState, useRef, useEffect } from 'react';
    import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
    import { faChevronDown, faChevronUp, faInfoCircle, faArrowUp } from '@fortawesome/free-solid-svg-icons';
    import { ClipLoader } from 'react-spinners';

    function formatCurrency(amount) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    }

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

        const affordableAmount = Math.min(
          (0.30 * gross - debt),
          ((income - expenses - saving) * emergency)
        );
        const disposableLimit = ((income - expenses - saving) * emergency);
        const dtiLimit = (0.30 * gross) - debt;

        let response = `
          💵 The new monthly installment is ${formatCurrency(installment)}
          <br/>
          💳 Your Debt-to-Income (DTI) limit is: ${formatCurrency(dtiLimit)}
          <br/>
          💸 Your Disposable income Limit is ${formatCurrency(disposableLimit)}
          `;

        if (installment > dtiLimit) {
          response += '<br/>👎 No! You CANNOT afford this new installment plan at all!!! Read the "Understand Your Result" section below to learn more.';
        } else if (installment <= dtiLimit && installment > disposableLimit * 3) {
          response += '<br/>🤔 While you technically can afford this new installment plan, you might not wanna risk it! Read the "Understand Your Result" section below to learn more.';
        } else if (installment <= disposableLimit * 1.5 && installment > disposableLimit) {
          response += '<br/>😬 This is cutting it very close!!! Read the "Understand Your Result" section below to learn more.';
        } else {
          response += '<br/>👍 Looks good! Go ahead! We suggest you read the "Understand Your Result" section below to learn more.';
        }
        setResult(response);

        // Pass the calculated values to the parent component
        onCalculate({
          installmentAmount: installment,
          dtiLimit,
          disposableLimit,
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
              Necessity Expenses:
              <span className="tooltip">
                <FontAwesomeIcon icon={faInfoCircle} />
                <span className="tooltiptext">
                  Your total monthly expenses, excluding any debt payments.
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
          <button onClick={calculateAffordability}>Let's check!</button>
          {result && <div className="result" dangerouslySetInnerHTML={{ __html: result }} />}
        </div>
      );
    }

    function LoanPaymentCalculator() {
      const [loanAmount, setLoanAmount] = useState('');
      const [interestRate, setInterestRate] = useState('');
      const [loanTerm, setLoanTerm] = useState('');
      const [monthlyPayment, setMonthlyPayment] = useState('');
      const [localErrors, setLocalErrors] = useState({
        loanAmount: '',
        interestRate: '',
        loanTerm: '',
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
          setMonthlyPayment('Please enter valid values for all fields.');
          return;
        }

        const numerator = rate * Math.pow(1 + rate, term);
        const denominator = Math.pow(1 + rate, term) - 1;
        const payment = amount * (numerator / denominator);

        setMonthlyPayment(`Your monthly payment is: ${formatCurrency(payment)}`);
      };

      return (
        <div className="calculator-card">
          <h2>Loan Payment Calculator</h2>
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
          <button onClick={calculateLoanPayment}>Calculate</button>
          {monthlyPayment && <div className="result">{monthlyPayment}</div>}
        </div>
      );
    }

    function DownPaymentCalculator() {
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
          setDownPaymentAmount('Please enter valid values for all fields.');
          return;
        }

        const amount = price * percent;
        setDownPaymentAmount(`Your required down payment is: ${formatCurrency(amount)}`);
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

    function SavingsGoalCalculator() {
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
          setMonthlySavings('Please enter valid values for all fields.');
          return;
        }

        const savings = goal / months;
        setMonthlySavings(`You need to save ${formatCurrency(savings)} per month to reach your goal.`);
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

    function DtiRatioCalculator() {
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
          setDtiRatio('Please enter a valid gross monthly income.');
          return;
        }

        const ratio = (debt / income) * 100;
        setDtiRatio(`Your Debt-to-Income (DTI) ratio is: ${ratio.toFixed(2)}%`);
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
      const [expanded, setExpanded] = useState(false);

      const toggleExpand = () => {
        setExpanded(!expanded);
      };

      return (
        <CollapsibleCard
          title="Frequently Asked Questions (FAQ) ❓"
          isExpanded={expanded}
          onToggle={toggleExpand}
        >
          <div className="faq-content">
            <p>
              <strong>1. Q: What is the Installment Affordability Calculator?</strong><br />
              A: The Installment Affordability Calculator is a tool designed to help you determine if you can comfortably afford an installment plan for a purchase. It considers your income, expenses, and savings goals to provide a recommendation on a safe monthly installment amount.
            </p>
            <p>
              <strong>2. Q: How does the calculator work?</strong><br />
              A: The calculator uses the information you provide (gross monthly income, net monthly income, existing debt payments, essential expenses, target savings, and proposed monthly installment amount) to assess your financial situation. It then compares your proposed installment amount to a recommended safe level based on your overall budget.
            </p>
            <p>
              <strong>3. Q: What is the "Safe Percentage (%)"?</strong><br />
              A: The "Safe Percentage (%)" represents a recommended maximum portion of your income that should be allocated to debt repayments, including installment plans. A lower percentage indicates a more comfortable financial buffer. We generally recommend keeping this under 15% to avoid overstretching your budget.
            </p>
            <p>
              <strong>4. Q: Why is the "Safe Percentage (%)" important?</strong><br />
              A: Sticking to a recommended safe percentage helps ensure you can comfortably manage your debt obligations without jeopardizing your essential expenses, savings goals, or overall financial well-being. It acts as a guideline to prevent taking on more debt than you can realistically handle.
            </p>
            <p>
              <strong>5. Q: What if my proposed installment amount is higher than the calculator's recommendation?</strong><br />
              A: If your proposed amount exceeds the recommended level, it suggests that the installment plan might put a strain on your finances. You may want to reconsider the purchase, explore less expensive alternatives, or adjust your budget to accommodate the higher payment.
            </p>
            <p>
              <strong>6. Q: Can I still afford the installment plan if it's slightly higher than the recommendation?</strong><br />
              A: While the recommendation provides a good guideline, individual circumstances vary. If the difference is small, and you have a clear plan for managing your finances, you might still be able to afford it. However, it's essential to carefully review your budget and ensure you have a sufficient financial cushion for unexpected expenses.
            </p>
            <p>
              <strong>7. Q: What if my income or expenses change after using the calculator?</strong><br />
              A: If your financial situation changes significantly, it's crucial to revisit the calculator and update the information. This will ensure the recommendation remains relevant to your current circumstances.
            </p>
            <p>
              <strong>8. Q: Is the calculator's recommendation a guarantee that I can afford the installment plan?</strong><br />
              A: The calculator provides a helpful assessment based on the data you input, but it's not a financial guarantee. It's essential to use your own judgment and consider all relevant factors, including potential changes in income or expenses, before making a financial decision.
            </p>
            <p>
              <strong>9. Q: Is my data secure when using the calculator?</strong><br />
              A: This calculator operates within your browser and does not transmit your personal financial data to any external servers. Your information remains private and secure.
            </p>
            <p>
              <strong>10. Q: Who should use this calculator?</strong><br />
              A: 🙋 Anyone considering an installment plan for a significant purchase can benefit from using this calculator. It's particularly helpful for individuals who want to make informed financial decisions and avoid taking on excessive debt.
            </p>
          </div>
        </CollapsibleCard>
      );
    }

    function App() {
      const [expandedCards, setExpandedCards] = useState({
        loanPayment: false,
        downPayment: false,
        savingsGoal: false,
        dtiRatio: false,
      });
      const [showExplanation, setShowExplanation] = useState(false);
      const [dtiLimit, setDtiLimit] = useState(0);
      const [disposableLimit, setDisposableLimit] = useState(0);
      const [installmentAmount, setInstallmentAmount] = useState(0);
      const [showBackToTop, setShowBackToTop] = useState(false);

      const toggleCard = (card) => {
        setExpandedCards((prev) => ({
          ...prev,
          [card]: !prev[card],
        }));
      };

      const handleCalculate = ({ installmentAmount, dtiLimit, disposableLimit }) => {
        setInstallmentAmount(installmentAmount);
        setDtiLimit(dtiLimit);
        setDisposableLimit(disposableLimit);
        setShowExplanation(true);
      };

      const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };

      useEffect(() => {
        const handleScroll = () => {
          setShowBackToTop(window.scrollY > 200);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
      }, []);

      return (
        <div>
          <h1 className="header">Can you pay for it?</h1>
          <div className="sub-header">
            Think that installment plan is a steal? Let's make sure that your wallet agrees!
          </div>
          <div className="container">
            <SimpleCalculator onCalculate={handleCalculate} />
            {showExplanation && (
              <div className="explanation-card">
                <h3>Understanding Your Result</h3>
                <div className="explanation-content">
                  <p>
                    Your <strong>Disposable Income Limit</strong> is <strong>{formatCurrency(disposableLimit)}</strong>. This represents the maximum amount you can safely allocate to a new installment without compromising your financial stability. It's calculated based on your net income, expenses, and savings.
                  </p>
                  <p>
                    Your <strong>Debt-to-Income (DTI) Limit</strong> is <strong>{formatCurrency(dtiLimit)}</strong>. This is the maximum amount lenders typically allow for debt payments, calculated as 30% of your gross income minus existing debts.
                  </p>
                  <p>
                    Your desired installment amount is <strong>{formatCurrency(installmentAmount)}</strong>.
                  </p>
                  <p>If this amount is higher than your DTI limit, then you obviously <em>CANNOT</em> afford the new installment. If it falls anywhere between your Disposable Income Limit and DTI Limit, it's <strong>safer to stay closer to your Disposable Income Limit</strong>. This ensures:</p>
                  <ul>
                    <li>No unexpected financial strain</li>
                    <li>Room for emergencies or unexpected expenses</li>
                    <li>Long-term peace of mind</li>
                  </ul>
                  <p>
                    Remember, just because you <em>can</em> afford something doesn't always mean you <em>should</em>. Prioritize financial stability over short-term gains!
                  </p>
                  <p>
                    If, however, the installment amount is equal to, or lower than, the Disposable Income Limit then you can afford it without putting a strain on your financial health.
                  </p>
                </div>
              </div>
            )}
            <CollapsibleCard
              title="Loan Payment Calculator"
              isExpanded={expandedCards.loanPayment}
              onToggle={() => toggleCard('loanPayment')}
            >
              <LoanPaymentCalculator />
            </CollapsibleCard>
            <CollapsibleCard
              title="Down Payment Calculator"
              isExpanded={expandedCards.downPayment}
              onToggle={() => toggleCard('downPayment')}
            >
              <DownPaymentCalculator />
            </CollapsibleCard>
            <CollapsibleCard
              title="Savings Goal Calculator"
              isExpanded={expandedCards.savingsGoal}
              onToggle={() => toggleCard('savingsGoal')}
            >
              <SavingsGoalCalculator />
            </CollapsibleCard>
            <CollapsibleCard
              title="Debt-to-Income Ratio (DTI) Calculator"
              isExpanded={expandedCards.dtiRatio}
              onToggle={() => toggleCard('dtiRatio')}
            >
              <DtiRatioCalculator />
            </CollapsibleCard>
            <FAQSection />
            <p className="disclaimer">
              Disclaimer: The calculations provided are estimates and should not
              be considered financial advice.
            </p>
            <footer>
              <p>&copy; {new Date().getFullYear()} Installment Calculator</p>
            </footer>
          </div>
          {showBackToTop && (
            <button
              onClick={scrollToTop}
              className="back-to-top"
            >
              <FontAwesomeIcon icon={faArrowUp} />
              <span className="tooltiptext">Back to Top</span>
            </button>
          )}
        </div>
      );
    }

    export default App;
