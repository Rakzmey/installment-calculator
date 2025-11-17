import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { calculatorMetadata, defaultMetadata } from './metadata';
import { translations } from '../translations';
import { useLanguage } from '../contexts/LanguageContext';

// Define the SEOProps interface
interface SEOProps {
    calculatorType?: string;
    customTitle?: string;
    customDescription?: string;
}

const SEO: React.FC<SEOProps> = ({ calculatorType, customTitle, customDescription }) => {
    const router = useRouter();
    const { language } = useLanguage();
    
    const baseUrl = 'https://opakor.com'; // Replace with your actual domain
    
    // Get metadata for the current calculator or use default
    const metadata = calculatorType ? calculatorMetadata[calculatorType] || defaultMetadata : defaultMetadata;
    const localizedMetadata = metadata[language as 'en' | 'kh'];
    
    // Use custom title/description if provided, otherwise use from metadata
    const title = customTitle || localizedMetadata.title;
    const description = customDescription || localizedMetadata.description;
    
    // Get both language versions for alternate links
    const alternateUrl = router.asPath;
    const currentUrl = `${baseUrl}${router.asPath}`;
    
    // Generate canonical URL
    const canonicalUrl = `${baseUrl}${router.asPath}`;

    return (
        <Head>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={localizedMetadata.keywords.join(', ')} />
            
            {/* Open Graph tags for social sharing */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:locale" content={language === 'kh' ? 'km_KH' : 'en_US'} />
            
            {/* Alternate language versions */}
            <link
                rel="alternate"
                href={`${baseUrl}${alternateUrl}`}
                hrefLang={language === 'kh' ? 'en' : 'km'}
            />
            <link rel="alternate" href={`${baseUrl}${alternateUrl}`} hrefLang="x-default" />
            
            {/* Twitter Card tags */}
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            
            {/* Canonical URL */}
            <link rel="canonical" href={canonicalUrl} />
            
            {/* Additional SEO meta tags */}
            <meta name="robots" content="index, follow" />
            <meta name="author" content="Cambodian Financial Calculators" />
            <meta name="application-name" content="Cambodian Financial Calculators" />
        </Head>
    );
};

export default SEO;