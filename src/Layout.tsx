import { Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

const Layout = () => {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
};

export default Layout;
