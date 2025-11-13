// RegisterPage.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DynamicEventForm from '@/components/form/DynamicEventForm';
import supabase from '@/api/client';
import { Loader2, DollarSign, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import Script from 'next/script'; 
import { DynamicFormData } from '@/lib/types/event'; 
import { sendRegistrationEmail } from '@/lib/email';

// --- UPDATED IMPORTS ---
import { preRegisterUser, finalizeRegistrationStatus } from '@/lib/dynamicForm'; 

declare global {
  interface Window {
    Razorpay: any;
  }
}

// --- Type Definition ---
interface Event {
  id: string;
  title: string;
  description: string;
  ticket_price: number | null;
}

const RegisterPage = () => {
  const params = useParams();
  const router = useRouter();

  const eventId = Array.isArray(params.id) ? params.id[0] : (params.id as string | undefined);

  const [userId, setUserId] = useState<string | null>(null);
  const [eventData, setEventData] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'success' | 'payment_required' | 'error' | 'submitting_data'>('idle');

  const [razorpayOrderId, setRazorpayOrderId] = useState<string | null>(null); 
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false); 

  const [ticketUid, setTicketUid] = useState<string | null>(null); 
  const [preRegTicketUid, setPreRegTicketUid] = useState<string | null>(null); 

  const formDataRef = useRef<DynamicFormData>({}); 

  // --- Fetch Event Data ---
  const fetchData = useCallback(async (id: string) => {
    setLoading(true);
    setFetchError(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUserId(session.user.id);
    } else {
      router.push(`/login?redirect=/events/${id}/register`);
      return;
    }

    const { data, error } = await supabase
      .from('events')
      .select('id, title, description, ticket_price') 
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error fetching event for registration:', error || 'No data');
      setFetchError(error?.message || 'Event not found.');
    } else {
      setEventData(data as Event);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    if (eventId) fetchData(eventId);
    else setLoading(false);
  }, [eventId, fetchData]);


  // --- Finalize Registration (updates DB) ---
  const finalizeRegistration = async (ticketUidToUse: string, paymentResponse: any) => {
    if (!eventId || !userId || !eventData || !ticketUidToUse) {
      console.error("Finalization failed: Missing event, user, or pre-registration UID.");
      setFetchError("Internal error during final registration.");
      setRegistrationStatus('error');
      return;
    }

    setTicketUid(ticketUidToUse);
    setRegistrationStatus('submitting_data');

    try {
      await finalizeRegistrationStatus(eventId, userId, ticketUidToUse, paymentResponse);
      setRegistrationStatus('success');
    } catch (error: any) {
      console.error('Final registration update failed:', error);
      setFetchError('Payment succeeded, but final registration update failed. Please contact support with your Payment ID: ' + paymentResponse?.razorpay_payment_id);
      setRegistrationStatus('error');
    }
  };

  const handlePaymentSuccess = (response: any) => {
    if (!preRegTicketUid) {
      console.error('Missing ticket UID on payment success.');
      setFetchError('Internal error during registration. Ticket UID not found.');
      setRegistrationStatus('error');
      return;
    }
    finalizeRegistration(preRegTicketUid, response);
  };

  // --- Razorpay Payment Initiator ---
  const handleProceedToPayment = useCallback(() => {
    if (!razorpayOrderId || !eventData || !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      console.error("Payment initiation failed: Missing Order ID or Key.");
      setFetchError("Payment data is incomplete.");
      setRegistrationStatus('error');
      return;
    }

    setIsPaymentProcessing(true);
    const ticketPrice = eventData.ticket_price ?? 0;

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount: ticketPrice * 100,
      currency: "INR",
      name: eventData.title,
      description: `Registration for ${eventData.title}`,
      order_id: razorpayOrderId,
      handler: function (response: any) {
        handlePaymentSuccess(response);
        setIsPaymentProcessing(false);
      },
      modal: {
        ondismiss: () => {
          setIsPaymentProcessing(false);
          console.log('Payment modal closed');
        }
      },
      prefill: {
        name: formDataRef.current.Name || "Registered User",
        email: formDataRef.current.Email || "user@example.com",
        contact: formDataRef.current.Phone || "9999999999",
      },
      theme: { color: "#4F46E5" },
    };

    if (typeof window.Razorpay !== 'undefined') {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      console.error("Razorpay SDK not loaded.");
      setIsPaymentProcessing(false);
      setFetchError("Payment gateway is not ready. Please try again.");
    }
  }, [razorpayOrderId, eventData, handlePaymentSuccess]);

  useEffect(() => {
    if (registrationStatus === 'payment_required' && razorpayOrderId && !isPaymentProcessing) {
      const timer = setTimeout(() => handleProceedToPayment(), 500);
      return () => clearTimeout(timer);
    }
  }, [registrationStatus, razorpayOrderId, isPaymentProcessing, handleProceedToPayment]);

  // --- Initial Form Submission ---
  const handleInitialSubmission = async (formData: DynamicFormData) => {
    if (!eventData || !eventId || !userId) return;

    formDataRef.current = formData;

    const ticketPrice = eventData.ticket_price ?? 0;
    const initialStatus = ticketPrice > 0 ? 'pending' : 'free';

    setLoading(true);
    setFetchError(null);

    try {
      const { ticketUid, isRegistered, existingStatus } = await preRegisterUser(
        eventId,
        userId,
        formData,
        initialStatus
      );

      setPreRegTicketUid(ticketUid);

      if (isRegistered) {
        setLoading(false);
        if (existingStatus === 'paid' || existingStatus === 'free') {
          setTicketUid(ticketUid);
          setFetchError(`You are already registered! Ticket ID: ${ticketUid}`);
          setRegistrationStatus('success');
          return;
        } else if (existingStatus === 'pending' && ticketPrice > 0) {
          console.log('Pending registration found. Proceeding to payment.');
        } else {
          setFetchError('You are already registered, but with unknown status. Contact support.');
          setRegistrationStatus('error');
          return;
        }
      }

      if (ticketPrice > 0) {
        // Paid event: create Razorpay order
        const response = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: ticketPrice * 100 }),
        });
        const data = await response.json();
        if (!response.ok || data.error) throw new Error(data.error || "Failed to create order.");
        setRazorpayOrderId(data.orderId);
        setRegistrationStatus('payment_required');
      } else {
        // Free event: finalize immediately
        console.log('Free Event - Finalizing registration...');
        if (!ticketUid) throw new Error('Ticket UID missing for free event.');
        await finalizeRegistration(ticketUid, { razorpay_payment_id: 'FREE_EVENT', razorpay_order_id: 'NA' });
      }
    } catch (error: any) {
      console.error("Submission Error:", error);
      setFetchError(error.message || "Unknown error during registration.");
      setRegistrationStatus('error');
    } finally {
      if (registrationStatus !== 'payment_required') setLoading(false);
    }
  };

  // --- Render ---
  if (loading || isPaymentProcessing || registrationStatus === 'submitting_data') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-green-500 mr-2" />
        <p className="text-white">
          {registrationStatus === 'submitting_data'
            ? 'Finalizing registration...'
            : isPaymentProcessing ? 'Initializing Payment Gateway...' : 'Loading event...'}
        </p>
      </div>
    );
  }

  if (!eventId || !userId || fetchError || !eventData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900">
        <AlertTriangle className="w-6 h-6 text-red-400 mr-2" />
        <p className="text-red-400 mt-2">
          Error: {fetchError || (!eventId ? 'Event ID missing.' : !userId ? 'Authentication required.' : 'Event data not found.')}
        </p>
      </div>
    );
  }

  const ticketPrice = eventData.ticket_price ?? 0;
  const isFree = ticketPrice === 0;

  if (registrationStatus === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900">
        <div className="max-w-md w-full bg-gray-800/90 border border-gray-700 p-8 rounded-xl shadow-2xl text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            {fetchError?.includes('already registered') ? 'Already Registered!' : 'Registration Complete!'}
          </h2>
          <p className="text-gray-300 mb-4">
            {fetchError?.includes('already registered') 
              ? 'Your registration was previously confirmed.'
              : `You are now registered for **${eventData.title}**. Save your Ticket ID.`}
          </p>
          {ticketUid && (
            <div className="mt-4 p-4 border border-gray-700 rounded-lg bg-gray-800 flex flex-col items-center">
              <h3 className="font-bold text-lg mb-2 text-green-400">Your E-Ticket QR</h3>
              <div className='w-24 h-24 bg-white flex items-center justify-center text-gray-800 font-bold rounded-md'></div>
              <p className="mt-4 text-sm text-gray-300 break-all">Ticket ID: **{ticketUid.substring(0, 8)}...**</p>
            </div>
          )}
          <button
            onClick={() => router.push(`/event-page`)}
            className="mt-6 py-2 px-4 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition duration-200 flex items-center justify-center mx-auto"
          >
            View Event Details <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    );
  }

  if (registrationStatus === 'payment_required') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900">
        <div className="max-w-md w-full bg-gray-800/90 border border-gray-700 p-8 rounded-xl shadow-2xl text-center">
          <DollarSign className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Payment Required</h2>
          <p className="text-gray-300 mb-4">
            Your registration is **reserved** (Ticket ID: {preRegTicketUid?.substring(0, 8)}...). Complete payment for: **₹{ticketPrice.toFixed(2)}**.
          </p>
          <p className='text-sm text-yellow-300 mb-4 font-semibold'>
            The payment window should open automatically.
          </p>
          {razorpayOrderId && (
            <button
              onClick={handleProceedToPayment} 
              disabled={isPaymentProcessing}
              className="w-full py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition duration-200 flex items-center justify-center disabled:bg-green-400"
            >
              {isPaymentProcessing ? (
                <> <Loader2 className="w-5 h-5 animate-spin mr-2" /> Initializing...</>
              ) : (
                <>Pay Now: ₹{ticketPrice.toFixed(2)} <ArrowRight className="w-5 h-5 ml-2" /></>
              )}
            </button>
          )}
          {!razorpayOrderId && <p className='text-red-400 mt-4'>Error: Failed to get Razorpay Order ID. Please refresh.</p>}
        </div>
      </div>
    );
  }

  // --- Main Form Render ---
  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-gray-900 pt-20">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="w-full max-w-2xl bg-gray-800/90 border border-gray-700 p-8 rounded-xl shadow-2xl">
        <h1 className="text-3xl md:text-4xl font-bold lowercase text-white mb-6 border-b border-gray-700 pb-3">
          Register for: {eventData.title}
        </h1>

        <div className={`p-4 mb-6 rounded-lg flex items-center ${isFree ? 'bg-green-900/50 border border-green-600 text-green-400' : 'bg-yellow-900/50 border border-yellow-600 text-yellow-400'}`}>
          {isFree ? <CheckCircle className="w-5 h-5 mr-3" /> : <DollarSign className="w-5 h-5 mr-3" />}
          <p className="font-semibold">{isFree ? 'This is a **FREE** event.' : `Ticket Price: **₹${ticketPrice.toFixed(2)}**`}</p>
        </div>

        <p className="text-gray-300 mb-6">{eventData.description}</p>

        <DynamicEventForm 
          eventId={eventId} 
          userId={userId} 
          onFormSubmit={handleInitialSubmission} 
          ticketPrice={ticketPrice} 
        />
      </div>
    </div>
  );
};

export default RegisterPage;
