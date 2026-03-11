export default {
  adjustTier: async (amount) => {
    const currentTier = Number(appsmith.store.currentUser?.Tier || 0);
		const mathAmount = Number(amount);
		
    const newTier = Math.max(0, currentTier + mathAmount); // Prevent negative tiers

    // 1. Update the Mac database
    await Debug_Rank.run({ newTier: newTier });

    // 2. Update the local iPad "Brain"
    const updatedUser = { ...appsmith.store.currentUser, Tier: newTier };
    storeValue('currentUser', updatedUser);

    // 3. Visual feedback for the Chemist
    showAlert(`Tier updated to ${newTier}`, "success");
  }
}