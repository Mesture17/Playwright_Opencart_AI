import { expect, test } from '@playwright/test';
import dotenv from 'dotenv';
import { Routes } from '../../api/endpoints/routes';
import { RandomDataUtil } from '../../utils/dataGenerator';
import {
    buildRoute,
    expectIdsSorted,
    expectMatchesSchema,
    expectOptionalDeleteBody,
    readResourceId
} from './apiTestUtils';

dotenv.config();

test.describe('FakeStore Users API Tests', () => {
    // ---------------------------------------------------------
    // Configuration
    // ---------------------------------------------------------

    const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
    const USER_ID = Number(process.env.USER_ID ?? 1);
    const LIMIT = Number(process.env.LIMIT ?? 3);

    // ---------------------------------------------------------
    // GET - Users
    // ---------------------------------------------------------

    test('GET - All users @master @sanity @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_USERS}`);

        expect(response.status()).toBe(200);
        const users = await response.json();

        expect(Array.isArray(users)).toBeTruthy();
        expect(users.length, 'At least one user should be returned').toBeGreaterThan(0);
    });

    test('GET - User by ID @master @sanity @api', async ({ request }) => {
        const route = buildRoute(Routes.GET_USER_BY_ID, { id: USER_ID });
        const response = await request.get(`${BASE_URL}${route}`);

        expect(response.status()).toBe(200);
        const user = await response.json();

        expect(user.id).toBe(USER_ID);
        expect(user).toEqual(expect.objectContaining({
            email: expect.any(String),
            username: expect.any(String),
            name: expect.any(Object)
        }));
    });

    test('GET - Users with limit @master @sanity @api', async ({ request }) => {
        const route = buildRoute(Routes.GET_USERS_WITH_LIMIT, { limit: LIMIT });
        const response = await request.get(`${BASE_URL}${route}`);

        expect(response.status()).toBe(200);
        const users = await response.json();

        expect(Array.isArray(users)).toBeTruthy();
        expect(users.length, 'User count should match the requested limit').toBe(LIMIT);
    });

    test('GET - Users sorted ascending @master @regression @api', async ({ request }) => {
        const route = buildRoute(Routes.GET_USERS_SORTED, { order: 'asc' });
        const response = await request.get(`${BASE_URL}${route}`);

        expect(response.status()).toBe(200);
        const users = await response.json();
        const ids = users.map((user: { id: number }) => user.id);

        expectIdsSorted(ids, 'asc');
    });

    test('GET - Users sorted descending @master @regression @api', async ({ request }) => {
        const route = buildRoute(Routes.GET_USERS_SORTED, { order: 'desc' });
        const response = await request.get(`${BASE_URL}${route}`);

        expect(response.status()).toBe(200);
        const users = await response.json();
        const ids = users.map((user: { id: number }) => user.id);

        expectIdsSorted(ids, 'desc');
    });

    // ---------------------------------------------------------
    // POST - User
    // ---------------------------------------------------------

    test('POST - Create user @master @regression @api', async ({ request }) => {
        const payload = RandomDataUtil.generateUserPayload();
        const response = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, {
            data: payload
        });

        expect(response.status()).toBe(201);
        const created = await response.json();
        const userId = readResourceId(created, 'user');

        expect(created).toEqual(expect.objectContaining({ id: expect.any(Number) }));

        const cleanupRoute = buildRoute(Routes.DELETE_USER, { id: userId });
        const cleanupResponse = await request.delete(`${BASE_URL}${cleanupRoute}`);
        expect(cleanupResponse.status(), 'Created user cleanup should succeed').toBe(200);
        await expectOptionalDeleteBody(cleanupResponse, userId);
    });

    // ---------------------------------------------------------
    // PUT - User
    // ---------------------------------------------------------

    test('PUT - Update user @master @regression @api', async ({ request }) => {
        const route = buildRoute(Routes.UPDATE_USER, { id: USER_ID });
        const payload = RandomDataUtil.generateUserUpdatePayload();
        const response = await request.put(`${BASE_URL}${route}`, { data: payload });

        expect(response.status()).toBe(200);
        const updated = await response.json();

        expect(updated).toEqual(expect.objectContaining(payload));
    });

    // ---------------------------------------------------------
    // DELETE - User
    // ---------------------------------------------------------

    test('DELETE - User by ID @master @regression @api', async ({ request }) => {
        const route = buildRoute(Routes.DELETE_USER, { id: USER_ID });
        const response = await request.delete(`${BASE_URL}${route}`);

        expect(response.status()).toBe(200);
        await expectOptionalDeleteBody(response, USER_ID);
    });

    // ---------------------------------------------------------
    // Schema validation
    // ---------------------------------------------------------

    test('GET - User response schema @master @regression @api', async ({ request }) => {
        const route = buildRoute(Routes.GET_USER_BY_ID, { id: USER_ID });
        const response = await request.get(`${BASE_URL}${route}`);

        expect(response.status()).toBe(200);
        expectMatchesSchema(await response.json(), 'user_api_schema.json');
    });
});

test.describe.serial('FakeStore User CRUD Workflow @api', () => {
    const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;

    test('POST, PUT, DELETE - User CRUD workflow @master @regression @api', async ({ request }) => {
        const createPayload = RandomDataUtil.generateUserPayload();
        const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, {
            data: createPayload
        });

        expect(createResponse.status()).toBe(201);
        const created = await createResponse.json();
        const userId = readResourceId(created, 'user');

        expect(userId, 'Create response should provide the user ID for following operations').toBeTruthy();

        const updatePayload = RandomDataUtil.generateUserUpdatePayload();
        const updateRoute = buildRoute(Routes.UPDATE_USER, { id: userId });
        const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, {
            data: updatePayload
        });

        expect(updateResponse.status()).toBe(200);
        const updated = await updateResponse.json();
        expect(updated).toEqual(expect.objectContaining(updatePayload));

        const deleteRoute = buildRoute(Routes.DELETE_USER, { id: userId });
        const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
        expect(deleteResponse.status()).toBe(200);
        await expectOptionalDeleteBody(deleteResponse, userId);
    });
});
