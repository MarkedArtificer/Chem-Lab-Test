export default {
  selectedRecipeID: "",

  getVisibleRecipes: () => {
    // 1. The Loading Guard: If data isn't here yet, stop and return empty
    if (!fetch_recipes.data || !fetch_recipes.data.items) {
      return [];
    }

    // 2. The Raw Data
    const allRecipes = fetch_recipes.data.items;
    
    // 3. The Filter
    // We use '==' instead of '===' to let Appsmith handle String vs Number for us
    const filtered = allRecipes.filter(r => r.Tier == select_tier.selectedOptionValue);

    // 4. The Output
    return filtered.map(r => ({
      label: r.Name,
      value: r.id
    }));
  }
}