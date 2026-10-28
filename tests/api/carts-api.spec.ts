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

test.describe('FakeStore Carts API Tests', () => {
    // ---------------------------------------------------------
    // Configuration
    // ---------------------------------------------------------

    const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
    const USER_ID = Number(process.env.USER_ID ?? 1);
    const CART_ID = Number(process.env.CART_ID ?? 1);
    const LIMIT = Number(process.env.LIMIT ?? 3);
    const START_DATE = process.env.START_DATE ?? '';
    const END_DATE = process.env.END_DATE ?? '';

    // ---------------------------------------------------------
    // GET - Carts
    // ---------------------------------------------------------

    test('GET - All carts @master @sanity @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CARTS}`);

        expect(response.status()).toBe(200);
        const carts = await response.json();

        expect(Array.isArray(carts)).toBeTruthy();
        expect(carts.length, 'At least one cart should be returned').toBeGreaterThan(0);
    });

    test('GET - Cart by ID @master @sanity @api', async ({ request }) => {
        const route = buildRoute(Routes.GET_CART_BY_ID, { id: CART_ID });
        const response = await request.get(`${BASE_URL}${route}`);

        expect(response.status()).toBe(200);
        const cart = await response.json();

        expect(cart.id).toBe(CART_ID);
        expect(cart).toEqual(expect.objectContaining({
            userId: expect.any(Number),
            date: expect.any(String),
            products: expect.any(Array)
        }));
    });

    test('GET - Carts by date range @master @regression @api', async ({ request }) => {
        expect(START_DATE, 'START_DATE must be configured in .env').toBeTruthy();
        expect(END_DATE, 'END_DATE must be configured in .env').toBeTruthy();

        const route = buildRoute(Routes.GET_CARTS_BY_DATE_RANGE, {
            startdate: START_DATE,
            enddate: END_DATE
        });
        const response = await request.get(`${BASE_URL}${route}`);

        expect(response.status()).toBe(200);
        const carts = await response.json();

        expect(Array.isArray(carts)).toBeTruthy();
        const start = new Date(START_DATE).getTime();
        const end = new Date(END_DATE).getTime();
        for (const cart of carts) {
            const cartDate = new Date(cart.date).getTime();
            expect(cartDate, `Cart ${cart.id} should be on or after START_DATE`).toBeGreaterThanOrEqual(start);
            expect(cartDate, `Cart ${cart.id} should be on or before END_DATE`).toBeLessThanOrEqual(end);
        }
    });

    test('GET - Carts for a user @master @regression @api', async ({ request }) => {
        const route = buildRoute(Routes.GET_USER_CART, { userId: USER_ID });
        const response = await request.get(`${BASE_URL}${route}`);

        expect(response.status()).toBe(200);
        const carts = await response.json();

        expect(Array.isArray(carts)).toBeTruthy();
        for (const cart of carts) {
            expect(cart.userId).toBe(USER_ID);
        }
    });

    test('GET - Carts with limit @master @sanity @api', async ({ request }) => {
        const route = buildRoute(Routes.GET_CARTS_WITH_LIMIT, { limit: LIMIT });
        const response = await request.get(`${BASE_URL}${route}`);

        expect(response.status()).toBe(200);
        const carts = await response.json();

        expect(Array.isArray(carts)).toBeTruthy();
        expect(carts.length, 'Cart count should match the requested limit').toBe(LIMIT);
    });

    test('GET - Carts sorted ascending @master @regression @api', async ({ request }) => {
        const route = buildRoute(Routes.GET_CARTS_SORTED, { order: 'asc' });
        const response = await request.get(`${BASE_URL}${route}`);

        expect(response.status()).toBe(200);
        const carts = await response.json();
        const ids = carts.map((cart: { id: number }) => cart.id);

        expectIdsSorted(ids, 'asc');
    });

    test('GET - Carts sorted descending @master @regression @api', async ({ request }) => {
        const route = buildRoute(Routes.GET_CARTS_SORTED, { order: 'desc' });
        const response = await request.get(`${BASE_URL}${route}`);

        expect(response.status()).toBe(200);
        const carts = await response.json();
        const ids = carts.map((cart: { id: number }) => cart.id);

        expectIdsSorted(ids, 'desc');
    });

    // ---------------------------------------------------------
    // POST - Cart
    // ---------------------------------------------------------

    test('POST - Create cart @master @regression @api', async ({ request }) => {
        const payload = RandomDataUtil.generateCartPayload(USER_ID);
        const response = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, {
            data: payload
        });

        expect(response.status()).toBe(201);
        const created = await response.json();
        const cartId = readResourceId(created, 'cart');

        expect(created.userId).toBe(USER_ID);
        expect(created.products).toEqual(payload.products);

        const cleanupRoute = buildRoute(Routes.DELETE_CART, { id: cartId });
        const cleanupResponse = await request.delete(`${BASE_URL}${cleanupRoute}`);
        expect(cleanupResponse.status(), 'Created cart cleanup should succeed').toBe(200);
        await expectOptionalDeleteBody(cleanupResponse, cartId);
    });

    // ---------------------------------------------------------
    // PUT - Cart
    // ---------------------------------------------------------

    test('PUT - Update cart @master @regression @api', async ({ request }) => {
        const route = buildRoute(Routes.UPDATE_CART, { id: CART_ID });
        const payload = RandomDataUtil.generateUpdatedCartPayload(USER_ID);
        const response = await request.put(`${BASE_URL}${route}`, { data: payload });

        expect(response.status()).toBe(200);
        const updated = await response.json();

        expect(updated.id).toBe(CART_ID);
        expect(updated.userId).toBe(USER_ID);
        expect(updated.products).toEqual(payload.products);
    });

    // ---------------------------------------------------------
    // DELETE - Cart
    // ---------------------------------------------------------

    test('DELETE - Cart by ID @master @regression @api', async ({ request }) => {
        const route = buildRoute(Routes.DELETE_CART, { id: CART_ID });
        const response = await request.delete(`${BASE_URL}${route}`);

        expect(response.status()).toBe(200);
        await expectOptionalDeleteBody(response, CART_ID);
    });

    // ---------------------------------------------------------
    // Schema validation
    // ---------------------------------------------------------

    test('GET - Cart response schema @master @regression @api', async ({ request }) => {
        const route = buildRoute(Routes.GET_CART_BY_ID, { id: CART_ID });
        const response = await request.get(`${BASE_URL}${route}`);

        expect(response.status()).toBe(200);
        expectMatchesSchema(await response.json(), 'cart_api_schema.json');
    });
});

