export default {
  logout: () => {
    // 1. Clear the User Data
    storeValue('currentUser', undefined);
    
    // 2. Clear the Station Data
    storeValue('activeRecipeID', undefined);
    
    // 3. Clear any search terms or temporary buffers
    resetWidget("input_manual", true);
    resetWidget("list_unlocked_recipes", true);
		
		storeValue('neonav_id', undefined);
		storeValue('activeRecipeID', undefined);
 	 	fetch_recipes.run(); // Pre-fetch fresh data for the next user

    
    // 4. Send them back to the Login Screen
  	navigateTo('NeoNav Landing');
    
    showAlert("Terminal Cleared. Standby for next Chemist.", "info");
  },
verifyAdmin: async () => {
        // 1. Ensure the user data is loaded first
        const userId = appsmith.store.currentUser?.id;
        
        if (!userId) {
            // If no user, definitely not an admin
            await storeValue('isAdmin', false);
            return;
        }

        try {
            // 2. Run the query we built in Step 1
            const result = await check_admin_status.run();

            // 3. Compare: If the array length is > 0, they are in the admin list
            if (result && result.length > 0) {
                await storeValue('isAdmin', true);
            } else {
                await storeValue('isAdmin', false);
            }
        } catch (error) {
            // If the API fails, default to false for security
            await storeValue('isAdmin', false);
            console.error("Admin verification failed", error);
        }
    }
}