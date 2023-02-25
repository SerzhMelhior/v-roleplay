// ===========================================================================
// Vortrex's Roleplay Resource
// https://github.com/VortrexFTW/v-roleplay
// ===========================================================================
// FILE: payphone.js
// DESC: Provides payphone functions and commands
// TYPE: Server (JavaScript)
// ===========================================================================

class PayPhoneData {
	constructor(dbAssoc = false) {
		this.databaseId = 0;
		this.serverId = 0;
		this.index = -1;
		this.state = V_PAYPHONE_STATE_IDLE;
		this.number = 0;
		this.position = toVector3(0.0, 0.0, 0.0);
		this.usingPlayer = false;
		this.connectedPlayer = false;
		this.enabled = false;
		this.broken = false;
		this.price = 0;
		this.whoAdded = 0;
		this.whenAdded = 0;

		if (dbAssoc) {
			this.databaseId = toInteger(dbAssoc["payphone_id"]);
			this.serverId = toInteger(dbAssoc["payphone_server"]);
			this.number = toInteger(dbAssoc["payphone_number"]);
			this.enabled = intToBool(dbAssoc["payphone_enabled"]);
			this.broken = intToBool(dbAssoc["payphone_broken"]);
			this.position = toVector3(toFloat(dbAssoc["payphone_pos_x"]), toFloat(dbAssoc["payphone_pos_y"]), toFloat(dbAssoc["payphone_pos_z"]));
			this.price = toInteger(dbAssoc["payphone_price"]);
			this.whoAdded = toInteger(dbAssoc["payphone_who_added"]);
			this.whenAdded = toInteger(dbAssoc["payphone_when_added"]);
		}
	}
};

// ===========================================================================

function initPayPhoneScript() {
	logToConsole(LOG_INFO, "[V.RP.PayPhone]: Initializing payphone script ...");
	logToConsole(LOG_INFO, "[V.RP.PayPhone]: Payphone script initialized successfully!");
}

// ===========================================================================

function createPayPhoneCommand(command, params, client) {
	let payPhoneNumber = generateRandomPhoneNumber();

	if (!areParamsEmpty(params)) {
		if (isNaN(params)) {
			messagePlayerError(client, getLocaleString(client, "MustBeNumber"));
			return false;
		}

		payPhoneNumber = toInteger(params);
	}

	let closestPayPhone = getClosestPayPhone(getPlayerPosition(client));
	if (closestPayPhone != -1) {
		if (getDistance(getPlayerPosition(client), getPayPhoneData(closestPayPhone).position) <= getGlobalConfig().payPhoneAnswerDistance) {
			messagePlayerError(client, "There is already a payphone at this location!");
			return false;
		}
	}

	createPayPhone(getPlayerPosition(client), payPhoneNumber, getPlayerData(client).accountData.databaseId);
	messageAdmins(`{adminOrange}${getPlayerName(client)}{MAINCOLOUR} created a payphone with number {ALTCOLOUR}${payPhoneNumber}`);
}

// ===========================================================================

function createPayPhone(position, number, addedBy = defaultNoAccountId) {
	let tempPayPhoneData = new PayPhoneData(false);
	tempPayPhoneData.number = number;
	tempPayPhoneData.position = position;
	tempPayPhoneData.state = V_PAYPHONE_STATE_IDLE;
	tempPayPhoneData.needsSaved = true;
	tempPayPhoneData.whoAdded = addedBy;
	tempPayPhoneData.whenAdded = getCurrentUnixTimestamp();
	tempPayPhoneData.whoDeleted = defaultNoAccountId;
	tempPayPhoneData.whenDeleted = 0;

	getServerData().payPhones.push(tempPayPhoneData);

	sendPayPhoneToPlayer(null, getServerData().payPhones.length - 1, false, tempPayPhoneData.state, tempPayPhoneData.position);

	return true;
}

// ===========================================================================

function getClosestPayPhone(position) {
	let closest = 0;
	for (let i in getServerData().payPhones) {
		if (getDistance(position, getServerData().payPhones[i].position) < getDistance(position, getServerData().payPhones[closest].position)) {
			closest = i;
		}
	}

	return closest;
}

