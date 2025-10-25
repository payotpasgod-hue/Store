# VPS Debugging Guide

## API Endpoint Information

### Add Product API
- **Endpoint**: `POST /api/admin/products`
- **Content-Type**: `application/json`
- **Status on Success**: `201 Created`

### Request Format
```json
{
  "displayName": "Product Name",
  "deviceName": "iPhone 15",
  "model": "A2345",
  "colorOptions": ["Black", "White"],
  "storageOptions": [{
    "capacity": "128GB",
    "originalPrice": 50000,
    "discount": 10
  }],
  "rating": 4.5,
  "specs": ["Spec 1", "Spec 2"],
  "releaseDate": "2024",
  "image": "data:image/jpeg;base64,...",  // Optional
  "imageFilename": "product.jpg"          // Optional
}
```

## Step-by-Step VPS Debugging

### 1. Run the Test Script

Upload `test-vps-api.sh` to your VPS and run:

```bash
cd /path/to/your/app
chmod +x test-vps-api.sh
./test-vps-api.sh
```

This will test:
- ✓ If server is running
- ✓ If API endpoints respond
- ✓ If adding products works
- ✓ File/directory permissions
- ✓ Recent logs

### 2. Manual API Test

If you want to test manually:

```bash
# Test without image
curl -X POST http://localhost:5000/api/admin/products \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "Test Product",
    "deviceName": "iPhone Test",
    "model": "TEST123",
    "colorOptions": ["Black"],
    "storageOptions": [{
      "capacity": "128GB",
      "originalPrice": 50000,
      "discount": 10
    }],
    "specs": ["Test spec"]
  }'
```

### 3. Check What You Should See

**On SUCCESS (HTTP 201):**
```json
{
  "id": "some-uuid-here",
  "displayName": "Test Product",
  "deviceName": "iPhone Test",
  ...
  "storageOptions": [{
    "capacity": "128GB",
    "originalPrice": 50000,
    "discount": 10,
    "price": 45000
  }]
}
```

**Server logs should show:**
```
Received product data
Adding product to storage...
Product saved to config file successfully
Product added successfully: <uuid>
```

### 4. Common Errors and Solutions

#### Error: "Failed to add product" (HTTP 500)

**Cause**: Server-side error

**Debug**:
```bash
# Check recent logs
pm2 logs --lines 30
# OR
sudo journalctl -u yourapp -n 30

# Look for error messages like:
# - "ENOENT: no such file or directory"
# - "EACCES: permission denied"
# - "Cannot read property..."
```

**Solutions**:
- Check file permissions: `ls -la config/`
- Verify config file exists: `cat config/store-config.json`
- Check directory ownership: `ls -la uploads/`

#### Error: "Invalid product data" (HTTP 400)

**Cause**: Data validation failed

**Debug**: Check the response `details` field for specific validation errors

**Solutions**:
- Ensure `originalPrice` is a number, not a string
- Make sure required fields are present

#### Error: Connection refused

**Cause**: Server not running or wrong port

**Solutions**:
```bash
# Check if server is running
pm2 list
# OR
sudo systemctl status yourapp

# Check which port it's listening on
netstat -tlnp | grep node
```

#### Error: Request too large (HTTP 413)

**Cause**: Nginx body size limit (shouldn't happen with new approach, but just in case)

**Solution**:
```nginx
# In nginx config
http {
    client_max_body_size 10M;
}
```

### 5. Test From Browser Console

Open your admin page (F12 → Console) and paste:

```javascript
// Test adding a product
fetch('/api/admin/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    displayName: "Browser Test Product",
    deviceName: "iPhone Browser Test",
    model: "BROWSER-001",
    colorOptions: ["Black"],
    storageOptions: [{
      capacity: "128GB",
      originalPrice: 50000,
      discount: 10
    }],
    specs: ["Test from browser"]
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

You should see either:
- Success: Product object with an `id`
- Error: Object with `error` and possibly `message` fields

### 6. Compare Replit vs VPS

**On Replit it works because:**
- All directories are auto-created
- Permissions are correct
- Port 5000 is exposed
- No reverse proxy issues

**On VPS check:**
- [ ] Are directories created?
- [ ] Do they have write permissions?
- [ ] Is Node.js user the same as directory owner?
- [ ] Is there a reverse proxy (nginx/apache)?
- [ ] Are you accessing the correct URL/port?

### 7. Enable Debug Mode

Add this to your VPS environment:

```bash
# In your .env or start command
DEBUG=* NODE_ENV=production npm start
```

This will show all debug output and help identify the issue.

### 8. Check Process User

The Node.js process must have permission to write files:

```bash
# Who owns the files?
ls -la config/store-config.json

# Who is running Node.js?
ps aux | grep node

# They should match! If not:
sudo chown -R <node-user>:<node-user> /path/to/app
```

## Need More Help?

Run the test script and send me:
1. The complete output from `test-vps-api.sh`
2. The error message from browser console
3. The last 30 lines from your application logs
4. Your nginx config (if using nginx)

With this info, I can pinpoint exactly what's wrong!
