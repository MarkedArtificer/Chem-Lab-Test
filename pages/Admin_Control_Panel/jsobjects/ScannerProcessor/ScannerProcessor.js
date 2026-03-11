export default {
  // 1. Core Logic: The Entry Point for the Scanner
  processScan: async () => {
    const rawData = Camera_Admin.value; // Adjust to your scanner's name
    if (!rawData) return;

    const [scannedUserId, scannedRecipeId] = rawData.split(":");

    if (!scannedUserId || !scannedRecipeId) {
      showAlert("Invalid QR Format", "error");
      return;
    }

    // 2. Fetch the Scanned User and Recipe data from your queries
    // We run these queries with the IDs from the scan
    await fetch_player_by_id.run({ id: scannedUserId });
    await fetch_single_recipe.run({ id: scannedRecipeId });

    const targetUser = fetch_player_by_id.data;
    const targetRecipe = fetch_player_by_id.data; // Assuming your query returns a single item

    if (!targetUser || !targetRecipe) {
      showAlert("User or Recipe not found in Database", "error");
      return;
    }

    // 3. Synthesis Logic (Adapted from your WorkManager)
    const tier = targetRecipe.Tier;
    const field = `T${tier}_Completion`;
    const code = targetRecipe.recipe_code.toUpperCase();
    let currentStr = String(targetUser[field] || "");

    // Check for duplicates
    if (!currentStr.includes(code)) {
      const updatedStr = currentStr + code;

      // 4. Push update to PocketBase (The Raspberry Pi)
      await update_player_progress.run({
        userId: targetUser.id,
        tierField: field,
        newString: updatedStr,
        lastCompletedID: targetRecipe.id
      });

      showAlert(`Verification Successful: ${targetRecipe.Name} for User ${targetUser.username}`, "success");
    } else {
      showAlert("Already completed. No new progress recorded.", "info");
    }
    
    // 5. Cleanup
    resetWidget("ScannerWidget");
  },

  // Helper for Displaying Info on Admin UI
  getScannedImage: () => {
    const recipe = fetch_single_recipe.data;
    if (!recipe) return "";
    const ip = "192.168.10.63"; 
    return `http://${ip}:8090/api/files/Schematics/${recipe.id}/${recipe.Picture}`;
  }
}