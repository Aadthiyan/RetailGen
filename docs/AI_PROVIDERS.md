# AI Image Generation - Provider Configuration

RetailGen AI supports multiple AI image generation providers. You can easily switch between them based on your needs.

## Available Providers

### 1. **Pollinations.ai** (Default - FREE)
- ✅ **Completely free**
- ✅ **No API key required**
- ✅ **Instant generation**
- ✅ **No rate limits**
- ⚠️ Lower quality than DALL-E 3
- ⚠️ Less control over output

**Best for:** Testing, development, demos, prototyping

### 2. **OpenAI DALL-E 3** (Premium)
- ✅ **Highest quality images**
- ✅ **Best prompt understanding**
- ✅ **Professional results**
- ✅ **Can include text in images**
- 💰 **Costs ~$0.04 per image** (1024×1024)
- 💰 **Requires OpenAI billing setup**

**Best for:** Production, client work, professional marketing materials

---

## How to Switch Providers

### Option 1: Use Pollinations.ai (Free - Default)

**In your `.env.local` file:**
```bash
AI_PROVIDER=pollinations
```

Or simply leave it blank (defaults to pollinations):
```bash
# AI_PROVIDER not set = uses pollinations
```

**No other configuration needed!**

---

### Option 2: Use OpenAI DALL-E 3 (Paid)

**Prerequisites:**
1. OpenAI account with billing enabled
2. Valid OpenAI API key

**In your `.env.local` file:**
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Setup billing:**
1. Go to https://platform.openai.com/account/billing
2. Add payment method
3. Set spending limit (recommended: $5-10 for testing)
4. Wait 2-3 minutes for activation

---

## Testing the Configuration

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Go to the builder:**
   ```
   http://localhost:3000/app/builder
   ```

3. **Click "AI" button** (purple gradient button on right)

4. **Generate an image:**
   - Enter product name: "Coffee Cup"
   - Select style: "Modern"
   - Click "Generate"

5. **Check the results:**
   - **Pollinations:** Images appear instantly (1-2 seconds)
   - **OpenAI:** Takes 10-15 seconds, higher quality

---

## Cost Comparison

| Provider | Cost per Image | Quality | Speed | API Key Required |
|----------|---------------|---------|-------|------------------|
| **Pollinations** | FREE | Good | Instant | ❌ No |
| **OpenAI DALL-E 3** | $0.04 | Excellent | 10-15s | ✅ Yes |

---

## Switching in Production

### For Development/Testing:
```bash
AI_PROVIDER=pollinations
```

### For Production/Client Work:
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-production-key
```

---

## Troubleshooting

### Pollinations Issues:
- **Images not loading?** Check your internet connection
- **Low quality?** This is expected - it's a free service
- **Want better quality?** Switch to OpenAI

### OpenAI Issues:
- **"Billing hard limit reached"?** Add payment method at https://platform.openai.com/account/billing
- **"Invalid API key"?** Check your `OPENAI_API_KEY` in `.env.local`
- **Slow generation?** This is normal (10-15 seconds per image)
- **Too expensive?** Switch back to Pollinations for testing

---

## Recommendation

**For your current situation:**
- ✅ Use **Pollinations** for testing and development
- ✅ Switch to **OpenAI** when you have billing set up
- ✅ Use **OpenAI** for final production/client deliverables

**The code is ready for both!** Just change one line in `.env.local` 🚀
