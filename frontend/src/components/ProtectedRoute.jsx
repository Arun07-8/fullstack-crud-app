import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user, loading } = useSelector(
    (state) => state.auth
  );

  if (loading) {
    return <p>Checking authentication...</p>;
  }

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to={role === "admin" ? "/admin/login" : "/login"}
        replace
      />
    );
  }

  if (role && user.role !== role) {
    return (
      <Navigate
        to={role === "admin" ? "/admin/login" : "/login"}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;