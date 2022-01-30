import { getGoogleMeetURL } from './utils';

describe('getGoogleMeetURL', () => {
    test('Fail when `accounts` is empty and `selected_account` is present', () => {
        let data = { accounts: [], selected_account: "user@mail.com"};
        
        return getGoogleMeetURL(data).catch(error => {
            expect(error).toEqual({key: 'error.google.accounts.notfound'});
        });
    });
    
    test('Fail when `accounts` is present and `selected_account` is empty', () => {
        let data = { accounts: ["user@mail.com"], selected_account: null};
        
        return getGoogleMeetURL(data).catch(error => {
            expect(error).toEqual({key: 'error.google.accounts.notfound'});
        });
    });
    
    test('Pass when both `accounts` and `selected_account` are present', () => {
        let data = { accounts: ["user@mail.com", "user2@mail.com"], selected_account: "user2@mail.com"};
        
        return getGoogleMeetURL(data).then(url => {
            expect(url).toEqual("https://meet.google.com/new?authuser=1");
        });
    });
});