import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { getVerifiedChildren } from '../services/parentApi';

export const ChildContext = createContext({
  children: [],
  selectedChild: null,
  selectedChildId: null,
  isLoadingChildren: false,
  childrenError: null,
  selectChild: () => {},
  fetchChildren: async () => {},
  refreshChildren: async () => {},
});

export const ChildProvider = ({ children: reactChildren }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  const [childrenError, setChildrenError] = useState(null);

  const fetchChildren = useCallback(async () => {
    if (!isAuthenticated) {
      setChildren([]);
      setSelectedChildId(null);
      return;
    }

    setIsLoadingChildren(true);
    setChildrenError(null);

    try {
      const data = await getVerifiedChildren();
      const verifiedList = Array.isArray(data) ? data : [];
      setChildren(verifiedList);

      // Select first child by default if current selection is invalid or null
      setSelectedChildId((prevSelectedId) => {
        if (prevSelectedId && verifiedList.some((c) => c.studentId === prevSelectedId)) {
          return prevSelectedId;
        }
        return verifiedList.length > 0 ? verifiedList[0].studentId : null;
      });
    } catch (err) {
      setChildrenError(err.message || 'Unable to load verified children.');
    } finally {
      setIsLoadingChildren(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchChildren();
    } else {
      setChildren([]);
      setSelectedChildId(null);
      setChildrenError(null);
    }
  }, [isAuthenticated, fetchChildren]);

  const selectChild = useCallback(
    (studentId) => {
      if (children.some((c) => c.studentId === studentId)) {
        setSelectedChildId(studentId);
      }
    },
    [children]
  );

  const selectedChild = children.find((c) => c.studentId === selectedChildId) || null;

  return (
    <ChildContext.Provider
      value={{
        children,
        selectedChild,
        selectedChildId,
        isLoadingChildren,
        childrenError,
        selectChild,
        fetchChildren,
        refreshChildren: fetchChildren,
      }}
    >
      {reactChildren}
    </ChildContext.Provider>
  );
};
