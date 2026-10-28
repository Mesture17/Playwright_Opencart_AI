import { Locator, Page } from '@playwright/test';
import { LogoutPage } from './LogoutPage';

export class AccountPage {
    private readonly page: Page;

    // Locators
    private readonly dashboardHeading: Locator;
    private readonly logoutLink: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with selectors verified in account navigation
        this.dashboardHeading = page.getByRole('heading', { name: 'My Account', exact: true }).first();
        this.logoutLink = page
            .getByRole('complementary')
            .getByRole('link', { name: 'Logout', exact: true });
    }

    /**
     * Checks that the customer account dashboard is displayed.
     * @returns Promise<boolean> - true when the account heading is visible
     */
    async isDashboardDisplayed(): Promise<boolean> {
        await this.dashboardHeading.waitFor({ state: 'visible' });
        return true;
    }

    /**
     * Logs the customer out.
     * @returns Promise<LogoutPage> - Logout confirmation page object
     */
    async logout(): Promise<LogoutPage> {
        await this.logoutLink.click();
        return new LogoutPage(this.page);
    }
}
