// ===========================================================================
// Asshat Gaming RP
// http://asshatgaming.com
// © 2020 Asshat Gaming 
// ---------------------------------------------------------------------------
// FILE: faction.js
// DESC: Provides faction functions and usage
// TYPE: Server (JavaScript)
// ===========================================================================

function initFactionScript() {
	console.log("[Asshat.Faction]: Initializing faction script ...");
	addFactionCommandHandlers();
	console.log("[Asshat.Faction]: Faction script initialized!");	
	return true;
}

// ---------------------------------------------------------------------------

function addFactionCommandHandlers() {
	console.log("[Asshat.Faction]: Adding faction command handlers ...");
	let factionCommands = serverCommands.faction;
	for(let i in factionCommands) {
		addCommandHandler(factionCommands[i].command, factionCommands[i].handlerFunction);
	}
	console.log("[Asshat.Faction]: Faction command handlers added!");	
	return true;
}

// ---------------------------------------------------------------------------

function loadFactionsFromDatabase() {
	console.log("[Asshat.Faction]: Loading factions from database ...");

	let tempFactions = [];
	let dbConnection = connectToDatabase();
	
	if(dbConnection) {
		let dbQuery = dbConnection.query("SELECT * FROM `fac_main` WHERE `fac_server` = " + String(serverId));
		if(dbQuery) {
			if(dbQuery.numRows > 0) {
				while(dbFetchAssoc = dbQuery.fetchAssoc()) {
					let tempFactionData = getClasses().clanData(dbFetchAssoc);
					tempFactionData.members = loadFactionMembersFromDatabase(tempFactionData.databaseId);
					tempFactionData.ranks = loadFactionRanksFromDatabase(tempFactionData.databaseId);
					tempFactions.push(tempFactionData);
					console.log(`[Asshat.Faction]: Faction '${tempFactionData.name}' loaded from database successfully!`);
				}
			}
			dbQuery.free();
		}
		dbConnection.close();
	}

	console.log("[Asshat.Faction]: " + String(tempFactions.length) + " factions loaded from database successfully!");
	return tempFactions;
}

// ---------------------------------------------------------------------------