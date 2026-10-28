import { Locator, Page } from '@playwright/test';

export class LoginPage {
    private readonly page: Page;

    // Locators
    private readonly emailField: Locator;
    private readonly passwordField: Locator;
    private readonly loginButton: Locator;
    private readonly invalidCredentialsWarning: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with selectors verified in the login form
        this.emailField = page.getByRole('textbox', { name: 'E-Mail Address', exact: true });
        this.passwordField = page.getByRole('textbox', { name: 'Password', exact: true });
        this.loginButton = page.getByRole('button', { name: 'Login', exact: true });
        this.invalidCredentialsWarning = page.getByText(
            'Warning: No match for E-Mail Address and/or Password.',
            { exact: true },
        );
    }

    /**
     * Checks that the returning-customer login form is displayed.
     * @returns Promise<boolean> - true when the email field is visible
     */
    async isLoginFormDisplayed(): Promise<boolean> {
        await this.emailField.waitFor({ state: 'visible' });
        return true;
    }

    /**
     * Authenticates a customer using the supplied credentials.
     * @param email - Customer email address
     * @param password - Customer password
     */
    async login(email: string, password: string): Promise<void> {
        await this.emailField.fill(email);
        await this.passwordField.fill(password);
        await this.loginButton.click();
    }

    /**
     * Checks whether the invalid-credentials warning is displayed.
     * @returns Promise<boolean> - true when the warning is visible
     */
    async isInvalidCredentialsWarningDisplayed(): Promise<boolean> {
        await this.invalidCredentialsWarning.waitFor({ state: 'visible' });
        return true;
    }
}
