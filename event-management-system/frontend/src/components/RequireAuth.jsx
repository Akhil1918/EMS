import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const RequireAuth = ({ children, roles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RequireAuth; 