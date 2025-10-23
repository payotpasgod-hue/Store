import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AddressStepProps {
  data: {
    customerName: string;
    phone: string;
    address: string;
    pinCode: string;
  };
  onDataChange: (data: any) => void;
  onNext: () => void;
}

export function AddressStep({ data, onDataChange, onNext }: AddressStepProps) {
  const handleChange = (field: string, value: string) => {
    onDataChange({ ...data, [field]: value });
  };

  const isValid = data.customerName.trim().length >= 2 &&
    /^[6-9]\d{9}$/.test(data.phone) &&
    data.address.trim().length >= 10 &&
    /^\d{6}$/.test(data.pinCode);

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="material-icons text-primary">location_on</span>
          Delivery Address
        </CardTitle>
        <CardDescription>
          Enter your delivery details to proceed with the order
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="customerName">Full Name *</Label>
          <Input
            id="customerName"
            placeholder="Enter your full name"
            value={data.customerName}
            onChange={(e) => handleChange("customerName", e.target.value)}
            data-testid="input-customer-name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Mobile Number *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="10-digit mobile number"
            value={data.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            maxLength={10}
            data-testid="input-phone"
          />
          <p className="text-xs text-muted-foreground">
            We'll contact you on this number for order updates
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Complete Address *</Label>
          <Textarea
            id="address"
            placeholder="House/Flat No., Street, Locality, City, State"
            value={data.address}
            onChange={(e) => handleChange("address", e.target.value)}
            rows={4}
            data-testid="input-address"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pinCode">PIN Code *</Label>
          <Input
            id="pinCode"
            type="text"
            placeholder="6-digit PIN code"
            value={data.pinCode}
            onChange={(e) => handleChange("pinCode", e.target.value)}
            maxLength={6}
            data-testid="input-pincode"
          />
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full rounded-full"
          size="lg"
          onClick={onNext}
          disabled={!isValid}
          data-testid="button-continue-payment"
        >
          Continue to Payment
          <span className="material-icons ml-2">arrow_forward</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
