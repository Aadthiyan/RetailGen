# API Documentation - RetailGen AI

## Overview

RetailGen AI provides a RESTful API for creative generation, compliance validation, and asset management. All API endpoints are authenticated using Clerk.

**Base URL:** `https://your-domain.com/api`

---

## Authentication

All API requests require authentication via Clerk session tokens.

```javascript
// Example: Authenticated request
const response = await fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${sessionToken}`,
    'Content-Type': 'application/json'
  }
});
```

---

## API Endpoints

### 1. Asset Management

#### Upload Asset Signature
Generate a signed upload URL for Cloudinary.

**Endpoint:** `POST /api/assets/sign-upload`

**Request:**
```json
{
  "folder": "user-assets",
  "timestamp": 1701518400
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "signature": "a1b2c3d4e5f6...",
    "timestamp": 1701518400,
    "cloudName": "your-cloud-name",
    "apiKey": "your-api-key"
  }
}
```

**Error Codes:**
- `401`: Unauthorized - User not authenticated
- `500`: Server error

---

### 2. AI Generation

#### Generate Copy
Generate marketing copy using AI.

**Endpoint:** `POST /api/generate-copy`

**Request:**
```json
{
  "brief": {
    "product": "Organic Coffee Beans",
    "targetAudience": "Health-conscious millennials",
    "tone": "Friendly and energetic",
    "keyMessage": "Fresh roasted daily",
    "format": "social-post"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "copy": {
      "headline": "Wake Up to Freshness ☕",
      "body": "Our organic coffee beans are roasted daily to bring you the perfect cup every morning.",
      "cta": "Shop Now"
    }
  }
}
```

**Error Codes:**
- `400`: Bad Request - Invalid brief format
- `401`: Unauthorized
- `500`: AI generation failed

---

#### Generate Recommendations
Get AI-powered design recommendations.

**Endpoint:** `POST /api/recommendations`

**Request:**
```json
{
  "canvasJSON": { /* Fabric.js canvas JSON */ },
  "context": {
    "retailer": "tesco",
    "format": "social-post"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "category": "color",
        "suggestion": "Consider using more brand colors",
        "priority": "medium",
        "impact": "Improves brand recognition"
      }
    ]
  }
}
```

---

### 3. Compliance

#### Validate Compliance
Run compliance validation on a creative.

**Endpoint:** `POST /api/compliance`

**Request:**
```json
{
  "canvasJSON": { /* Fabric.js canvas JSON */ },
  "retailer": "tesco",
  "metadata": {
    "creativeId": "abc123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "report": {
      "overallStatus": "pass",
      "score": 92,
      "results": [
        {
          "ruleId": "tesco-logo-size",
          "ruleName": "Logo Minimum Size",
          "passed": true,
          "severity": "error",
          "message": "Logo meets minimum size requirement"
        }
      ],
      "summary": {
        "total": 15,
        "passed": 14,
        "failed": 0,
        "warnings": 1
      },
      "timestamp": 1701518400
    }
  }
}
```

**Error Codes:**
- `400`: Invalid canvas JSON
- `404`: Retailer rules not found
- `500`: Validation failed

---

#### Get AI Copilot Guidance
Get AI-powered guidance for compliance violations.

**Endpoint:** `POST /api/compliance/copilot`

**Request:**
```json
{
  "violation": {
    "ruleId": "tesco-logo-size",
    "ruleName": "Logo Minimum Size",
    "message": "Logo is 12mm, minimum is 15mm"
  },
  "retailer": "Tesco"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "guidance": {
      "explanation": "The Tesco logo must be at least 15mm to ensure visibility...",
      "businessContext": "Maintaining logo visibility ensures brand recognition...",
      "fixAction": {
        "type": "resize",
        "params": { "minSize": 15 },
        "label": "Resize logo to 15mm"
      },
      "learningTip": "Always check logo size early in the design process"
    }
  }
}
```

---

#### Generate Compliance Report
Generate a downloadable compliance report.

**Endpoint:** `POST /api/compliance/report`

**Request:**
```json
{
  "report": { /* Compliance report object */ },
  "creativeName": "Summer Sale Banner",
  "creativeId": "abc123",
  "action": "report"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "report": "# Compliance Report...",
    "filename": "compliance-report-1701518400.md"
  }
}
```

**For Certification (action: "certify"):**
```json
{
  "success": true,
  "data": {
    "certificate": {
      "id": "CERT-1701518400",
      "creativeId": "abc123",
      "score": 95,
      "timestamp": 1701518400,
      "signature": "a1b2c3d4..."
    }
  }
}
```

---

### 4. Image Analysis

#### Analyze Image
Analyze an image using computer vision.

**Endpoint:** `POST /api/analyze-image`

**Request:**
```json
{
  "imageUrl": "https://cloudinary.com/image.jpg",
  "analysisType": "full"
}
```

**Analysis Types:**
- `full`: Complete analysis (text, objects, colors, logos)
- `logo`: Logo detection only
- `text`: Text extraction (OCR) only
- `color`: Color analysis only
- `layout`: Layout analysis only

**Response:**
```json
{
  "success": true,
  "data": {
    "text": ["Summer Sale", "30% Off"],
    "objects": ["product", "background"],
    "colors": ["#FF0000", "#FFFFFF"],
    "logos": [
      {
        "description": "Tesco logo",
        "confidence": 0.95,
        "bounds": { "x": 10, "y": 10, "width": 100, "height": 50 }
      }
    ]
  }
}
```

---

### 5. Health Check

#### System Health
Check API and service health.

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": 1701518400,
  "services": {
    "openai": true,
    "replicate": true,
    "cloudinary": true,
    "vision": true
  }
}
```

