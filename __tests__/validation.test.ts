import { sanitizeInput, isValidEmail, isValidURL } from '../src/lib/security/validation';

describe('Validation Utilities', () => {
    describe('sanitizeInput', () => {
        it('should remove HTML tags', () => {
            const input = '<script>alert("xss")</script>Hello';
            expect(sanitizeInput(input)).toBe('alert("xss")Hello');
        });

        it('should trim whitespace', () => {
            const input = '  Hello World  ';
            expect(sanitizeInput(input)).toBe('Hello World');
        });

        it('should handle empty strings', () => {
            expect(sanitizeInput('')).toBe('');
        });
    });

    describe('isValidEmail', () => {
        it('should validate correct emails', () => {
            expect(isValidEmail('test@example.com')).toBe(true);
            expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
        });

        it('should reject invalid emails', () => {
            expect(isValidEmail('invalid')).toBe(false);
            expect(isValidEmail('test@')).toBe(false);
            expect(isValidEmail('@domain.com')).toBe(false);
        });
    });

    describe('isValidURL', () => {
        it('should validate correct URLs', () => {
            expect(isValidURL('https://example.com')).toBe(true);
            expect(isValidURL('http://localhost:3000')).toBe(true);
        });

        it('should reject invalid URLs', () => {
            expect(isValidURL('invalid-url')).toBe(false);
            expect(isValidURL('ftp://example.com')).toBe(false); // Only http/https allowed
        });
    });
});
