
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children, role }) => {
  const { isAuthenticated, user, loading } = useSelector(
    (state) => state.auth
  );

  if (loading) {
    return <p>Checking authentication...</p>;
  }

  // Redirect only if the requested role is authenticated.
  if (isAuthenticated && user?.role === role) {
    return (
      <Navigate
        to={role === "admin" ? "/admin/dashboard" : "/home"}
        replace
      />
    );
  }

  return children;
};

export default PublicRoute;
