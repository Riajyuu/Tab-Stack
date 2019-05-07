var targetLocation = "";

browser.menus.create({
    id: "hide-top-domain",
    icons: {
        "16": "icon.svg",
        "32": "icon.svg"
    },
    title: browser.i18n.getMessage("hide_context"),
    contexts: ["tab"]
});

async function tabHide(url ,excludeId, location) {
    let query = await browser.tabs.query({url: url, currentWindow: true}),
        hidingTab = query.map((item)=>{
        return item.id
    }),
        index = hidingTab.indexOf(excludeId),
        hiddenQuery = await browser.tabs.query({url: url, currentWindow: true, hidden: false})
    hidingTab.splice(index, 1);
    if (hiddenQuery.length > 1) {
        browser.tabs.hide(hidingTab);
    } else if (hiddenQuery.length == 1) {
        browser.notifications.create({
            "type": "basic",
            "iconUrl": "icon.svg",
            "title": "Tab Stack for Firefox",
            "message": browser.i18n.getMessage("notifi_last_tab")
        });
    }
    browser.menus.create({
        id: "show-top-domain",
        icons: {
            "16": "icon.svg",
            "32": "icon.svg"
        },
        title: browser.i18n.getMessage("show_context") + location,
        contexts: ["tab"]
    });
    targetLocation = location;
}

browser.menus.onShown.addListener(async function(info, tab) {
    let splitting = tab.url.split("/");
    browser.menus.update("hide-top-domain", {
        title: browser.i18n.getMessage("hide_context") + splitting[2]
    });
    browser.menus.refresh();
});

async function tabShow(targetLocation) {
    let url = "*://" + targetLocation + "/*",
        query = await browser.tabs.query({url: url, currentWindow: true, hidden: true}),
    showingTab = query.map((item)=>{
        return item.id
    });
    browser.tabs.show(showingTab);
    browser.menus.remove("show-top-domain");
    browser.menus.create({
        id: "hide-top-domain",
        icons: {
            "16": "icon.svg",
            "32": "icon.svg"
        },
        title: browser.i18n.getMessage("hide_context"),
        contexts: ["tab"]
    });
}

browser.menus.onClicked.addListener(function(info) {
    if (info.menuItemId == "show-top-domain") {
        tabShow(targetLocation);
    }
})

browser.menus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId == "hide-top-domain") {
        let splitting = tab.url.split("/"),
            location = splitting[2],
            hiding = "*://" + location + "/*";
        tabHide(hiding ,tab.id, location);
    }
});