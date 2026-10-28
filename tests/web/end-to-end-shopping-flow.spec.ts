/**
 * Test Case: End-to-End Shopping Flow
 *
 * Tags: @master @end-to-end @web
 *
 * Steps:
 * 1) Open the storefront and register a unique customer
 * 2) Verify registration, then log out
 * 3) Log in with the new customer credentials
 * 4) Search for an in-stock product and add it to the cart
 * 5) Verify the cart product, quantity, price, total, and absence of page errors
 */

import { test, expect } from '../../fixtures/pageFixtures';
import { RandomDataUtil } from '../../utils/dataGenerator';
import { Helper } from '../../utils/helper';

test('End-to-End Shopping Flow @master @end-to-end @web', async ({
    page,
    homePage,
    registerPage,
    loginPage,
    accountPage,
    logoutPage,
    searchResultsPage,
    productPage,
    cartPage,
}) => {
    const customer = {
        firstName: RandomDataUtil.getFirstName(),
        lastName: RandomDataUtil.getLastName(),
        email: RandomDataUtil.getEmail().replace('@', `.${Date.now()}@`),
        telephone: RandomDataUtil.getPhoneNumber(),
        password: RandomDataUtil.getPassword(12),
    };
    const product = Helper.getProductDetails();
    const pageErrors: string[] = [];

    page.on('pageerror', (error) => pageErrors.push(error.message));

    await test.step('1) Open the storefront', async () => {
        await expect(page).toHaveTitle('Your Store');
    });

    await test.step('2) Register a new customer and verify the account', async () => {
        await homePage.navigateToRegistration();
        expect(await registerPage.isRegistrationFormDisplayed()).toBeTruthy();

        await registerPage.register(customer);
        expect(await registerPage.isAccountCreatedConfirmationDisplayed()).toBeTruthy();

        await registerPage.continueToAccount();
        expect(await accountPage.isDashboardDisplayed()).toBeTruthy();
    });

    await test.step('3) Log out and verify the logout confirmation', async () => {
        await accountPage.logout();
        expect(await logoutPage.isLogoutConfirmationDisplayed()).toBeTruthy();
        expect(await logoutPage.isLoggedOutMessageDisplayed()).toBeTruthy();

        await logoutPage.continueToStore();
        await homePage.openAccountMenu();
        expect(await homePage.isLoginOptionVisible()).toBeTruthy();
        expect(await homePage.isLogoutOptionVisible()).toBeFalsy();
    });

    await test.step('4) Log in again with the newly registered customer', async () => {
        await homePage.navigateToLogin();
        expect(await loginPage.isLoginFormDisplayed()).toBeTruthy();

        await loginPage.login(customer.email, customer.password);
        expect(await accountPage.isDashboardDisplayed()).toBeTruthy();
    });

    await test.step('5) Search for and open the known product', async () => {
        await homePage.searchForProduct(product.productName);
        expect(await searchResultsPage.areResultsDisplayed()).toBeTruthy();
        expect(await searchResultsPage.isProductDisplayed(product.productName)).toBeTruthy();

        await searchResultsPage.openProduct(product.productName);
        expect(await productPage.isProductDisplayed(product.productName)).toBeTruthy();
        expect(await productPage.isInStock()).toBeTruthy();
        expect(await productPage.getProductPrice()).toBe(product.totalPrice);
    });

    await test.step('6) Add the product and verify the shopping cart', async () => {
        await productPage.setQuantity(product.productQuantity);
        await productPage.addToCart();
        expect(await productPage.isAddedConfirmationDisplayed()).toBeTruthy();

        await productPage.openShoppingCart();
        expect(await cartPage.isProductInCart(product.productName)).toBeTruthy();
        expect(await cartPage.getProductQuantity(product.productName)).toBe(product.productQuantity);
        expect(await cartPage.getProductPrice(product.productName)).toBe(product.totalPrice);
        expect(await cartPage.getCartTotal()).toBe(product.totalPrice);
        expect(await cartPage.hasStockWarning()).toBeFalsy();
    });

    await test.step('7) Confirm the journey completed without page errors', async () => {
        expect(pageErrors).toEqual([]);
    });

    console.log('✅ End-to-End Shopping Flow completed successfully.');
});
