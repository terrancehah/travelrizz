// import { NextApiRequest, NextApiResponse } from 'next';
// import Stripe from 'stripe';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//     apiVersion: '2025-01-27.acacia',
//     // apiVersion: '2023-08-16', //test api
    
// });

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     if (req.method !== 'POST') {
//         return res.status(405).json({ error: 'Method not allowed' });
//     }
    
//     try {
//         const { clientReferenceId } = req.body;
        
//         // Create Checkout Session with proper success URL
//         const session = await stripe.checkout.sessions.create({
//             payment_method_types: ['card'],
//             line_items: [
//                 {
//                     price_data: {
//                         currency: 'usd',
//                         product_data: {
//                             name: 'Premium Travel Planning',
//                             description: 'Unlimited access to AI-powered travel planning',
//                         },
//                         unit_amount: 199, // $1.99 in cents
//                     },
//                     quantity: 1,
//                 },
//             ],
//             mode: 'payment',
//             success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
//             cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
//             client_reference_id: clientReferenceId,
//         });
        
//         res.status(200).json({ sessionId: session.id });
//     } catch (error) {
//         console.error('Error creating checkout session:', error);
//         res.status(500).json({ error: `Error creating checkout session: ${(error as Error).message}` });
//     }
// }
