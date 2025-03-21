import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'
import FeatureCarousel from '../ui/feature-carousel'
import { useTheme } from 'next-themes'
import { useTranslations } from 'next-intl'

import { 
    setPaymentStatus, 
    setPaymentReference,
    getPaymentReference,
    clearPaymentReference,
} from '@/managers/session-manager'

// Declare the custom element for TypeScript
declare global {
    namespace JSX {
        interface IntrinsicElements {
            'stripe-buy-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                'buy-button-id': string;
                'publishable-key': string;
                'client-reference-id': string;
            }
        }
    }
}

interface PremiumUpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPaymentSuccess: () => void;
}

export default function PremiumUpgradeModal({ isOpen, onClose, onPaymentSuccess }: PremiumUpgradeModalProps) {
    const [isMobile, setIsMobile] = useState(false)
    const [isPolling, setIsPolling] = useState(false)
    const stripeContainerRef = useRef<HTMLDivElement>(null)
    const clientReferenceId = useRef<string>()
    const pollInterval = useRef<NodeJS.Timeout>()
    const { theme } = useTheme()
    const tComp = useTranslations('components')
    
    // Generate client reference ID on mount
    useEffect(() => {
        if (!clientReferenceId.current) {
            // Check if we have a stored reference ID first
            const storedRefId = getPaymentReference();
            if (storedRefId) {
                clientReferenceId.current = storedRefId;
            } else {
                // Generate a new one ONLY if we don't have one
                clientReferenceId.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                // Store the new reference ID
                setPaymentReference(clientReferenceId.current);
            }
            console.log('[Payment] Using client reference ID:', clientReferenceId.current);
        }
    }, [])
    
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])
    
    useEffect(() => {
        if (!isOpen || !stripeContainerRef.current) return
        
        // Clean up any existing button
        stripeContainerRef.current.innerHTML = ''
        
        // Get the reference ID from our ref (NOT from storage again)
        const refId = clientReferenceId.current;
        if (!refId) {
            console.error('[Payment] No payment reference found in ref');
            return;
        }
        
        console.log('[Payment] Setting up button with reference ID:', refId);
        
        // test buy-button
        const buttonHtml = `
        <stripe-buy-button
            buy-button-id="${theme === 'dark' ? 'buy_btn_1QvFHUI41yHwVfoxAdnHirxn' : 'buy_btn_1QvFE0I41yHwVfoxoa2fvTlL'}"
            publishable-key="pk_test_51MtLXgI41yHwVfoxNp7MKLfz0Gh4qo2LwImaCBtCt0Gn48e613BLsbOajpHT1uJOs2l0ACRpUE3RZrh8FcLxdwef00QOtxcHmf"
            client-reference-id="${refId}"
        >
        </stripe-buy-button>
    `;
        
        // production buy-button
        // const buttonHtml = `
        // <stripe-buy-button
        //   buy-button-id="buy_btn_1QbgllI41yHwVfoxHUfAJEEx"
        //   publishable-key="pk_live_51MtLXgI41yHwVfoxoenCC4Y3iWAv4dwTMPFtBsuAWnJItf6KjcLgtClHE281ixQp5j7tQdmHt9JCtyVSvGaVOI4N00AXx9Bg3a"
        // >
        // </stripe-buy-button>
        // `;
        
        stripeContainerRef.current.innerHTML = buttonHtml;
        
        // Load Stripe script dynamically
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/buy-button.js';
        script.async = true;
        document.head.appendChild(script);
        
        // Add custom styles
        const style = document.createElement('style')
        style.textContent = `
      stripe-buy-button {
        display: flex !important;
        justify-content: center !important;
        width: 40% !important;
        margin: 0 auto !important;
      }
      stripe-buy-button > * {
        border: 2px solid #e2e8f0 !important;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
        border-radius: 0.5rem !important;
        width: 100% !important;
      }
      stripe-buy-button button {
        width: 100% !important;
      }
        
      /* Dark mode styles */
      @media (prefers-color-scheme: dark) {
        stripe-buy-button > * {
          border-color: #374151 !important; /* gray-700 */
          background-color: #1f2937 !important; /* gray-800 */
          color: #f3f4f6 !important; /* gray-100 */
        }
        stripe-buy-button button {
          background-color: #1f2937 !important; /* gray-800 */
          color: #f3f4f6 !important; /* gray-100 */
        }
        stripe-buy-button button:hover {
          background-color: #374151 !important; /* gray-700 */
        }
      }
        
      /* For class-based dark mode */
      .dark stripe-buy-button > * {
        border-color: #374151 !important; /* gray-700 */
        background-color: #1f2937 !important; /* gray-800 */
        color: #f3f4f6 !important; /* gray-100 */
      }
      .dark stripe-buy-button button {
        background-color: #1f2937 !important; /* gray-800 */
        color: #f3f4f6 !important; /* gray-100 */
      }
      .dark stripe-buy-button button:hover {
        background-color: #374151 !important; /* gray-700 */
      }
    `
        document.head.appendChild(style)
        
        return () => {
            // Clean up styles
            document.head.removeChild(style)
        }
    }, [isOpen])
    
    // Start polling when modal opens and Stripe script is loaded
    useEffect(() => {
        if (!isOpen) return;
        
        // Wait for Stripe script to load
        const waitForStripe = setInterval(() => {
            const stripeButton = document.querySelector('stripe-buy-button');
            if (stripeButton) {
                console.log('[Payment Modal] Stripe button loaded, starting polling...');
                setIsPolling(true);
                clearInterval(waitForStripe);
            }
        }, 500);
        
        return () => {
            clearInterval(waitForStripe);
        };
    }, [isOpen]);
    
    // Payment polling effect
    useEffect(() => {
        const pollPaymentStatus = async () => {
            const pollInstanceId = Math.random().toString(36).substring(7);
            console.log(`[Payment Modal][${pollInstanceId}] Starting poll instance`);
            
            const refId = clientReferenceId.current;
            if (!refId) {
                console.log(`[Payment Modal][${pollInstanceId}] No reference ID found, stopping poll`);
                setIsPolling(false);
                return false;
            }
            
            console.log(`[Payment Modal][${pollInstanceId}] Checking webhook verification for:`, refId);
            try {
                const response = await fetch(`${window.location.origin}/api/stripe/verify`, {  
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json'},
                    body: JSON.stringify({ clientReferenceId: refId })
                });
                
                if (!response.ok) {
                    console.log(`[Payment Modal][${pollInstanceId}] Verify request failed:`, response.status);
                    return false;
                }
                
                const data = await response.json();
                console.log(`[Payment Modal][${pollInstanceId}] Verification response:`, data);
                
                // Check if webhook has verified the payment
                if (data.isPaid && data.verifiedAt) {
                    console.log(`[Payment Modal][${pollInstanceId}] Payment verified by webhook for:`, refId);
                    
                    // Update states and trigger success popup
                    setPaymentStatus(true);
                    console.log(`[Payment Modal][${pollInstanceId}] Payment status updated to true for:`, refId);
                    onPaymentSuccess();
                    clearPaymentReference();
                    console.log(`[Payment Modal][${pollInstanceId}] Payment reference cleared for:`, refId);
                    setIsPolling(false);
                    console.log(`[Payment Modal][${pollInstanceId}] Polling stopped for:`, refId);
                    (window as any).setShowPaymentSuccess(true);
                    console.log(`[Payment Modal][${pollInstanceId}] Payment success popup opened for:`, refId);
                    // (window as any).setCurrentStage(4);
                    console.log(`[Payment Modal][${pollInstanceId}] Stage advanced to 4 for:`, refId);
                    onClose();
                    
                    return true;
                }
                
                console.log(`[Payment Modal][${pollInstanceId}] Payment pending webhook verification, continuing to poll`);
                return false;
            } catch (error) {
                console.error(`[Payment Modal][${pollInstanceId}] Error polling payment status:`, error);
                return false;
            }
        };
        
        if (!isOpen || !isPolling) return;
        
        console.log('[Payment Modal] Starting polling interval');
        pollInterval.current = setInterval(async () => {
            console.log('[Payment Modal] Polling iteration starting');
            const success = await pollPaymentStatus();
            if (success) {
                console.log('[Payment Modal] Polling succeeded, cleaning up');
                if (pollInterval.current) {
                    clearInterval(pollInterval.current);
                    pollInterval.current = undefined;
                }
            }
        }, 2000);
        
        return () => {
            if (pollInterval.current) {
                clearInterval(pollInterval.current);
                pollInterval.current = undefined;
            }
        };
    }, [isPolling, isOpen, onPaymentSuccess]);
    
    return (
        <>
        {isOpen ? (
            isMobile ? (
                
                // Mobile view
                <div className="fixed inset-0 bg-white/85 dark:bg-gray-900/85 backdrop-blur-sm z-[60]">
                <div className="flex flex-col min-h-screen w-full">
                <button
                onClick={onClose}
                className="absolute top-6 right-6 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white bg-slate-300 dark:bg-gray-700 hover:bg-slate-400 dark:hover:bg-gray-600 p-1.5 rounded-2xl transition-colors"
                aria-label="Close modal"
                >
                <X className="w-4 h-4" />
                </button>
                
                <div className="flex-1 flex flex-col items-center font justify-center w-full px-4 py-4">
                <div className="text-center">
                <h2 className="w-[70%] mx-auto text-lg font-bold text-primary dark:text-white mb-2">{tComp('premiumUpgrade.heading')}</h2>
                <div className="flex flex-wrap items-center justify-center gap-2 text-xl">
                <span className="font-bold text-xl text-center order-1 basis-1/5 xl:basis-[15%] text-primary dark:text-white">{tComp('premiumUpgrade.newPrice')}</span>
                <span className="text-gray-400 dark:text-gray-500 text-center text-xl order-1 basis-1/5 xl:basis-[15%] line-through decoration-2">{tComp('premiumUpgrade.originalPrice')}</span>
                <span className="bg-blue-200 dark:bg-blue-900 text-blue-500 dark:text-blue-200 text-sm font-medium px-2.5 py-1 order-2 basis-[35%] xl:basis-1/5 rounded">{tComp('premiumUpgrade.tag')}</span>
                </div>
                </div>
                
                <div className="py-2 mt-0">
                <FeatureCarousel />
                </div>
                
                <div className="w-min h-min bg-white dark:bg-gray-800 mx-auto rounded-2xl p-1 shadow-lg border border-gray-100 dark:border-gray-700">
                <div ref={stripeContainerRef} className="flex justify-center"></div>
                </div>
                </div>
                </div>
                </div>
            ) : (
                
                // Desktop view
                <div className="absolute inset-0 bottom-[64px] bg-white/85 dark:bg-gray-900/85 backdrop-blur-sm z-[60]">
                <div className="h-full w-full overflow-hidden">
                <div className="flex h-full m-auto font-raleway py-4 px-2">
                <button
                onClick={onClose}
                className="absolute top-6 right-6 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white bg-slate-300 dark:bg-gray-700 hover:bg-slate-400 dark:hover:bg-gray-600 p-1.5 rounded-2xl transition-colors"
                aria-label="Close modal"
                >
                <X className="w-4 h-4" />
                </button>
                
                <div className="flex flex-col items-center justify-center space-y-2 my-auto w-full h-full">
                <div className="flex flex-col text-center gap-y-2">
                <h2 className="w-[70%] mx-auto text-base lg:text-lg font-bold text-primary dark:text-white mb-2">{tComp('premiumUpgrade.heading')}</h2>
                <div className="flex flex-wrap items-center justify-center gap-1 text-xl">
                <span className="font-bold text-lg md:text-xl lg:text-2xl text-center order-1 basis-1/5 xl:basis-[15%] text-primary dark:text-white">{tComp('premiumUpgrade.newPrice')}</span>
                <span className="text-gray-400 dark:text-gray-500 text-center text-lg md:text-xl lg:text-2xl order-1 basis-1/5 xl:basis-[15%] line-through decoration-2">{tComp('premiumUpgrade.originalPrice')}</span>
                <span className="bg-blue-200 dark:bg-blue-900 text-blue-500 dark:text-blue-200 text-sm xl:text-base font-medium px-2.5 py-1 order-2 basis-[30%] xl:basis-1/5 rounded">{tComp('premiumUpgrade.tag')}</span>
                </div>
                </div>
                
                <div className="py-2 mt-0">
                <FeatureCarousel />
                </div>
                
                <div className="w-min h-min bg-white dark:bg-gray-800 mx-auto rounded-2xl p-1 shadow-lg border border-gray-100 dark:border-gray-700">
                <div ref={stripeContainerRef} className="flex justify-center"></div>
                </div>
                </div>
                </div>
                </div>
                </div>
            )
        ) : null}
        </>
    )
}
