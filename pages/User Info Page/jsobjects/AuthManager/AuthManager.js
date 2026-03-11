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
  }
}