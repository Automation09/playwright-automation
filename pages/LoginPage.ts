import { Page,Locator, expect } from "@playwright/test";

export class LoginPage{
    readonly page: Page;
    readonly username : Locator;
    readonly password: Locator;
    readonly submitBtn: Locator;
    readonly title: Locator;
    readonly logout: Locator;

    constructor(page:Page){
        this.page= page;
        
        //this.username= page.getByRole('textbox',{name:'username'})
        //this.password= page.getByRole('textbox',{name:'password'})
        //this.submitBtn= page.getByRole('button',{name:'Submit'})
        this.username= page.locator('#username');
        this.password= page.locator('#password');
        this.submitBtn= page.locator('#submit');
        this.title= page.locator('h1.post-title');
        this.logout= page.getByRole('link',{name:'Log out'})
    }
    async enterUserName(username: string){
        await this.username.fill(username)
    }
    async enterPassword(password: string){
        await this.password.fill(password)
    }
    async clickSubmit(){
        await this.submitBtn.click();
    }
    async login(username: string,password: string){
        await this.enterUserName(username);
        await this.enterPassword(password);
        await this.clickSubmit();
        await expect(this.title).toHaveText('Logged In Successfully');
    }
    async navigate(){
        await this.page.goto('/practice-test-login/');
    }
    async logOut(){
        await this.logout.click();
    }
    
}