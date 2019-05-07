browser.menus.create({
    id: "hide-top-domain",
    icons: {
        "16": "icon.svg",
        "32": "icon.svg"
    },
    title: "Stack tabs from ",
    contexts: ["tab"]
});

async function tabHide(url ,excludeId) {
    let query = await browser.tabs.query({url: url, currentWindow: true}),
        hidingTab = query.map((item)=>{
        return item.id
    });
    let index = hidingTab.indexOf(excludeId);
    hidingTab.splice(index, 1);
    browser.tabs.hide(hidingTab);
}

browser.menus.onShown.addListener(async function(info, tab) {
    let splitting = tab.url.split("/");
    browser.menus.update("hide-top-domain", {
        title: "Stack tabs from " + splitting[2]
    });
    browser.menus.refresh();
});

browser.menus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId == "hide-top-domain") {
        let splitting = tab.url.split("/"),
            hiding = "*://" + splitting[2] + "/*";
        tabHide(hiding ,tab.id);
    }
});