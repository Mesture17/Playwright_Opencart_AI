import { Locator, Page } from '@playwright/test';
import { CartPage } from './CartPage';

export class ProductPage {
    private readonly page: Page;

    // Locators
    private readonly productHeading: Locator;
    private readonly availability: Locator;
    private readonly priceHeading: Locator;
    private readonly quantityField: Locator;
    private readonly addToCartButton: Locator;
    private readonly addedConfirmation: Locator;
    private readonly shoppingCartLink: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with selectors verified on the product details page
        this.productHeading = page.getByRole('heading', { level: 1 });
        this.availability = page.getByText('Availability: In Stock', { exact: true });
        this.priceHeading = page.getByRole('heading', { level: 2 });
        this.quantityField = page.getByRole('textbox', { name: 'Qty', exact: true });
        this.addToCartButton = page.getByRole('button', { name: 'Add to Cart', exact: true });
        this.addedConfirmation = page.getByText(/Success: You have added/);
        this.shoppingCartLink = page.getByRole('link', { name: 'shopping cart', exact: true });
    }

    /**
     * Checks that the product details page is displayed.
     * @param productName - Expected product heading
     * @returns Promise<boolean> - true when the expected heading is visible
     */
    async isProductDisplayed(productName: string): Promise<boolean> {
        await this.productHeading.filter({ hasText: productName }).waitFor({ state: 'visible' });
        return true;
    }

    /**
     * Checks whether the selected product is in stock.
     * @returns Promise<boolean> - true when the storefront reports In Stock
     */
    async isInStock(): Promise<boolean> {
        await this.availability.waitFor({ state: 'visible' });
        return true;
    }

    /**
     * Reads the displayed product price.
     * @returns Promise<string> - Formatted product price
     */
    async getProductPrice(): Promise<string> {
        return (await this.priceHeading.innerText()).trim();
    }

    /**
     * Sets the quantity requested for the product.
     * @param quantity - Requested product quantity
     */
    async setQuantity(quantity: string): Promise<void> {
        await this.quantityField.fill(quantity);
    }

    /**
     * Adds the selected quantity of the product to the shopping cart.
     */
    async addToCart(): Promise<void> {
        await this.addToCartButton.click();
        await this.addedConfirmation.waitFor({ state: 'visible' });
    }

    /**
     * Checks whether the storefront confirms the product was added.
     * @returns Promise<boolean> - true when the success message is visible
     */
    async isAddedConfirmationDisplayed(): Promise<boolean> {
        return this.addedConfirmation.isVisible();
    }

    /**
     * Opens the shopping cart from the add-to-cart confirmation.
     * @returns Promise<CartPage> - Shopping cart page object
     */
    async openShoppingCart(): Promise<CartPage> {
        await this.shoppingCartLink.click();
        return new CartPage(this.page);
    }
}
