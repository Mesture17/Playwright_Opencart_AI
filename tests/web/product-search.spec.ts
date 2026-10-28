/**
 * Test Case: Product Search Flow
 *
 * Tags: @master @sanity @regression @web
 *
 * Steps:
 * 1) Open the storefront and locate the product search field
 * 2) Search for the configured known product
 * 3) Verify the search results page and matching product name
 */

import { test, expect } from '../../fixtures/pageFixtures';
import { Helper } from '../../utils/helper';

test('Product Search Flow @master @sanity @regression @web', async ({
    page,
    homePage,
    searchResultsPage,
}) => {
    const { productName } = Helper.getProductDetails();

    await test.step('1) Open the storefront', async () => {
        await expect(page).toHaveTitle('Your Store');
    });

    await test.step('2) Search for the known product', async () => {
        await homePage.searchForProduct(productName);
    });

    await test.step('3) Verify the results page and matching product', async () => {
        await expect(page).toHaveTitle(`Search - ${productName}`);
        expect(await searchResultsPage.areResultsDisplayed()).toBeTruthy();
        expect(await searchResultsPage.isProductDisplayed(productName)).toBeTruthy();
    });

    console.log('✅ Product Search Flow completed successfully.');
});
