import { useContext } from 'react';
import { ChildContext } from '../context/ChildContext';

export const useChildren = () => {
  const context = useContext(ChildContext);
  if (!context) {
    throw new Error('useChildren must be used within a ChildProvider');
  }
  return context;
};

export default useChildren;
