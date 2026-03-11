export default {
  // 1. Get the current active recipe object
  getActiveRecipe: () => {
    const id = appsmith.store.activeRecipeID;
    if (!id || !fetch_recipes.data?.items) return null;
    return fetch_recipes.data.items.find(r => r.id == id) || null;
  },

  // 2. Construct the high-res image URL
  getLargeImage: () => {
    const recipe = this.getActiveRecipe();
    if (!recipe) return "";

    const ip = "192.168.10.63"; // Your Mac's Static IP
    return `http://${ip}:8090/api/files/Schematics/${recipe.id}/${recipe.Picture}`;
  },

  // 3. Debug Phase: Force Synthesis Completion
 verifySynthesis: async () => {
  const recipe = WorkManager.getActiveRecipe();
  const user = appsmith.store.currentUser;
  
  if (!recipe || !user) return;

  const tier = recipe.Tier;
  const field = `T${tier}_Completion`;
  const recipeID = recipe.id;
  const code = recipe.recipe_code.toUpperCase();

  
  // 1. Get current string and prevent duplicates
  let currentStr = String(user[field] || "");
	const updatedStr = currentStr + code;
  if (!currentStr.includes(code)) {
   

    // 2. Push to the Mac
    await update_user_progress.run({
      userId: user.id,
      tierField: field,
      newString: updatedStr,
			lastCompletedID: recipeID // Pass the current recipe ID here
    });

    // 3. Update the local iPad store
    const updatedUser = { ...user, [field]: updatedStr, Last_Completed: recipeID};
    storeValue('currentUser', updatedUser);
    
  // showAlert(`Synthesis Verified: Code ${code} added to Tier ${tier}`, "success");
		showAlert(`Synthesis Verified`, "success");
 	 } 
	 else {
		 // 3. Update the local iPad store
    const updatedUser = { ...user, [field]: updatedStr, Last_Completed: recipeID};
    storeValue('currentUser', updatedUser);
    showAlert("Already completed. No new progress recorded.", "info");
  }


},

  // 4. Reset & Navigate
  returnToSelector: () => {
    storeValue('activeRecipeID', undefined);
   navigateTo('User Info Page');
  }
}