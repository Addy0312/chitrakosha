"use client";
import React from 'react';


interface RazorpayCheckoutProps {
  orderId: string;
  amount: number;
  currency: string;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}

export default function RazorpayCheckout({ orderId, amount, currency, onSuccess, onFailure }: RazorpayCheckoutProps) {
  const openRazorpay = () => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount: amount * 100,
      currency,
      order_id: orderId,
      handler: async (response: any) => {
        try {
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) throw new Error(verifyData.error || 'Payment verification failed');
          onSuccess(verifyData);
        } catch (err) {
          onFailure(err);
        }
      },
      modal: { ondismiss: onFailure },
      prefill: {},
      theme: { color: '#121212' },
    };
    // @ts-ignore
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <button type="button" onClick={openRazorpay} className="btn btn-primary">
      Pay with Razorpay
    </button>
  );
}
