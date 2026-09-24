import { test, expect } from '../fixtures/test-base';
import testData from '../data/userdata.json'

test('Valid Login @regression',async ({loginpage,page }) => {

    await loginpage.navigate();
    await loginpage.page.screenshot({path:`screenshots/${Date.now()}.png`,fullPage:true});
    await loginpage.login('student','Password123');
    await expect(page).toHaveURL(/.*logged-in-successfully/);
    //await expect(page.locator('h1.post-title')).toHaveText('Logged In Successfully');

});

test('Select Practice from Home Page @sanity',async ({homepage,page})=>{
    await homepage.navigate();
    await homepage.clickPractice();
});

test('Select login page from practice page @sanity',async ({practicepage,page})=>{
    await practicepage.navigate();
    await practicepage.clicktestloginpage();
});

test('Login @regression',async({homepage,practicepage,loginpage}) => {

    await homepage.navigate();
    await homepage.clickPractice();

    await practicepage.clicktestloginpage();

    console.log(testData.validUser);

    await loginpage.login(testData.validUser.username,testData.validUser.password);
    await expect(loginpage.page).toHaveURL(/.*logged-in-successfully/);
    await loginpage.logOut();

});