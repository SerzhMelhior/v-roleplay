// ===========================================================================
// Asshat Gaming Roleplay
// https://github.com/VortrexFTW/agrp_main
// (c) 2022 Asshat Gaming
// ===========================================================================
// FILE: clan-manager.js
// DESC: Provides clan manager GUI
// TYPE: Client (JavaScript)
// ===========================================================================

let clanManager = {
	window: null,
	generalTabButton: null,
	ranksTabButton: null,
	membersTabButton: null,
	vehiclesTabButton: null,
	businessesTabButton: null,
	housesTabButton: null,
	generalTab: {
		noPermissionsErrorLabel: null,
		clanNameInput: null,
		clanTagInput: null,
		clanMOTDInput: null,
		clanDiscordWebhookURLInput: null,
		clanDiscordWebhookEnabledCheckbox: null,
		clanDiscordWebhookSendVehicleEventsCheckbox: null,
		clanDiscordWebhookSendHouseEventsCheckbox: null,
		clanDiscordWebhookSendBusinessEventsCheckbox: null,
		clanDiscordWebhookSendRankEventsCheckbox: null,
		clanDiscordWebhookSendMemberEventsCheckbox: null,
		clanDiscordWebhookEnabledLabel: null,
		clanDiscordWebhookSendVehicleEventsLabel: null,
		clanDiscordWebhookSendHouseEventsLabel: null,
		clanDiscordWebhookSendBusinessEventsLabel: null,
		clanDiscordWebhookSendRankEventsLabel: null,
		clanDiscordWebhookSendMemberEventsLabel: null,
		clanSaveButton: null,
	},
	ranksTab: {
		noPermissionsErrorLabel: null,
		ranks: [

		]
	},
	membersTab: {
		noPermissionsErrorLabel: null,
	},
	vehiclesTab: {
		noPermissionsErrorLabel: null,
	},
	businessesTab: {
		noPermissionsErrorLabel: null,
	},
	housesTab: {
		noPermissionsErrorLabel: null,
	},
};

class clanRankTab {
	rankContainer = null;
	rankNameLabel = null;
	rankLevelLabel = null;
	rankTagLabel = null;
	rankExpandButton = null;
	rankNameInput = null;
	rankLevelNumberSelect = null;
	rankTagInput = null;
	rankPermissionStartTurfWarCheckbox = null;
	rankPermissionStartPointWarCheckbox = null;
	rankPermissionInviteMemberCheckbox = null;
	rankPermissionSuspendMemberCheckbox = null;
	rankPermissionRemoveMemberCheckbox = null;
	rankPermissionMemberRankCheckbox = null;
	rankPermissionClanTagCheckbox = null;
	rankPermissionClanNameCheckbox = null;
	rankPermissionManageVehiclesCheckbox = null;
	rankPermissionManageHousesCheckbox = null;
	rankPermissionManageBusinessesCheckbox = null;
	rankPermissionManageNPCsCheckbox = null;
	rankPermissionManageRanksCheckbox = null;
	rankPermissionOwnerCheckbox = null;
	rankPermissionStartTurfWarLabel = null;
	rankPermissionStartPointWarLabel = null;
	rankPermissionInviteMemberLabel = null;
	rankPermissionSuspendMemberLabel = null;
	rankPermissionRemoveMemberLabel = null;
	rankPermissionMemberRankLabel = null;
	rankPermissionClanTagLabel = null;
	rankPermissionClanNameLabel = null;
	rankPermissionManageVehiclesLabel = null;
	rankPermissionManageHousesLabel = null;
	rankPermissionManageBusinessesLabel = null;
	rankPermissionManageNPCsLabel = null;
	rankPermissionManageRanksLabel = null;
	rankPermissionOwnerLabel = null;
	rankSaveButton = null;

	constructor(data) {

	}
}

// ===========================================================================

