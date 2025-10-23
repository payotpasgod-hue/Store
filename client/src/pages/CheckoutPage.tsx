import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AddressStep } from "@/components/checkout/AddressStep";
import { PaymentStep } from "@/components/checkout/PaymentStep";
import { CheckoutProgress } from "@/components/checkout/CheckoutProgress";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import type { CartItem, StoreConfig } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<1 | 2>(1);
  const [addressData, setAddressData] = useState({
    customerName: "",
    phone: "",
    address: "",
    pinCode: "",
  });

  const { data: cartItems, isLoading: cartLoading } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
  });

  const { data: config, isLoading: configLoading } = useQuery<StoreConfig>({
    queryKey: ["/api/config"],
  });

  useEffect(() => {
    if (!cartLoading && (!cartItems || cartItems.length === 0)) {
      navigate("/cart");
    }
  }, [cartItems, cartLoading, navigate]);

  if (cartLoading || configLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" data-testid="loader-checkout" />
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0 || !config) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Checkout</h1>
          <p className="text-muted-foreground">Complete your order in 2 simple steps</p>
        </div>

        <CheckoutProgress currentStep={step} />

        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            {step === 1 ? (
              <AddressStep
                data={addressData}
                onDataChange={setAddressData}
                onNext={() => setStep(2)}
              />
            ) : (
              <PaymentStep
                addressData={addressData}
                cartItems={cartItems}
                config={config}
                paymentConfig={config.paymentConfig}
                onBack={() => setStep(1)}
              />
            )}
          </div>

          <div className="lg:col-span-1">
            <OrderSummary
              cartItems={cartItems}
              config={config}
              advancePayment={config.paymentConfig.defaultAdvancePayment}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
