import Messenger from "../../lib/messenger";
import { i18n } from "../../contents";
import {
    openTab, closeTab, waitTillURL, copyToClipboard, isURL, getGoogleMeetURL 
} from './utils';

import {
    // url
    GOOGLE_MEET_LANDING_URL,

    // regex
    GOOGLE_MEET_LANDING_RGX,
    GOOGLE_MEET_RGX,
    
    // actions
    GOOGLE_MEET_CREATE,
    GOOGLE_ACCOUNT_FETCH,
    GOOGLE_ACCOUNT_LIST
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
    chrome.storage.local.get(['accounts', 'selected_account'])
        .then(getGoogleMeetURL)
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
