import { Locator, Page } from '@playwright/test';

export interface RegistrationData {
    firstName: string;
    lastName: string;
    email: string;
    telephone: string;
    password: string;
}

export class RegisterPage {
    private readonly page: Page;

    // Locators
    private readonly firstNameField: Locator;
    private readonly lastNameField: Locator;
    private readonly emailField: Locator;
    private readonly telephoneField: Locator;
    private readonly passwordField: Locator;
    private readonly passwordConfirmField: Locator;
    private readonly privacyPolicyCheckbox: Locator;
    private readonly submitButton: Locator;
    private readonly continueLink: Locator;
    private readonly confirmationHeading: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with selectors verified in the registration form
        this.firstNameField = page.getByPlaceholder('First Name');
        this.lastNameField = page.getByPlaceholder('Last Name');
        this.emailField = page.getByPlaceholder('E-Mail');
        this.telephoneField = page.getByPlaceholder('Telephone');
        this.passwordField = page.getByPlaceholder('Password', { exact: true });
        this.passwordConfirmField = page.getByPlaceholder('Password Confirm');
        this.privacyPolicyCheckbox = page.getByRole('checkbox');
        this.submitButton = page.getByRole('button', { name: 'Continue', exact: true });
        this.continueLink = page.getByRole('link', { name: 'Continue', exact: true });
        this.confirmationHeading = page.getByRole('heading', {
            name: 'Your Account Has Been Created!',
            exact: true,
        });
    }

    /**
     * Checks that the registration form is displayed.
     * @returns Promise<boolean> - true when the first-name field is visible
     */
    async isRegistrationFormDisplayed(): Promise<boolean> {
        await this.firstNameField.waitFor({ state: 'visible' });
        return true;
    }

    /**
     * Fills and submits the new-customer registration form.
     * @param customer - Dynamically generated customer registration details
     */
    async register(customer: RegistrationData): Promise<void> {
        await this.firstNameField.fill(customer.firstName);
        await this.lastNameField.fill(customer.lastName);
        await this.emailField.fill(customer.email);
        await this.telephoneField.fill(customer.telephone);
        await this.passwordField.fill(customer.password);
        await this.passwordConfirmField.fill(customer.password);
        await this.privacyPolicyCheckbox.check();
        await this.submitButton.click();
    }

    /**
     * Checks whether registration reached the account-created confirmation.
     * @returns Promise<boolean> - true when the confirmation heading is visible
     */
    async isAccountCreatedConfirmationDisplayed(): Promise<boolean> {
        await this.confirmationHeading.waitFor({ state: 'visible' });
        return true;
    }

    /**
     * Continues from the registration confirmation to the customer account.
     */
    async continueToAccount(): Promise<void> {
        await this.continueLink.click();
    }
}
