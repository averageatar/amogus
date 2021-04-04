localStorage.setItem("bulge","69");

const DigitalDetox = {
    init: () => {
    console.log("Initiate Batsu Block");
    },

    /**
	 * Fetches blocked websites lists, attaches them to the listener provided by the WebExtensions API
	 */
    getUserOptions: () => DigitalDetox.userOptions,
	enableBlocker: () => {
		const sites = DigitalDetox.getBlockedSites(),
			pattern = sites.map(item => `*://*.${item}/*`);

		// console.log(pattern);

		// Clear blocker incase when blocker is already running
		//DigitalDetox.clearBlocker();

		if (pattern.length > 0) {
			// Block current tabs
			DigitalDetox.redirectCurrentTab(pattern);

			// Listen to new tabs
			browser.webRequest.onBeforeRequest.addListener(
				DigitalDetox.redirectTab,
				{
					urls: pattern,
					types: ['main_frame']
				},
				['blocking']
			);
		}

		// Enable blocker auto update
		//DigitalDetox.autoUpdateBlocker();

		// Change status to on
		//DigitalDetox.setStatus('on');

		console.log('Blocker enabled');
	},

	redirectCurrentTab: urls => {
		browser.tabs
			.query({ 		//Gets all tabs that have the specified properties, or all tabs if no properties are specified.
				url: urls,
				audible: false,
				pinned: false
			})
			.then(tabs => { //On success, iterates through received tabs.6
				// Loop matched tabs
				for (let tab of tabs) {
					// Block tabs
					browser.tabs.update(tab.id, {
						url: browser.runtime.getURL(
							'/redirect.html?from=' +
								encodeURIComponent(btoa(tab.url))
						)
					});
				}
			});
	},

	/**
	 * Redirects the tab to local "You have been blocked" page.
	 */
	redirectTab: requestDetails => {
		let match = true; // By default url is catched correctly

		// Test url on false positive when url components are found
		if (requestDetails.url.match(/[?#]./)) {	
			const sites = DigitalDetox.getBlockedSites(),
				url = new URL(requestDetails.url),
				domain = url.hostname.replace(/^www\./, '');

			// Catch url that are false positive for example when a url has a url as component
			if (!sites.includes(domain)) {
				match = false;
			}
		}

		if (match === true) { //Redirect newly opened tabs to redirect.html if they match a banned url	
			browser.tabs.update(requestDetails.tabId, {
				url: browser.runtime.getURL(
					'/redirect.html?from=' +
						encodeURIComponent(btoa(requestDetails.url))
				)
			});
		}
	},

    getBlockedSites: () => {
		const sites = DigitalDetox.getUserOptions().blockedSites,
			blockedSites = [];

		sites.forEach(site => {
			blockedSites.push(site.url);
			// IDEA: Implement time logic
		});

		console.log('Get blocked sites', blockedSites);
		return blockedSites;
	},

	addSite: (url, time = 0) => {
		const userOptions = DigitalDetox.getUserOptions();

		// Check if url already exists
		if (userOptions.blockedSites.findIndex(v => v.url === url) === -1) {
			// Parse time
			time = parseInt(time, 0);

			// Add url to blocked websites
			userOptions.blockedSites.push({
				url: url,
				time: time
			});

			// Update user settings
			DigitalDetox.updateUserOptions(userOptions);

			console.log('Site added');
			return true;
		}

		return new Error('Url already exists.');
	},

	/**
	 * Add a website to the blocked list
	 * @param  {string} url Url to remove to the list
	 */
	removeSite: url => {
		const userOptions = DigitalDetox.getUserOptions();

		userOptions.blockedSites.splice(
			userOptions.blockedSites.findIndex(v => v.url === url),
			1
		);

		DigitalDetox.updateUserOptions(userOptions);
	},

	updateUserOptions: (options, value = null) => {
		// When sites are defined
		if (options != undefined) {
			// Set global sites array
			if (value != undefined) {
				DigitalDetox.userOptions[options] = value;
			} else {
				DigitalDetox.userOptions = options;
			}

			DigitalDetox.userOptionsModified = Date.now();

			console.log('Update user options');
		}
	},
}

// Default user options meant to be synct
DigitalDetox.userOptions = {
	blockedSites: [
		// Social media
		{
			url: 'facebook.com',
			time: 0
		},
		{
			url: 'tumblr.com',
			time: 0
		},
		{
			url: 'instagram.com',
			time: 0
		},
		{
			url: 'twitter.com',
			time: 0
		},
		{
			url: 'snapchat.com',
			time: 0
		},
		{
			url: 'vk.com',
			time: 0
		},
		{
			url: 'pinterest.com',
			time: 0
		},
		{
			url: 'reddit.com',
			time: 0
		},
		{
			url: 'linkedin.com',
			time: 0
		},
		// Video streaming
		{
			url: 'youtube.com',
			time: 0
		},
		{
			url: 'netflix.com',
			time: 0
		},
		{
			url: 'primevideo.com',
			time: 0
		},
		{
			url: 'hulu.com',
			time: 0
		},
		{
			url: 'hbonow.com',
			time: 0
		},
		{
			url: 'videoland.com',
			time: 0
		},
		{
			url: 'dumpert.nl',
			time: 0
		},
		{
			url: 'dailymotion.com',
			time: 0
		},
		{
			url: 'twitch.tv',
			time: 0
		},
		// Entertainment
		{
			url: '9gag.com',
			time: 0
		},
		{
			url: 'buzzfeed.com',
			time: 0
		}
	],
	disableDuration: null // TODO: Add disable duration to options page
};

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
	switch (request.type) {
		case 'getStatus':
			sendResponse(DigitalDetox.getStatus());
			break;

		case 'disableBlocker':
			sendResponse(DigitalDetox.disableBlocker());
			break;

		case 'enableBlocker':
			sendResponse(DigitalDetox.enableBlocker());
			break;

		case 'getCurrentDomain':
			sendResponse(Domain.getCurrent());
			break;

		case 'getLocalOptions':
			sendResponse(DigitalDetox.getLocalOptions());
			break;

		case 'getUserOptions':
			sendResponse(DigitalDetox.getUserOptions());
			break;

		case 'syncUserOptions':
			sendResponse(DigitalDetox.syncUserOptions());
			break;

		case 'getBlockedSites':
			sendResponse(DigitalDetox.getBlockedSites());
			break;

		case 'getAllSites':
			sendResponse(DigitalDetox.getUserOptions().blockedSites);
			break;

		case 'getHistory':
			sendResponse(DigitalDetox.getLocalOptions().history);
			break;

		case 'resetHistory':
			// Empty history
			DigitalDetox.updateLocalOptions(
				'history',
				DigitalDetox.options.history
			);

			// Update history modification date
			DigitalDetox.updateLocalOptions('historyModified', Date.now());

			sendResponse(true);
			break;

		case 'addSite':
			sendResponse(DigitalDetox.addSite(request.url, request.time));
			break;

		case 'removeSite':
			sendResponse(DigitalDetox.removeSite(request.url));
			break;

		default:
			sendResponse(new Error('Message request type does not exist'));
			break;
	}

	return;
});

DigitalDetox.init();
DigitalDetox.enableBlocker();



