import {useContext} from 'react';
import {StateContext} from '../../context/StateContext';

export default function useAuthContext() {
  const globalState = useContext(StateContext);
  return globalState;
}
