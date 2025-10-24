import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Lock, Settings, DollarSign, QrCode } from "lucide-react";
import type { AdminSettings, ProductPriceOverride, Product } from "@shared/schema";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const verifyPin = async () => {
    if (pin.length !== 4) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be 4 digits",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const response = await apiRequest("POST", "/api/admin/verify-pin", { pin });
      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
        toast({
          title: "Access granted",
          description: "Welcome to admin panel",
        });
      }
    } catch (error) {
      toast({
        title: "Access denied",
        description: "Invalid PIN",
        variant: "destructive",
      });
      setPin("");
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>Enter PIN to access admin panel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pin">PIN</Label>
              <Input
                id="pin"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && verifyPin()}
                placeholder="Enter 4-digit PIN"
                data-testid="input-admin-pin"
                autoFocus
              />
            </div>
            <Button
              onClick={verifyPin}
              disabled={pin.length !== 4 || isVerifying}
              className="w-full"
              data-testid="button-verify-pin"
            >
              {isVerifying ? "Verifying..." : "Verify PIN"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const { toast } = useToast();

  const { data: settings } = useQuery<AdminSettings>({
    queryKey: ["/api/admin/settings"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Manage your store settings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="telegram" className="space-y-6">
          <TabsList data-testid="tabs-admin">
            <TabsTrigger value="telegram" data-testid="tab-telegram">
              Telegram Settings
            </TabsTrigger>
            <TabsTrigger value="qr" data-testid="tab-qr">
              UPI Payment
            </TabsTrigger>
            <TabsTrigger value="prices" data-testid="tab-prices">
              Product Prices
            </TabsTrigger>
          </TabsList>

          <TabsContent value="telegram">
            <TelegramSettings settings={settings} />
          </TabsContent>

          <TabsContent value="qr">
            <QRCodeSettings settings={settings} />
          </TabsContent>

          <TabsContent value="prices">
            <ProductPriceSettings products={products} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function TelegramSettings({ settings }: { settings?: AdminSettings }) {
  const { toast } = useToast();
  const [botToken, setBotToken] = useState(settings?.telegramBotToken || "");
  const [chatId, setChatId] = useState(settings?.telegramChatId || "");

  // Sync state when settings data loads
  useEffect(() => {
    if (settings) {
      setBotToken(settings.telegramBotToken || "");
      setChatId(settings.telegramChatId || "");
    }
  }, [settings]);

  const updateSettings = useMutation({
    mutationFn: async (data: { telegramBotToken?: string; telegramChatId?: string }) => {
      const response = await apiRequest("POST", "/api/admin/settings", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({
        title: "Settings updated",
        description: "Telegram settings have been saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateSettings.mutate({
      telegramBotToken: botToken || undefined,
      telegramChatId: chatId || undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Telegram Bot Configuration</CardTitle>
        <CardDescription>
          Configure Telegram bot to receive order notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bot-token">Bot Token</Label>
          <Input
            id="bot-token"
            type="password"
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
            placeholder="Enter your Telegram bot token"
            data-testid="input-telegram-token"
          />
          <p className="text-xs text-muted-foreground">
            Get this from @BotFather on Telegram
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="chat-id">Chat ID</Label>
          <Input
            id="chat-id"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            placeholder="Enter your Telegram chat ID"
            data-testid="input-telegram-chatid"
          />
          <p className="text-xs text-muted-foreground">
            Use @userinfobot to get your chat ID
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          data-testid="button-save-telegram"
        >
          {updateSettings.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  );
}

function QRCodeSettings({ settings }: { settings?: AdminSettings }) {
  const { toast } = useToast();
  const [upiId, setUpiId] = useState(settings?.upiId || "");

  // Sync state when settings data loads
  useEffect(() => {
    if (settings) {
      setUpiId(settings.upiId || "");
    }
  }, [settings]);

  const updateSettings = useMutation({
    mutationFn: async (data: { upiId?: string }) => {
      const response = await apiRequest("POST", "/api/admin/settings", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      toast({
        title: "UPI ID updated",
        description: "UPI ID and QR code have been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update UPI ID",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateSettings.mutate({
      upiId: upiId || undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          UPI Payment Settings
        </CardTitle>
        <CardDescription>
          Enter your UPI ID to auto-generate payment QR code
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="upi-id">UPI ID</Label>
          <Input
            id="upi-id"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="yourname@paytm"
            data-testid="input-upi-id"
          />
          <p className="text-xs text-muted-foreground">
            Enter your UPI ID (e.g., yourname@paytm). QR code will be auto-generated.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          data-testid="button-save-upi"
        >
          {updateSettings.isPending ? "Saving..." : "Save UPI ID"}
        </Button>
      </CardContent>
    </Card>
  );
}

function ProductPriceSettings({
  products,
}: {
  products: Product[];
}) {
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedStorage, setSelectedStorage] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discount, setDiscount] = useState("");

  const updatePrice = useMutation({
    mutationFn: async (data: ProductPriceOverride) => {
      const response = await apiRequest("POST", "/api/admin/product-prices", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      setSelectedProduct("");
      setSelectedStorage("");
      setNewPrice("");
      setOriginalPrice("");
      setDiscount("");
      toast({
        title: "Price updated",
        description: "Product price has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update price",
        variant: "destructive",
      });
    },
  });


  const handleUpdatePrice = () => {
    if (!selectedProduct || !selectedStorage || !newPrice) {
      toast({
        title: "Missing fields",
        description: "Please select product, storage, and enter price",
        variant: "destructive",
      });
      return;
    }

    updatePrice.mutate({
      productId: selectedProduct,
      storage: selectedStorage,
      price: parseFloat(newPrice),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      discount: discount ? parseFloat(discount) : undefined,
    });
  };

  const selectedProductData = products.find((p) => p.id === selectedProduct);
  const storageOptions = selectedProductData?.storageOptions || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Update Product Prices
          </CardTitle>
          <CardDescription>
            Update product prices directly in the store configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product-select">Product</Label>
              <select
                id="product-select"
                value={selectedProduct}
                onChange={(e) => {
                  setSelectedProduct(e.target.value);
                  setSelectedStorage("");
                }}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                data-testid="select-product"
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="storage-select">Storage</Label>
              <select
                id="storage-select"
                value={selectedStorage}
                onChange={(e) => setSelectedStorage(e.target.value)}
                disabled={!selectedProduct}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                data-testid="select-storage"
              >
                <option value="">Select storage</option>
                {storageOptions.map((option) => (
                  <option key={option.capacity} value={option.capacity}>
                    {option.capacity}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-price">New Price (₹)</Label>
              <Input
                id="new-price"
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="0"
                data-testid="input-new-price"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="original-price">Original Price (₹)</Label>
              <Input
                id="original-price"
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="Optional"
                data-testid="input-original-price"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount">Discount (%)</Label>
              <Input
                id="discount"
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="Optional"
                data-testid="input-discount"
              />
            </div>
          </div>

          <Button
            onClick={handleUpdatePrice}
            disabled={updatePrice.isPending}
            data-testid="button-update-price"
          >
            {updatePrice.isPending ? "Updating..." : "Update Price"}
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}
