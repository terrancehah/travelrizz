import { useState, useEffect } from 'react';
import Head from 'next/head';

/**
 * Monitoring Dashboard
 * Provides an intuitive interface to monitor Langfuse metrics and manage prompts
 * 
 * This is an embedded iframe dashboard that connects to your local Langfuse instance
 */

interface DashboardTab {
    id: string;
    name: string;
    url: string;
    description: string;
}

export default function MonitoringDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [langfuseHost, setLangfuseHost] = useState('https://cloud.langfuse.com');
    const [isConnected, setIsConnected] = useState(false);

    // Check if Langfuse is accessible
    useEffect(() => {
        const checkConnection = async () => {
            try {
                const response = await fetch(`${langfuseHost}/api/public/health`);
                setIsConnected(response.ok);
            } catch (error) {
                setIsConnected(false);
            }
        };

        checkConnection();
        const interval = setInterval(checkConnection, 30000); // Check every 30s

        return () => clearInterval(interval);
    }, [langfuseHost]);

    const dashboardTabs: DashboardTab[] = [
        {
            id: 'overview',
            name: 'Overview',
            url: `${langfuseHost}`,
            description: 'Main dashboard with key metrics',
        },
        {
            id: 'traces',
            name: 'Traces',
            url: `${langfuseHost}/traces`,
            description: 'View all conversation traces',
        },
        {
            id: 'prompts',
            name: 'Prompt Management',
            url: `${langfuseHost}/prompts`,
            description: 'Create and manage AI prompts',
        },
        {
            id: 'analytics',
            name: 'Analytics',
            url: `${langfuseHost}/analytics`,
            description: 'Cost and usage analytics',
        },
        {
            id: 'users',
            name: 'Users',
            url: `${langfuseHost}/users`,
            description: 'User activity and sessions',
        },
    ];

    const activeTabData = dashboardTabs.find(tab => tab.id === activeTab) || dashboardTabs[0];

    return (
        <>
            <Head>
                <title>Monitoring Dashboard - Travel-Rizz</title>
                <meta name="description" content="Monitor AI performance and manage prompts" />
            </Head>

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Monitoring Dashboard
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Track costs, monitor performance, and manage AI prompts
                                </p>
                            </div>

                            {/* Connection Status */}
                            <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {isConnected ? 'Connected' : 'Disconnected'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
                            {dashboardTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                                        ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                        }
                                    `}
                                >
                                    {tab.name}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {!isConnected ? (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                        Langfuse Not Set Up
                                    </h3>
                                    <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                                        <p>To enable monitoring:</p>
                                        <ol className="list-decimal list-inside mt-2 space-y-1">
                                            <li>Sign up at <a href="https://cloud.langfuse.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold">cloud.langfuse.com</a> (free)</li>
                                            <li>Create a project and get your API keys</li>
                                            <li>Add keys to your <code className="bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded">.env.local</code> file</li>
                                            <li>Restart your app</li>
                                        </ol>
                                        <p className="mt-2">See <code className="bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded">MONITORING_SETUP.md</code> for details.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            {/* Tab Description */}
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {activeTabData.name}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {activeTabData.description}
                                </p>
                            </div>

                            {/* Embedded Langfuse Dashboard */}
                            <div className="relative" style={{ height: 'calc(100vh - 300px)' }}>
                                <iframe
                                    src={activeTabData.url}
                                    className="w-full h-full border-0"
                                    title={`Langfuse ${activeTabData.name}`}
                                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                                />
                            </div>
                        </div>
                    )}

                    {/* Quick Stats (when connected) */}
                    {isConnected && (
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Quick Actions</h3>
                                <div className="mt-4 space-y-2">
                                    <a
                                        href={`${langfuseHost}/prompts/new`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Create New Prompt
                                    </a>
                                    <a
                                        href={`${langfuseHost}/traces`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full text-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        View All Traces
                                    </a>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Documentation</h3>
                                <ul className="mt-4 space-y-2 text-sm">
                                    <li>
                                        <a href="/MONITORING_SETUP.md" className="text-blue-600 dark:text-blue-400 hover:underline">
                                            Setup Guide
                                        </a>
                                    </li>
                                    <li>
                                        <a href="https://langfuse.com/docs" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                                            Langfuse Docs
                                        </a>
                                    </li>
                                    <li>
                                        <a href="https://cloud.langfuse.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                                            Cloud Dashboard
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tips</h3>
                                <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                    <li>• Filter traces by stage: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">tags contains "stage-3"</code></li>
                                    <li>• Find expensive calls: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">cost &gt; 0.01</code></li>
                                    <li>• Track errors: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">level = ERROR</code></li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
