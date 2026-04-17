import { Navigate } from 'react-router-dom';
import { getUser } from '../../utils/auth';

const ProtectedRoute = ({ children }) => {
  const user = getUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
