# OpenAI Model Configuration - RetailGen AI

## Current Configuration

**Model:** `gpt-4o-mini`  
**Tier:** Standard  
**Updated:** December 4, 2025

---

## Pricing (Standard Tier)

- **Input:** $0.15 per 1M tokens
- **Output:** $0.60 per 1M tokens
- **Cached Input:** $0.075 per 1M tokens

---

## Cost Estimates for RetailGen AI

### Per Request Estimate
- **Average Input:** ~750 tokens (prompt + context)
- **Average Output:** ~350 tokens (generated content)
- **Cost per Request:** ~$0.0003 ($0.11 + $0.21 = $0.32 per 1000 requests)

### Monthly Cost Scenarios

| Usage Level | Requests/Day | Requests/Month | Monthly Cost |
|-------------|--------------|----------------|--------------|
| **Light** (Testing) | 100 | 3,000 | ~$1 |
| **Moderate** (Small Team) | 500 | 15,000 | ~$5 |
| **Heavy** (Production) | 2,000 | 60,000 | ~$20 |
| **Enterprise** | 10,000 | 300,000 | ~$100 |

---

## Where It's Used in RetailGen AI

### 1. AI Copywriting (`src/lib/ai/copyGenerator.ts`)
- Generates headlines, body copy, CTAs
- **Tokens:** ~500 input, ~200 output
- **Cost:** ~$0.0002 per generation

### 2. Recommendations (`src/lib/ai/recommendationEngine.ts`)
- Design improvement suggestions
- **Tokens:** ~800 input, ~300 output
- **Cost:** ~$0.0003 per recommendation

### 3. Compliance Copilot (`src/lib/compliance/copilot.ts`)
- Explains violations, suggests fixes
- **Tokens:** ~1000 input, ~500 output
- **Cost:** ~$0.0005 per explanation

---

## Alternative Models (If Needed)

### For Higher Quality (More Expensive)
```typescript
model: 'gpt-4o' // $2.50 input, $10.00 output per 1M tokens
```
**Use case:** Complex compliance explanations, critical copy

### For Lower Cost (Less Capable)
```typescript
model: 'gpt-4.1-nano' // $0.10 input, $0.40 output per 1M tokens
```
**Use case:** Simple recommendations, basic suggestions

### For Latest Features
```typescript
model: 'gpt-5-mini' // $0.25 input, $2.00 output per 1M tokens
```
**Use case:** Testing new capabilities

---

## How to Change the Model

### Global Change (All Features)
Edit `src/lib/ai/openaiClient.ts`:
```typescript
const {
    model = 'gpt-4o-mini', // Change this
    temperature = 0.7,
    maxTokens = 1000,
    jsonMode = false,
} = options;
```

### Per-Feature Change
Edit specific files:
- **Copywriting:** `src/lib/ai/copyGenerator.ts` (line ~32)
- **Recommendations:** `src/lib/ai/recommendationEngine.ts` (line ~254)
- **Copilot:** `src/lib/compliance/copilot.ts` (if different model needed)

---

## Cost Optimization Tips

### 1. Use Caching (Prompt Caching)
OpenAI offers 50% discount on cached input tokens:
- **Regular:** $0.15/1M tokens
- **Cached:** $0.075/1M tokens

### 2. Reduce Token Usage
- Keep prompts concise
- Limit context to relevant info
- Set appropriate `max_tokens`

### 3. Batch Requests
For non-real-time operations, use Batch API:
- **50% discount** on both input and output
- **Input:** $0.075/1M (vs $0.15)
- **Output:** $0.30/1M (vs $0.60)

### 4. Monitor Usage
Check OpenAI dashboard regularly:
- https://platform.openai.com/usage
- Set up billing alerts
- Track per-feature costs

---

## Current Setup (Updated)

✅ All files updated to use `gpt-4o-mini`  
✅ Cost-optimized for production  
✅ Good balance of quality and price  

**Estimated Monthly Cost:** $5-20 for typical usage

---

## Need to Upgrade?

If you need better quality:
1. Change model to `gpt-4o` or `gpt-5-mini`
2. Test the difference in output quality
3. Evaluate if the cost increase is worth it

**Remember:** You can use different models for different features!

---

*Last Updated: December 4, 2025*
