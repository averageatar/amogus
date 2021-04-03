// Initialize page
//
function initializePage() {
	browser.storage.local.get("sync").then(onGotSync);

	function onGotSync(options) {
		if (options["sync"]) {
			browser.storage.sync.get("theme").then(onGot);
		} else {
			browser.storage.local.get("theme").then(onGot);
		}
	}

	function onGot(options) {
		let theme = options["theme"];
		let link = document.getElementById("themeLink");
		if (link) {
			link.href = theme ? `themes/${theme}.css` : "";
		}
	}
}

// Open options page
//
function openOptions() {
	browser.runtime.openOptionsPage();
	window.close();
}

// Open timer page
//
function openTimer() {
	openExtensionPage("timer.html");
}

// Open permaban page
//
function openPermaban() {
	openExtensionPage("permaban.html");
}

// Open batsu page
//
function openBatsu() {
	openExtensionPage("batsu.html");
}

// Open extension page (either create new tab or activate existing tab)
//
function openExtensionPage(url) {
	let fullURL = browser.extension.getURL(url);

	browser.tabs.query({ url: fullURL }).then(onGot, onError);

	function onGot(tabs) {
		if (tabs.length > 0) {
			browser.tabs.update(tabs[0].id, { active: true });
		} else {
			browser.tabs.create({ url: fullURL });
		}
		window.close();
	}

	function onError(error) {
		browser.tabs.create({ url: fullURL });
		window.close();
	}
}

document.querySelector("#options").addEventListener("click", openOptions);
document.querySelector("#timer").addEventListener("click", openTimer);
document.querySelector("#permaban").addEventListener("click", openPermaban);
document.querySelector("#batsu").addEventListener("click", openBatsu);

document.addEventListener("DOMContentLoaded", initializePage);