function initClanManagerGUI() {
	logToConsole(LOG_DEBUG, `[VRR.GUI] Creating character select GUI ...`);
	clanManager.window = mexui.window(game.width / 2 - 230, game.height / 2 - 170, 460, 340, 'CLAN MANAGER', {
		main: {
			backgroundColour: toColour(secondaryColour[0], secondaryColour[1], secondaryColour[2], windowAlpha),
		},
		title: {
			textSize: 12.0,
			textFont: mainFont,
			textColour: toColour(0, 0, 0, 255),
			backgroundColour: toColour(primaryColour[0], primaryColour[1], primaryColour[2], windowTitleAlpha),
		},
		icon: {
			textSize: 10.0,
			textFont: mainFont,
			textColour: toColour(0, 0, 0, 255),
			backgroundColour: toColour(primaryColour[0], primaryColour[1], primaryColour[2], windowTitleAlpha),
		}
	});
	clanManager.window.titleBarIconSize = toVector2(0, 0);
	clanManager.window.titleBarIconShown = false;
	clanManager.window.titleBarHeight = 30;

	clanManager.generalTabButton = clanManager.window.button(5, 5, 85, 20, 'GENERAL', {
		main: {
			backgroundColour: toColour(primaryColour[0], primaryColour[1], primaryColour[2], buttonAlpha),
			textColour: toColour(primaryTextColour[0], primaryTextColour[1], primaryTextColour[2], 255),
			textSize: 10.0,
			textFont: mainFont,
			textAlign: 0.5,
		},
		focused: {
			borderColour: toColour(primaryColour[0], primaryColour[1], primaryColour[2], buttonAlpha),
		}
	}, switchClanManagerToGeneralTab);

	clanManager.ranksTabButton = clanManager.window.button(95, 5, 85, 20, 'RANKS', {
		main: {
			backgroundColour: toColour(primaryColour[0], primaryColour[1], primaryColour[2], buttonAlpha),
			textColour: toColour(primaryTextColour[0], primaryTextColour[1], primaryTextColour[2], 255),
			textSize: 10.0,
			textFont: mainFont,
			textAlign: 0.5,
		},
		focused: {
			borderColour: toColour(primaryColour[0], primaryColour[1], primaryColour[2], buttonAlpha),
		}
	}, switchClanManagerToRanksTab);

	clanManager.membersTabButton = clanManager.window.button(185, 5, 85, 20, 'MEMBERS', {
		main: {
			backgroundColour: toColour(primaryColour[0], primaryColour[1], primaryColour[2], buttonAlpha),
			textColour: toColour(primaryTextColour[0], primaryTextColour[1], primaryTextColour[2], 255),
			textSize: 10.0,
			textFont: mainFont,
			textAlign: 0.5,
		},
		focused: {
			borderColour: toColour(primaryColour[0], primaryColour[1], primaryColour[2], buttonAlpha),
		}
	}, switchClanManagerToMembersTab);

	clanManager.businessesTabButton = clanManager.window.button(275, 5, 85, 20, 'BUSINESSES', {
		main: {
			backgroundColour: toColour(primaryColour[0], primaryColour[1], primaryColour[2], buttonAlpha),
			textColour: toColour(primaryTextColour[0], primaryTextColour[1], primaryTextColour[2], 255),
			textSize: 10.0,
			textFont: mainFont,
			textAlign: 0.5,
		},
		focused: {
			borderColour: toColour(primaryColour[0], primaryColour[1], primaryColour[2], buttonAlpha),
		}
	}, switchClanManagerToBusinessesTab);

	clanManager.housesTabButton = clanManager.window.button(365, 5, 85, 20, 'HOUSES', {
		main: {
			backgroundColour: toColour(primaryColour[0], primaryColour[1], primaryColour[2], buttonAlpha),
			textColour: toColour(primaryTextColour[0], primaryTextColour[1], primaryTextColour[2], 255),
			textSize: 10.0,
			textFont: mainFont,
			textAlign: 0.5,
		},
		focused: {
			borderColour: toColour(primaryColour[0], primaryColour[1], primaryColour[2], buttonAlpha),
		}
	}, switchClanManagerToHousesTab);

	clanManager.vehiclesTabButton = clanManager.window.button(455, 5, 85, 20, 'VEHICLES', {
		main: {
			backgroundColour: toColour(primaryColour[0], primaryColour[1], primaryColour[2], buttonAlpha),
			textColour: toColour(primaryTextColour[0], primaryTextColour[1], primaryTextColour[2], 255),
			textSize: 10.0,
			textFont: mainFont,
			textAlign: 0.5,
		},
		focused: {
			borderColour: toColour(primaryColour[0], primaryColour[1], primaryColour[2], buttonAlpha),
		}
	}, switchClanManagerToVehiclesTab);

	let gridWidth = 80 * (clanManager.window.width / 100);
	let gridHeight = 80 * (clanManager.window.height / 100);
	clanManager.ranksTab.grid = clanManager.window.grid(5, 30, gridWidth, gridHeight, {
		main: {
			backgroundColour: toColour(secondaryColour[0], secondaryColour[1], secondaryColour[2], windowAlpha),
		},
		column: {
			lineColour: toColour(primaryColour[0], primaryColour[1], primaryColour[2], buttonAlpha),
		},
		header: {
			backgroundColour: toColour(secondaryColour[0], secondaryColour[1], secondaryColour[2], windowAlpha),
			textColour: toColour(primaryTextColour[0], primaryTextColour[1], primaryTextColour[2], 255),
		},
		cell: {
			backgroundColour: toColour(secondaryColour[0], secondaryColour[1], secondaryColour[2], windowAlpha),
			textColour: toColour(primaryTextColour[0], primaryTextColour[1], primaryTextColour[2], 255),
		},
		row: {
			lineColour: toColour(primaryColour[0], primaryColour[1], primaryColour[2], buttonAlpha),
		}
	});
}

