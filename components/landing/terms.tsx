import { useLocalizedFont } from '../../hooks/useLocalizedFont';
import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

// Section interface for type safety
interface TermsSection {
  id: string;
  title: string;
  content: string | string[];
}

// Utility class for text glow effect on hover
const textGlowClass = 'hover:[text-shadow:0_0_20px_rgba(236,245,255,0.9)] hover:text-primary dark:hover:[text-shadow:0_0_20px_rgba(224,242,254,0.3)] dark:hover:text-sky-100';

// Helper function to process nested content
const processNestedContent = (text: string) => {
  if (text.startsWith('    •')) {
    // Return bullet and content separately for nested items
    return {
      isNested: true,
      bullet: '•',
      text: text.replace('•', '').trim()
    };
  }
  return {
    isNested: false,
    text
  };
};

// Component for each collapsible section with enhanced styling and animations
const CollapsibleSection = ({ section, isOpen, onToggle, fonts }: { 
  section: TermsSection; 
  isOpen: boolean; 
  onToggle: () => void;
  fonts: ReturnType<typeof useLocalizedFont>;
}) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={onToggle}
        className={`w-full flex justify-between items-center py-6 px-4 transition-all duration-700 text-gray-600 dark:text-gray-300 ${textGlowClass}`}
      >
        <h3 className={`text-xl ${fonts.text} font-medium`}>
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
        <div className={`px-6 pb-8 pt-2 transition-all duration-700 transform ${
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          {Array.isArray(section.content) ? (
            <ul className="space-y-3">
              {section.content.map((item, index) => {
                const processed = processNestedContent(item);
                return (
                  <li
                    key={index}
                    className={`${fonts.text} leading-relaxed text-gray-600 dark:text-gray-300 transition-all duration-300 ${
                      processed.isNested ? 'pl-5' : 'list-disc pl-5'
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

export default function Terms() {
  const fonts = useLocalizedFont();
  const [openSections, setOpenSections] = useState<string[]>([]);

  // Toggle section visibility
  const toggleSection = (sectionId: string) => {
    setOpenSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Terms of service sections
  const sections: TermsSection[] = [
    {
      id: 'intro',
      title: '1. Introduction and Scope',
      content: "Welcome to TravelRizz.app ('TravelRizz,' 'we,' 'our,' or 'us'). These Terms of Service ('ToS') govern your use of our AI-powered travel planning service, available at TravelRizz.app, including both free and premium features. By accessing or using our service, you agree to these ToS. If you do not agree, please refrain from using TravelRizz."
    },
    {
      id: 'account',
      title: '2. No Account Required; Payment for Premium Services',
      content: [
        "No Signup Needed: You don't need to create an account or provide personal information to use any of our services, including premium features.",
        "Payment Details for Premium Services: To access premium services, you must provide payment details. We process payments securely through Stripe, our third-party payment provider. By using premium services, you agree to Stripe's terms and conditions (available on their website). All fees are non-refundable unless otherwise specified."
      ]
    },
    {
      id: 'usage',
      title: '3. Service Usage',
      content: [
        'Acceptable Use: You may use TravelRizz for personal, non-commercial travel planning purposes only.',
        'Prohibited Actions: You agree not to misuse the service, including but not limited to:',
        '    • Spamming or sending excessive requests',
        '    • Scraping or extracting data from the site',
        '    • Attempting to reverse-engineer or interfere with our AI technology',
        '    • Using the service for illegal activities'
      ]
    },
    {
      id: 'data',
      title: '4. Data Collection and Usage',
      content: [
        'No Personal Data Collected by Us: TravelRizz does not require or collect personal information from users, except for payment details needed for premium services (handled by Stripe).',
        "Third-Party Data Collection: Our site is hosted on Vercel and uses Cloudflare's free tier for security, proxy, DNS, and analytics.",
        'Purpose of Data Use: Any data collected via third-party services is used solely for improving our service and personalizing user experiences.'
      ]
    },
    {
      id: 'integrations',
      title: '5. Third-Party Integrations',
      content: [
        'Cloudflare: We use Cloudflare for security, DNS management, and basic analytics.',
        'Vercel: Our service is hosted on Vercel, which provides analytics and powers our AI chat features.',
        'Stripe: Payments for premium services are handled by Stripe.',
        "Booking.com API (Planned): We intend to integrate Booking.com's hotel recommendation API."
      ]
    },
    {
      id: 'retention',
      title: '6. Data Retention and Deletion',
      content: [
        'Our Policy: TravelRizz does not store user data, including chat histories or personal details, on our own servers.',
        'Third-Party Retention: Any data collected by third parties is retained according to their respective policies.',
        'Advice for Users: For details on data retention or deletion requests, please refer to our third-party providers policies.'
      ]
    },
    {
      id: 'compliance',
      title: '7. Compliance and User Rights',
      content: [
        'Regulatory Compliance: We rely on our third-party providers to comply with data protection regulations.',
        'User Requests: Since we don\'t collect or store your data, data-related requests should be directed to relevant third-party services.'
      ]
    },
    {
      id: 'ai',
      title: '8. AI-Related Disclaimers',
      content: [
        'Our AI assistant is designed to help with travel planning, but it has limitations and may not always be accurate. Please treat its suggestions as recommendations rather than definitive advice.',
        'Important: Avoid sharing sensitive personal information (e.g., credit card numbers, passwords) in chats with our AI. While we don\'t store chats, our service providers (Vercel and OpenAI) may retain them according to their policies.'
      ]
    },
    {
      id: 'ip',
      title: '9. Intellectual Property',
      content: [
        'Ownership: All content on TravelRizz.app, including AI-generated travel plans, text, graphics, and other materials, is owned by TravelRizz or its licensors. This content is protected by copyright, trademark, and other intellectual property laws.',
        'User Permissions: You may use the AI-generated travel plans for your personal, non-commercial purposes, such as planning your own trips or sharing them with friends and family for their personal use.',
        'Restrictions: You may not:',
        '    • Copy, distribute, or share the content for commercial purposes (e.g., selling the plans or using them in a business)',
        '    • Create derivative works from the content (e.g., modifying the plans and claiming them as your own)',
        '    • Publicly display or publish the content on other platforms (e.g., social media, blogs, or websites) without our written permission',
        'Attribution: If you share the travel plans with others, we kindly ask that you attribute them to TravelRizz.app'
      ]
    },
    {
      id: 'liability',
      title: '10. Limitation of Liability',
      content: [
        'TravelRizz.app and its services are provided "as is" without any warranties, express or implied. We do not guarantee the accuracy or completeness of AI-generated travel plans or any other content.',
        'To the fullest extent permitted by law, TravelRizz is not liable for any direct, indirect, incidental, special, or consequential damages arising from your use of our service.'
      ]
    },
    {
      id: 'law',
      title: '11. Governing Law',
      content: 'These Terms of Service are governed by the laws of Malaysia. Any disputes will be resolved in the courts of Kuala Lumpur, Malaysia, in accordance with Malaysian law. We aim to resolve any disputes amicably, considering our international user base and the global nature of our service.'
    },
    {
      id: 'changes',
      title: '12. Updates to This Policy',
      content: [
        'Last Updated: March 13, 2025',
        'We may update these Terms of Service periodically to reflect changes in our practices, services, or legal requirements. Significant changes will be announced on our website. Your continued use of TravelRizz.app after such changes constitutes acceptance of the updated policy.'
      ]
    },
    {
      id: 'contact',
      title: '13. Contact Us',
      content: [
        'Have questions or concerns about our Terms of Service? We\'d love to hear from you! Reach out through our social media channels:',
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
            Terms of Service
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
