import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AddressStep } from "@/components/checkout/AddressStep";
import { PaymentStep } from "@/components/checkout/PaymentStep";
import { CheckoutProgress } from "@/components/checkout/CheckoutProgress";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import type { StoreConfig, Product } from "@shared/schema";
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

  // Get product info from URL parameters
  const searchParams = new URLSearchParams(window.location.search);
  const productId = searchParams.get("productId");
  const productName = searchParams.get("productName");
  const storage = searchParams.get("storage");
  const fullPrice = searchParams.get("fullPrice");
  const color = searchParams.get("color");

  const { data: config, isLoading: configLoading } = useQuery<StoreConfig>({
    queryKey: ["/api/config"],
  });

  const { data: product, isLoading: productLoading } = useQuery<Product>({
    queryKey: ["/api/products", productId],
    enabled: !!productId,
  });

  useEffect(() => {
    if (!productId || !storage || !fullPrice) {
      navigate("/");
    }
  }, [productId, storage, fullPrice, navigate]);

  if (configLoading || productLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" data-testid="loader-checkout" />
      </div>
    );
  }

  if (!config || !product || !productId || !storage || !fullPrice) {
    return null;
  }

  const orderItem = {
    productId,
    productName: productName || product.displayName,
    storage,
    color,
    fullPrice: parseFloat(fullPrice),
  };

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
                orderItem={orderItem}
                config={config}
                paymentConfig={config.paymentConfig}
                onBack={() => setStep(1)}
              />
            )}
          </div>

          <div className="lg:col-span-1">
            <OrderSummary
              orderItem={orderItem}
              config={config}
              advancePayment={config.paymentConfig.defaultAdvancePayment}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