// ===========================================================================

/**
 * @param {Number} payPhoneIndex - The data index of the payphone
 * @return {PayPhoneData} The payphone's data (class instance)
 */
function getPayPhoneData(payPhoneIndex) {
	if (payPhoneIndex == -1) {
		return false;
	}

	if (typeof getServerData().payPhones[payPhoneIndex] != "undefined") {
		return getServerData().payPhones[payPhoneIndex];
	}

	return false;
}

// ===========================================================================

function callPayPhoneCommand(command, params, client) {
	if (areParamsEmpty(params)) {
		messagePlayerSyntax(client, getCommandSyntaxText(command));
		return false;
	}

	if (getPlayerData(client).usingPayPhone != -1) {
		messagePlayerError(client, getLocaleString(client, "AlreadyUsingPayPhone"));
		return false;
	}

	let closestPayPhone = getClosestPayPhone(getPlayerPosition(client));

	if (closestPayPhone == -1) {
		messagePlayerError(client, getLocaleString(client, "NoPayPhoneCloseEnough"));
		return false;
	}

	if (getDistance(getPlayerPosition(client), getPayPhoneData(closestPayPhone).position) > getGlobalConfig().payPhoneAnswerDistance) {
		messagePlayerError(client, getLocaleString(client, "NoPayPhoneCloseEnough"));
		return false;
	}

	// Will work on dual number/player calling param later
	//let targetRecipient = getPayPhoneRecipientFromParams(params);

	let targetClient = getPlayerFromParams(params);

	if (!targetClient) {
		messagePlayerError(client, getLocaleString(client, "InvalidPlayer"));
		return false;
	}

	if (getPlayerData(targetClient).usingPayPhone != -1 || isPlayerRestrained(targetClient) || isPlayerSurrendered(targetClient) || isPlayerMuted(targetClient) || !isPlayerSpawned(targetClient)) {
		messagePlayerError(client, getLocaleString(client, "UnableToCallPlayer"));
		return false;
	}

	let closestPayPhoneTarget = getClosestPayPhone(getPlayerPosition(targetClient));

	getPayPhoneData(closestPayPhone).state = V_PAYPHONE_STATE_CALLING;
	getPayPhoneData(closestPayPhone).usingPlayer = client;

	sendPayPhonePickupToPlayer(client);

	setTimeout(function () {
		sendPayPhoneDialingToPlayer(client);
		setTimeout(function () {
			getPayPhoneData(closestPayPhoneTarget).state = V_PAYPHONE_STATE_RINGING;
			getPayPhoneData(closestPayPhoneTarget).usingPlayer = client;

			getPlayerData(client).usingPayPhone = closestPayPhone;

			sendPayPhoneStateToClient(null, closestPayPhone, V_PAYPHONE_STATE_CALLING);
			sendPayPhoneStateToClient(null, closestPayPhoneTarget, V_PAYPHONE_STATE_RINGING);
		}, 6000);
	}, 1000);
}

// ===========================================================================

