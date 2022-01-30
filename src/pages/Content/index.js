import Messenger from "../../lib/messenger";
import { i18n } from '../../contents';

import {
    // actions
    GOOGLE_ACCOUNT_LIST,
    GOOGLE_ACCOUNT_FETCH,
    COPY_TO_CLIPBOARD
} from '../../constants';

const ACTIONS_MAP = {
    [COPY_TO_CLIPBOARD]: (msg)=> docReady(()=> copyToClipboard(msg)),
    [GOOGLE_ACCOUNT_FETCH]: fetchGoogleAccountInfo
};

// --- Event listeners ---

for(let action in ACTIONS_MAP) {
    Messenger.listen({ targetScript: 'content', action: action }, ACTIONS_MAP[action]);
}

// --- Handlers ---

function copyToClipboard(text) {
    document.documentElement.focus();
    navigator.clipboard.writeText(text);
    showToastInfo( i18n('gmeet.link.copied') );
}

function fetchGoogleAccountInfo() {
    let accounts = [];

    // Open profile popup
    document.querySelector('a[aria-label^="Google Account"][role="button"]').click();

    // Query for accounts
    document
        .querySelectorAll('a[href*="/landing?authuser="] img+div > div:last-child')
        .forEach((account) => accounts.push(account.innerText));

    console.log(accounts);

    Messenger.send({ targetScript: 'background', action: GOOGLE_ACCOUNT_LIST, message: accounts });
}

// --- Utils ---

function showToastInfo(msg) {
    let container = document.createElement("div");
    let child = document.createElement("div");

    container.classList.add("ext-copied-info");    
    child.classList.add("content");

    child.innerText = msg;

    container.appendChild(child);

    requestAnimationFrame(() => document.body.appendChild(container));

    setTimeout(() => {
        child.classList.add("fade-out");
        requestAnimationFrame(() => document.body.removeChild(container));
    }, 30000);
}

function docReady(callback) {
    if (document.readyState === "complete" || document.readyState === "interactive") callback();
    else document.addEventListener("DOMContentLoaded", callback);
}
