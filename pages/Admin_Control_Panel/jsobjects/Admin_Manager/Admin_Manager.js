export default {
/**
 * AdminManager: Handles the localized Verification Loop on the Mac Mini.
 * Coordinates verbal verification, visual prop inspection, and progression.
 */
	/**
	 * 1. SCAN PHASE
	 * Triggered by the Admin Camera Widget.
	 * Expects QR Format: "PLAYER_ID|RECIPE_ID"
	 */
	onQRScan: async () => {
		// 1. Get the raw text from the scanner widget
		const rawData = Camera_Admin.value; 

		if (!rawData) {
			showAlert("No QR data found. Please scan again.", "warning");
			return;
		}

		// 2. Split the string at the colon
		const parts = rawData.split(':');
		if (parts.length < 2) {
			showAlert("Invalid QR Format. Expected: PLAYER_ID:RECIPE_ID", "error");
			return;
		}

		const scannedPlayerId = parts[0];
		const recipeId = parts[1];

		try {
			// Fetch Player and Recipe details from local PocketBase (Mac Mini)
			const playerResponse = await fetch_player_by_id.run({ playerId: scannedPlayerId });
			const recipeResponse = await fetch_recipe_by_id.run({ recipeId });

			// Safely extract the data whether it's wrapped in 'items' or already an array
			const playerList = playerResponse.items ? playerResponse.items : playerResponse;
			const recipeList = recipeResponse.items ? recipeResponse.items : recipeResponse;

			// Now check the actual arrays
			if (!Array.isArray(playerList) || playerList.length === 0 || !Array.isArray(recipeList) || recipeList.length === 0) {
				showAlert("Local record not found. Check if IDs match the database.", "error");
				return;
			}

			// Safely grab the first record from each
			const p = playerList[0];
			const r = recipeList[0];

			// Construct the URL for the Assembly Image stored in PocketBase
			const ip = "192.168.10.63";
			const assemblyImageUrl = `http://${ip}:8090/api/files/Schematics/${r.id}/${r.Picture}`;

			// Store in Appsmith memory for UI bindings (Verbal & Visual checks)
			await storeValue('activeVerification', {
				player_id: p.id,
				player_name: p.Name,
				player_tier: Number(p.Tier || 1),
				T1_Completion: p.T1_Completion || "",
				T2_Completion: p.T2_Completion || "",
				T3_Completion: p.T3_Completion || "",
				T4_Completion: p.T4_Completion || "",
				Debug: p.Debug || false,
				// Recipe Details
				recipe_id: r.id,
				recipe_name: r.Name,
				recipe_tier: r.Tier,
				recipe_code: r.recipe_code.toUpperCase(),
				recipe_image: assemblyImageUrl
			});

			showAlert(`Identified: ${p.Name}. Awaiting visual inspection.`, "info");

		} catch (e) {
			showAlert("Admin Scan Error: " + e.message, "error");
		}
	},

	/**
	 * 2. VERIFY & PROGRESS PHASE
	 * Triggered by the "Verify Synthesis" button after the Admin is satisfied.
	 * Appends the recipe_code to the Tier String and checks for Rank advancement.
	 */
	verifySynthesis: async () => {
		const data = appsmith.store.activeVerification;
		if (!data) return;

		// Fetch Thresholds from local Game Settings (T1Threshold, T2Threshold, etc.)
		const settingsRaw = fetch_game_settings.data;
		const settings = (Array.isArray(settingsRaw) ? settingsRaw[0] : settingsRaw) || { T1Threshold: 2, T2Threshold: 4, T3Threshold: 4, T4Threshold: 4 };

		const tier = data.recipe_tier;
		const field = `T${tier}_Completion`;
		const code = data.recipe_code;
		
		let currentStr = String(data[field] || "");
		let updatedStr = currentStr;
		let earnedTier = Number(data.player_tier);

		// A. Check for Duplicates / Append Code
		if (!currentStr.includes(code)) {
			updatedStr = currentStr + code;
		}

		// B. Progression Check (Threshold Logic)
		if (!data.Debug) {
			const thresholdKey = `T${tier}Threshold`;
			const threshold = Number(settings[thresholdKey] || 99);
			
			// If the player is solving a recipe in their current highest tier, check for upgrade
			if (earnedTier === tier && updatedStr.length >= threshold) {
				earnedTier = tier + 1;
				showAlert(`RANK INCREASED: PLAYER AUTHORIZED FOR TIER ${earnedTier}`, "success");
			}
		}

		try {
			// C. Update the Local PocketBase Record
			await update_player_progress.run({
				playerId: data.player_id,
				tierField: field,
				newString: updatedStr,
				lastCompletedID: data.recipe_id,
				newTier: earnedTier,
				Active_Project: undefined
			});

			showAlert(`Verification logged for ${data.player_name}`, "success");

			// D. Cleanup UI for the next player
			await storeValue('activeVerification', null);
			resetWidget("Camera_Admin");

		} catch (e) {
			showAlert("Database Update Failed: " + e.message, "error");
		}
	}
}