function givePayPhoneToPlayerCommand(command, params, client) {
	if (getPlayerData(client).usingPayPhone == -1) {
		messagePlayerError(client, "NotUsingPayPhone");
		return false;
	}

	let targetClient = getClosestPlayer(getPlayerPosition(client), client);

	if (areParamsEmpty(params)) {
		targetClient = getPlayerFromParams(params);
	}

	if (!targetClient) {
		messagePlayerError(client, getLocaleString(client, "InvalidPlayer"));
		return false;
	}

	if (getDistance(getPlayerPosition(client), getPlayerPosition(targetClient) <= getGlobalConfig().payPhoneGiveDistance)) {
		messagePlayerError(client, getLocaleString(client, "NoPlayerCloseEnough"))
		return false;
	}

	let otherClient = getPlayerData(client).payPhoneOtherPlayer;
	messagePlayerAlert(otherClient, getLocaleString(otherClient, "PayPhoneOccupantSwitched"));
	messagePlayerAlert(targetClient, getLocaleString(targetClient, "PayPhoneReceived", `{ALTCOLOUR}${getCharacterFullName(targetClient)}{MAINCOLOUR}`));
	messagePlayerSuccess(client, getLocaleString(client, "PayPhoneGiven", `{ALTCOLOUR}${getCharacterFullName(targetClient)}{MAINCOLOUR}`));

	getPlayerData(targetClient).payPhoneCallStart = getPlayerData(client).payPhoneCallStart;
	getPlayerData(targetClient).payPhoneOtherPlayer = otherClient;
	getPlayerData(targetClient).usingPayPhone = getPlayerData(client).usingPayPhone;
	getPlayerData(targetClient).payPhoneInitiatedCall = getPlayerData(client).payPhoneInitiatedCall;

	getPlayerData(client).payPhoneCallStart = 0;
	getPlayerData(client).payPhoneOtherPlayer = null;
	getPlayerData(client).usingPayPhone = -1;
	getPlayerData(client).payPhoneInitiatedCall = false;

	getPlayerData(otherClient).payPhoneCallStart = getCurrentUnixTimeStamp();
	getPlayerData(otherClient).payPhoneOtherPlayer = targetClient;
}

// ===========================================================================

function answerPayPhoneCommand(command, params, client) {
	//if (areParamsEmpty(params)) {
	//	messagePlayerSyntax(client, getCommandSyntaxText(command));
	//	return false;
	//}

	if (getPlayerData(client).usingPayPhone != -1) {
		messagePlayerError(client, getLocaleString(client, "AlreadyUsingPayPhone"));
		return false;
	}

	let closestPayPhone = getClosestPayPhone(getPlayerPosition(client));

	if (getDistance(getPlayerPosition(client), getPayPhoneData(closestPayPhone).position) > getGlobalConfig().payPhoneAnswerDistance) {
		messagePlayerError(client, getLocaleString(client, "NoPayPhoneCloseEnough"));
		return false;
	}

	if (getPayPhoneData(closestPayPhone).state != V_PAYPHONE_STATE_RINGING) {
		messagePlayerError(client, getLocaleString(client, "PayPhoneNotRinging"));
		return false;
	}

	let otherClient = getPayPhoneData(closestPayPhone).usingPlayer;
	messagePlayerAlert(otherClient, getLocaleString(client, "PayPhoneRecipientAnswered"));
	messagePlayerNormal(client, getLocaleString(client, "PayPhoneAnswered"));

	getPlayerData(client).payPhoneCallStart = getCurrentUnixTimeStamp();
	getPlayerData(client).payPhoneOtherPlayer = otherClient;
	getPlayerData(client).usingPayPhone = closestPayPhone;
	getPlayerData(otherClient).payPhoneCallStart = getCurrentUnixTimeStamp();
	getPlayerData(otherClient).payPhoneOtherPlayer = client;

	getPayPhoneData(closestPayPhone).state = V_PAYPHONE_STATE_ACTIVE_CALL;
	getPayPhoneData(closestPayPhone).usingPlayer = client;
	getPayPhoneData(getPlayerData(otherClient).usingPayPhone).state = V_PAYPHONE_STATE_ACTIVE_CALL;

	sendPayPhoneStateToClient(null, closestPayPhone, V_PAYPHONE_STATE_ACTIVE_CALL);
	sendPayPhoneStateToClient(null, getPlayerData(otherClient).usingPayPhone, V_PAYPHONE_STATE_ACTIVE_CALL);
}

// ===========================================================================

