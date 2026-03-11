export default {
 async onAppStart() {
    // 1. Attempt to pull the token from the NeoNav cookie [cite: 2026-03-09]
    // Appsmith allows access to cookies via the 'appsmith.URL.cookies' object
    const sessionToken = appsmith.URL.cookies.accessToken;

    if (sessionToken) {
      // 2. Decode the cookie data [cite: 2026-03-09]
      const decoded = this.parseJwt(sessionToken);
      
      if (decoded && decoded.id) {
        await storeValue('neonav_id', decoded.id);
        await storeValue('neonav_user', decoded.username);
        
        // 3. Skip login and sync with your database [cite: 2026-02-23]
        return this.syncWithPocketBase();
      }
    }
    
    // If no cookie is found, the 'con_login' container remains visible
  },
// This is what the Button's "onSuccess" calls
async handleLoginSuccess() {
    // 1. Check if the response actually contains a valid ID
    // We check if data exists and if the 'id' key isn't null/undefined
    if (!NeoNav_Login.data || !NeoNav_Login.data.id) {
      showAlert("NeoNav verification failed: User ID not found. Please check your credentials.", "error");
      return; // Stop execution here
    }

    // 2. If valid, proceed with saving the ID
    const neonavId = NeoNav_Login.data.id; 
    await storeValue('neonav_id', neonavId);
    
    // 3. Optional: Add a success notification for the player
    showAlert("Credentials confirmed. Welcome to the Synthesis Hub", "success");

    // 4. Proceed to Phase 2: PocketBase Sync
    return this.syncWithPocketBase();
  },

async syncWithPocketBase() {

    // 2. Search PocketBase for this Chemist
    await pb_check_chemist.run();

    // 3. Logic: Create or Continue
    if (pb_check_chemist.data.items.length === 0) {
        // No account found -> Create New
        showModal(Registration.name);
				//modal creates chemist account and then runs loadUserData
    } else {
        // Account exists -> Load Data
        return this.loadUserData();
    }
},
async loadUserData() {
	LoadingTimer.Sign_InonClick();
},
parseJwt: (token) => {
    try {
        const base64Url = token.split('.')[1]; // Get the middle part of the JWT [cite: 2026-03-09]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}
}