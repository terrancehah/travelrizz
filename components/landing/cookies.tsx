import { useLocalizedFont } from '../../hooks/useLocalizedFont';
import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { ReactNode } from 'react';

interface CookieSection {
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
    section: CookieSection; 
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
            
            export default function Cookies() {
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
                
                const sections: CookieSection[] = [
                    {
                        id: 'intro',
                        title: '1. Introduction',
                        content: "At TravelRizz.app ('TravelRizz,' 'we,' 'our,' or 'us'), we use third-party services to enhance your experience, ensure security, and analyze site performance. These services may use cookies—small text files stored on your device—to function properly. This Cookie Policy explains what cookies are, how they are used on our site through third-party services, and how you can manage them."
                    },
                    {
                        id: 'what',
                        title: '2. What Are Cookies?',
                        content: [
                            'Cookies are small files that websites place on your device to store information, such as preferences or browsing activity. They help websites remember your actions, improve functionality, and provide insights into how the site is used. Cookies can be:',
                            '    • Session cookies: Temporary and deleted when you close your browser.',
                            '    • Persistent cookies: Stay on your device for a set period.'
                        ]
                    },
                    {
                        id: 'third-party',
                        title: '3. Third-Party Cookies on TravelRizz.app',
                        content: [
                            'TravelRizz.app does not set its own cookies. However, we rely on third-party services that may place cookies on your device for purposes such as security, analytics, and performance optimization. These services include:',
                            'Cloudflare: Provides security, DNS management, and analytics. Cloudflare may use cookies to:',
                            '    • Identify trusted web traffic.',
                            '    • Prevent malicious activity.',
                            '    • Analyze site performance and usage.',
                            <div key="cloudflare" className="mt-2">
                            For more details, see <ExternalLink href="https://www.cloudflare.com/cookie-policy/">Cloudflare's Cookie Policy</ExternalLink>.
                            </div>,
                            'Vercel: Hosts our site and powers our AI chat features. Vercel may use cookies to:',
                            '    • Manage user sessions.',
                            '    • Analyze site usage and performance.',
                            <div key="vercel" className="mt-2">
                            For more information, refer to <ExternalLink href="https://vercel.com/legal/privacy-policy">Vercel's Privacy Policy</ExternalLink>.
                            </div>
                        ]
                    },
                    {
                        id: 'booking',
                        title: '4. Booking.com API Integration',
                        content: "We plan to integrate Booking.com's API to provide hotel recommendations within our service. This integration does not involve setting cookies on your device; it simply retrieves data to display options on TravelRizz.app."
                    },
                    {
                        id: 'manage',
                        title: '5. How to Manage Cookies',
                        content: [
                            'You can control or disable cookies through your browser settings. Most browsers allow you to:',
                            '    • View the cookies stored on your device.',
                            '    • Block or delete specific cookies.',
                            '    • Set preferences for accepting or rejecting cookies.',
                            'Here are links to instructions for popular browsers:',
                            <div key="browsers" className="space-y-2 mt-2">
                            <div><ExternalLink href="https://support.google.com/chrome/answer/95647">Google Chrome</ExternalLink></div>
                            <div><ExternalLink href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop">Mozilla Firefox</ExternalLink></div>
                            <div><ExternalLink href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac">Safari</ExternalLink></div>
                            <div><ExternalLink href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09">Microsoft Edge</ExternalLink></div>
                            </div>,
                            'Note: Blocking cookies may affect the functionality of some features on TravelRizz.app or the third-party services we use.'
                        ]
                    },
                    {
                        id: 'consent',
                        title: '6. Your Consent',
                        content: 'By using TravelRizz.app, you consent to the use of cookies by our third-party service providers as described in this policy. If you do not agree, you can adjust your browser settings to limit or block cookies, though this may impact your experience.'
                    },
                    {
                        id: 'updates',
                        title: '7. Updates to This Policy',
                        content: [
                            'Last Updated: March 13, 2025',
                            'We may update this Cookie Policy periodically to reflect changes in our practices, services, or legal requirements. Significant changes will be announced on our website. Your continued use of TravelRizz.app after such changes constitutes acceptance of the updated policy.'
                        ]
                    },
                    {
                        id: 'contact',
                        title: '8. Contact Us',
                        content: [
                            'Have questions or concerns about our Cookie Policy? We\'d love to hear from you! Reach out through our social media channels:',
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
                    Cookie Policy
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
