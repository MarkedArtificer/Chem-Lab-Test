export default {
  initializePage: async () => {
    // 1. Clear the specific input widgets
    resetWidget("select_tier", true);
		resetWidget("list_unlocked_recipes", true);
		resetWidget("input_manual", true);
  }
}