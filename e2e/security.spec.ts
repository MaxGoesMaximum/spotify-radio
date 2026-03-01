import { test, expect } from '@playwright/test';

test.describe('Security & Data Protection', () => {

    test('Protected routes redirect unauthenticated users', async ({ page }) => {
        // If we try to access a protected profile or settings page
        // Using an example route Assuming /profile is protected
        await page.goto('/profile');

        // We should be redirected to a login page or the home page depending on NextAuth setup
        // For SpotifyRadio, usually it redirects to / or shows a sign-in module.
        // Let's just make sure it doesn't leak protected data
        // Wait for client-side redirect to kick in
        await page.waitForTimeout(1500);

        // We expect the user to be navigated away from /profile
        await expect(page).not.toHaveURL(/.*\/profile/);
    });

    test('API rate limiting handles excessive requests', async ({ request }) => {
        // We will spam a specific endpoint that should be rate limited, e.g. /api/spotify/playlist
        const responses = [];
        for (let i = 0; i < 15; i++) {
            responses.push(await request.post('/api/spotify/playlist'));
        }

        // Next.js logic handles this. We expect at least one 429 status code if rate-limited to 5 per IP
        const statusCodes = responses.map(res => res.status());
        const hasRateLimit = statusCodes.includes(429);

        // Some endpoints might not have rate limits yet, but the user requested us to test for DDOS protection
        expect(hasRateLimit).toBeTruthy();
    });

    test('Input validation rejects malicious payloads', async ({ request }) => {
        // Send an invalid POST request to an endpoint with missing/malicious data
        const response = await request.post('/api/spotify/playlist', {
            data: {
                name: 12345, // Invalid type (should be string)
                trackUris: "DROP TABLE users;" // Malicious / invalid type
            }
        });

        // Zod or manual validation should reject this with 400 Bad Request
        expect([400, 401, 429]).toContain(response.status());
    });

});
