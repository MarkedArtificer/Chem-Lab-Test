export default {
  // 1. Pull the recipe data based on the stored ID
  getActiveData: () => {
    
		const id = Game_Manager.getPriorityID();
    // Safety check: Don't run if we don't have an ID or data yet
    if (!id || !fetch_recipes.data) return null;

    // Handle both nested 'items' (PocketBase) or flat arrays
    const recipes = fetch_recipes.data.items || fetch_recipes.data || [];
    
    // Match the ID
    return recipes.find(r => r.id == id) || null;
  },

  // 2. Generate the Image URL for the iPad
  getImageUrl: () => {
    // Reference the Object directly to avoid 'this' context issues
    const recipe = PreviewManager.getActiveData();
    
    if (!recipe || !recipe.Picture) {
      return "https://placehold.co/600x400?text=Awaiting+Selection";
    }

    const ip = "192.168.10.63"; 
    const col = "Schematics"; // Ensure this matches your PocketBase exactly
    
    return `http://${ip}:8090/api/files/${col}/${recipe.id}/${recipe.Picture}`;
  }
}