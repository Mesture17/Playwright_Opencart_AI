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

test.describe('FakeStore Products API Tests', () => {
    // ---------------------------------------------------------
    // Configuration
    // ---------------------------------------------------------

    const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
    const PRODUCT_ID = Number(process.env.PRODUCT_ID ?? 1);
    const LIMIT = Number(process.env.LIMIT ?? 3);
    const CATEGORY = 'electronics';

    // ---------------------------------------------------------
    // GET - Products
    // ---------------------------------------------------------

    test('GET - All products @master @sanity @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_PRODUCTS}`);

        expect(response.status()).toBe(200);
        const products = await response.json();

        expect(Array.isArray(products), 'Products response should be an array').toBeTruthy();
        expect(products.length, 'At least one product should be returned').toBeGreaterThan(0);

        for (const product of products) {
            expect(product).toEqual(expect.objectContaining({
                id: expect.any(Number),
                title: expect.any(String),
                price: expect.any(Number),
                category: expect.any(String),
                image: expect.any(String)
            }));
        }
    });

    test('GET - Product by ID @master @sanity @api', async ({ request }) => {
        const route = buildRoute(Routes.GET_PRODUCT_BY_ID, { id: PRODUCT_ID });
        const response = await request.get(`${BASE_URL}${route}`);

        expect(response.status()).toBe(200);
        const product = await response.json();

        expect(product.id).toBe(PRODUCT_ID);
        expect(product).toEqual(expect.objectContaining({
            title: expect.any(String),
            price: expect.any(Number),
            category: expect.any(String),
            image: expect.any(String)
        }));
    });

    test('GET - Products with limit @master @sanity @api', async ({ request }) => {
        const route = buildRoute(Routes.GET_PRODUCTS_WITH_LIMIT, { limit: LIMIT });
        const response = await request.get(`${BASE_URL}${route}`);

        expect(response.status()).toBe(200);
        const products = await response.json();

        expect(Array.isArray(products)).toBeTruthy();
        expect(products.length, 'Product count should match the requested limit').toBe(LIMIT);
    });

    test('GET - Products sorted ascending @master @regression @api', async ({ request }) => {
        const route = buildRoute(Routes.GET_PRODUCTS_SORTED, { order: 'asc' });
        const response = await request.get(`${BASE_URL}${route}`);

        expect(response.status()).toBe(200);
        const products = await response.json();
        const ids = products.map((product: { id: number }) => product.id);

        expectIdsSorted(ids, 'asc');
    });

    test('GET - Products sorted descending @master @regression @api', async ({ request }) => {
        const route = buildRoute(Routes.GET_PRODUCTS_SORTED, { order: 'desc' });
        const response = await request.get(`${BASE_URL}${route}`);

        expect(response.status()).toBe(200);
        const products = await response.json();
        const ids = products.map((product: { id: number }) => product.id);

        expectIdsSorted(ids, 'desc');
    });

    test('GET - All product categories @master @sanity @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CATEGORIES}`);

        expect(response.status()).toBe(200);
        const categories = await response.json();

        expect(Array.isArray(categories)).toBeTruthy();
        expect(categories.length, 'At least one category should be returned').toBeGreaterThan(0);
    });

    test('GET - Products by category @master @regression @api', async ({ request }) => {
        const route = buildRoute(Routes.GET_PRODUCTS_BY_CATEGORY, { category: CATEGORY });
        const response = await request.get(`${BASE_URL}${route}`);

        expect(response.status()).toBe(200);
        const products = await response.json();

        expect(Array.isArray(products)).toBeTruthy();
        for (const product of products) {
            expect(product.category).toBe(CATEGORY);
        }
    });

    // ---------------------------------------------------------
    // POST - Product
    // ---------------------------------------------------------

    test('POST - Create product @master @regression @api', async ({ request }) => {
        const payload = RandomDataUtil.generateProductPayload();
        const response = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, {
            data: payload
        });

        expect(response.status()).toBe(201);
        const created = await response.json();
        const productId = readResourceId(created, 'product');

        expect(created).toEqual(expect.objectContaining(payload));

        const cleanupRoute = buildRoute(Routes.DELETE_PRODUCT, { id: productId });
        const cleanupResponse = await request.delete(`${BASE_URL}${cleanupRoute}`);
        expect(cleanupResponse.status(), 'Created product cleanup should succeed').toBe(200);
        await expectOptionalDeleteBody(cleanupResponse, productId);
    });

    // ---------------------------------------------------------
    // PUT - Product
    // ---------------------------------------------------------

    test('PUT - Update product @master @regression @api', async ({ request }) => {
        const route = buildRoute(Routes.UPDATE_PRODUCT, { id: PRODUCT_ID });
        const payload = RandomDataUtil.generateUpdatedProductPayload();
        const response = await request.put(`${BASE_URL}${route}`, { data: payload });

        expect(response.status()).toBe(200);
        const updated = await response.json();

        expect(updated.id).toBe(PRODUCT_ID);
        expect(updated).toEqual(expect.objectContaining(payload));
    });

    // ---------------------------------------------------------
    // DELETE - Product
    // ---------------------------------------------------------

    test('DELETE - Product by ID @master @regression @api', async ({ request }) => {
        const route = buildRoute(Routes.DELETE_PRODUCT, { id: PRODUCT_ID });
        const response = await request.delete(`${BASE_URL}${route}`);

        expect(response.status()).toBe(200);
        await expectOptionalDeleteBody(response, PRODUCT_ID);
    });

    // ---------------------------------------------------------
    // Schema validation
    // ---------------------------------------------------------

    test('GET - Product response schema @master @regression @api', async ({ request }) => {
        const route = buildRoute(Routes.GET_PRODUCT_BY_ID, { id: PRODUCT_ID });
        const response = await request.get(`${BASE_URL}${route}`);

        expect(response.status()).toBe(200);
        expectMatchesSchema(await response.json(), 'product_api_schema.json');
    });
});

test.describe.serial('FakeStore Product CRUD Workflow @api', () => {
    const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;

    test('POST, PUT, DELETE - Product CRUD workflow @master @regression @api', async ({ request }) => {
        const createPayload = RandomDataUtil.generateProductPayload();
        const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, {
            data: createPayload
        });

        expect(createResponse.status()).toBe(201);
        const created = await createResponse.json();
        const productId = readResourceId(created, 'product');

        expect(productId, 'Create response should provide the product ID for following operations').toBeTruthy();

        const updatePayload = RandomDataUtil.generateUpdatedProductPayload();
        const updateRoute = buildRoute(Routes.UPDATE_PRODUCT, { id: productId });
        const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, {
            data: updatePayload
        });

        expect(updateResponse.status()).toBe(200);
        const updated = await updateResponse.json();
        expect(updated.id).toBe(productId);
        expect(updated).toEqual(expect.objectContaining(updatePayload));

        const deleteRoute = buildRoute(Routes.DELETE_PRODUCT, { id: productId });
        const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
        expect(deleteResponse.status()).toBe(200);
        await expectOptionalDeleteBody(deleteResponse, productId);
    });
});
