import Ajv from 'ajv';
import { expect, type APIResponse } from '@playwright/test';
import { resolve } from 'path';
import { DataProvider } from '../../utils/DataReader';

export function buildRoute(
    route: string,
    params: Record<string, string | number>
): string {
    return route.replace(/\{(\w+)\}/g, (_placeholder, key: string) => {
        const value = params[key];

        if (value === undefined) {
            throw new Error(`Missing value for route parameter: ${key}`);
        }

        return encodeURIComponent(String(value));
    });
}

export function expectIdsSorted(ids: number[], direction: 'asc' | 'desc'): void {
    const sortedIds = [...ids].sort((left, right) =>
        direction === 'asc' ? left - right : right - left
    );

    const sortOrder = direction === 'asc' ? 'ascending' : 'descending';
    expect(ids, `IDs should be sorted in ${sortOrder} order`).toEqual(sortedIds);
}

export function readResourceId(body: unknown, resourceName: string): number {
    if (
        typeof body !== 'object' ||
        body === null ||
        !('id' in body) ||
        typeof body.id !== 'number'
    ) {
        throw new Error(`Create response did not contain a numeric ${resourceName} ID`);
    }

    return body.id;
}

export function expectMatchesSchema(body: unknown, schemaFile: string): void {
    const schema = DataProvider.readJson(
        resolve(__dirname, '../../api/schemas', schemaFile)
    );
    const validate = new Ajv().compile(schema);
    const isValid = validate(body);

    expect(
        isValid,
        `Response should match ${schemaFile}: ${JSON.stringify(validate.errors)}`
    ).toBeTruthy();
}

export async function expectOptionalDeleteBody(
    response: APIResponse,
    expectedId: number
): Promise<void> {
    const responseText = await response.text();

    if (!responseText.trim()) {
        return;
    }

    const body: unknown = JSON.parse(responseText);
    if (body !== null) {
        expect(body).toEqual(expect.objectContaining({ id: expectedId }));
    }
}
