import React from 'react';
import DapBuddyDropdownMenu from './DapBuddyDropdownMenu';

const Header = () => {
  // The header's only job is to render your new component.
  return (
    <header className="py-4">
      <DapBuddyDropdownMenu />
    </header>
  );
};

export default Header;