function hangupPayPhoneCommand(command, params, client) {
	//if (areParamsEmpty(params)) {
	//	messagePlayerSyntax(client, getCommandSyntaxText(command));
	//	return false;
	//}

	if (getPlayerData(client).usingPayPhone == -1) {
		messagePlayerError(client, getLocaleString(client, "NotUsingPayPhone"));
		return false;
	}

	if (getPayPhoneData(getPlayerData(client).usingPayPhone) == false) {
		getPlayerData(client).usingPayPhone = -1
		messagePlayerError(client, getLocaleString(client, "InvalidPayPhone"));
		return false;
	}

	let clientPayPhoneIndex = getPlayerData(client).usingPayPhone;
	let clientPayPhone = getPayPhoneData(clientPayPhone);

	if (clientPayPhone.state == V_PAYPHONE_STATE_CALLING) {
		clientPayPhone.state = V_PAYPHONE_STATE_IDLE;
		clientPayPhone.usingPlayer = null;

		sendPayPhoneStateToClient(null, clientPayPhoneIndex, V_PAYPHONE_STATE_IDLE);

		let otherPayPhoneIndex = getPayPhoneUsedByPlayer(client);
		if (clientPayPhoneIndex != otherPayPhoneIndex) {
			getPayPhoneData(otherPayPhoneIndex).state = V_PAYPHONE_STATE_IDLE;
			getPayPhoneData(otherPayPhoneIndex).usingPlayer = null;

			sendPayPhoneStateToClient(null, otherPayPhoneIndex, V_PAYPHONE_STATE_IDLE);
		}
	} else if (clientPayPhone.state == V_PAYPHONE_STATE_ACTIVE_CALL) {
		let otherClient = getPlayerData(client).payPhoneOtherPlayer;
		let otherClientPayPhoneIndex = getPlayerData(otherClient).usingPayPhone;
		let otherClientPayPhone = getPayPhoneData(otherClientPayPhoneIndex);

		if (getPlayerData(client).payPhoneInitiatedCall == true) {
			messagePlayerNormal(client, getLocaleString("PayPhoneRecipientHangup", getPayPhoneCallPrice(clientPayPhoneIndex, getCurrentUnixTimeStamp() - getPlayerData(client).payPhoneCallStart)));
			takePlayerCash(client, getPayPhoneCallPrice(getCurrentUnixTimeStamp() - getPlayerData(client).payPhoneCallStart));
			messagePlayerAlert(otherClient, getLocaleString(client, "PayPhoneHangup"));
		} else {
			messagePlayerNormal(otherClient, getLocaleString("PayPhoneRecipientHangup", getPayPhoneCallPrice(otherClientPayPhoneIndex, getCurrentUnixTimeStamp() - getPlayerData(client).payPhoneCallStart)));
			takePlayerCash(otherClient, getPayPhoneCallPrice(getCurrentUnixTimeStamp() - getPlayerData(client).payPhoneCallStart));
			messagePlayerAlert(client, getLocaleString(client, "PayPhoneHangup"));
		}

		clientPayPhone.state = V_PAYPHONE_STATE_IDLE;
		otherClientPayPhone.state = V_PAYPHONE_STATE_IDLE;

		sendPayPhoneStateToClient(null, clientPayPhone, V_PAYPHONE_STATE_IDLE);
		sendPayPhoneStateToClient(null, otherClientPayPhone, V_PAYPHONE_STATE_IDLE);

		getPlayerData(otherClient).payPhoneCallStart = 0;
		getPlayerData(otherClient).payPhoneOtherPlayer = null;
		getPlayerData(otherClient).usingPayPhone = -1;
	}

	getPlayerData(client).payPhoneCallStart = 0
	getPlayerData(client).payPhoneOtherPlayer = null;
	getPlayerData(client).usingPayPhone = -1;
}

// ===========================================================================

function loadPayPhonesFromDatabase() {
	logToConsole(LOG_DEBUG, `[V.RP.PayPhone]: Loading payphones from database ...`);
	let dbConnection = connectToDatabase();
	let tempPayPhones = [];
	let dbAssoc = [];
	if (dbConnection) {
		let dbQueryString = `SELECT * FROM payphone_main WHERE payphone_server = ${getServerId()} AND payphone_enabled = 1`;
		dbAssoc = fetchQueryAssoc(dbConnection, dbQueryString);
		if (dbAssoc.length > 0) {
			for (let i in dbAssoc) {
				let tempPayPhoneData = new PayPhoneData(dbAssoc[i]);
				tempPayPhones.push(tempPayPhoneData);
			}
		}
		disconnectFromDatabase(dbConnection);
	}

	logToConsole(LOG_DEBUG, `[V.RP.PayPhone]: ${tempPayPhones.length} payphones loaded from database successfully!`);
	return tempPayPhones;
}

