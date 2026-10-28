import { Locator, Page } from '@playwright/test';
import { HomePage } from './HomePage';

export class LogoutPage {
    private readonly page: Page;

    // Locators
    private readonly confirmationHeading: Locator;
    private readonly confirmationMessage: Locator;
    private readonly continueLink: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with selectors verified on the logout page
        this.confirmationHeading = page.getByRole('heading', { name: 'Account Logout', exact: true });
        this.confirmationMessage = page.getByText(
            'You have been logged off your account. It is now safe to leave the computer.',
            { exact: true },
        );
        this.continueLink = page.getByRole('link', { name: 'Continue', exact: true });
    }

    /**
     * Checks whether the logout confirmation is displayed.
     * @returns Promise<boolean> - true when the confirmation text is visible
     */
    async isLogoutConfirmationDisplayed(): Promise<boolean> {
        await this.confirmationHeading.waitFor({ state: 'visible' });
        return true;
    }

    /**
     * Continues from the logout confirmation to the storefront home page.
     * @returns Promise<HomePage> - Storefront home page object
     */
    async continueToStore(): Promise<HomePage> {
        await this.continueLink.click();
        return new HomePage(this.page);
    }

    /**
     * Checks whether the logout confirmation message is displayed.
     * @returns Promise<boolean> - true when the logged-out message is visible
     */
    async isLoggedOutMessageDisplayed(): Promise<boolean> {
        await this.confirmationMessage.waitFor({ state: 'visible' });
        return true;
    }
}
