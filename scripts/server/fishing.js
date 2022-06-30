// ===========================================================================
// Vortrex's Roleplay Resource
// https://github.com/VortrexFTW/gtac_roleplay
// ===========================================================================
// FILE: fishing.js
// DESC: Provides fishing functions and commands
// TYPE: Server (JavaScript)
// ===========================================================================

// Fishing Catch Types (Probably not going to be used, in favor of items and their use type)
const VRR_FISHING_CATCH_TYPE_NONE = 1;
const VRR_FISHING_CATCH_TYPE_FISH = 1;
const VRR_FISHING_CATCH_TYPE_JUNK = 2;

// ===========================================================================

let fishingCollectables = [
	// Fish
	["Salmon", VRR_FISHING_CATCH_TYPE_FISH],
	["Tuna", VRR_FISHING_CATCH_TYPE_FISH],
	["Crab", VRR_FISHING_CATCH_TYPE_FISH],
	["Trout", VRR_FISHING_CATCH_TYPE_FISH],
	["Sea Bass", VRR_FISHING_CATCH_TYPE_FISH],
	["Shark", VRR_FISHING_CATCH_TYPE_FISH],
	["Turtle", VRR_FISHING_CATCH_TYPE_FISH],
	["Manta Ray", VRR_FISHING_CATCH_TYPE_FISH],
	["Cat Fish", VRR_FISHING_CATCH_TYPE_FISH],
	["Blue Marlin", VRR_FISHING_CATCH_TYPE_FISH],

	// Junk
	["Rusty Can", VRR_FISHING_CATCH_TYPE_JUNK],
	["Old Pants", VRR_FISHING_CATCH_TYPE_JUNK],
	["Old Shoes", VRR_FISHING_CATCH_TYPE_JUNK],
	["Garbage", VRR_FISHING_CATCH_TYPE_JUNK],
	["Baby Diaper", VRR_FISHING_CATCH_TYPE_JUNK],
	["Old Tire", VRR_FISHING_CATCH_TYPE_JUNK],
	["Old Car Battery", VRR_FISHING_CATCH_TYPE_JUNK],
	["Horse Hoove", VRR_FISHING_CATCH_TYPE_JUNK],
	["Soggy Log", VRR_FISHING_CATCH_TYPE_JUNK],
	["Soggy Dildo", VRR_FISHING_CATCH_TYPE_JUNK],
	["Clump of Seaweed", VRR_FISHING_CATCH_TYPE_JUNK],
];

// ===========================================================================

function initFishingScript() {
	logToConsole(LOG_INFO, "[VRR.Fishing]: Initializing fishing script ...");
	logToConsole(LOG_INFO, "[VRR.Fishing]: Fishing script initialized successfully!");
}

// ===========================================================================

function castFishingLineCommand(client) {
	if (isPlayerInFishingSpot(client)) {
		messagePlayerError(client, getLocaleString(client, "CantFishHere"));
		return false;
	}

	if (doesPlayerHaveItemOfUseTypeEquipped(client, VRR_ITEM_USE_TYPE_FISHINGROD)) {
		messagePlayerError(client, getLocaleString(client, "NeedFishingRod"));
		return false;
	}

	getPlayerData(client).fishingLineCastStart = getCurrentUnixTimestamp();
	makePedPlayAnimation(getPlayerPed(client), getAnimationFromParams("batswing"));

	let messageText = getLocaleString(client, "FishingCastCommandHelp")
	if (doesPlayerHaveKeyBindForCommand(client, "fish")) {
		messageText = getLocaleString(client, "FishingCastKeyPressHelp")
	}

	showGameMessage(client, messageText);
}

// ===========================================================================

function resetFishingLineCommand(client) {
	if (doesPlayerHaveFishingLineCast(client)) {
		messagePlayerError(client, getLocaleString(client, "FishingLineNotCast"));
		return false;
	}

	if (doesPlayerHaveItemOfUseTypeEquipped(client, VRR_ITEM_USE_TYPE_FISHINGROD)) {
		messagePlayerError(client, getLocaleString(client, "CantFishHere"));
		return false;
	}

	makePedStopAnimation(getPlayerPed(client));

	let messageText = getLocaleString(client, "FishingCastCommandHelp")
	if (doesPlayerHaveKeyBindForCommand(client, "fish")) {
		messageText = getLocaleString(client, "FishingCastKeyPressHelp")
	}

	showGameMessage(client, messageText);
}

// ===========================================================================

function doesPlayerHaveFishingLineCast(client) {
	return getPlayerData(client).fishingLineCastStart != 0;
}

// ===========================================================================

function isPlayerInFishingSpot(client) {
	if (isPlayerOnBoat(client)) {
		return true;
	}

	let closestFishingLocation = getClosestFishingLocation(getPlayerPosition(client));
	if (closestFishingLocation != false) {
		if (getDistance(getPlayerPosition(client), closestFishingLocation) < getGlobalConfig().fishingSpotDistance) {
			return true;
		}
	}

	return false;
}

// ===========================================================================