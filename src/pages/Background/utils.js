import Messenger from "../../lib/messenger";

import {
    // url
    GOOGLE_MEET_CREATE_URL,

    // actions
    COPY_TO_CLIPBOARD
} from '../../constants';

export async function openTab(url, active = true) {
    return await chrome.tabs.create({ url: url, active: active });
}

export function closeTab(tab) {
    chrome.tabs.remove(tab.id);
}

export function waitTillURL(url_rgx) { // wait till url matches the given regex 
    return (tab)=> new Promise((resolve, reject) => {
        let timeout = setTimeout(()=> reject( {key: 'error.url.maxtimeout'} ), 1000 * 60 * 5); // timeout after 5 minutes
        
        chrome.webNavigation.onHistoryStateUpdated.addListener(function listener(detail) {
            let url_match = detail.url.match(url_rgx);
            if(tab.id == detail.tabId && url_match) {
                chrome.webNavigation.onHistoryStateUpdated.removeListener(listener);
                clearTimeout(timeout);
                resolve({ message: url_match[0], tab });
            }
        });
    });
}

export async function copyToClipboard({ message, tab }) {
    Messenger.send({ targetScript: 'content', action: COPY_TO_CLIPBOARD, message, tabId: tab.id });
    return tab;
}

// is current tab is processing tab and its state is completed and matches the given regex
export function isURL(url_rgx) {
    return (tab)=> new Promise((resolve, reject) => {
        let handler = (tab) => {
            if ( tab.url.match(url_rgx)) resolve(tab)
            else reject( {key: 'error.url.notfound', tab} );
        };
        chrome.tabs.get(tab.id, function (tab) {
            if (tab.status == 'complete') handler(tab);
            else chrome.tabs.onUpdated.addListener(function watchTab(tabId, changeInfo, _tab) {
                if (_tab.status == 'complete' && tabId == tab.id) {
                    handler(_tab);
                    chrome.tabs.onUpdated.removeListener(watchTab);
                }
            });
        });
    });
}

export function getGoogleMeetURL({ accounts, selected_account }) {
    return new Promise((resolve, reject) => {
        if (accounts.length && selected_account) {
            let account_idx = accounts.indexOf(selected_account);
            if (account_idx != -1) {
                resolve(`${GOOGLE_MEET_CREATE_URL}${account_idx}`);
            } else {
                reject( {key: 'error.google.accounts.notfound'} );
            }
        } else {
            reject( {key: 'error.google.accounts.notfound'} );
        }
    });
}