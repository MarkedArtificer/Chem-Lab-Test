export default {
  handleScan: async () => {
    // 1. Get the raw text from the scanner widget
    const rawData = ScannerWidget.value; 

    // 2. Split the string at the colon
    const parts = rawData.split(":");
    const scannedUser = parts[0];
    const scannedRecipe = parts[1];

    if (scannedUser && scannedRecipe) {
      // 3. Find the player's record ID in PocketBase first
      // (Assumes you have a query named 'get_player' that filters by User ID)
      await get_player.run({ userId: scannedUser });
      const recordId = get_player.data[0].id;

      // 4. Update the record
      await update_player_progress.run({ 
        recordId: recordId, 
        recipeId: scannedRecipe 
      });

      showAlert(`Success: User ${scannedUser} verified for ${scannedRecipe}`, "success");
    } else {
      showAlert("Error: Invalid QR Format scanned.", "error");
    }
  }
}