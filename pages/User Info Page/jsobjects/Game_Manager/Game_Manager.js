export default {

	updateChemist: () =>{
	const userData = chemist_status_update.run();
//	return	chemist_status_update.run();
	storeValue('currentUser', userData); 

	},
	
  // Pull current settings from the query
  getThresholds: () => {
    // Ensure we handle the first record of the array from PocketBase
    const data = fetch_game_settings.data;
    return (Array.isArray(data) ? data[0] : data) || { T1Threshold: 2, T2Threshold: 4, T3Threshold: 4, T4Threshold: 4 };
  },
	
	
	instantiatePlayer: () => {
		storeValue('currentUser', pb_check_chemist.data.items[0]);
	},
	
	updateActiveRecipe: () => {
		storeValue("activeRecipeID", appsmith.store.currentUser?.Active_Project)
	},
	
tierUpdate: () => {
    const user = appsmith.store.currentUser || {};
    const settings = Game_Manager.getThresholds();
    
    // Direct length measurement for the automated system
    const t1Count = (user.T1_Completion || "").length;
    const t2Count = (user.T2_Completion || "").length;
    const t3Count = (user.T3_Completion || "").length;
    const t4Count = (user.T4_Completion || "").length;
    
    let earnedTier = Number(user.Tier || 1);

    if (!user.Debug) {
      if (earnedTier === 1 && t1Count >= settings.T1Threshold) earnedTier = 2;
      if (earnedTier === 2 && t2Count >= settings.T2Threshold) earnedTier = 3;
      if (earnedTier === 3 && t3Count >= settings.T3Threshold) earnedTier = 4;
      if (earnedTier === 4 && t4Count >= settings.T4Threshold) earnedTier = 5;
    }

    return { t1Count, t2Count, t3Count, t4Count, earnedTier };
	  
  },
  
	getCurrentProgress: () => {
    const user = appsmith.store.currentUser || {};
    const settings = Game_Manager.getThresholds();
    const tier = Number(user.Tier || 1);

    // Simple length check since the system is closed-loop
    const stats = {
      1: { count: (user.T1_Completion || "").length, goal: Number(settings.T1Threshold) },
      2: { count: (user.T2_Completion || "").length, goal: Number(settings.T2Threshold) },
      3: { count: (user.T3_Completion || "").length, goal: Number(settings.T3Threshold) },
      4: { count: (user.T4_Completion || "").length, goal: Number(settings.T4Threshold) }
    };

    return stats[tier] || { count: 0, goal: 1 };
  },
	
	syncTier: async () => {
    const user = appsmith.store.currentUser || {};
    const results = Game_Manager.tierUpdate(); // Runs the length-based count

    // Only proceed if not in Debug mode and an upgrade is actually earned
    if (!user.Debug && results.earnedTier > Number(user.Tier)) {
      
      // 1. Update the PocketBase record
      await update_user_tier.run({ "newTier": results.earnedTier });
      
      // 2. Update the local store so the UI reflects it instantly
      await storeValue("currentUser", { ...user, Tier: results.earnedTier });
      showModal('Tier_Upgrade')
      // 3. Notify the player
      showAlert(`RANK INCREASED: TIER ${results.earnedTier} AUTHORIZED`, "success");
			
    }
  },
	
	
	getPriorityID: () => {
		const activeID = appsmith.store.activeRecipeID ?? appsmith.store.currentUser?.Active_Project;
		const lastID = appsmith.store.currentUser.Last_Completed;	
		// Return activeID if it exists; otherwise, return lastID
		if (activeID.length > 0)
			{
				return activeID;
			}
			else
				{
					return lastID;
				}	
	},
	
	getPriorityStatus: () => {
		const activeID = appsmith.store.activeRecipeID ?? appsmith.store.currentUser?.Active_Project;
		if (activeID.length !== 0)
			{
				return "Current Synthesis: ";
			}
			else
				{
					return "Last Synthesized: "
				}	
	},
	
	
	getActiveRecipeName: () => {
  const recipes = fetch_recipes.data?.items || [];
  const actId = Game_Manager.getPriorityID();
		
  if (!actId || recipes.length === 0) return "None";
  
  const match = recipes.find(r => r.id === actId);
  return match ? match.Name : "None";
},
	
	 resetActiveProject: () => {
 	storeValue('activeRecipeID', undefined);
	clear_active_project.run();
	Game_Manager.updateChemist();
},
	
checkAdminStatus: async () => {
    // 1. Run the query we just created
    await fetch_staff_record.run();

    // 2. PocketBase returns data inside an "items" array
    const staffData = fetch_staff_record.data?.items?.[0];

    if (staffData && staffData.role) {
      // SUCCESS: User is a staff member
      await storeValue("isAdmin", true);
      await storeValue("staffRole", staffData.role);
      
      showAlert(`AUTHORIZED: ${staffData.role} STATUS ACTIVE`, "success");
    } else {
      // FAILURE: Regular player
      await storeValue("isAdmin", false);
      await storeValue("staffRole", null);
  }
}
}