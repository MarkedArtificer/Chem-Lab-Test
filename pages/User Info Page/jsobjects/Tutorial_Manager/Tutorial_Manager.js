export default {
  // Check if a specific tutorial letter is missing from the progress string
  shouldShowTutorial: (tutorialLetter) => {
    const user = appsmith.store.currentUser || {};
    const progress = user.TutorialProgress || "";
    
    // Returns true if the letter is NOT found
    return !progress.includes(tutorialLetter);
  },
		TutorialCheck:(tutorialLetter) => {
		if (Tutorial_Manager.shouldShowTutorial(tutorialLetter)) {
	  showModal(`mdl_tutorial_${tutorialLetter}`); // Trigger the first tutorial
	}
},
	TutorialBoot:() => {
		Tutorial_Manager.TutorialCheck("A");
	},

  // Pass the letter (e.g., 'A', 'B', 'C') to the function
  completeTutorial: async (letter) => {
    const user = appsmith.store.currentUser || {};
    const currentProgress = user.TutorialProgress || "";

    if (!currentProgress.includes(letter)) {
      const newProgress = currentProgress + letter;

      // 1. Update the database record
      await update_user_tutorial.run({ "progress": newProgress });

      // 2. Sync the local store
      await storeValue("currentUser", { ...user, TutorialProgress: newProgress });
      
      // 3. Close the modal dynamically using the letter
      closeModal(`mdl_tutorial_${letter}`); 
    }
  }
}
