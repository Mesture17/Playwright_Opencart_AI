/**
 * Test Case: Valid Login Flow
 *
 * Tags: @master @sanity @regression @web
 *
 * Steps:
 * 1) Open the storefront and navigate to My Account → Login
 * 2) Verify the login form and submit configured valid credentials
 * 3) Verify redirect to My Account and the authenticated dashboard
 */

import { test, expect } from '../../fixtures/pageFixtures';
import { Helper } from '../../utils/helper';

test('Valid Login Flow @master @sanity @regression @web', async ({
    page,
    homePage,
    loginPage,
    accountPage,
}) => {
    const { email, password } = Helper.getLoginDetails();

    await test.step('1) Open the storefront and navigate to the login page', async () => {
        await expect(page).toHaveTitle('Your Store');
        await homePage.navigateToLogin();

        expect(await loginPage.isLoginFormDisplayed()).toBeTruthy();
        await expect(page).toHaveTitle('Account Login');
    });

    await test.step('2) Log in with the configured valid customer credentials', async () => {
        await loginPage.login(email, password);
    });

    await test.step('3) Verify redirect and authenticated account dashboard', async () => {
        await expect(page).toHaveURL(/route=account\/account/);
        expect(await accountPage.isDashboardDisplayed()).toBeTruthy();
    });

    console.log('✅ Valid Login Flow completed successfully.');
});