// ===========================================================================

function switchClanManagerToBusinessesTab() {
	hideAllClanManagerTabs();
	showClanManagerBusinessesTab();
}

// ===========================================================================

function switchClanManagerToHousesTab() {
	hideAllClanManagerTabs();
	showClanManagerHousesTab();
}

// ===========================================================================

function switchClanManagerToGeneralTab() {
	hideAllClanManagerTabs();
	showClanManagerGeneralTab();
}

// ===========================================================================

function switchClanManagerToMembersTab() {
	hideAllClanManagerTabs();
	showClanManagerMembersTab();
}

// ===========================================================================

function switchClanManagerToRanksTab() {
	hideAllClanManagerTabs();
	showClanManagerRanksTab();
}

// ===========================================================================

function switchClanManagerToVehiclesTab() {
	hideAllClanManagerTabs();
	showClanManagerVehiclesTab();
}

// ===========================================================================

function hideAllClanManagerTabs() {
	hideClanManagerGeneralTab();
	hideClanManagerRanksTab();
	hideClanManagerMembersTab();
	hideClanManagerBusinessesTab();
	hideClanManagerHousesTab();
	hideClanManagerVehiclesTab();
}

// ===========================================================================

function hideClanManagerGeneralTab() {
	for (let i in clanManager.generalTab) {
		clanManager.generalTab[i].shown = false;
	}
}

// ===========================================================================

function hideClanManagerRanksTab() {
	for (let i in clanManager.ranksTab) {
		clanManager.ranksTab[i].shown = false;
	}
}

// ===========================================================================

function hideClanManagerMembersTab() {
	for (let i in clanManager.membersTab) {
		clanManager.membersTab[i].shown = false;
	}
}

// ===========================================================================

function hideClanManagerBusinessesTab() {
	for (let i in clanManager.businessesTab) {
		clanManager.businessesTab[i].shown = false;
	}
}

// ===========================================================================

function hideClanManagerHousesTab() {
	for (let i in clanManager.housesTab) {
		clanManager.housesTab[i].shown = false;
	}
}

// ===========================================================================

