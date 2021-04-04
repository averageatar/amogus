//import Domain from './modules/domain';
//import Tabs from './modules/tabs';

class Tabs {
	static async getCurrent() {
		const currentTab = await browser.tabs.query({
			active: true,
			currentWindow: true
		});
		return currentTab[0];
	}

	static async getBlocked() {
		return await browser.tabs.query({
			url: browser.runtime.getURL('*')
		});
	}

	static async restore() {
		// Get current blocked tabs
		const blockedTabs = await this.getBlocked();

		// Loop blocked tabs and reload
		for (let tab of blockedTabs) {
			browser.tabs.reload(tab.id);
		}

		console.log('Tabs restored');
		return;
	}
}

const DigitalDetox = {
    init: () => {
    console.log("Initiate Batsu Block");
    },

	/**
	 * Get local options
	 */
	getLocalOptions: () => DigitalDetox.localOptions,

	/**
	 * Processes
	 */
	process: {},

    /**
	 * Fetches blocked websites lists, attaches them to the listener provided by the WebExtensions API
	 */
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

	refreshBlocker: () => {
		console.log("dodgy ass refresher");
		browser.webRequest.onBeforeRequest.removeListener(DigitalDetox.redirectTab);
		console.log('Blocker cleared');

		const sites = DigitalDetox.getBlockedSites(),
			pattern = sites.map(item => `*://*.${item}/*`);

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
				console.log("TEST TEST TEST")
				console.log(sites);

			// Catch url that are false positive for example when a url has a url as component
			if (!sites.includes(domain)) {
				match = false;
				console.log("not a match")

			}
		}

		if (match === true) { //Redirect newly opened tabs to redirect.html if they match a banned url	
			console.log("match found")
			browser.tabs.update(requestDetails.tabId, {
				url: browser.runtime.getURL(
					'/redirect.html?from=' +
						encodeURIComponent(btoa(requestDetails.url))
				)
			});
		}
	},

	/**
	 * Get user options
	 */
	getUserOptions: () => DigitalDetox.userOptions,

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
		//console.log(userOptions);

	},

	disableBlocker: () => {
		console.log('Disable blocker');

		// Restore blocked tabs
		Tabs.restore();

		// Remove listeners
		DigitalDetox.clearBlocker();
		//DigitalDetox.setStatus('off');
	},

	restoreTabs: () => {
		browser.tabs
			.query({
				url: browser.runtime.getURL('*')
			})
			.then(tabs => {
				// Loop matched tabs
				for (let tab of tabs) {
					// Reload tabs
					browser.tabs.reload(tab.id);
				}
			});

		console.log('Tabs restored');
	},

	clearBlocker: () => {
		browser.webRequest.onBeforeRequest.removeListener(
			DigitalDetox.redirectTab
		);

		// Delete interval
		if (DigitalDetox.process.updateBlockerTimer != undefined) {
			DigitalDetox.process.updateBlockerTimer.delete();
			DigitalDetox.process.updateBlockerTimer = null;
		}

		console.log('Blocker cleared');
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

	autoUpdateBlocker: () => {
		let previousSites = DigitalDetox.getBlockedSites();

		DigitalDetox.process.updateBlockerTimer = new Interval(() => {
			console.log('Check for blocker updates');

			let currentSites = DigitalDetox.getBlockedSites();
			if (equalArrays(previousSites, currentSites) === false) {
				DigitalDetox.enableBlocker();
				previousSites = currentSites;

				console.log('Blocker updated');
			}
		}, DigitalDetox.options.updateBlockerInterval);

		// Pause background processes when user is inactive
		// NOTE: Currently updating blocker in background is not needed in future it can be the case
		if (DigitalDetox.options.idleManagement === true) {
			browser.idle.onStateChanged.addListener(state => {
				if (DigitalDetox.process.updateBlockerTimer != undefined) {
					if (state === 'idle' || state === 'locked') {
						DigitalDetox.process.updateBlockerTimer.pause();
					} else if (state === 'active') {
						DigitalDetox.process.updateBlockerTimer.start();
					}
				}
			});
		} 
	},
}

// Default options
DigitalDetox.options = {
	status: 'on',
	idleManagement: true,
	processInterval: {
		syncLocalOptions: 1000,
		syncUserOptions: 30000,
		statusInterval: 6000
	},
	updateBlockerInterval: 1000,
	disableDuration: 5400000,
	history: []
};

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
			console.log("d block heard")
			break;

		case 'enableBlocker':
			sendResponse(DigitalDetox.enableBlocker());
			console.log("e block heard")
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
			DigitalDetox.refreshBlocker();
			break;

		case 'removeSite':
			sendResponse(DigitalDetox.removeSite(request.url));
			DigitalDetox.refreshBlocker();
			console.log("removeSite message heard")
			break;

		default:
			sendResponse(new Error('Message request type does not exist'));
			break;
	}

	return;
});

DigitalDetox.init();
DigitalDetox.enableBlocker();



