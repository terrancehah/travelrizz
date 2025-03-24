import { useTranslations, useMessages } from 'next-intl';
import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useLocalizedFont } from '../../hooks/useLocalizedFont';

// Define types for messages and content
type Content = string | Content[];

interface SectionData {
    title: string;
    content: Content;
}

interface Messages {
    privacy: Record<string, SectionData>;
}

interface PrivacySection {
    id: string;
    title: string;
    content: Content;
}

// Component to render content recursively
function RenderContent({
    content,
    fonts,
}: {
    content: Content;
    fonts: ReturnType<typeof useLocalizedFont>;
}) {
    if (Array.isArray(content)) {
        return (
            <ul className="space-y-3 list-disc pl-5">
                {content.map((item, index) => {
                    // If the item is an array (nested list), render it directly without an <li>
                    if (Array.isArray(item)) {
                        return (
                            <RenderContent
                                key={index}
                                content={item}
                                fonts={fonts}
                            />
                        );
                    }
                    // If the item is a string, wrap it in an <li>
                    return (
                        <li
                            key={index}
                            className={`${fonts.text} leading-relaxed text-gray-600 dark:text-gray-300 transition-all duration-300`}
                        >
                            <RenderContent content={item} fonts={fonts} />
                        </li>
                    );
                })}
            </ul>
        );
    }
    return (
        <span
            className={`${fonts.text} leading-relaxed text-gray-600 dark:text-gray-300 transition-all duration-300`}
        >
            {content}
        </span>
    );
}

// CollapsibleSection component
function CollapsibleSection({
    section,
    isOpen,
    onToggle,
    fonts,
}: {
    section: PrivacySection;
    isOpen: boolean;
    onToggle: () => void;
    fonts: ReturnType<typeof useLocalizedFont>;
}) {
    return (
        <div className="border-b border-gray-200 dark:border-gray-700">
            <button
                onClick={onToggle}
                className="w-full flex justify-between items-center py-6 px-4 transition-all duration-700 text-gray-600 dark:text-gray-300 hover:[text-shadow:0_0_20px_rgba(236,245,255,0.9)] hover:text-primary dark:hover:[text-shadow:0_0_20px_rgba(224,242,254,0.3)] dark:hover:text-sky-100"
            >
                <h3 className={`text-lg xl:text-xl ${fonts.text} text-left font-medium`}>
                    {section.title}
                </h3>
                <div
                    className={`transition-transform duration-500 transform ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                >
                    <ChevronDownIcon className="h-6 w-6" />
                </div>
            </button>
            <div
                className={`transition-all duration-700 ease-out overflow-hidden ${
                    isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <div
                    className={`px-6 pb-8 pl-8 pt-2 transition-all duration-700 transform ${
                        isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                    }`}
                >
                    <RenderContent content={section.content} fonts={fonts} />
                </div>
            </div>
        </div>
    );
}

// Main Privacy component
export default function Privacy() {
    const fonts = useLocalizedFont();
    const t = useTranslations('privacy');
    const messages = useMessages() as unknown as Messages;
    const [openSections, setOpenSections] = useState<string[]>([]);
    const toggleSection = (sectionId: string) => {
        setOpenSections((prev) =>
            prev.includes(sectionId)
                ? prev.filter((id) => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    // Define all section IDs
    const sectionIds = [
        'intro',
        'collection',
        'usage',
        'sharing',
        'retention',
        'compliance',
        'rights',
        'ai',
        'cookies',
        'changes',
        'contact',
    ];

    // Map sections to include title and content
    const sections: PrivacySection[] = sectionIds.map((id) => {
        const content = messages.privacy[id].content;
        return {
            id,
            title: t(`${id}.title`),
            content,
        };
    });

    return (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-900">
            <div className="container w-[80%] mx-auto">
                <div className="flex flex-col items-center justify-center space-y-8">
                    <h1
                        className={`text-4xl md:text-5xl text-primary dark:text-sky-100 ${fonts.heading} transition-colors duration-400 text-center`}
                    >
                        {t('title')}
                    </h1>
                    <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                        {sections.map((section) => (
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