function hideClanManagerVehiclesTab() {
	for (let i in clanManager.vehiclesTab) {
		clanManager.vehiclesTab[i].shown = false;
	}
}

// ===========================================================================

function showClanManagerGeneralTab() {
	for (let i in clanManager.generalTab) {
		clanManager.generalTab[i].shown = true;
	}
}

// ===========================================================================

function showClanManagerRanksTab() {
	for (let i in clanManager.ranksTab) {
		clanManager.ranksTab[i].shown = true;
	}
}

// ===========================================================================

function showClanManagerMembersTab() {
	for (let i in clanManager.membersTab) {
		clanManager.membersTab[i].shown = true;
	}
}

// ===========================================================================

function showClanManagerBusinessesTab() {
	for (let i in clanManager.businessesTab) {
		clanManager.businessesTab[i].shown = true;
	}
}

// ===========================================================================

function showClanManagerHousesTab() {
	for (let i in clanManager.housesTab) {
		clanManager.housesTab[i].shown = true;
	}
}

// ===========================================================================

function showClanManagerVehiclesTab() {
	for (let i in clanManager.vehiclesTab) {
		clanManager.vehiclesTab[i].shown = true;
	}
}

// ===========================================================================

function requestClanManagerData() {
	sendNetworkEventToServer("agrp.requestClanManagerData");
}

// ===========================================================================

function receiveClanManagerData(generalInfo, ranks, members, businesses, houses, vehicles) {
	updateClanManagerData(generalInfo, ranks, members, businesses, houses, vehicles);
}

// ===========================================================================

function updateClanManagerData(generalInfo, ranks, members, businesses, houses, vehicles) {
	for (let i in ranks) {
		rankContainer[i] = null;
		rankNameLabel[i] = mexui.window.text(5, 65, 200, 25, 'Cash: $0', {
			main: {
				textSize: 9.0,
				textAlign: 0.0,
				textColour: toColour(255, 255, 255, 220),
				textFont: mainFont,
			},
			focused: {
				borderColour: toColour(0, 0, 0, 0),
			}
		});
		rankLevelLabel[i] = null;
		rankTagLabel[i] = null;
		rankExpandButton[i] = null;
		rankNameInput[i] = null;
		rankLevelNumberSelect[i] = null;
		rankTagInput[i] = null;
		rankPermissionStartTurfWarCheckbox[i] = null;
		rankPermissionStartPointWarCheckbox[i] = null;
		rankPermissionInviteMemberCheckbox[i] = null;
		rankPermissionSuspendMemberCheckbox[i] = null;
		rankPermissionRemoveMemberCheckbox[i] = null;
		rankPermissionMemberRankCheckbox[i] = null;
		rankPermissionClanTagCheckbox[i] = null;
		rankPermissionClanNameCheckbox[i] = null;
		rankPermissionManageVehiclesCheckbox[i] = null;
		rankPermissionManageHousesCheckbox[i] = null;
		rankPermissionManageBusinessesCheckbox[i] = null;
		rankPermissionManageNPCsCheckbox[i] = null;
		rankPermissionManageRanksCheckbox[i] = null;
		rankPermissionOwnerCheckbox[i] = null;
		rankPermissionStartTurfWarLabel[i] = null;
		rankPermissionStartPointWarLabel[i] = null;
		rankPermissionInviteMemberLabel[i] = null;
		rankPermissionSuspendMemberLabel[i] = null;
		rankPermissionRemoveMemberLabel[i] = null;
		rankPermissionMemberRankLabel[i] = null;
		rankPermissionClanTagLabel[i] = null;
		rankPermissionClanNameLabel[i] = null;
		rankPermissionManageVehiclesLabel[i] = null;
		rankPermissionManageHousesLabel[i] = null;
		rankPermissionManageBusinessesLabel[i] = null;
		rankPermissionManageNPCsLabel[i] = null;
		rankPermissionManageRanksLabel[i] = null;
		rankPermissionOwnerLabel[i] = null;
		rankSaveButton[i] = null;
	}
}

// ===========================================================================
