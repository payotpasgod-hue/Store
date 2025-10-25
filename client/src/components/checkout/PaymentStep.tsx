import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { PaymentConfig, StoreConfig } from "@shared/schema";
import { Loader2 } from "lucide-react";

interface PaymentStepProps {
  addressData: {
    customerName: string;
    phone: string;
    address: string;
    pinCode: string;
  };
  orderItem: {
    productId: string;
    productName: string;
    storage: string;
    color: string | null;
    fullPrice: number;
  };
  config: StoreConfig;
  paymentConfig: PaymentConfig;
  onBack: () => void;
}

export function PaymentStep({ addressData, orderItem, config, paymentConfig, onBack }: PaymentStepProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [paymentType, setPaymentType] = useState<"full" | "advance" | null>(null);
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!screenshot) {
        throw new Error("Screenshot is required");
      }

      if (!paymentType) {
        throw new Error("Payment type is required");
      }

      const formData = new FormData();
      formData.append("screenshot", screenshot);
      formData.append("customerName", addressData.customerName);
      formData.append("phone", addressData.phone);
      formData.append("address", addressData.address);
      formData.append("pinCode", addressData.pinCode);
      formData.append("paymentType", paymentType);
      formData.append("productId", orderItem.productId);
      formData.append("productName", orderItem.productName);
      formData.append("storage", orderItem.storage);
      formData.append("fullPrice", orderItem.fullPrice.toString());
      if (orderItem.color) {
        formData.append("color", orderItem.color);
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create order: ${errorText}`);
      }
      
      const order = await response.json();
      return order;
    },
    onSuccess: async (order) => {
      navigate(`/order-confirmation?orderId=${order.id}`);
    },
    onError: (error) => {
      console.error("Order creation error:", error);
      toast({
        title: "Order Failed",
        description: error instanceof Error ? error.message : "Unable to place your order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!paymentType) {
      toast({
        title: "Payment Option Required",
        description: "Please select a payment option to proceed.",
        variant: "destructive",
      });
      return;
    }
    
    if (!screenshot) {
      toast({
        title: "Screenshot Required",
        description: "Please upload your payment screenshot to proceed.",
        variant: "destructive",
      });
      return;
    }

    createOrderMutation.mutate();
  };

  const fullPrice = orderItem.fullPrice;
  const advancePayment = paymentConfig.defaultAdvancePayment;
  const amountToPay = paymentType === "full" ? fullPrice : advancePayment;

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="material-icons text-primary">payment</span>
          Payment Details
        </CardTitle>
        <CardDescription>
          Complete your payment to confirm your order
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-semibold mb-4 block">Select Payment Option</Label>
          <RadioGroup value={paymentType || ""} onValueChange={(value) => setPaymentType(value as "full" | "advance")}>
            <Card className="mb-3 hover-elevate">
              <CardContent className="flex items-start gap-4 p-4">
                <RadioGroupItem 
                  value="full" 
                  id="full" 
                  className="mt-1"
                  data-testid="radio-payment-full"
                />
                <Label htmlFor="full" className="flex-1 cursor-pointer">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold">Pay Full Amount</span>
                    <span className="font-bold text-lg text-[#22C55E]">
                      ₹{fullPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Complete payment now</p>
                </Label>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="flex items-start gap-4 p-4">
                <RadioGroupItem 
                  value="advance" 
                  id="advance" 
                  className="mt-1"
                  data-testid="radio-payment-advance"
                />
                <Label htmlFor="advance" className="flex-1 cursor-pointer">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold">Pay Advance</span>
                    <div className="text-right">
                      <div className="font-bold text-lg text-[#22C55E]">
                        ₹{advancePayment.toLocaleString("en-IN")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Balance: ₹{(fullPrice - advancePayment).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Pay ₹{advancePayment.toLocaleString("en-IN")} now, remaining at delivery
                  </p>
                </Label>
              </CardContent>
            </Card>
          </RadioGroup>
        </div>

        {paymentType && (
          <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Amount to Pay:</span>
              <span className="text-2xl font-bold text-[#22C55E]" data-testid="text-amount-to-pay">
                ₹{amountToPay.toLocaleString("en-IN")}
              </span>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">UPI ID</Label>
              <div className="flex gap-2">
                <Input
                  value={paymentConfig.upiId}
                  readOnly
                  className="font-mono"
                  data-testid="input-upi-id"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(paymentConfig.upiId);
                    toast({
                      title: "Copied!",
                      description: "UPI ID copied to clipboard",
                    });
                  }}
                  data-testid="button-copy-upi"
                >
                  <span className="material-icons text-sm">content_copy</span>
                </Button>
              </div>
            </div>

            {paymentConfig.qrCodeUrl && (
              <div className="text-center">
                <Label className="text-sm font-medium mb-2 block">Scan QR Code</Label>
                <div className="inline-block bg-white p-4 rounded-lg">
                  <img
                    src={paymentConfig.qrCodeUrl}
                    alt="Payment QR Code"
                    className="w-48 h-48 mx-auto"
                    data-testid="img-qr-code"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="screenshot">
            Upload Payment Screenshot <span className="text-destructive">*</span>
          </Label>
          <Input
            id="screenshot"
            type="file"
            accept="image/*"
            onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
            data-testid="input-payment-screenshot"
          />
          {screenshot && (
            <p className="text-sm text-muted-foreground" data-testid="text-screenshot-name">
              Selected: {screenshot.name}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={createOrderMutation.isPending}
          className="flex-1"
          data-testid="button-back"
        >
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={createOrderMutation.isPending}
          className="flex-1 rounded-full"
          data-testid="button-place-order"
        >
          {createOrderMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <span className="material-icons mr-2 text-sm">check_circle</span>
              Place Order
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
