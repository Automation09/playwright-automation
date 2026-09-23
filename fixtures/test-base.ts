import {test as base} from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { PracticePage } from '../pages/PracticePage';

type MyFixtures = {
    loginpage: LoginPage;
    homepage: HomePage;
    practicepage: PracticePage;
}

export const test = base.extend<MyFixtures>({
    loginpage: async({page},use)=>{
        await use(new LoginPage(page));
    },
    homepage: async({page},use)=>{
        await use(new HomePage(page));
    },
    practicepage: async({page},use)=>{
        await use(new PracticePage(page));
    }
});

export {expect} from '@playwright/test';