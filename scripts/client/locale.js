// ===========================================================================
// Vortrex's Roleplay Resource
// https://github.com/VortrexFTW/gtac_roleplay
// ===========================================================================
// FILE: locale.js
// DESC: Provides locale functions and usage
// TYPE: Client (JavaScript)
// ===========================================================================

function getLocaleString(stringName, ...args) {
	return findResourceByName("agrp_locale").exports.getLocaleString(localLocaleId, stringName, args);
}

// ===========================================================================

function getGroupedLocaleString(stringName, index, ...args) {
	return findResourceByName("agrp_locale").exports.getGroupedLocaleString(localLocaleId, stringName, index, args);
}

// ===========================================================================

function getAvailableLocaleOptions() {
	return findResourceByName("agrp_locale").exports.getAvailableLocaleOptions();
}

// ===========================================================================

function getLocales() {
	return findResourceByName("agrp_locale").exports.getLocales();
}

// ===========================================================================

function setLocale(tempLocaleId) {
	let locales = getLocales();
	logToConsole(LOG_DEBUG, `[VRR.Locale] Setting locale to ${tempLocaleId} (${locales[tempLocaleId].englishName})`);
	localLocaleId = tempLocaleId;
	resetGUIStrings();
}

// ===========================================================================