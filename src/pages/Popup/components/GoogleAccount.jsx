import React from 'react';

import Dropdown from '../../../components/Dropdown';
import Messenger from '../../../lib/messenger';
import { i18n } from '../../../contents';

import {
    GOOGLE_ACCOUNT_FETCH,
    GOOGLE_ACCOUNT_LIST
} from '../../../constants';

let ACTIONS = {
    [GOOGLE_ACCOUNT_FETCH]: () => Messenger.send({ targetScript: 'background', action: GOOGLE_ACCOUNT_FETCH }),
};

// account status constants
const ACCOUNT_NOT_FETCHED = 0;
const ACCOUNT_FETCHING = 1;
const ACCOUNT_FETCHED = 2;
const ACCOUNT_NOT_FOUND = -1;

// hook to get google account info
export const useGoogleAccounts = () => {

    const [accounts, setAccounts] = React.useState([]);
    const [selectedAccount, setSelectedAccount] = React.useState(null);
    const [fetchState, setIsAcntFetch] = React.useState(ACCOUNT_NOT_FETCHED);

    // Fetches Google accounts from background script and updates the state of accounts
    // Caches the accounts for later use
    const fetchAcnt = React.useCallback(() => {
        ACTIONS[GOOGLE_ACCOUNT_FETCH]();
        setIsAcntFetch(ACCOUNT_FETCHING);

        let listener = Messenger.listen({ targetScript: 'popup', action: GOOGLE_ACCOUNT_LIST }, (message) => {
            if (Array.isArray(message)) {

                setIsAcntFetch(ACCOUNT_FETCHED);
                setAccounts(message);

                // cache the accounts for later use
                chrome.storage.local.set({ accounts: message });
            } else {

                setIsAcntFetch(ACCOUNT_NOT_FOUND);
                setSelectedAccount(null);
                setAccounts([]);

                // clear local storage
                chrome.storage.local.set({ accounts: [], selectedAccount: null });
            }
            listener.remove();
        });
    }, [setIsAcntFetch, setAccounts, setSelectedAccount]);

    // handle account selection
    const updateSelectedAccount = React.useCallback((account) => {
        setSelectedAccount(account);
        chrome.storage.local.set({ selected_account: account });
    }, [setSelectedAccount]);

    // fetch the accounts and selected account from local storage
    React.useEffect(() => {
        chrome.storage.local.get(['accounts', 'selected_account'], (result) => {
            setAccounts(result.accounts || []);
            setSelectedAccount(result.selected_account || null);
        });
    }, [setAccounts, setSelectedAccount]);

    return { accounts, selectedAccount, updateSelectedAccount, fetchState, fetchAcnt };
}

// Google account selector component
export const GoogleAccountSelector = (props) => {
    const { accounts, selectedAccount, updateSelectedAccount, fetchState, fetchAcnt } = props;
    let drpdwn = (
        <Dropdown
            className='ext-mT30'
            selected={selectedAccount}
            options={accounts.map((acnt, idx) => ({ label: acnt, value: acnt }))}
            onChange={updateSelectedAccount}
            title={<span>Google Account - <span onClick={fetchAcnt} className='ext-link'>{i18n('reload')}</span></span>}
        />
    );

    let noaccount = (
        <div className='ext-mT30'>
            <span className='ext-text-muted'>{i18n('no.gaccounts.linked')} </span>
            <span className='ext-link' onClick={fetchAcnt}>{i18n('link.now')}</span>
        </div>
    );

    let noaccount_signedin = (
        <div className='ext-mT30'>
            <span className='ext-clrR'>{i18n('google.not.logeed.in')}</span>
        </div>
    );

    let account_fetching = <div className='ext-mT30'>{i18n('fetching.gacnt.info')}</div>;

    if (accounts.length) return drpdwn;
    else if (fetchState == ACCOUNT_FETCHING) return account_fetching;
    else if (fetchState == ACCOUNT_NOT_FOUND) return noaccount_signedin;
    else return noaccount;
}
