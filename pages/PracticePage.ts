import { Page,Locator, expect } from "@playwright/test";

export class PracticePage{
    readonly page: Page;
    readonly title: Locator;
    readonly testloginpage: Locator;

    constructor(page:Page){
        this.page=page;
        this.title= page.locator('h1.post-title');
        this.testloginpage= page.getByRole('link',{name:'Test Login Page'});
    }

    async navigate(){
        await this.page.goto('/practice/');
        await expect(this.title).toHaveText('Practice');
    }

    async clicktestloginpage(){
        await this.testloginpage.click();
    }
}