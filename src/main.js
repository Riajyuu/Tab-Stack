var targetLocation = "";

browser.menus.create({
    id: "hide-top-domain",
    icons: {
        "16": "icon.svg",
        "32": "icon.svg"
    },
    title: "Stack tabs from ",
    contexts: ["tab"]
});

async function tabHide(url ,excludeId, location) {
    let query = await browser.tabs.query({url: url, currentWindow: true}),
        hidingTab = query.map((item)=>{
        return item.id
    }),
        index = hidingTab.indexOf(excludeId);
    hidingTab.splice(index, 1);
    browser.tabs.hide(hidingTab);
    browser.menus.remove("hide-top-domain");
    browser.menus.create({
        id: "show-top-domain",
        icons: {
            "16": "icon.svg",
            "32": "icon.svg"
        },
        title: "Show tabs from " + location,
        contexts: ["tab"]
    });
    targetLocation = location;
}

browser.menus.onShown.addListener(async function(info, tab) {
    let splitting = tab.url.split("/");
    browser.menus.update("hide-top-domain", {
        title: "Stack tabs from " + splitting[2]
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
        title: "Stack tabs from ",
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