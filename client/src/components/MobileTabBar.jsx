import { useLocation, useNavigate } from 'react-router-dom';
import { TabBar } from 'antd-mobile';
import {
  AppOutline,
  UserOutline,
  UnorderedListOutline,
  MoreOutline
} from 'antd-mobile-icons';
import styles from './MobileTabBar.module.css';

/**
 * MobileTabBar - Bottom navigation for mobile devices
 * Shows on screens <640px, provides quick access to main features
 */
function MobileTabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Map routes to tab keys
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith('/pos')) return 'pos';
    if (path.startsWith('/customers')) return 'customers';
    if (path.startsWith('/products') || path.startsWith('/categories')) return 'products';
    // More tab for other routes
    return 'more';
  };

  const handleTabChange = (key) => {
    switch (key) {
      case 'pos':
        navigate('/pos');
        break;
      case 'customers':
        navigate('/customers');
        break;
      case 'products':
        navigate('/products');
        break;
      case 'more':
        navigate('/dashboard');
        break;
      default:
        break;
    }
  };

  const tabs = [
    {
      key: 'pos',
      title: 'POS',
      icon: <AppOutline />,
    },
    {
      key: 'customers',
      title: 'Customers',
      icon: <UserOutline />,
    },
    {
      key: 'products',
      title: 'Products',
      icon: <UnorderedListOutline />,
    },
    {
      key: 'more',
      title: 'More',
      icon: <MoreOutline />,
    },
  ];

  return (
    <div className={styles.mobileTabBar}>
      <TabBar
        activeKey={getActiveTab()}
        onChange={handleTabChange}
        className={styles.tabBar}
      >
        {tabs.map((item) => (
          <TabBar.Item
            key={item.key}
            icon={item.icon}
            title={item.title}
          />
        ))}
      </TabBar>
    </div>
  );
}

export default MobileTabBar;
