browser.menus.create({
    id: "hide-top-domain",
    icons: {
        "16": "icon.svg",
        "32": "icon.svg"
    },
    title: "Stack tabs from ",
    contexts: ["tab"]
});

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
            hiding = "*://" + splitting + "/*";
        browser.tabs.query({url: hiding, currentWindow: true}).then(
            console.log(hiding, tab.id),
            browser.tabs.hide(tab.id)
        );
    }
});