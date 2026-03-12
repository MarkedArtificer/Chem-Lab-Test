export default {
// OnPageLoad for Admin_Control_Panel
PlayerBounce: () => {
  if (!appsmith.store.isAdmin)
	{navigateTo('User Info Page') }
}
}