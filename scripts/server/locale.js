// ===========================================================================
// Vortrex's Roleplay Resource
// https://github.com/VortrexFTW/gtac_roleplay
// ===========================================================================
// FILE: locale.js
// DESC: Provides locale structures, functions and usage
// TYPE: Server (JavaScript)
// ===========================================================================

function initLocaleScript() {
	logToConsole(LOG_INFO, "[VRR.Locale]: Initializing locale script ...");
	logToConsole(LOG_INFO, "[VRR.Locale]: Locale script initialized!");
}

// ===========================================================================

function getLocaleString(client, stringName, ...args) {
	let localeId = getPlayerData(client).locale;
	if (!findResourceByName("agrp_locale").exports.doesLocaleStringExist(localeId, stringName)) {
		submitBugReport(client, `(AUTOMATED REPORT) Locale string "${stringName}" is missing for "${getPlayerLocaleName(client)}"`);
		return "";
	}

	return findResourceByName("agrp_locale").exports.getLocaleString(localeId, stringName, args);
}

// ===========================================================================

function getLanguageLocaleString(localeId, stringName, ...args) {
	if (!findResourceByName("agrp_locale").exports.doesLocaleStringExist(localeId, stringName)) {
		submitBugReport(client, `(AUTOMATED REPORT) Locale string "${stringName}" is missing for "${getPlayerLocaleName(client)}"`);
		return "";
	}

	return findResourceByName("agrp_locale").exports.getLocaleString(getPlayerData(client).locale, stringName, args);
}

// ===========================================================================

function getGroupedLocaleString(client, stringName, index, ...args) {
	return findResourceByName("agrp_locale").exports.getGroupedLocaleString(getPlayerData(client).locale, stringName, index, args);
}

// ===========================================================================

function getRawLocaleString(stringName, localeId) {
	return findResourceByName("agrp_locale").exports.getRawLocaleString(localeId, stringName);
}

// ===========================================================================

function getRawGroupedLocaleString(stringName, localeId, index) {
	return findResourceByName("agrp_locale").exports.getRawGroupedLocaleString(localeId, stringName, index);
}

// ===========================================================================

function getPlayerLocaleName(client) {
	let localeId = getPlayerData(client).locale;
	return getLocales()[localeId].englishName;
}

// ===========================================================================

function getLocaleFromParams(params) {
	return findResourceByName("agrp_locale").exports.getLocaleFromParams(params);
}

// ===========================================================================

function getLocales() {
	return findResourceByName("agrp_locale").exports.getLocales();
}

// ===========================================================================

function showLocaleListCommand(command, params, client) {
	let localeList = getLocales().map(function (x) { return x[0]; });
	let chunkedList = splitArrayIntoChunks(localeList, 10);

	messagePlayerInfo(client, getLocaleString(client, "HeaderLocaleList"));
	for (let i in chunkedList) {
		messagePlayerInfo(client, chunkedList[i].join(", "));
	}
}

// ===========================================================================

function setLocaleCommand(command, params, client) {
	if (areParamsEmpty(params)) {
		messagePlayerSyntax(client, getCommandSyntaxText(command));
		return false;
	}

	let localeId = getLocaleFromParams(params);

	if (!getLocaleData(localeId)) {
		messagePlayerInfo(client, getLocaleString(client, "InvalidLocale"));
		return false;
	}

	getPlayerData(client).accountData.locale = localeId;
	getPlayerData(client).locale = localeId;
	messagePlayerSuccess(client, getLocaleString(client, "LocaleChanged1", getLocaleString(client, "LocaleNativeName")));
	sendPlayerLocaleStrings(client);
}

// ===========================================================================

function getLocaleData(localeId) {
	if (typeof getLocales()[localeId] != "undefined") {
		return getLocales()[localeId];
	}

	return false;
}

// ===========================================================================

function reloadLocaleConfigurationCommand(command, params, client) {
	getGlobalConfig().locale = loadLocaleConfig();
	getServerData().localeStrings = loadAllLocaleStrings();

	// Translation Cache
	getServerData().cachedTranslations = new Array(getGlobalConfig().locale.locales.length);
	getServerData().cachedTranslationFrom = new Array(getGlobalConfig().locale.locales.length);
	getServerData().cachedTranslationFrom.fill([]);
	getServerData().cachedTranslations.fill(getServerData().cachedTranslationFrom);

	getGlobalConfig().locale.defaultLanguageId = getLocaleFromParams(getGlobalConfig().locale.defaultLanguage);

	messageAdmins(`${getPlayerName(client)}{MAINCOLOUR} has reloaded the locale settings and texts`);
}

// ===========================================================================

async function translateMessage(messageText, translateFrom = getGlobalConfig().locale.defaultLanguageId, translateTo = getGlobalConfig().locale.defaultLanguageId) {
	return new Promise(resolve => {
		if (translateFrom == translateTo) {
			resolve(messageText);
		}

		for (let i in cachedTranslations[translateFrom][translateTo]) {
			if (cachedTranslations[translateFrom][translateTo][i][0] == messageText) {
				logToConsole(LOG_DEBUG, `[Translate]: Using existing translation for ${getGlobalConfig().locale.locales[translateFrom].englishName} to ${getGlobalConfig().locale.locales[translateTo].englishName} - (${messageText}), (${cachedTranslations[translateFrom][translateTo][i][1]})`);
				resolve(cachedTranslations[translateFrom][translateTo][i][1]);
				return true;
			}
		}

		let thisTranslationURL = getGlobalConfig().locale.translateURL.format(encodeURI(messageText), toUpperCase(getGlobalConfig().locale.locales[translateFrom].isoCode), toUpperCase(getGlobalConfig().locale.locales[translateTo].isoCode), getGlobalConfig().locale.apiEmail);
		httpGet(
			thisTranslationURL,
			"",
			function (data) {
				data = ArrayBufferToString(data);
				let translationData = JSON.parse(data);
				cachedTranslations[translateFrom][translateTo].push([messageText, translationData.responseData.translatedText]);
				resolve(translationData.responseData.translatedText);
			},
			function (data) {
			}
		);
	});
}

// ===========================================================================