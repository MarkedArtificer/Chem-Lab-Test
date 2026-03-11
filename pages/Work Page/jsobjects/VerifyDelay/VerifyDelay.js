export default {
	VerifyonSuccess () {
		// Generate a random delay between 1.5 and 4 seconds
const randomDelay = Math.floor(Math.random() * (4000 - 1500 + 1)) + 1500;

	setTimeout(() => {
    closeModal('mdl_loading');
   			  //Reset station and go home
  	WorkManager.returnToSelector();
		}, randomDelay);
	},
	VerifyonFail () {
		// Generate a random delay between 1.5 and 4 seconds
		const randomDelay = Math.floor(Math.random() * (4000 - 1500 + 1)) + 1500;

		setTimeout(() => {
    closeModal('mdl_loading');
		showAlert("INVALID VERIFICATION KEY", "error");	
	}, randomDelay);
	}
	
}