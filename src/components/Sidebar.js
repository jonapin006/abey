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
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatIcon from '@mui/icons-material/Chat';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolIcon from '@mui/icons-material/School';
import LogoutIcon from '@mui/icons-material/Logout';
import SupportIcon from '@mui/icons-material/Support';
import HelpIcon from '@mui/icons-material/Help';
import PersonIcon from '@mui/icons-material/Person';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

// Map icon names to Material-UI icons
const iconMap = {
  'home': <HomeIcon />,
  'users': <PeopleIcon />,
  'chart-bar': <BarChartIcon />,
  'message-square': <ChatIcon />,
  'trending-up': <TrendingUpIcon />,
  'graduation-cap': <SchoolIcon />,
};

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

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
        return;
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
        return;
      }

      const userPermissions = await userPermResponse.json();

      if (!userPermissions || userPermissions.length === 0) {
        setMenuItems([]);
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
        return;
      }

      const roles = await rolesResponse.json();

      if (!roles || roles.length === 0) {
        setMenuItems([]);
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
        return;
      }

      const permissions = await permissionsResponse.json();

      if (!permissions || permissions.length === 0) {
        setMenuItems([]);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const footerItems = [
    { path: '/soporte', icon: <SupportIcon />, label: 'Soporte' },
    { path: '/ayuda', icon: <HelpIcon />, label: 'Ayuda' },
    { path: '/perfil', icon: <PersonIcon />, label: 'Perfil' },
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
          {menuItems.map((item) => (
            <ListItem key={item.id} disablePadding>
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
                  {iconMap[item.icon] || <HomeIcon />}
                </ListItemIcon>
                <ListItemText primary={item.name} />
              </ListItemButton>
            </ListItem>
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
