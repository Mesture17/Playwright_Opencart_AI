import { expect, test } from '@playwright/test';
import dotenv from 'dotenv';
import { Routes } from '../../api/endpoints/routes';
import { RandomDataUtil } from '../../utils/dataGenerator';

dotenv.config();

test.describe('FakeStore Authentication API Tests', () => {
    // ---------------------------------------------------------
    // Configuration
    // ---------------------------------------------------------

    const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
    const USERNAME = process.env.USERNAME ?? '';
    const PASSWORD = process.env.PASSWORD ?? '';

    // ---------------------------------------------------------
    // POST - Authentication
    // ---------------------------------------------------------

    test('POST - Login with valid credentials @master @sanity @api', async ({ request }) => {
        expect(USERNAME, 'USERNAME must be configured in .env').toBeTruthy();
        expect(PASSWORD, 'PASSWORD must be configured in .env').toBeTruthy();

        const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
            data: { username: USERNAME, password: PASSWORD }
        });

        expect(response.status(), 'Successful login should return status 201').toBe(201);

        const body = await response.json();

        expect(body).toHaveProperty('token');
        expect(typeof body.token).toBe('string');
        expect(body.token.length, 'Authentication token should not be empty').toBeGreaterThan(0);
    });

    test('POST - Login with invalid credentials @master @regression @api', async ({ request }) => {
        const payload = RandomDataUtil.generateInvalidLoginPayload();
        const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
            data: payload
        });

        expect(response.status(), 'Invalid login should return status 401').toBe(401);

        const message = await response.text();

        expect(message).toBe('username or password is incorrect');
    });
});
