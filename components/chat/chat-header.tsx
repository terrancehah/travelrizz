import { ChevronDownIcon, ChevronUpIcon, CalendarDays, Languages, WandSparkles, CircleDollarSign } from 'lucide-react';

interface ChatHeaderProps {
  currentDetails: {
    destination: string;
    startDate: string;
    endDate: string;
    language: string;
    preferences?: string[];
    budget?: string;
  };
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export const ChatHeader = ({ currentDetails, isCollapsed, setIsCollapsed }: ChatHeaderProps) => (
  <div className="bg-background border-b border-border shadow-sm transition-all duration-300 ease-in-out">
    <div className="mx-auto p-2 px-6 relative">
      <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'max-h-12' : 'max-h-[500px]'}`}>
        <h1 className={`font-semibold text-foreground ${isCollapsed ? 'text-2xl font-caveat text-primary mb-0' : 'text-2xl font-caveat text-primary mb-2'}`}>
          Trip to {currentDetails.destination}
        </h1>

        {!isCollapsed && (
          <div className="grid grid-cols-2 gap-x-16 gap-y-4">
            {/* Date */}
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <CalendarDays className="h-5 w-5" />
                Date
              </div>
              <div className="text-foreground text-sm">{currentDetails.startDate} to {currentDetails.endDate}</div>
            </div>

            {/* Language */}
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Languages className="h-5 w-5" />
                Language
              </div>
              <div className="text-foreground text-sm">{currentDetails.language}</div>
            </div>

            {/* Preferences */}
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <WandSparkles className="h-5 w-5" />
                Preferences
              </div>
              <div className="text-foreground text-sm">
                {currentDetails.preferences?.join(', ') || '-'}
              </div>
            </div>

            {/* Budget */}
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <CircleDollarSign className="h-5 w-5" />
                Budget
              </div>
              <div className="text-foreground text-sm">
                {currentDetails.budget || '-'}
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 px-2 py-0.5 mb-2 text-gray-500 hover:text-black hover:bg-slate-200 transition-colors bg-slate-50 rounded-full duration-200 focus:outline-none"
        aria-label={isCollapsed ? 'Expand header' : 'Collapse header'}
      >
        {isCollapsed ? <ChevronDownIcon className="h-6 w-6" /> : <ChevronUpIcon className="h-6 w-6" />}
      </button>
    </div>
  </div>
);
