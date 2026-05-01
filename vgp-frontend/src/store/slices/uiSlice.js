import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    showSideNavigation: false,
    productMaxShowModal: false,
    modalMessage: '',
  },
  reducers: {
    toggleSideBar(state) {
      state.showSideNavigation = !state.showSideNavigation;
    },
    closeSideBar(state) {
      state.showSideNavigation = false;
    },
    showModal(state, { payload: message }) {
      state.productMaxShowModal = true;
      state.modalMessage = message || '';
    },
    closeModal(state) {
      state.productMaxShowModal = false;
      state.modalMessage = '';
    },
  },
});

export const { toggleSideBar, closeSideBar, showModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;
