import { Locator, Page } from '@playwright/test';

export class CartPage {
    private readonly page: Page;

    // Locators
    private readonly productTable: Locator;
    private readonly stockWarning: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with selectors verified on the shopping cart page
        this.productTable = page.getByRole('table').first();
        this.stockWarning = page.getByText(
            'Products marked with *** are not available in the desired quantity or not in stock!',
            { exact: true },
        );
    }

    private productRow(productName: string): Locator {
        return this.productTable.getByRole('row').filter({ hasText: productName });
    }

    /**
     * Checks whether the expected product appears in the cart.
     * @param productName - Product name to locate
     * @returns Promise<boolean> - true when the matching cart row is visible
     */
    async isProductInCart(productName: string): Promise<boolean> {
        await this.productRow(productName).waitFor({ state: 'visible' });
        return true;
    }

    /**
     * Reads the product quantity from its cart row.
     * @param productName - Product name in the cart
     * @returns Promise<string> - Displayed quantity
     */
    async getProductQuantity(productName: string): Promise<string> {
        return this.productRow(productName).getByRole('textbox').inputValue();
    }

    /**
     * Reads the unit price from the matching cart row.
     * @param productName - Product name in the cart
     * @returns Promise<string> - Formatted unit price
     */
    async getProductPrice(productName: string): Promise<string> {
        return this.productRow(productName).getByRole('cell').nth(4).innerText();
    }

    /**
     * Reads the cart's grand total, including applicable taxes.
     * @returns Promise<string> - Formatted cart total
     */
    async getCartTotal(): Promise<string> {
        const totalRow = this.page.getByRole('row').filter({ hasText: 'Total:' }).last();
        return totalRow.getByRole('cell').last().innerText();
    }

    /**
     * Checks whether the cart reports a stock or quantity warning.
     * @returns Promise<boolean> - true when the stock warning is visible
     */
    async hasStockWarning(): Promise<boolean> {
        return this.stockWarning.isVisible();
    }
}
