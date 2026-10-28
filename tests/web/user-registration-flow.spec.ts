/**
 * Test Case: User Registration Flow
 *
 * Tags: @master @sanity @regression @web
 *
 * Steps:
 * 1) Open the storefront and navigate to My Account → Register
 * 2) Verify the registration form and submit unique customer details
 * 3) Verify the account-created confirmation
 * 4) Continue to My Account and verify the new account is accessible
 */

import { test, expect } from '../../fixtures/pageFixtures';
import { RandomDataUtil } from '../../utils/dataGenerator';

test('User Registration Flow @master @sanity @regression @web', async ({
    page,
    homePage,
    registerPage,
    accountPage,
}) => {
    const customer = RandomDataUtil.generateCustomerRegistrationPayload();
    customer.email = customer.email.replace('@', `.${Date.now()}@`);

    await test.step('1) Open the storefront and navigate to registration', async () => {
        await expect(page).toHaveTitle('Your Store');
        await homePage.navigateToRegistration();

        await expect(page).toHaveTitle('Register Account');
        expect(await registerPage.isRegistrationFormDisplayed()).toBeTruthy();
    });

    await test.step('2) Submit the registration form with unique customer data', async () => {
        await registerPage.register(customer);
    });

    await test.step('3) Verify the account-created confirmation', async () => {
        expect(await registerPage.isAccountCreatedConfirmationDisplayed()).toBeTruthy();
    });

    await test.step('4) Verify the new account is accessible from registration', async () => {
        await registerPage.continueToAccount();

        await expect(page).toHaveURL(/route=account\/account/);
        expect(await accountPage.isDashboardDisplayed()).toBeTruthy();
    });

    console.log('✅ User Registration Flow completed successfully.');
});
