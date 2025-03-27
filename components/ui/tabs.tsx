import * as React from "react";

interface TabsProps {
    defaultValue: string;
    className?: string;
    children: React.ReactNode;
}

interface TabsContextType {
    activeTab: string;
    setActiveTab: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType | null>(null);

export const Tabs = ({ defaultValue, className, children }: TabsProps) => {
    const [activeTab, setActiveTab] = React.useState(defaultValue);
    
    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
        <div className={className}>{children}</div>
        </TabsContext.Provider>
    );
};

export const TabsList = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return <div className={className}>{children}</div>;
};

interface TabsTriggerProps {
    value: string;
    className?: string;
    children: React.ReactNode;
}

export const TabsTrigger = ({ value, className, children }: TabsTriggerProps) => {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error("TabsTrigger must be used within a Tabs component");
    
    const { activeTab, setActiveTab } = context;
    
    return (
        <button
        onClick={() => setActiveTab(value)}
        className={className}
        data-state={activeTab === value ? "active" : "inactive"}
        >
        {children}
        </button>
    );
};

interface TabsContentProps {
    value: string;
    className?: string;
    children: React.ReactNode;
}

export const TabsContent = ({ value, className, children }: TabsContentProps) => {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error("TabsContent must be used within a Tabs component");
    
    const { activeTab } = context;
    
    return activeTab === value ? <div className={className}>{children}</div> : null;
};