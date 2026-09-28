import { test, expect } from '../../fixtures/test-base';
import testData from '../../data/userdata.json'

test('logs in successfully with valid credentials @regression', async ({ loginpage, page }) => {
    console.log('RUNNING: regression - logs in successfully with valid credentials');
    await loginpage.navigate();
    await loginpage.login(testData.validUser.username, testData.validUser.password);
    await expect(page).toHaveURL(/.*logged-in-successfully/);
});

test('shows an error when the password is invalid @regression', async ({ loginpage, page }) => {
    console.log('RUNNING: regression - shows an error when the password is invalid');
    await loginpage.navigate();
    await loginpage.enterUserName('student');
    await loginpage.enterPassword('WrongPassword');
    await loginpage.clickSubmit();

    await expect(page).toHaveURL(/.*practice-test-login/);
    await expect(page.locator('#error')).toBeVisible();
    await expect(page.locator('#error')).toHaveText('Your password is invalid!');
});

test('navigates to the practice page from the home page @sanity', async ({ homepage }) => {
    console.log('RUNNING: sanity - navigates to the practice page from the home page');
    await homepage.navigate();
    await homepage.clickPractice();
});

test('opens the login page from the practice page @sanity', async ({ practicepage }) => {
    console.log('RUNNING: sanity - opens the login page from the practice page');
    await practicepage.navigate();
    await practicepage.clicktestloginpage();
});

test('logs out after a successful login @regression', async ({ homepage, practicepage, loginpage }) => {
    console.log('RUNNING: regression - logs out after a successful login');
    await homepage.navigate();
    await homepage.clickPractice();
    await practicepage.clicktestloginpage();

    await loginpage.login(testData.validUser.username, testData.validUser.password);
    await expect(loginpage.page).toHaveURL(/.*logged-in-successfully/);
    await loginpage.logOut();
});

test('intentionally fails because the element does not exist @regression', async ({ loginpage }) => {
    console.log('RUNNING: regression - intentionally failing locator test');
    await loginpage.navigate();

    await expect(loginpage.page.locator('#this-element-does-not-exist')).toBeVisible();
});