import { createMocks } from 'node-mocks-http';
import { POST } from '../src/app/api/generate-copy/route';

// Mock dependencies
jest.mock('../src/lib/ai/openaiClient', () => ({
    generateMarketingCopy: jest.fn().mockResolvedValue({
        headline: 'Test Headline',
        body: 'Test Body',
        cta: 'Test CTA',
    }),
}));

jest.mock('@clerk/nextjs', () => ({
    auth: () => ({ userId: 'user_123' }),
    currentUser: () => ({ id: 'user_123' }),
}));

describe('Generate Copy API', () => {
    it('returns generated copy on success', async () => {
        const { req } = createMocks({
            method: 'POST',
            json: () => ({
                brief: {
                    product: 'Test Product',
                    tone: 'friendly',
                },
            }),
        });

        const response = await POST(req as any);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.copy).toEqual({
            headline: 'Test Headline',
            body: 'Test Body',
            cta: 'Test CTA',
        });
    });

    it('returns 400 for invalid input', async () => {
        const { req } = createMocks({
            method: 'POST',
            json: () => ({}), // Missing brief
        });

        const response = await POST(req as any);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
    });
});
