import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavBar from '../BottomNavBar';
import PullToRefresh from 'react-simple-pull-to-refresh'; // 1. Import the component

const MainLayout = () => {
  // 2. This function will be called when the user pulls down
  const handleRefresh = () => {
    // The simplest action is to reload the window
    window.location.reload();
    
    // Since this is a hard reload, returning a resolved promise is good practice
    // but not strictly necessary.
    return Promise.resolve();
  };

  return (
    // 3. Wrap your existing content with the PullToRefresh component
    <PullToRefresh onRefresh={handleRefresh}>
      <>
        <Outlet /> {/* Nested routes will still render here */}
        <BottomNavBar />
      </>
    </PullToRefresh>
  );
};

export default MainLayout;