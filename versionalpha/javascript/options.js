'use strict';

let blockedSites, formBlockSite;

document.addEventListener('DOMContentLoaded', initialize);

function initialize() {
	blockedSites = document
		.getElementById('optionsBlockedSites')
		.getElementsByTagName('tbody')[0];
	formBlockSite = document.getElementById('formBlockSite');

    console.log("Options.js initialized")
    setListeners();

	restoreOptions();
}

function setListeners() {
	window.addEventListener('beforeunload', closeOptions);
	formBlockSite.addEventListener('submit', saveSite);
	blockedSites.addEventListener('click', deleteSite);
}

async function restoreOptions() {
    console.log("function restoreOptions ran")
	const userOptions = await browser.runtime.sendMessage({
		type: 'getUserOptions'
	});
    console.log("function restoreOptions stage 2")
	// Set sites
	setSites(userOptions.blockedSites);
}

function closeOptions() {
	// Request sync sites to storage
	browser.runtime.sendMessage({
		type: 'syncUserOptions'
	});
}

function sortSites(a, b) {
	const urlA = a.url.toLowerCase(),
		urlB = b.url.toLowerCase();

	let comparison = 0;

	if (urlA > urlB) {
		comparison = -1;
	} else if (urlA < urlB) {
		comparison = 1;
	}

	return comparison;
}

async function setSites(sites) {
	// Sort alphabetically on url
	sites.sort(sortSites);

	// Add sites to options page
	sites.forEach(site => {
		addToBlockedList(site.url);
	});

    console.log("function setSites ran")
}

function addToBlockedList(url) {
	const button = document.createElement('button');
	button.title = browser.i18n.getMessage('optionsDeleteSiteButton');

	// Insert new row
	const blockedSitesRow = blockedSites.insertRow(0);

	// Insert website cell
	const valueCell = blockedSitesRow.insertCell(0);

	// Insert button cell
	const buttonCell = blockedSitesRow.insertCell(1);

	blockedSitesRow.dataset.url = url;
	valueCell.textContent = url;
	buttonCell.appendChild(button);

    console.log("function addToBlockedList ran")
}

function saveSite(event) {
	event.preventDefault();
	const url = formBlockSite.site.value;
	if (url.length === 0) {
		return;
	}

	// Add url to list
	addToBlockedList(url);

	// Clear form field
	formBlockSite.site.value = '';

	// Store url
	browser.runtime.sendMessage({
		type: 'addSite',
		url: url,
		time: 0
	});
}

function deleteSite(event) {
	if (event.target.nodeName === 'BUTTON') {
		const row = event.target.closest('tr');
		const url = row.dataset.url;
		row.remove();

		browser.runtime.sendMessage({
			type: 'removeSite',
			url: url
		});
	}
}