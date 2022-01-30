export const content = {
    "cancel": "Cancel",
    "new.meeting": "New meeting",
    "welcome.to.gmeet": "Hey, Welcome to Gmeet",
    "create.google.meet.link": "Create Google Meet Link",
    "gmeet.link.copied": "Meeting link has been copied to your clipboard. Just share it by pasting (CTRL + V)",
    "welcome.gmeet.desc": "Quickly create google meet link and share it with your team members.",
    "google.not.logeed.in": "Oops! You are not logged in to your google account. Please login to your google account and try again.",
    "fetching.gacnt.info" : "Fetching your google account info...",
    "reload": "Reload",
    "no.gaccounts.linked": "No Google account linked.",
    "link.now": "Link now",
    "shortcut.info": "ⓘ Shortcut key : ALT + SHIFT + G"
};

export function i18n(key) {
    return content[key] || key;
}