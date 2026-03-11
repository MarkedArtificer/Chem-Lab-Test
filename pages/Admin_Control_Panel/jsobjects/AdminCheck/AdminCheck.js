export default {
// OnPageLoad for Admin_Control_Panel
PlayerBounce: () => {
  !appsmith.store.isAdmin ? navigateTo('Dashboard') : null 
}
}