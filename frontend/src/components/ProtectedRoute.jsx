import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {

  const { isAuthenticated, user } = useSelector((state) => state.auth);
console.log(isAuthenticated)
if (!isAuthenticated) {
  if (role === "admin") {
    return <Navigate to="/admin/login" replace />;
  }
  return <Navigate to="/login" replace />;
}

  if (role && user?.role !== role) {
    if(user?.role==="admin"){
      return <Navigate to="/admin/login" replace />;
    }
    if(user?.role==="user"){
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;