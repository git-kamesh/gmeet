/*
* This class is used to provide uniform messaging across the application.
* content script, background script, and popup script.
*/
export default class Messenger {
    static send({ targetScript, action, message, tabId }, callback) {
        chrome.runtime.sendMessage({ action, targetScript, message }, callback);

        // send message to content script
        if (['all', 'content'].includes(targetScript)) {
            chrome.tabs.sendMessage(tabId, { action, targetScript, message });
        }
    }
    
    static listen({ targetScript, action }, callback) {
        const handler = function (request, sender, sendResponse) {
            if (
                request.action === action && 
                ['all', targetScript].includes(request.targetScript) && 
                sender.id == chrome.runtime.id
            ) {
                callback(request.message, sendResponse);
            }
        };
        const removeListener = () => chrome.runtime.onMessage.removeListener(handler);
        
        chrome.runtime.onMessage.addListener(handler);

        return { remove: removeListener };
    }
}