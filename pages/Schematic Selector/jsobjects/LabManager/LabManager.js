export default {
  selectedRecipeID: "",

 getVisibleRecipes: () => {
  // 1. Determine if data is nested in 'items' or is a direct array
  const rawData = fetch_recipes.data?.items || fetch_recipes.data || [];
  
  if (rawData.length === 0) return [];

  // 2. FORCE both values to Numbers to avoid String vs Number mismatches
  const targetTier = Number(select_tier.selectedOptionValue);
  const playerTier = Number(appsmith.store.currentUser?.Tier || 0);

  // 3. Perform the Tier filter first
  return rawData
    .filter(r => {
      const recipeTier = Number(r.Tier); // Force PocketBase value to Number
      
      // Check Tier Match
      if (recipeTier !== targetTier) return false;

      // Rule 1: Higher player rank gets all
      if (playerTier > targetTier) return true;

      // Rule 2: Current rank checks the completion string
      const completionStr = String(appsmith.store.currentUser?.[`T${targetTier}_Completion`] || "");
      return completionStr.includes(r.recipe_code);
    })
    .map(r => ({
      label: r.Name,
      value: r.id
    }));
},
	
	
  manualSearch: () => {
    const rawInput = input_manual.text;
    if (!rawInput || rawInput.trim().length === 0) return showAlert("Enter a recipe name.", "info");

    const searchStr = rawInput.toLowerCase().trim();
    const match = fetch_recipes.data.items.find(r => 
      String(r.Name).toLowerCase().trim() === searchStr
    );

    if (!match) return showAlert("No match found for: " + rawInput, "error");

    if (Number(match.Tier) > Number(appsmith.store.currentUser.Tier)) {
      return showAlert("ACCESS DENIED: Insufficient Clearance", "warning");
    }

    // Use LabManager instead of 'this' for Appsmith stability
    LabManager.selectedRecipeID = match.id;
    storeValue('activeRecipeID', match.id);
    showAlert("Recipe Found: " + match.Name, "success");
    resetWidget("input_manual", true);
  }
}