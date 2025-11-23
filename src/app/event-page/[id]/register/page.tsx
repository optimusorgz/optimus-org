// RegisterPage.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DynamicEventForm from '@/components/form/DynamicEventForm';
import supabase from '@/api/client';
import { Loader2, DollarSign, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import Script from 'next/script';
import { DynamicFormData } from '@/lib/types/event';
import { preRegisterUser, finalizeRegistrationStatus } from '@/lib/dynamicForm';
import { DynamicPreRegResult } from '@/lib/types/event';

declare global {
  interface Window {
    Razorpay: any;
  }
}

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

  const [userId, setUserId] = useState<string | null >(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [eventData, setEventData] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'success' | 'payment_required' | 'error' | 'submitting_data'>('idle');

  const [razorpayOrderId, setRazorpayOrderId] = useState<string | null>(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const [ticketUid, setTicketUid] = useState<string | null>(null);
  const [preRegTicketUid, setPreRegTicketUid] = useState<string | null>(null);

  const formDataRef = useRef<DynamicFormData>({});
  const [prefilledFormData, setPrefilledFormData] = useState<DynamicFormData | null>(null);

  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  // --- Fetch Event and User Data ---
  const fetchData = useCallback(async (id: string) => {
    setLoading(true);
    setFetchError(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push(`/login?redirect=/events/${id}/register`);
      return;
    }

    const currentUserId = session.user.id ?? null;
    const userEmailFromSession = session.user.email ?? null;

    if (!currentUserId) {
      console.error('User ID missing from active session.');
      setFetchError('Authentication error: User ID not found.');
      setLoading(false);
      return;
    }

    setUserId(currentUserId);
    setUserEmail(userEmailFromSession);

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('phone_number')
      .eq('id', currentUserId)
      .single();

    if (profileData && profileData.phone_number) setUserPhone(profileData.phone_number);
    else if (profileError && profileError.code !== 'PGRST116') console.warn('Could not fetch user phone number:', profileError.message);

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
      setPaymentAmount(data.ticket_price ?? 0);
    }

    if (currentUserId) {
      const existingFormData = await fetchPendingFormData(id, currentUserId);
      if (existingFormData) {
        setPrefilledFormData(existingFormData);
        console.log('Found existing pending form data for pre-fill.');
      }
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    if (eventId) fetchData(eventId);
    else setLoading(false);
  }, [eventId, fetchData]);

  const fetchPendingFormData = async (eventId: string, userId: string): Promise<DynamicFormData | null> => {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('form_data')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching pending form data:', error.message);
      return null;
    }

    return data?.form_data as DynamicFormData ?? null;
  };

  // --- Finalize Registration ---
  const finalizeRegistration = async (ticketUidToUse: string | null, paymentResponse: any) => {
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
    setRegistrationStatus("error");
    return;
  }

  setIsPaymentProcessing(true);

  if (isNaN(paymentAmount) || paymentAmount < 0) {
    setFetchError("Invalid ticket price selected.");
    setIsPaymentProcessing(false);
    return;
  }

  const prefillName = formDataRef.current.Name || "Registered User";
  const prefillEmail = formDataRef.current.Email || userEmail || "user@example.com";
  const prefillContact = formDataRef.current.Phone || userPhone || "9999999999";

  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    amount: paymentAmount * 100, // ✅ Ensure Razorpay gets the correct amount
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
        setRegistrationStatus("idle");
        setRazorpayOrderId(null);
        console.log("Payment modal closed, status reset to idle.");
      },
    },
    prefill: {
      name: prefillName,
      email: prefillEmail,
      contact: prefillContact,
    },
    theme: { color: "#4F46E5" },
  };

  if (typeof window.Razorpay !== "undefined") {
    const rzp = new window.Razorpay(options);
    rzp.open();
  } else {
    console.error("Razorpay SDK not loaded.");
    setIsPaymentProcessing(false);
    setFetchError("Payment gateway is not ready. Please try again.");
  }
}, [razorpayOrderId, eventData, userEmail, userPhone, paymentAmount]);


  // --- Initial Form Submission ---
  const handleInitialSubmission = async (formData: DynamicFormData) => {
  if (!eventData || !eventId || !userId) return;

  formDataRef.current = formData;

  // --- Determine payment method and amount ---
  let amountToPay = 0;
  let paymentMethod: string | null | string[] | number;
  
  
  if (formData.ticketPrice) {
    paymentMethod = "online";
    amountToPay = Number(formData.ticketPrice ?? 0);
  }else if (eventData.ticket_price && eventData.ticket_price > 0) {
    amountToPay = Number(eventData.ticket_price);
    paymentMethod = amountToPay === 0 ? "free" : "online";
  } else {
    paymentMethod = "free";
    amountToPay = 0;
  }

  setPaymentAmount(amountToPay);
  console.log("User Selected Price:", formData.ticketPrice);
  console.log("Amount To Pay:", amountToPay);


  // --- Handle pay_later ---
  if (paymentMethod === "pay_later") {
    const preRegResult = await preRegisterUser(eventId, userId, formData , "pending");
    setRegistrationStatus("success");
    setTicketUid(preRegResult.ticketUid);
    return;
  }

  // --- Handle free event ---
  if (paymentMethod === "free" || amountToPay === 0) {
    const preRegResult = await preRegisterUser(eventId, userId, formData, "free");
    await finalizeRegistration(preRegResult.ticketUid!, { razorpay_payment_id: "FREE" });
    return;
  }

  // --- Online payment ---
  const initialStatus = amountToPay > 0 ? "pending" : "free";
  setLoading(true);
  setFetchError(null);

  try {
    const preRegResult: DynamicPreRegResult = await preRegisterUser(eventId, userId, formData, initialStatus);
    const { ticketUid, isRegistered, existingStatus, existingOrderId } = preRegResult;
    setPreRegTicketUid(ticketUid);

    if (isRegistered) {
      setLoading(false);
      if (existingStatus === "paid" || existingStatus === "free") {
        setTicketUid(ticketUid);
        setFetchError(`You are already registered! Ticket ID: ${ticketUid}`);
        setRegistrationStatus("success");
        return;
      } else if (existingStatus === "pending" && amountToPay > 0) {
        if (existingOrderId) {
          setRazorpayOrderId(existingOrderId);
          setRegistrationStatus("payment_required");
          setLoading(false);
          return;
        }
      } else {
        setFetchError("You are already registered, but with unknown status. Contact support.");
        setRegistrationStatus("error");
        return;
      }
    }

    if (amountToPay > 0) {
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountToPay * 100, ticketUid }),
      });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || "Failed to create order.");

      setRazorpayOrderId(data.orderId);
      setRegistrationStatus("payment_required");
    } else {
      await finalizeRegistration(ticketUid, { razorpay_payment_id: "FREE_EVENT", razorpay_order_id: "NA" });
    }
  } catch (error: any) {
    console.error("Submission Error:", error);
    setFetchError(error.message || "Unknown error during registration.");
    setRegistrationStatus("error");
  } finally {
    if (registrationStatus !== "payment_required") setLoading(false);
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

  const isFree = (formDataRef.current.ticketPrice ?? paymentAmount) === 0;

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
            <div className="mt-6 p-6 border border-gray-700 rounded-xl bg-gray-800 flex flex-col items-center text-center shadow-lg">
              <svg className="w-16 h-16 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="text-2xl font-bold text-white mb-2">Registration Successful!</h3>
              <p className="text-gray-300 text-sm">
                Your E-ticket has been generated. You can view and download it from your <span className="text-green-400 font-semibold">Dashboard</span>.
              </p>
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

const displayPrice = Number(formDataRef.current.ticketPrice ?? paymentAmount);

  if (registrationStatus === 'payment_required') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900">
        <div className="max-w-md w-full bg-gray-800/90 border border-gray-700 p-8 rounded-xl shadow-2xl text-center">
          <DollarSign className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Payment Required</h2>
          <p className="text-gray-300 mb-4">
            You selected <b>{formDataRef.current.payment}</b><br />
            Amount to pay: <b>₹{paymentAmount.toFixed(2)}</b>
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
                <>Pay Now: ₹{displayPrice.toFixed(2)} <ArrowRight className="w-5 h-5 ml-2" /></>
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
      {(registrationStatus === 'idle' || registrationStatus === 'error') && (
        <div className="w-full max-w-2xl bg-gray-800/90 border border-gray-700 p-8 rounded-xl shadow-2xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-white">{eventData.title}</h1>
          {fetchError && <p className="text-red-400 mb-4">{fetchError}</p>}
          
          <DynamicEventForm 
              eventId={eventId} 
              userId={userId} 
              onFormSubmit={handleInitialSubmission} 
              paymentAmount={paymentAmount} 
              // ADD THIS PROP:
              initialData={prefilledFormData} 
            />
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
