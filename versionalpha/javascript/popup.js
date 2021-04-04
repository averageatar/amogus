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
	openExtensionPage("/options.html");
}
// Open timer page
//
function openTimer() {
	openExtensionPage("/timer.html");
}

// Open permaban page
//
function openPermaban() {
	openExtensionPage("/permaban.html");
}

// Open batsu page
//
function openBatsu() {
	openExtensionPage("/batsu.html");
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

function switchState() {
	if (document.getElementById("imgClickAndChange").src == "https://helpx.adobe.com/content/dam/help/en/stock/how-to/visual-reverse-image-search/jcr_content/main-pars/image/visual-reverse-image-search-v2_intro.jpg") {
		// TURN ON
		document.getElementById("imgClickAndChange").src = "https://media.sproutsocial.com/uploads/2017/02/10x-featured-social-media-image-size.png";
		// tells background.js to enable blocker
		browser.runtime.sendMessage({
			type: 'enableBlocker'
		});
	} else {
		// TURN OFF
		document.getElementById("imgClickAndChange").src = "https://helpx.adobe.com/content/dam/help/en/stock/how-to/visual-reverse-image-search/jcr_content/main-pars/image/visual-reverse-image-search-v2_intro.jpg";
		// tells background.js to disable blocker
		browser.runtime.sendMessage({
			type: 'disableBlocker'
		});
		}

	console.log(document.getElementById("imgClickAndChange").src);
}

document.querySelector("#options").addEventListener("click", openOptions);
document.querySelector("#switch").addEventListener("click", switchState);
document.querySelector("#timer").addEventListener("click", openTimer);

document.addEventListener("DOMContentLoaded", initializePage);