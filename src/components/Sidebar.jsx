import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatIcon from '@mui/icons-material/Chat';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import LogoutIcon from '@mui/icons-material/Logout';
import SupportIcon from '@mui/icons-material/Support';
import HelpIcon from '@mui/icons-material/Help';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

// Map icon names to Material-UI icons
const iconMap = {
  'home': <HomeIcon />,
  'users': <PeopleIcon />,
  'business': <BusinessIcon />,
  'chart-bar': <BarChartIcon />,
  'message-square': <ChatIcon />,
  'trending-up': <TrendingUpIcon />,
  'graduation-cap': <SchoolIcon />,
  'Receipt': <ReceiptIcon />,
  'Dashboard': <DashboardIcon />,
  'Assessment': <AssessmentIcon />,
};

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({});

  useEffect(() => {
    if (user) {
      fetchUserMenus();
    }
  }, [user]);

  const fetchUserMenus = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // Get user email
      const { data: userData } = await supabase.auth.getUser();
      const userEmail = userData?.user?.email;

      if (!userEmail) {
        setMenuItems([]);
        setLoading(false);
        return;
      }

      // Check if menu is cached in sessionStorage
      const cacheKey = `menu_items_${userEmail}`;
      const cachedMenus = sessionStorage.getItem(cacheKey);

      if (cachedMenus) {
        try {
          const parsedMenus = JSON.parse(cachedMenus);
          setMenuItems(parsedMenus);
          setLoading(false);
          return;
        } catch (e) {
          // If parsing fails, continue to fetch
          sessionStorage.removeItem(cacheKey);
        }
      }

      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

      // First, get the user's role from user_permissions
      const userPermUrl = `${API_URL}/user_permissions?user_email=eq.${userEmail}&select=role_name&limit=1`;

      const userPermResponse = await fetch(userPermUrl, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!userPermResponse.ok) {
        setMenuItems([]);
        setLoading(false);
        return;
      }

      const userPermissions = await userPermResponse.json();

      if (!userPermissions || userPermissions.length === 0) {
        setMenuItems([]);
        setLoading(false);
        return;
      }

      const roleName = userPermissions[0].role_name;

      // Get the role_id from roles table
      const rolesUrl = `${API_URL}/roles?name=eq.${roleName}&select=id&limit=1`;

      const rolesResponse = await fetch(rolesUrl, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!rolesResponse.ok) {
        setMenuItems([]);
        setLoading(false);
        return;
      }

      const roles = await rolesResponse.json();

      if (!roles || roles.length === 0) {
        setMenuItems([]);
        setLoading(false);
        return;
      }

      const roleId = roles[0].id;

      // Fetch menu permissions for this role
      const permissionsUrl = `${API_URL}/role_menu_permissions?role_id=eq.${roleId}&can_view=eq.true&select=menu_id`;

      const permissionsResponse = await fetch(permissionsUrl, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!permissionsResponse.ok) {
        const errorText = await permissionsResponse.text();
        setMenuItems([]);
        setLoading(false);
        return;
      }

      const permissions = await permissionsResponse.json();

      if (!permissions || permissions.length === 0) {
        setMenuItems([]);
        setLoading(false);
        return;
      }

      // Get menu IDs
      const menuIds = permissions.map(p => p.menu_id);

      // Fetch actual menu items
      const menuIdsParam = menuIds.map(id => `id.eq.${id}`).join(',');
      const menusUrl = `${API_URL}/menu_items?or=(${menuIdsParam})&is_active=eq.true&order=order_index.asc`;

      const menusResponse = await fetch(menusUrl, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (menusResponse.ok) {
        const menus = await menusResponse.json();
        setMenuItems(menus);
        // Cache the menus in sessionStorage
        sessionStorage.setItem(cacheKey, JSON.stringify(menus));
      } else {
        const errorText = await menusResponse.text();
        setMenuItems([]);
      }
    } catch (err) {
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Organize menus into parent-child hierarchy
  const organizeMenus = (menus) => {
    const parentMenus = menus.filter(m => !m.parent_id);
    return parentMenus.map(parent => ({
      ...parent,
      children: menus.filter(m => m.parent_id === parent.id)
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    })).sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  };

  // Toggle menu expansion
  const toggleExpand = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  // Handle menu item click
  const handleMenuClick = (menu) => {
    // If menu has children or path starts with '#', toggle expand
    if (menu.children?.length > 0 || menu.path?.startsWith('#')) {
      toggleExpand(menu.id);
    } else if (menu.path) {
      navigate(menu.path);
    }
  };

  const handleLogout = async () => {
    // Clear menu cache on logout
    const { data: userData } = await supabase.auth.getUser();
    const userEmail = userData?.user?.email;
    if (userEmail) {
      sessionStorage.removeItem(`menu_items_${userEmail}`);
    }
    await supabase.auth.signOut();
    navigate('/login');
  };

  const footerItems = [
    { path: '/support', icon: <SupportIcon />, label: 'Soporte' },
    { path: '/help', icon: <HelpIcon />, label: 'Ayuda' },
    { path: '/profile', icon: <PersonIcon />, label: 'Perfil' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: 'primary.main',
          color: 'white',
        },
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" component="h2" sx={{ color: 'white', fontWeight: 600 }}>
          Abey Consultores
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />

      {/* Main Menu */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={24} sx={{ color: 'white' }} />
        </Box>
      ) : (
        <List sx={{ flexGrow: 1 }}>
          {organizeMenus(menuItems).map((menu) => (
            <React.Fragment key={menu.id}>
              {menu.children && menu.children.length > 0 ? (
                // Parent menu with children
                <>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => handleMenuClick(menu)}
                      sx={{
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                        {iconMap[menu.icon] || <HomeIcon />}
                      </ListItemIcon>
                      <ListItemText primary={menu.name} />
                      {expandedMenus[menu.id] ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                  </ListItem>
                  <Collapse in={expandedMenus[menu.id]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {menu.children.map((child) => (
                        <ListItem key={child.id} disablePadding>
                          <ListItemButton
                            selected={location.pathname === child.path}
                            onClick={() => navigate(child.path)}
                            sx={{
                              pl: 4,
                              color: 'white',
                              '&.Mui-selected': {
                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                },
                              },
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              },
                            }}
                          >
                            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                              {iconMap[child.icon] || <HomeIcon />}
                            </ListItemIcon>
                            <ListItemText primary={child.name} />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                </>
              ) : (
                // Regular menu item without children
                <ListItem disablePadding>
                  <ListItemButton
                    selected={location.pathname === menu.path}
                    onClick={() => navigate(menu.path)}
                    sx={{
                      color: 'white',
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        },
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                      {iconMap[menu.icon] || <HomeIcon />}
                    </ListItemIcon>
                    <ListItemText primary={menu.name} />
                  </ListItemButton>
                </ListItem>
              )}
            </React.Fragment>
          ))}
        </List>
      )}

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />

      {/* Footer Menu */}
      <List>
        {footerItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                color: 'white',
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}

        {/* Logout Button */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Cerrar Sesión" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
}

export default Sidebar;
