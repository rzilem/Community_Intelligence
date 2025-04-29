
import React from 'react';
import HomeownerPortalNav from './HomeownerPortalNav';
import BoardPortalNav from './BoardPortalNav';
import ResalePortalNav from './ResalePortalNav';
import VendorPortalNav from './VendorPortalNav';

interface ActivePortalNavProps {
  currentPath: string;
  isHomeownerPortal: boolean;
  isBoardPortal: boolean;
  isResalePortal: boolean;
  isVendorPortal: boolean;
}

const ActivePortalNav: React.FC<ActivePortalNavProps> = ({
  currentPath,
  isHomeownerPortal,
  isBoardPortal,
  isResalePortal,
  isVendorPortal
}) => {
  return (
    <>
      {isHomeownerPortal && <HomeownerPortalNav currentPath={currentPath} />}
      {isBoardPortal && <BoardPortalNav currentPath={currentPath} />}
      {isResalePortal && <ResalePortalNav currentPath={currentPath} />}
      {isVendorPortal && <VendorPortalNav currentPath={currentPath} />}
    </>
  );
};

export default ActivePortalNav;
