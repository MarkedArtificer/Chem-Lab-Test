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
        // 1. Get current User ID
        const userId = appsmith.store.currentUser?.id;
        
        if (!userId) {
            await storeValue('isAdmin', false);
            return;
        }

        try {
            // 2. Run the filter query (user_id = userId)
            const response = await check_admin_status.run();
            
            // 3. Simple Check: If any items exist in the result, they are an admin.
            // PocketBase returns results in an 'items' array.
            const isAdmin = response.items && response.items.length > 0;

            await storeValue('isAdmin', isAdmin);
            
            if (isAdmin) {
                showAlert("Admin identity confirmed", "success");
            }
        } catch (error) {
            await storeValue('isAdmin', false);
            console.error("Admin verification failed", error);
        }
    }
}