---

## Error Handling

All API errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "brief.product",
      "issue": "Product name is required"
    }
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Missing or invalid authentication |
| `VALIDATION_ERROR` | Invalid request parameters |
| `NOT_FOUND` | Resource not found |
| `RATE_LIMIT` | Too many requests |
| `AI_ERROR` | AI service failure |
| `STORAGE_ERROR` | File storage failure |
| `SERVER_ERROR` | Internal server error |

---

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Authenticated Users:** 100 requests/minute
- **AI Endpoints:** 10 requests/minute
- **Image Analysis:** 20 requests/minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1701518460
```

---

## Webhooks

RetailGen AI can send webhooks for async operations.

### Export Complete
Triggered when an export job completes.

**Payload:**
```json
{
  "event": "export.complete",
  "timestamp": 1701518400,
  "data": {
    "creativeId": "abc123",
    "formats": ["fb-feed", "ig-post"],
    "fileCount": 2,
    "totalSize": 1024000
  }
}
```

---

## SDK Examples

### JavaScript/TypeScript
```typescript
import { RetailGenClient } from '@retailgen/sdk';

const client = new RetailGenClient({
  apiKey: process.env.RETAILGEN_API_KEY
});

// Generate copy
const copy = await client.generateCopy({
  product: 'Coffee Beans',
  tone: 'friendly'
});

// Validate compliance
const report = await client.validateCompliance({
  canvasJSON: myCanvas.toJSON(),
  retailer: 'tesco'
});
```

### Python
```python
from retailgen import RetailGenClient

client = RetailGenClient(api_key=os.getenv('RETAILGEN_API_KEY'))

# Generate copy
copy = client.generate_copy(
    product='Coffee Beans',
    tone='friendly'
)

# Validate compliance
report = client.validate_compliance(
    canvas_json=canvas_data,
    retailer='tesco'
)
```

---

## Postman Collection

Download our Postman collection for easy API testing:

[Download Postman Collection](./postman/RetailGen-API.postman_collection.json)

---

## Support

For API support:
- **Documentation:** https://docs.retailgen.ai
- **Email:** api-support@retailgen.ai
- **Discord:** https://discord.gg/retailgen

---

*Last Updated: December 2, 2025*
