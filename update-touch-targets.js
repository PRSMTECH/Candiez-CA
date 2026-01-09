const fs = require('fs');

// Update POS.module.css
const posCssPath = 'J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/pages/POS.module.css';
let posContent = fs.readFileSync(posCssPath, 'utf8');

// Add mobile touch target styles at the end before the closing
const mobileTouchTargets = `
/* Mobile Touch Targets - 44px minimum */
@media (max-width: 768px) {
  .qtyBtn {
    width: 44px;
    height: 44px;
    font-size: 1.2rem;
  }

  .removeBtn {
    min-width: 44px;
    min-height: 44px;
    padding: 0.5rem;
  }

  .clearCart {
    min-height: 44px;
    padding: 0.5rem 1rem;
  }

  .paymentBtn {
    min-height: 44px;
  }

  .checkoutBtn {
    min-height: 48px;
  }

  .redeemBtn,
  .redeemMaxBtn,
  .redeemCancelBtn {
    min-height: 44px;
  }

  .receiptBtn {
    min-height: 44px;
    min-width: 44px;
  }

  .productCard {
    min-height: 44px;
  }
}
`;

// Check if mobile touch targets already exist
if (!posContent.includes('Mobile Touch Targets')) {
  posContent = posContent.trimEnd() + '\n' + mobileTouchTargets;
  fs.writeFileSync(posCssPath, posContent);
  console.log('Updated POS.module.css with mobile touch targets');
} else {
  console.log('POS.module.css already has mobile touch targets');
}

// Update Sidebar.module.css
const sidebarCssPath = 'J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/components/Sidebar.module.css';
let sidebarContent = fs.readFileSync(sidebarCssPath, 'utf8');

// Find the existing @media (max-width: 768px) section and enhance it
const oldSidebarMedia = `/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    width: 72px;
  }

  .sidebar:not(.collapsed) {
    width: 100%;
    max-width: 260px;
  }

  .toggleBtn {
    display: none;
  }
}`;

const newSidebarMedia = `/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    width: 72px;
  }

  .sidebar:not(.collapsed) {
    width: 100%;
    max-width: 260px;
  }

  .toggleBtn {
    display: none;
  }

  /* Mobile Touch Targets - 44px minimum */
  .menuLink {
    min-height: 44px;
    padding: 0.75rem 1rem;
  }

  .logoutBtn {
    min-height: 44px;
  }
}`;

if (sidebarContent.includes(oldSidebarMedia)) {
  sidebarContent = sidebarContent.replace(oldSidebarMedia, newSidebarMedia);
  fs.writeFileSync(sidebarCssPath, sidebarContent);
  console.log('Updated Sidebar.module.css with mobile touch targets');
} else if (sidebarContent.includes('Mobile Touch Targets')) {
  console.log('Sidebar.module.css already has mobile touch targets');
} else {
  // Try without the exact match - append the mobile styles
  const mobileStyles = `
/* Mobile Touch Targets - 44px minimum */
@media (max-width: 768px) {
  .menuLink {
    min-height: 44px;
    padding: 0.75rem 1rem;
  }

  .logoutBtn {
    min-height: 44px;
  }
}
`;
  sidebarContent = sidebarContent.trimEnd() + '\n' + mobileStyles;
  fs.writeFileSync(sidebarCssPath, sidebarContent);
  console.log('Appended mobile touch targets to Sidebar.module.css');
}

console.log('Done!');
