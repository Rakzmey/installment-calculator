# Installment Affordability Calculator

    This website provides a set of tools to help users assess their financial situation and determine if they can comfortably afford an installment plan or other financial goals.

    ## Features

    *   **Installment Affordability Calculator:** Helps users determine if they can afford a new installment plan based on their income, expenses, and savings.
    *   **Loan Payment Calculator:** Calculates the monthly payment for a loan based on the loan amount, interest rate, and loan term.
    *   **Down Payment Calculator:** Calculates the required down payment for a purchase based on the total price and down payment percentage.
    *   **Savings Goal Calculator:** Calculates the monthly savings needed to reach a specific savings goal within a given time frame.
    *   **Debt-to-Income Ratio (DTI) Calculator:** Calculates the debt-to-income ratio to assess financial health.
    *   **FAQ Section:** Provides answers to frequently asked questions about the calculators and financial planning.
    *   **Responsive Design:** The website is designed to be responsive and work well on different screen sizes.
    *   **Back to Top Button:** A button to easily scroll back to the top of the page.

    ## How to Run Locally

    1.  **Clone the repository:**
        ```bash
        git clone <repository_url>
        ```
        Replace `<repository_url>` with the actual URL of your repository.
    2.  **Navigate to the project directory:**
        ```bash
        cd installment-calculator
        ```
    3.  **Install dependencies:**
        ```bash
        npm install
        ```
    4.  **Start the development server:**
        ```bash
        npm run dev
        ```
    5.  Open your browser and go to the provided local server URL.

    ## Deployment

    This project is designed to be easily deployed on Cloudflare Pages. Follow these steps:

    1.  Create a GitHub repository and push your project to it.
    2.  Create a Cloudflare account (if you don't have one).
    3.  Create a Cloudflare Pages project:
        *   Log in to your Cloudflare account.
        *   Navigate to "Pages" and click "Create a project".
        *   Select "Connect to Git" and choose your GitHub repository.
        *   In the "Configure your build settings" section:
            *   Set "Framework preset" to "Create React App".
            *   Set "Build command" to `npm run build`.
            *   Set "Build output directory" to `dist`.
        *   Click "Save and Deploy".

    ## Technologies Used

    *   React
    *   Vite
    *   Font Awesome
    *   React Spinners
    *   HTML
    *   CSS

    ## Disclaimer

    The calculations provided are estimates and should not be considered financial advice.
