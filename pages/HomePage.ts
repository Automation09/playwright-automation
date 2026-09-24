import { Page,Locator, expect } from "@playwright/test";

export class HomePage{
    readonly page: Page;
    readonly practice: Locator;
    readonly title: Locator;


    constructor(page:Page){
        this.page=page;
        this.title=page.locator('h1.post-title');
        this.practice=page.locator('#menu-item-20');
    }

    async navigate(){
        await this.page.goto('/');
        await expect(this.title).toHaveText('Hello');
    }
    async clickPractice(){
        await this.practice.click();
    }
}