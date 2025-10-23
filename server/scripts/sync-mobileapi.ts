import { promises as fs } from "fs";
import path from "path";

interface MobileAPIDevice {
  id: number;
  name: string;
  brand: string;
  description: string;
  image_b64: string;
}

interface StorageOption {
  capacity: string;
  price: number;
  originalPrice?: number;
  discount?: number;
}

interface Product {
  id: string;
  deviceName: string;
  displayName: string;
  model: string;
  storageOptions: StorageOption[];
  rating?: number;
  specs: string[];
  releaseDate?: string;
  imagePath: string;
}

interface StoreConfig {
  products: Product[];
  paymentConfig: {
    upiId: string;
    qrCodeUrl: string;
    defaultAdvancePayment: number;
  };
}

const IPHONE_MODELS = [
  "iPhone 13",
  "iPhone 13 Pro",
  "iPhone 13 Pro Max",
  "iPhone 14",
  "iPhone 14 Pro",
  "iPhone 14 Pro Max",
  "iPhone 15",
  "iPhone 15 Pro",
  "iPhone 15 Pro Max",
  "iPhone 16",
  "iPhone 16 Pro",
  "iPhone 16 Pro Max",
];

async function fetchPhone(modelName: string, apiKey: string): Promise<MobileAPIDevice | null> {
  try {
    const response = await fetch(
      `https://mobileapi.dev/devices/search/?name=${encodeURIComponent(modelName)}`,
      {
        headers: {
          Authorization: `Token ${apiKey}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(`  ✗ API error for ${modelName}: ${response.status}`);
      return null;
    }

    const data: MobileAPIDevice = await response.json();
    return data;
  } catch (error) {
    console.error(`  ✗ Failed to fetch ${modelName}:`, error);
    return null;
  }
}

async function syncMobileAPI() {
  const apiKey = process.env.MOBILEAPI_DEV_KEY;

  if (!apiKey) {
    console.error("❌ MOBILEAPI_DEV_KEY environment variable not set");
    process.exit(1);
  }

  console.log("🔄 Fetching iPhone models from MobileAPI.dev...");
  console.log(`📱 Searching for ${IPHONE_MODELS.length} iPhone models`);

  const imagesDir = path.join(process.cwd(), "client", "public", "images", "iphones");
  await fs.mkdir(imagesDir, { recursive: true });

  const products: Product[] = [];
  const processedPhones = new Set<string>();

  for (const modelName of IPHONE_MODELS) {
    console.log(`  Fetching: ${modelName}`);
    
    const phone = await fetchPhone(modelName, apiKey);
    
    if (!phone) {
      console.log(`  ⚠️  Skipped: ${modelName}`);
      continue;
    }

    const slug = phone.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    
    if (processedPhones.has(slug)) {
      console.log(`  ⚠️  Skipped duplicate: ${phone.name}`);
      continue;
    }
    
    processedPhones.add(slug);
    
    const imageFilename = `${slug}.jpg`;
    const imagePath = `/images/iphones/${imageFilename}`;
    const imageFullPath = path.join(imagesDir, imageFilename);

    if (phone.image_b64) {
      try {
        const base64Data = phone.image_b64.includes(",")
          ? phone.image_b64.split(",")[1]
          : phone.image_b64;
        const imageBuffer = Buffer.from(base64Data, "base64");
        await fs.writeFile(imageFullPath, imageBuffer);
        console.log(`    ✓ Saved image: ${imageFilename}`);
      } catch (error) {
        console.error(`    ✗ Failed to save image: ${error}`);
      }
    }

    const specs: string[] = [];
    const descParts = phone.description.split(/Features|Announced/);
    if (descParts.length > 1) {
      const featureText = descParts[1];
      const features = featureText.split(",").slice(0, 4).map(f => f.trim());
      specs.push(...features.filter(f => f.length > 0 && f.length < 100));
    }

    if (specs.length === 0) {
      specs.push("Advanced features", "Premium build quality");
    }

    const storageMatches = phone.description.match(/(\d+)\s*GB storage/gi);
    const storageOptions: StorageOption[] = [];
    
    if (storageMatches && storageMatches.length > 0) {
      const uniqueStorages = new Set<string>();
      storageMatches.forEach((match) => {
        const capacity = match.match(/\d+/)?.[0];
        if (capacity && !uniqueStorages.has(capacity)) {
          uniqueStorages.add(capacity);
          const basePrice = 40000 + (parseInt(capacity) * 200);
          const originalPrice = basePrice + 20000;
          const discount = Math.floor(25 + Math.random() * 5);
          
          storageOptions.push({
            capacity: `${capacity}GB`,
            price: basePrice,
            originalPrice,
            discount,
          });
        }
      });
    }

    if (storageOptions.length === 0) {
      const defaultStorages = ["128GB", "256GB", "512GB"];
      defaultStorages.forEach((capacity, index) => {
        const basePrice = 50000 + (index * 15000);
        const originalPrice = basePrice + 20000;
        const discount = Math.floor(25 + Math.random() * 5);
        
        storageOptions.push({
          capacity,
          price: basePrice,
          originalPrice,
          discount,
        });
      });
    }

    const modelNumber = `A${Math.floor(2000 + Math.random() * 1000)}`;
    const rating = 4.0 + Math.random() * 0.8;

    const releaseDateMatch = phone.description.match(/Announced\s+([A-Za-z]+\s+\d{4})/);
    const releaseDate = releaseDateMatch ? releaseDateMatch[1] : undefined;

    products.push({
      id: slug,
      deviceName: phone.name,
      displayName: `Buy Apple ${phone.name}`,
      model: modelNumber,
      storageOptions,
      rating: Math.round(rating * 10) / 10,
      specs: specs.slice(0, 4),
      releaseDate,
      imagePath,
    });

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n✅ Processed ${products.length} iPhone models`);

  const configPath = path.join(process.cwd(), "config", "store-config.json");
  const existingConfigData = await fs.readFile(configPath, "utf-8");
  const existingConfig: StoreConfig = JSON.parse(existingConfigData);

  const updatedConfig: StoreConfig = {
    products,
    paymentConfig: existingConfig.paymentConfig,
  };

  await fs.writeFile(configPath, JSON.stringify(updatedConfig, null, 2));
  console.log(`📝 Saved ${products.length} products to config/store-config.json`);
  console.log(`📁 Images saved to: client/public/images/iphones/`);
}

syncMobileAPI();
