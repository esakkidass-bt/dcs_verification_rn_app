import {useContext} from 'react';
import {LocationContext} from '../../context/LocationContext';

export default function useLocationContext() {
  const context = useContext(LocationContext);
  return context;
}
