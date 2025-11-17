import '../styles/globals.css';
import '@fontsource/hanuman'; // Import Hanuman font
import type { AppProps } from 'next/app';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ThemeProvider } from '../contexts/ThemeContext';

// Create a wrapper component that includes all providers
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Component {...pageProps} />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default MyApp;