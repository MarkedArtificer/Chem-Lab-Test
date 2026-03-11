export default {
  syncQRData: () => {
 // Example: Setting the store values
	storeValue('qrPayload', appsmith.store.currentUser.id + ":" + appsmith.store.activeRecipeID);

  }
}