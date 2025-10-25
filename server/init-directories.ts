import { promises as fs } from "fs";
import path from "path";

export async function initializeDirectories() {
  const directories = [
    "uploads/payment-screenshots",
    "uploads/qr-codes", 
    "uploads/product-images",
    "config",
    "data"
  ];

  console.log("Initializing required directories...");
  
  for (const dir of directories) {
    const dirPath = path.join(process.cwd(), dir);
    try {
      await fs.mkdir(dirPath, { recursive: true });
      
      // Test write permission
      const testFile = path.join(dirPath, ".write-test");
      await fs.writeFile(testFile, "test");
      await fs.unlink(testFile);
      
      console.log(`✓ Directory ready: ${dir}`);
    } catch (error) {
      console.error(`✗ Failed to create/access directory ${dir}:`, error);
      throw new Error(`Directory initialization failed for ${dir}. Please check permissions.`);
    }
  }

  // Initialize config file if it doesn't exist
  const configPath = path.join(process.cwd(), "config", "store-config.json");
  try {
    await fs.access(configPath);
    console.log("✓ Config file exists");
  } catch {
    console.log("Creating default store-config.json...");
    const defaultConfig = {
      products: [],
      paymentConfig: {
        upiId: "",
        qrCodeUrl: ""
      }
    };
    await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2));
    console.log("✓ Default config file created");
  }

  console.log("All directories initialized successfully!");
}