// ===========================================================================

function saveAllPayPhonesToDatabase() {
	if (getServerConfig().devServer) {
		return false;
	}

	for (let i in getServerData().payPhones) {
		savePayPhoneToDatabase(i);
	}
}

// ===========================================================================

function savePayPhoneToDatabase(payPhoneIndex) {
	if (getServerConfig().devServer) {
		logToConsole(LOG_VERBOSE, `[V.RP.PayPhone]: Payphone ${payPhoneIndex} can't be saved because server is running as developer only. Aborting save ...`);
		return false;
	}

	if (getPayPhoneData(payPhoneIndex) == false) {
		logToConsole(LOG_VERBOSE, `[V.RP.PayPhone]: Payphone ${payPhoneIndex} data is invalid. Aborting save ...`);
		return false;
	}

	let tempPayPhoneData = getPayPhoneData(payPhoneIndex);

	if (tempPayPhoneData.databaseId == -1) {
		logToConsole(LOG_VERBOSE, `[V.RP.PayPhone]: Payphone ${payPhoneIndex} is a temp payphone. Aborting save ...`);
		return false;
	}

	if (!tempPayPhoneData.needsSaved) {
		logToConsole(LOG_VERBOSE, `[V.RP.PayPhone]: Payphone ${payPhoneIndex} hasn't changed data. Aborting save ...`);
		return false;
	}

	logToConsole(LOG_VERBOSE, `[V.RP.PayPhone]: Saving payphone ${tempPayPhoneData.databaseId} to database ...`);
	let dbConnection = connectToDatabase();
	if (dbConnection) {
		let data = [
			["payphone_server", getServerId()],
			["payphone_number", toInteger(tempPayPhoneData.number)],
			["payphone_enabled", boolToInt(tempPayPhoneData.enabled)],
			["payphone_price", toInteger(tempPayPhoneData.price)],
			["payphone_who_added", toInteger(tempPayPhoneData.whoAdded)],
			["payphone_when_added", toInteger(tempPayPhoneData.whenAdded)],
			["payphone_pos_x", toFloat(tempPayPhoneData.position.x)],
			["payphone_pos_y", toFloat(tempPayPhoneData.position.y)],
			["payphone_pos_z", toFloat(tempPayPhoneData.position.z)],
		];

		let dbQuery = null;
		if (tempPayPhoneData.databaseId == 0) {
			let queryString = createDatabaseInsertQuery("payphone_main", data);
			dbQuery = queryDatabase(dbConnection, queryString);
			tempPayPhoneData.databaseId = getDatabaseInsertId(dbConnection);
			tempPayPhoneData.needsSaved = false;
		} else {
			let queryString = createDatabaseUpdateQuery("payphone_main", data, `payphone_id=${tempPayPhoneData.databaseId}`);
			dbQuery = queryDatabase(dbConnection, queryString);
			tempPayPhoneData.needsSaved = false;
		}

		logToConsole(LOG_VERBOSE, `[V.RP.PayPhone]: Saved payphone ${payPhoneIndex} to database!`);

		freeDatabaseQuery(dbQuery);
		disconnectFromDatabase(dbConnection);
		return true;
	}

	return false;
}

// ===========================================================================

function setAllPayPhoneIndexes() {
	for (let i in getServerData().payPhones) {
		getServerData().payPhones[i].index = i;
	}
}

// ===========================================================================

function getPayPhoneCallPrice(payPhoneIndex, durationSeconds) {
	// Charge price for every 10 seconds
	return getPayPhoneData(payPhoneIndex).price * Math.ceil(durationSeconds / 10);
}

// ===========================================================================

function getPayPhoneUsedByPlayer(client) {
	for (let i in getServerData().payPhones) {
		if (getServerData().payPhones[i].usingPlayer) {
			return i;
		}
	}

	return -1;
}

// ===========================================================================