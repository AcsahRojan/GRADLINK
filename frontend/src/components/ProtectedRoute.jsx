import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRole }) => {
  const storedUser = localStorage.getItem("user");

  // If no user → not logged in
  if (!storedUser) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(storedUser);

  // If wrong role → block access
  if (user.role !== allowedRole) {
    return <Navigate to="/login" replace />;
    
  }

  return children;
};

export default ProtectedRoute;
