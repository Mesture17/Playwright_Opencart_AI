import { Locator, Page } from '@playwright/test';

export class HomePage {
    private readonly page: Page;

    // Locators
    private readonly accountMenu: Locator;
    private readonly registerLink: Locator;
    private readonly loginLink: Locator;
    private readonly logoutLink: Locator;
    private readonly searchField: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with selectors verified in the storefront
        this.accountMenu = page.getByRole('link', { name: /My Account/ }).first();
        this.registerLink = page.getByRole('link', { name: 'Register', exact: true });
        this.loginLink = page.getByRole('link', { name: 'Login', exact: true }).first();
        this.logoutLink = page.getByRole('link', { name: 'Logout', exact: true }).first();
        this.searchField = page.getByRole('textbox', { name: 'Search', exact: true });
    }

    /**
     * Opens the My Account navigation menu.
     */
    async openAccountMenu(): Promise<void> {
        await this.accountMenu.click();
    }

    /**
     * Navigates to the registration page from the account menu.
     */
    async navigateToRegistration(): Promise<void> {
        if (!(await this.registerLink.isVisible())) {
            await this.openAccountMenu();
        }
        await this.registerLink.click();
    }

    /**
     * Navigates to the login page from the account menu.
     */
    async navigateToLogin(): Promise<void> {
        if (!(await this.loginLink.isVisible())) {
            await this.openAccountMenu();
        }
        await this.loginLink.click();
    }

    /**
     * Checks whether the login option is visible in the account menu.
     * @returns Promise<boolean> - true when the login option is visible
     */
    async isLoginOptionVisible(): Promise<boolean> {
        return this.loginLink.isVisible();
    }

    /**
     * Checks whether the logout option is visible in the account menu.
     * @returns Promise<boolean> - true when the logout option is visible
     */
    async isLogoutOptionVisible(): Promise<boolean> {
        return this.logoutLink.isVisible();
    }

    /**
     * Searches the storefront for a product.
     * @param productName - Product name to search for
     */
    async searchForProduct(productName: string): Promise<void> {
        await this.searchField.fill(productName);
        await this.searchField.press('Enter');
    }
}
