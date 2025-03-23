import { useLocalizedFont } from '../../hooks/useLocalizedFont';
import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '../../lib/utils';
import { useRouter } from 'next/router';

interface PrivacySection {
    id: string;
    title: string;
    content: ReactNode | ReactNode[];
}

// Helper function to process nested content
const processNestedContent = (text: string) => {
    if (text.startsWith('    •')) {
        return {
            isNested: true,
            bullet: '•',
            text: text.replace('    •', '').trim()
        };
    }
    return {
        isNested: false,
        text
    };
};

const CollapsibleSection = ({ section, isOpen, onToggle, fonts }: { 
    section: PrivacySection; 
    isOpen: boolean; 
    onToggle: () => void;
    fonts: ReturnType<typeof useLocalizedFont>;
}) => {
    return (
        <div className="border-b border-gray-200 dark:border-gray-700">
        <button
        onClick={onToggle}
        className={`w-full flex justify-between items-center py-6 px-4 transition-all duration-700 text-gray-600 dark:text-gray-300 hover:[text-shadow:0_0_20px_rgba(236,245,255,0.9)] hover:text-primary dark:hover:[text-shadow:0_0_20px_rgba(224,242,254,0.3)] dark:hover:text-sky-100`}
        >
        <h3 className={`text-xl ${fonts.text} text-left font-medium`}>
        {section.title}
        </h3>
        <div className={`transition-transform duration-500 transform ${isOpen ? 'rotate-180' : ''}`}>
        <ChevronDownIcon className="h-6 w-6" />
        </div>
        </button>
        <div 
        className={`transition-all duration-700 ease-out overflow-hidden ${
            isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
            >
            <div className={`px-6 pb-8 pl-8 pt-2 transition-all duration-700 transform ${
                isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}>
                {Array.isArray(section.content) ? (
                    <ul className="space-y-3">
                    {section.content.map((item, index) => {
                        if (typeof item === 'string') {
                            const processed = processNestedContent(item);
                            return (
                                <li
                                key={index}
                                className={`${fonts.text} leading-relaxed text-gray-600 dark:text-gray-300 transition-all duration-300 ${
                                    processed.isNested ? 'pl-5' : 'list-disc pl-3 lg:pl-5'
                                    }`}
                                    >
                                    {processed.isNested ? (
                                        <div className="flex items-start nested-list-item">
                                        <span className="inline-block bullet-point w-4 mr-4">{processed.bullet}</span>
                                        <span className="flex-1 nested-content">{processed.text}</span>
                                        </div>
                                    ) : item}
                                    </li>
                                );
                            }
                            return item;
                        })}
                        </ul>
                    ) : (
                        <p className={`${fonts.text} leading-relaxed text-gray-600 dark:text-gray-300 transition-all duration-300`}>
                        {section.content}
                        </p>
                    )}
                    </div>
                    </div>
                    </div>
                );
            };
            
            export default function Privacy() {
                const fonts = useLocalizedFont();
                const [openSections, setOpenSections] = useState<string[]>([]);
                
                // External link component with proper font styling
                const ExternalLink = ({ href, children }: { href: string; children: ReactNode }) => (
                    <a 
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-primary ${fonts.text} dark:text-light-blue hover:underline transition-all duration-300`}
                    >
                    {children}
                    </a>
                );
                
                const toggleSection = (sectionId: string) => {
                    setOpenSections(prev =>
                        prev.includes(sectionId)
                        ? prev.filter(id => id !== sectionId)
                        : [...prev, sectionId]
                    );
                };
                
                const sections: PrivacySection[] = [
                    {
                        id: 'intro',
                        title: '1. Introduction',
                        content: "At TravelRizz.app ('TravelRizz,' 'we,' 'our,' or 'us'), we value your privacy. This Privacy Policy outlines how we collect, use, and protect your information when you use our AI-powered travel planning service at TravelRizz.app. We aim to keep things simple: we don't require signups or personal data for most features, and any data handling is minimized or managed by trusted third-party providers."
                    },
                    {
                        id: 'collection',
                        title: '2. Information We Collect',
                        content: [
                            'No Personal Data Collected by Us: You can use TravelRizz, including premium features, without creating an account or providing personal information like your name, email, or address.',
                            'Payment Information for Premium Services: If you opt for premium services, you will provide payment details (e.g., credit card information). This is processed securely by our third-party payment provider, Stripe, and we do not store or access it.',
                            'Third-Party Data Collection: We use services like Vercel (for hosting) and Cloudflare (for security, DNS, and analytics), which may automatically collect:',
                            '    • Traffic data (e.g., your country)',
                            '    • Site interactions (e.g., clicks or page views)',
                            '    • IP addresses (for security and analytics)',
                            'Chat Interactions: Our AI chat feature, powered by Vercel SDK and OpenAI ChatGPT-4o-mini model, processes your conversations to create travel plans. We do not store these chats, but Vercel and OpenAI may retain them per their policies.'
                        ]
                    },
                    {
                        id: 'usage',
                        title: '3. How We Use Your Information',
                        content: [
                            'Service Improvement and Personalization: Data collected by third-party services is used to:',
                            '    • Enhance our platform (e.g., fix bugs, improve speed)',
                            '    • Personalize your experience (e.g., tailor travel suggestions based on available demographic data)',
                            'No Advertising: We do not use your data for ads and have no plans to start.',
                            'Payment Processing: Payment details are used solely to process transactions via Stripe.'
                        ]
                    },
                    {
                        id: 'sharing',
                        title: '4. Data Sharing with Third Parties',
                        content: [
                            'Limited Sharing: We do not share your personal data except as needed to deliver our services:',
                            '    • Stripe: Handles payment processing for premium features',
                            '    • Cloudflare: Provides security, DNS, and basic analytics',
                            '    • Vercel: Hosts our site and supports AI chat functionality',
                            '    • OpenAI: Powers our AI assistant with ChatGPT-4o-mini',
                            'Booking.com Integration: We plan to integrate Booking.com API for hotel recommendations. This will not involve sharing your data with Booking.com; it is just to fetch options within TravelRizz.'
                        ]
                    },
                    {
                        id: 'retention',
                        title: '5. Data Retention and Deletion',
                        content: [
                            'No Storage by Us: TravelRizz doesn\'t store user data, including chat histories or personal details, on our servers.',
                            'Third-Party Retention: Data collected by Stripe, Cloudflare, Vercel, or OpenAI is kept according to their privacy policies. We can\'t control or specify their retention periods.',
                            'Deletion Requests: Since we don\'t hold your data, deletion requests should go directly to our third-party providers:',
                            <div key="cloudflare" className="flex items-start pl-5 text-gray-600 dark:text-gray-300">
                            <span className="inline-block w-4 mr-4">•</span>
                            <ExternalLink href="https://www.cloudflare.com/privacypolicy/">Cloudflare Privacy Policy</ExternalLink>
                            </div>,
                            <div key="vercel" className="flex items-start pl-5 text-gray-600 dark:text-gray-300">
                            <span className="inline-block w-4 mr-4">•</span>
                            <ExternalLink href="https://vercel.com/legal/privacy-policy">Vercel Privacy Policy</ExternalLink>
                            </div>,
                            <div key="stripe" className="flex items-start pl-5 text-gray-600 dark:text-gray-300">
                            <span className="inline-block w-4 mr-4">•</span>
                            <ExternalLink href="https://stripe.com/privacy">Stripe Privacy Policy</ExternalLink>
                            </div>,
                            <div key="openai" className="flex items-start pl-5 text-gray-600 dark:text-gray-300">
                            <span className="inline-block w-4 mr-4">•</span>
                            <ExternalLink href="https://openai.com/policies/privacy-policy">OpenAI Privacy Policy</ExternalLink>
                            </div>
                        ]
                    },
                    {
                        id: 'compliance',
                        title: '6. Compliance with Data Protection Laws',
                        content: [
                            'Third-Party Compliance: We don\'t collect or process personal data directly, so we rely on our third-party providers to comply with laws like the General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA).',
                            'International Users: If you\'re in a region with specific privacy rules (e.g., EU or California), check our providers\' policies for details on your rights.'
                        ]
                    },
                    {
                        id: 'rights',
                        title: '7. Your Rights Regarding Your Data',
                        content: [
                            'No Data with Us: Since we don\'t store your personal data, we can\'t provide access, corrections, or deletions.',
                            'Third-Party Requests: For data held by our providers, contact them directly using the links in Section 5.'
                        ]
                    },
                    {
                        id: 'ai',
                        title: '8. AI and Chat Data Disclaimer',
                        content: [
                            'Our AI assistant is designed to help with travel planning, but it has limitations and may not always be accurate. Please treat its suggestions as recommendations rather than definitive advice.',
                            'Important: Avoid sharing sensitive personal information (e.g., credit card numbers, passwords) in chats with our AI. While we don\'t store chats, our service providers (Vercel and OpenAI) may retain them according to their policies.'
                        ]
                    },
                    {
                        id: 'cookies',
                        title: '9. Cookies and Tracking Technologies',
                        content: [
                            'Our trusted service providers (Cloudflare and Vercel) use cookies and similar technologies for security, analytics, and performance optimization.',
                            'You can manage cookie preferences through your browser settings. For detailed information about the cookies used, please refer to our Cookie Policy.',
                            <div key="cookie-policy" className="mt-2">
                            For more details, see our <ExternalLink href="/cookies">Cookie Policy</ExternalLink>.
                            </div>
                        ]
                    },
                    {
                        id: 'changes',
                        title: '10. Updates to This Policy',
                        content: [
                            'Last Updated: March 13, 2025',
                            'We may update this Privacy Policy periodically to reflect changes in our practices, services, or legal requirements. Significant changes will be announced on our website. Your continued use of TravelRizz.app after such changes constitutes acceptance of the updated policy.'
                        ]
                    },
                    {
                        id: 'contact',
                        title: '11. Contact Us',
                        content: [
                            'Have questions or concerns about our Privacy Policy? We\'d love to hear from you! Reach out through our social media channels:',
                            '    • X: @travelrizz',
                            '    • Instagram: @travelrizz',
                            '    • Facebook: @travelrizz'
                        ]
                    }
                ];
                
                return (
                    <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-900">
                    <div className="container w-[80%] mx-auto">
                    <div className="flex flex-col items-center justify-center space-y-8">
                    <h1 className={`text-4xl md:text-5xl text-primary dark:text-sky-100 ${fonts.heading} transition-colors duration-400 text-center`}>
                    Privacy Policy
                    </h1>
                    <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                    {sections.map(section => (
                        <CollapsibleSection
                        key={section.id}
                        section={section}
                        isOpen={openSections.includes(section.id)}
                        onToggle={() => toggleSection(section.id)}
                        fonts={fonts}
                        />
                    ))}
                    </div>
                    </div>
                    </div>
                    </section>
                );
            }
