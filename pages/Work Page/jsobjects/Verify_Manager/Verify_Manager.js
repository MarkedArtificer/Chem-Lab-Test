export default {
  verifyScannerCode: async (scannedValue) => {
		const settings = Game_Manager.getThresholds();
	  const masterKey = settings.VerificationCode;
	//	showAlert(String(scannedValue), "error");	
	// showAlert(String(settings.VerificationCode), "error");	
    
    // Compare the scanned data to your specific Master Key
    if (scannedValue === masterKey) {
      // If it matches, trigger the force completion logic we discussed
      await WorkManager.verifySynthesis();
			closeModal(Verification);
			showModal(mdl_loading);
			VerifyDelay.VerifyonSuccess();

    } else {
      // Handle invalid scans
			VerifyDelay.VerifyonFail();
     // showAlert("INVALID VERIFICATION KEY", "error");	
    }
  }
}