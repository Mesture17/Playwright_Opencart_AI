/**
 * Test Case: Add Product to Cart
 *
 * Tags: @master @sanity @regression @web
 *
 * Steps:
 * 1) Open the storefront and search for a known product
 * 2) Open its details page and verify the product
 * 3) Add the requested quantity to the cart
 * 4) Verify the add-to-cart confirmation, cart product, and quantity
 */

import { test, expect } from '../../fixtures/pageFixtures';
import { Helper } from '../../utils/helper';

test('Add Product to Cart @master @sanity @regression @web', async ({
    page,
    homePage,
    searchResultsPage,
    productPage,
    cartPage,
}) => {
    const product = Helper.getProductDetails();

    await test.step('1) Open the storefront and search for a known product', async () => {
        await expect(page).toHaveTitle('Your Store');
        await homePage.searchForProduct(product.productName);

        expect(await searchResultsPage.areResultsDisplayed()).toBeTruthy();
        expect(await searchResultsPage.isProductDisplayed(product.productName)).toBeTruthy();
    });

    await test.step('2) Open the product details page and verify the product', async () => {
        await searchResultsPage.openProduct(product.productName);
        expect(await productPage.isProductDisplayed(product.productName)).toBeTruthy();
        expect(await productPage.isInStock()).toBeTruthy();
    });

    await test.step('3) Add the requested quantity to the shopping cart', async () => {
        await productPage.setQuantity(product.productQuantity);
        await productPage.addToCart();
        expect(await productPage.isAddedConfirmationDisplayed()).toBeTruthy();
    });

    await test.step('4) Verify the product and quantity in the cart', async () => {
        await productPage.openShoppingCart();

        expect(await cartPage.isProductInCart(product.productName)).toBeTruthy();
        expect(await cartPage.getProductQuantity(product.productName)).toBe(product.productQuantity);
    });

    console.log('✅ Add Product to Cart completed successfully.');
});
