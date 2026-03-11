export default {
  initializePage: async () => {
    // 1. Clear the specific input widgets
    resetWidget("input_login_user", true);
		resetWidget("input_login_pass", true);
  }
}