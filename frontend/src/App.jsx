import { Routes, Route, Navigate } from "react-router-dom";
import Authpage from "./pages/user/AuthPages";
import Home from "./pages/user/Home";
import UserProfile from "./pages/user/UserProfile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess, stopLoading } from "../features/auth/authReducer";
import Loader from "./components/Loader";
import ProtectedRoute from "./components/ProtectedRoute"
import PublicRoute from "./components/PublicRoute"

import axios from "axios";
import AdminLogin from "./pages/admin/AdminLogin";
import UserManagement from "./pages/admin/UserManagement";

export default function App() {

  const { loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/checkuser", {
          withCredentials: true
        });
        if (res.data.authenticated) {
          dispatch(loginSuccess(res.data.user));
        } else {
          dispatch(stopLoading());
        }
        

      } catch (error) {
        console.error("Auth check failed:", error.message);
        dispatch(stopLoading());

      }
    };
    checkUser();
  }, [dispatch]);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/login" element={
          <PublicRoute>
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
          <ProtectedRoute  role="user">
            <UserProfile />
          </ProtectedRoute>
        } />

        <Route path="/admin/login" element={
          <PublicRoute>
            <AdminLogin />
          </PublicRoute>
        } />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute role="admin">
            <UserManagement/>
          </ProtectedRoute>
        } />
      </Routes>
      <ToastContainer position="top-right" autoClose={1000} />
    </>
  );
}   