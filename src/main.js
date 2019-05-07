const config = {
    hide: {
        id: 'hide-top-domain',
    },
    show: {
        id: 'show-top-domain',
    },
    icons: {
        "16": "icon.svg",
        "32": "icon.svg"
    },
};

const stackCache = new Map();

const parseUrl = (url) => {
    const splitting = url.split('/');
    return { host: splitting[2] };
};

const showLastOneNotify = () => {
    browser.notifications.create({
        type: 'basic',
        iconUrl: 'icon.svg',
        title: 'Tab Stack for Firefox',
        message: browser.i18n.getMessage("notifi_last_tab"),
    });
};

const createMenuItem = (id, title) => {
    browser.menus.create({
        id,
        title,
        icons: config.icons,
        contexts: ["tab"],
    });
};

const removeMenuItem = (id) => {
    browser.menus.remove(id);
};

const showTabs = async (currentTab) => {
    const { host } = parseUrl(currentTab.url);
    const pattern = `*://${host}/*`;
    const tabs = await browser.tabs.query({ url: pattern, currentWindow: true, hidden: true });
    browser.tabs.show(tabs.map(tab => tab.id));
    stackCache.set(host, false);
};

const hideTabs = async (currentTab) => {
    const { host } = parseUrl(currentTab.url);
    const pattern = `*://${host}/*`;
    const tabs = await browser.tabs.query({ url: pattern, currentWindow: true, hidden: false });
    const idList = tabs.map(tab => tab.id);
    const idx = idList.indexOf(currentTab.id);
    if (idx !== -1) idList.splice(idx, 1);
    if (idList.length > 0) {
        browser.tabs.hide(idList);
    } else {
        showLastOneNotify();
    }
    stackCache.set(host, true);
};

const initHandle = (info, tab) => {
    const { host } = parseUrl(tab.url);
    createMenuItem(config.hide.id, browser.i18n.getMessage("hide_context") + host);
    if (stackCache.get(host)) {
        createMenuItem(config.show.id, browser.i18n.getMessage("show_context") + host);
    }
    browser.menus.refresh();
};

const cleanHandle = () => {
    removeMenuItem(config.hide.id);
    removeMenuItem(config.show.id);
};

const clickHandle = async (info, tab) => {
    if (info.menuItemId === 'hide-top-domain') {
        hideTabs(tab);
    } else if (info.menuItemId === 'show-top-domain') {
        showTabs(tab);
    }
};

browser.menus.onShown.addListener(initHandle);
browser.menus.onHidden.addListener(cleanHandle);
browser.menus.onClicked.addListener(clickHandle);
