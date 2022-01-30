import Messenger from "../../lib/messenger";
import { i18n } from "../../contents";

import {
    // url
    GOOGLE_MEET_CREATE_URL,
    GOOGLE_MEET_LANDING_URL,

    // regex
    GOOGLE_MEET_LANDING_RGX,
    GOOGLE_MEET_RGX,
    
    // actions
    GOOGLE_MEET_CREATE,
    GOOGLE_ACCOUNT_FETCH,
    GOOGLE_ACCOUNT_LIST,
    COPY_TO_CLIPBOARD
} from '../../constants';
 
//  --- Mapping ---
const ACTION_MAP = {
    [GOOGLE_MEET_CREATE] : createGoogleMeetLink,
    [GOOGLE_ACCOUNT_FETCH] : fetchGoogleAccount
};
const CONTEXT_MENU = {
    [GOOGLE_MEET_CREATE]: i18n('create.google.meet.link')
};

// --- Init ---
createMenus();

handleMessages();
handleMenuClick();
handleCommands();


// --- Handlers ---
function createGoogleMeetLink() {
    getGoogleMeetURL()
        .then(openTab)
        .then( waitTillURL(GOOGLE_MEET_RGX) )
        .then( copyToClipboard )
        .catch((err) => {
            if(err.tab) closeTab(err.tab);
        });
}

function fetchGoogleAccount() {
    openTab( GOOGLE_MEET_LANDING_URL, false)
    .then( isURL(GOOGLE_MEET_LANDING_RGX) )
    .then((tab) => {
        return new Promise((resolve, reject) => {
            // send message to content script to fetch google account
            Messenger.send({ targetScript: 'content', action: GOOGLE_ACCOUNT_FETCH, tabId: tab.id });

            // wait till content script sends back the account
            Messenger.listen({ targetScript: 'background', action: GOOGLE_ACCOUNT_LIST }, (message) => {
                if(message.length) {                
                    Messenger.send({ targetScript: 'popup', action: GOOGLE_ACCOUNT_LIST, message });
                    resolve(tab);
                } else {
                    reject( {key: 'error.google.accounts.notfound'} );
                }
            });
        })
    })
    .then( closeTab )
    .catch((err) => {
        if(err.key == 'error.url.notfound') {
            Messenger.send({ targetScript: 'popup', action: GOOGLE_ACCOUNT_LIST, message: err.key });
            closeTab(err.tab);
        }
    });
} 

// --- Hooks ---
function createMenus() {
    // clear all menus
    chrome.contextMenus.removeAll();
    
    // create new menu
    for(let key in CONTEXT_MENU) {
        chrome.contextMenus.create({
            id: key,
            title: CONTEXT_MENU[key],
            contexts: ["all"]
        });
    }
}

function handleMessages() {
    for(let key in ACTION_MAP) {
        Messenger.listen({ action: key, targetScript: 'background' }, ACTION_MAP[key]);
    }
}

function handleMenuClick() {
    chrome.contextMenus.onClicked.addListener(function (info, tab) {
        handleAction(info.menuItemId);
    });
}

function handleCommands() {
    chrome.commands.onCommand.addListener(handleAction);
}

function handleAction(action_id) {
    let handler = ACTION_MAP[action_id];
    handler && handler();
}

// --- Utils ---
async function openTab(url, active = true) {
    return await chrome.tabs.create({ url: url, active: active });
}

function closeTab(tab) {
    chrome.tabs.remove(tab.id);
}

function waitTillURL(url_rgx) { // wait till url matches the given regex 
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

async function copyToClipboard({ message, tab }) {
    Messenger.send({ targetScript: 'content', action: COPY_TO_CLIPBOARD, message, tabId: tab.id });
    return tab;
}

// is current tab is processing tab and its state is completed and matches the given regex
function isURL(url_rgx) {
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

function getGoogleMeetURL() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['accounts', 'selected_account'], function (result) {
            if (result.accounts) {
                let account_idx = result.accounts.indexOf(result.selected_account);
                if (account_idx != -1) {
                    resolve(`${GOOGLE_MEET_CREATE_URL}${account_idx}`);
                } else {
                    reject( {key: 'error.google.accounts.notfound'} );
                }
            } else {
                reject( {key: 'error.google.accounts.notfound'} );
            }
        });
    });
}