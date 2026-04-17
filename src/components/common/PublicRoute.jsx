import { Navigate } from 'react-router-dom';
import { getUser } from '../../utils/auth';

const PublicRoute = ({ children }) => {
  const user = getUser();
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export default PublicRoute;
