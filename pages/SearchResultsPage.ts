import { Locator, Page } from '@playwright/test';
import { ProductPage } from './ProductPage';

export class SearchResultsPage {
    private readonly page: Page;

    // Locators
    private readonly resultsHeading: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with selectors verified on the search results page
        this.resultsHeading = page.getByRole('heading', {
            name: /Products meeting the search criteria/,
            exact: false,
        });
    }

    /**
     * Checks that the search results section is displayed.
     * @returns Promise<boolean> - true when the results heading is visible
     */
    async areResultsDisplayed(): Promise<boolean> {
        await this.resultsHeading.waitFor({ state: 'visible' });
        return true;
    }

    /**
     * Checks whether a product appears in the search results.
     * @param productName - Product name to locate
     * @returns Promise<boolean> - true when the product link is visible
     */
    async isProductDisplayed(productName: string): Promise<boolean> {
        await this.productLink(productName).waitFor({ state: 'visible' });
        return true;
    }

    /**
     * Opens a product from the search results.
     * @param productName - Product name to open
     * @returns Promise<ProductPage> - Product details page object
     */
    async openProduct(productName: string): Promise<ProductPage> {
        await this.productLink(productName).click();
        return new ProductPage(this.page);
    }

    private productLink(productName: string): Locator {
        return this.page
            .getByRole('heading', { name: productName, exact: true })
            .getByRole('link', { name: productName, exact: true });
    }
}
