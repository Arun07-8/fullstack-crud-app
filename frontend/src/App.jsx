import { Routes, Route, Navigate, useLocation, } from "react-router-dom";
import Authpage from "./pages/user/AuthPages";
import Home from "./pages/user/Home";
import UserProfile from "./pages/user/UserProfile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess, logout, startLoading, stopLoading, } from "./features/auth/authReducer";
import Loader from "./components/Loader";
import ProtectedRoute from "./components/ProtectedRoute"
import PublicRoute from "./components/PublicRoute"

import axios from "axios";
import AdminLogin from "./pages/admin/AdminLogin";
import UserManagement from "./pages/admin/UserManagement";

export default function App() {

  const { loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      dispatch(startLoading());

      const isAdminRoute = location.pathname.startsWith("/admin");
      const endpoint = isAdminRoute ? `${import.meta.env.VITE_API_URL}/admin/checkadmin`
        : `${import.meta.env.VITE_API_URL}/checkuser`;

      try {
        const res = await axios.get(endpoint, {
          withCredentials: true,
        });

        if (cancelled) return;

        const expectedRole = isAdminRoute ? "admin" : "user";

        if (res.data.authenticated && res.data.user?.role === expectedRole) {
          dispatch(loginSuccess(res.data.user));
        } else {
          dispatch(logout());
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Session check failed:", error.message);
          dispatch(logout());
        }
      } finally {
        if (!cancelled) {
          dispatch(stopLoading());
        }
      }
    };

    checkSession();

    return () => {
      cancelled = true;
    };
  }, [dispatch, location.pathname]);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/login" element={
          <PublicRoute role="user">
            <Authpage />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <Authpage />
        } />
        <Route path="/home" element={
          <ProtectedRoute role="user">
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute role="user">
            <UserProfile />
          </ProtectedRoute>
        } />

        <Route path="/admin/login" element={
          <PublicRoute>
            <AdminLogin role="admin"/>
          </PublicRoute>
        } />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute role="admin">
            <UserManagement />
          </ProtectedRoute>
        } />
      </Routes>
      <ToastContainer position="top-right" autoClose={1000} />
    </>
  );
}   