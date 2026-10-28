/**
 * Test Case: Logout Flow
 *
 * Tags: @master @sanity @regression @web
 *
 * Steps:
 * 1) Open the storefront and log in with the configured customer credentials
 * 2) Verify authentication and log out from the account area
 * 3) Verify the logout confirmation and continue to the homepage
 * 4) Verify that authenticated account options are no longer available
 */

import { test, expect } from '../../fixtures/pageFixtures';
import { Helper } from '../../utils/helper';

test('Logout Flow @master @sanity @regression @web', async ({
    page,
    homePage,
    loginPage,
    accountPage,
    logoutPage,
}) => {
    const { email, password } = Helper.getLoginDetails();

    await test.step('1) Open the storefront and log in with valid credentials', async () => {
        await expect(page).toHaveTitle('Your Store');
        await homePage.navigateToLogin();
        expect(await loginPage.isLoginFormDisplayed()).toBeTruthy();

        await loginPage.login(email, password);
        expect(await accountPage.isDashboardDisplayed()).toBeTruthy();
    });

    await test.step('2) Log out from the customer account', async () => {
        await accountPage.logout();
        expect(await logoutPage.isLogoutConfirmationDisplayed()).toBeTruthy();
        expect(await logoutPage.isLoggedOutMessageDisplayed()).toBeTruthy();
    });

    await test.step('3) Continue from the logout confirmation to the homepage', async () => {
        await logoutPage.continueToStore();
        await expect(page).toHaveTitle('Your Store');
    });

    await test.step('4) Verify authenticated account options are unavailable', async () => {
        await homePage.openAccountMenu();
        expect(await homePage.isLoginOptionVisible()).toBeTruthy();
        expect(await homePage.isLogoutOptionVisible()).toBeFalsy();
    });

    console.log('✅ Logout Flow completed successfully.');
});
