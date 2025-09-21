import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavBar from '../BottomNavBar';

const MainLayout = () => {
  return (
    <>
      <Outlet /> {/* Nested routes will render here */}
      <BottomNavBar />
    </>
  );
};

export default MainLayout;