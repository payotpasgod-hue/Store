import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Lock, Settings, DollarSign, QrCode, MessageCircle, Package, Plus, Pencil, Trash2, Upload } from "lucide-react";
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
            <TabsTrigger value="whatsapp" data-testid="tab-whatsapp">
              WhatsApp Settings
            </TabsTrigger>
            <TabsTrigger value="qr" data-testid="tab-qr">
              UPI Payment
            </TabsTrigger>
            <TabsTrigger value="products" data-testid="tab-products">
              Manage Products
            </TabsTrigger>
            <TabsTrigger value="prices" data-testid="tab-prices">
              Product Prices
            </TabsTrigger>
          </TabsList>

          <TabsContent value="telegram">
            <TelegramSettings settings={settings} />
          </TabsContent>

          <TabsContent value="whatsapp">
            <WhatsAppSettings settings={settings} />
          </TabsContent>

          <TabsContent value="qr">
            <QRCodeSettings settings={settings} />
          </TabsContent>

          <TabsContent value="products">
            <ProductManagement products={products} />
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

function WhatsAppSettings({ settings }: { settings?: AdminSettings }) {
  const { toast } = useToast();
  const [whatsappNumber, setWhatsappNumber] = useState(settings?.whatsappNumber || "");

  useEffect(() => {
    if (settings) {
      setWhatsappNumber(settings.whatsappNumber || "");
    }
  }, [settings]);

  const updateSettings = useMutation({
    mutationFn: async (data: { whatsappNumber?: string }) => {
      const response = await apiRequest("POST", "/api/admin/settings", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      toast({
        title: "Settings updated",
        description: "WhatsApp settings have been saved successfully",
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
      whatsappNumber: whatsappNumber || undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          WhatsApp Contact Settings
        </CardTitle>
        <CardDescription>
          Configure WhatsApp contact number for the floating button
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="whatsapp-number">WhatsApp Number (with country code)</Label>
          <Input
            id="whatsapp-number"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="919876543210"
            data-testid="input-whatsapp-number"
          />
          <p className="text-xs text-muted-foreground">
            Enter number with country code (e.g., 919876543210 for India)
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          data-testid="button-save-whatsapp"
        >
          {updateSettings.isPending ? "Saving..." : "Save WhatsApp Number"}
        </Button>
      </CardContent>
    </Card>
  );
}

function ProductManagement({ products }: { products: Product[] }) {
  const { toast } = useToast();
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    displayName: "",
    deviceName: "",
    model: "",
    colorOptions: "",
    storageCapacity: "",
    originalPrice: "",
    discount: "",
    rating: "",
    specs: "",
    releaseDate: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const addProductMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        body: data,
      });
      if (!response.ok) throw new Error("Failed to add product");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      resetForm();
      setIsAddingProduct(false);
      toast({
        title: "Product added",
        description: "Product has been added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ productId, data }: { productId: string; data: FormData }) => {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        body: data,
      });
      if (!response.ok) throw new Error("Failed to update product");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      resetForm();
      setEditingProduct(null);
      toast({
        title: "Product updated",
        description: "Product has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete product");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      toast({
        title: "Product deleted",
        description: "Product has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      displayName: "",
      deviceName: "",
      model: "",
      colorOptions: "",
      storageCapacity: "",
      originalPrice: "",
      discount: "",
      rating: "",
      specs: "",
      releaseDate: "",
    });
    setSelectedImage(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      displayName: product.displayName,
      deviceName: product.deviceName,
      model: product.model,
      colorOptions: product.colorOptions?.join(", ") || "",
      storageCapacity: product.storageOptions[0]?.capacity || "",
      originalPrice: product.storageOptions[0]?.originalPrice?.toString() || "",
      discount: product.storageOptions[0]?.discount?.toString() || "0",
      rating: product.rating?.toString() || "",
      specs: product.specs?.join(", ") || "",
      releaseDate: product.releaseDate || "",
    });
  };

  const handleSubmit = () => {
    const originalPrice = parseFloat(formData.originalPrice);
    const discount = parseFloat(formData.discount || "0");
    
    if (!formData.displayName || !formData.deviceName || !formData.model) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const productData = {
      displayName: formData.displayName,
      deviceName: formData.deviceName,
      model: formData.model,
      colorOptions: formData.colorOptions ? formData.colorOptions.split(",").map(c => c.trim()) : [],
      storageOptions: [{
        capacity: formData.storageCapacity || "128GB",
        originalPrice,
        discount,
      }],
      rating: formData.rating ? parseFloat(formData.rating) : undefined,
      specs: formData.specs ? formData.specs.split(",").map(s => s.trim()) : [],
      releaseDate: formData.releaseDate || undefined,
    };

    const formDataToSend = new FormData();
    formDataToSend.append("productData", JSON.stringify(productData));
    if (selectedImage) {
      formDataToSend.append("image", selectedImage);
    }

    if (editingProduct) {
      updateProductMutation.mutate({ productId: editingProduct.id, data: formDataToSend });
    } else {
      addProductMutation.mutate(formDataToSend);
    }
  };

  const calculatedPrice = formData.originalPrice && formData.discount
    ? Math.round(parseFloat(formData.originalPrice) * (1 - parseFloat(formData.discount) / 100))
    : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Manage Products
              </CardTitle>
              <CardDescription>
                Add, edit, or remove products from your store
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setIsAddingProduct(!isAddingProduct);
                setEditingProduct(null);
              }}
              data-testid="button-toggle-add-product"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isAddingProduct ? "Cancel" : "Add Product"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {(isAddingProduct || editingProduct) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingProduct ? "Edit Product" : "Add New Product"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="display-name">Product Name *</Label>
                <Input
                  id="display-name"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Buy Apple iPhone 15 Pro"
                  data-testid="input-display-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="device-name">Device Name *</Label>
                <Input
                  id="device-name"
                  value={formData.deviceName}
                  onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
                  placeholder="iPhone 15 Pro"
                  data-testid="input-device-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="A2890"
                  data-testid="input-model"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storage">Storage Capacity</Label>
                <Input
                  id="storage"
                  value={formData.storageCapacity}
                  onChange={(e) => setFormData({ ...formData, storageCapacity: e.target.value })}
                  placeholder="256GB"
                  data-testid="input-storage"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="original-price-new">Original Price (₹) *</Label>
                <Input
                  id="original-price-new"
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  placeholder="100000"
                  data-testid="input-original-price-new"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount-new">Discount (%)</Label>
                <Input
                  id="discount-new"
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  placeholder="20"
                  data-testid="input-discount-new"
                />
              </div>

              <div className="space-y-2">
                <Label>Calculated Price</Label>
                <div className="h-9 px-3 py-2 rounded-md border border-input bg-muted flex items-center">
                  ₹{calculatedPrice.toLocaleString()}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating-new">Rating (0-5)</Label>
                <Input
                  id="rating-new"
                  type="number"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  placeholder="4.5"
                  data-testid="input-rating-new"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="release-date">Release Date</Label>
                <Input
                  id="release-date"
                  value={formData.releaseDate}
                  onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                  placeholder="Sep 2023"
                  data-testid="input-release-date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="colors">Color Options (comma separated)</Label>
                <Input
                  id="colors"
                  value={formData.colorOptions}
                  onChange={(e) => setFormData({ ...formData, colorOptions: e.target.value })}
                  placeholder="Black, White, Gold"
                  data-testid="input-colors"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="specs">Specs (comma separated)</Label>
                <Input
                  id="specs"
                  value={formData.specs}
                  onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                  placeholder="6.1 inch display, A17 Pro chip, 48MP camera"
                  data-testid="input-specs"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="product-image">Product Image</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="product-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                    data-testid="input-product-image"
                  />
                  {selectedImage && (
                    <span className="text-sm text-muted-foreground">
                      {selectedImage.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={addProductMutation.isPending || updateProductMutation.isPending}
                data-testid="button-submit-product"
              >
                <Upload className="w-4 h-4 mr-2" />
                {editingProduct ? "Update Product" : "Add Product"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsAddingProduct(false);
                  setEditingProduct(null);
                }}
                data-testid="button-cancel-product"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Existing Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 border rounded-md"
                data-testid={`product-item-${product.id}`}
              >
                <div className="flex items-center gap-4">
                  {product.imagePath && (
                    <img
                      src={product.imagePath}
                      alt={product.displayName}
                      className="w-16 h-16 object-contain rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-medium">{product.displayName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {product.model} | {product.storageOptions[0]?.capacity}
                    </p>
                    <p className="text-sm">
                      ₹{product.storageOptions[0]?.price.toLocaleString()}
                      {product.storageOptions[0]?.discount && (
                        <span className="text-muted-foreground ml-2">
                          ({product.storageOptions[0].discount}% off)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleEdit(product)}
                    data-testid={`button-edit-${product.id}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this product?")) {
                        deleteProductMutation.mutate(product.id);
                      }
                    }}
                    data-testid={`button-delete-${product.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