test.describe.serial('FakeStore Cart CRUD Workflow @api', () => {
    const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
    const USER_ID = Number(process.env.USER_ID ?? 1);

    test('POST, PUT, DELETE - Cart CRUD workflow @master @regression @api', async ({ request }) => {
        const createPayload = RandomDataUtil.generateCartPayload(USER_ID);
        const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, {
            data: createPayload
        });

        expect(createResponse.status()).toBe(201);
        const created = await createResponse.json();
        const cartId = readResourceId(created, 'cart');

        expect(cartId, 'Create response should provide the cart ID for following operations').toBeTruthy();
        expect(created.userId).toBe(USER_ID);
        expect(created.products).toEqual(createPayload.products);

        const updatePayload = RandomDataUtil.generateUpdatedCartPayload(USER_ID);
        const updateRoute = buildRoute(Routes.UPDATE_CART, { id: cartId });
        const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, {
            data: updatePayload
        });

        expect(updateResponse.status()).toBe(200);
        const updated = await updateResponse.json();
        expect(updated.id).toBe(cartId);
        expect(updated.userId).toBe(USER_ID);
        expect(updated.products).toEqual(updatePayload.products);

        const deleteRoute = buildRoute(Routes.DELETE_CART, { id: cartId });
        const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
        expect(deleteResponse.status()).toBe(200);
        await expectOptionalDeleteBody(deleteResponse, cartId);
    });
});
