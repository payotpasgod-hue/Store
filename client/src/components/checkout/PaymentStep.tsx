import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Product, PaymentConfig } from "@shared/schema";
import { Loader2 } from "lucide-react";

interface PaymentStepProps {
  addressData: {
    customerName: string;
    phone: string;
    address: string;
    pinCode: string;
  };
  product: Product;
  storage: { capacity: string; price: number };
  paymentConfig: PaymentConfig;
  onBack: () => void;
}

export function PaymentStep({ addressData, product, storage, paymentConfig, onBack }: PaymentStepProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [paymentType, setPaymentType] = useState<"full" | "advance">("advance");
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const createOrderMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/orders", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to create order");
      return response.json();
    },
    onSuccess: (data) => {
      navigate(`/order-confirmation?orderId=${data.id}`);
    },
    onError: () => {
      toast({
        title: "Order Failed",
        description: "Unable to place your order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!screenshot) {
      toast({
        title: "Screenshot Required",
        description: "Please upload your payment screenshot to proceed.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("customerName", addressData.customerName);
    formData.append("phone", addressData.phone);
    formData.append("address", addressData.address);
    formData.append("pinCode", addressData.pinCode);
    formData.append("productId", product.id);
    formData.append("storage", storage.capacity);
    formData.append("paymentType", paymentType);
    formData.append("screenshot", screenshot);

    createOrderMutation.mutate(formData);
  };

  const paymentAmount = paymentType === "full" ? storage.price : paymentConfig.defaultAdvancePayment;
  const remainingBalance = paymentType === "full" ? 0 : storage.price - paymentConfig.defaultAdvancePayment;

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="material-icons text-primary">payment</span>
          Payment Details
        </CardTitle>
        <CardDescription>
          Complete your payment using UPI and upload the screenshot
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>Choose Payment Option</Label>
          <RadioGroup value={paymentType} onValueChange={(v) => setPaymentType(v as "full" | "advance")}>
            <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-border hover-elevate cursor-pointer" data-testid="radio-full-payment">
              <RadioGroupItem value="full" id="full" />
              <div className="flex-1">
                <Label htmlFor="full" className="cursor-pointer font-medium">
                  Pay Full Amount
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Pay ₹{storage.price.toLocaleString("en-IN")} now. No balance remaining.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-border hover-elevate cursor-pointer" data-testid="radio-advance-payment">
              <RadioGroupItem value="advance" id="advance" />
              <div className="flex-1">
                <Label htmlFor="advance" className="cursor-pointer font-medium">
                  Pay Advance (Recommended)
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Pay ₹{paymentConfig.defaultAdvancePayment.toLocaleString("en-IN")} now. 
                  Balance ₹{(storage.price - paymentConfig.defaultAdvancePayment).toLocaleString("en-IN")} on delivery.
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        <div className="bg-muted/30 rounded-xl p-6 space-y-4">
          <div className="text-center">
            <p className="text-sm font-medium mb-4">Scan QR Code or Use UPI ID</p>
            <div className="bg-white p-4 rounded-lg inline-block shadow-lg mb-4">
              <img
                src={paymentConfig.qrCodeUrl}
                alt="Payment QR Code"
                className="w-64 h-64 object-contain"
                data-testid="img-qr-code"
              />
            </div>
            <div className="flex items-center justify-center gap-2 p-3 bg-background rounded-lg">
              <span className="material-icons text-primary">account_balance</span>
              <code className="font-mono text-sm" data-testid="text-upi-id">{paymentConfig.upiId}</code>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Amount to Pay Now:</span>
              <span className="font-semibold text-lg" data-testid="text-amount-to-pay">
                ₹{paymentAmount.toLocaleString("en-IN")}
              </span>
            </div>
            {remainingBalance > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pay on Delivery:</span>
                <span className="font-medium" data-testid="text-remaining-balance">
                  ₹{remainingBalance.toLocaleString("en-IN")}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="screenshot">Upload Payment Screenshot *</Label>
          <Input
            id="screenshot"
            type="file"
            accept="image/*"
            onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
            data-testid="input-screenshot"
          />
          <p className="text-xs text-muted-foreground">
            Take a screenshot of your successful payment and upload it here
          </p>
          {screenshot && (
            <p className="text-sm text-primary flex items-center gap-1">
              <span className="material-icons text-sm">check_circle</span>
              {screenshot.name}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={onBack}
          disabled={createOrderMutation.isPending}
          className="flex-1 rounded-full"
          data-testid="button-back"
        >
          <span className="material-icons mr-2">arrow_back</span>
          Back
        </Button>
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={!screenshot || createOrderMutation.isPending}
          className="flex-1 rounded-full"
          data-testid="button-place-order"
        >
          {createOrderMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <span className="material-icons mr-2">check_circle</span>
              Place Order
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
