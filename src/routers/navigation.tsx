import {DrawerActions} from '@react-navigation/native';
import * as React from 'react';

export const navigationRef: any = React.createRef();

function navigate(name: string, params?: any) {
  navigationRef.current?.navigate(name, params);
}
function goBack() {
  navigationRef.current?.goBack();
}
function openDrawer() {
  navigationRef.current?.dispatch(DrawerActions.openDrawer());
}
function closeDrawer() {
  navigationRef.current?.dispatch(DrawerActions.openDrawer());
}

export const navigation = {
  navigate,
  openDrawer,
  closeDrawer,
  goBack,
};
