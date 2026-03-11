export default {
	Sign_InonClick () {
		showModal('mdl_loading');
		storeValue('currentUser', pb_check_chemist.data.items[0]);
		// Generate a random delay between 1.5 and 4 seconds
const randomDelay = Math.floor(Math.random() * (4000 - 1500 + 1)) + 1500;

setTimeout(() => {
    closeModal('mdl_loading');
 		navigateTo('User Info Page');
}, randomDelay);
	}
}