/**
 * Test Case: Invalid Login Flow
 *
 * Tags: @master @sanity @regression @web
 *
 * Steps:
 * 1) Open the storefront and navigate to My Account → Login
 * 2) Submit invalid customer credentials
 * 3) Verify login is rejected and the expected warning is displayed
 * 4) Verify unauthenticated account navigation remains available
 */

import { test, expect } from '../../fixtures/pageFixtures';
import { RandomDataUtil } from '../../utils/dataGenerator';

test('Invalid Login Flow @master @sanity @regression @web', async ({
    page,
    homePage,
    loginPage,
}) => {
    const invalidCredentials = RandomDataUtil.generateInvalidLoginPayload();

    await test.step('1) Open the storefront and navigate to the login page', async () => {
        await expect(page).toHaveTitle('Your Store');
        await homePage.navigateToLogin();
        expect(await loginPage.isLoginFormDisplayed()).toBeTruthy();
    });

    await test.step('2) Submit invalid customer credentials', async () => {
        await loginPage.login(invalidCredentials.username, invalidCredentials.password);
    });

    await test.step('3) Verify login failed and the expected warning is displayed', async () => {
        expect(await loginPage.isInvalidCredentialsWarningDisplayed()).toBeTruthy();
        await expect(page).toHaveURL(/route=account\/login/);
    });

    await test.step('4) Verify the customer is not authenticated', async () => {
        await homePage.openAccountMenu();
        expect(await homePage.isLoginOptionVisible()).toBeTruthy();
        expect(await homePage.isLogoutOptionVisible()).toBeFalsy();
    });

    console.log('✅ Invalid Login Flow completed successfully.');
});
