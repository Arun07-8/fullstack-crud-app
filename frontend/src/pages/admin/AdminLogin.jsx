import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../../features/auth/authReducer";

const AdminLogin = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Invalid email address";
        }
        if (!formData.password) {
            newErrors.password = "Password is required";
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await axios.post("http://localhost:5000/admin/login", {
                email: formData.email,
                password: formData.password
            }, { withCredentials: true });

            dispatch(loginSuccess(response.data.admindata));
            toast.success(response.data.message);
            navigate("/admin/dashboard");
        } catch (error) {
            toast.error(error.response?.data?.message || "Admin login failed");
        }
        setIsSubmitting(false);
    };

    return (
        <div className="auth-container" style={{ background: '#0f172a' }}>
            <div className="auth-card" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                {/* Left Side: Admin Identity */}
                <div className="auth-sidebar" style={{ background: '#1e293b' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    </div>
                    <h2 className="welcome-title" style={{ color: 'white', fontSize: '2.5rem' }}>
                        Admin Portal
                    </h2>
                    <p className="app-description" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>
                        Secure access for system administrators. Please authenticate to manage the platform.
                    </p>
                </div>

                {/* Right Side: Login Form */}
                <div className="auth-main" style={{ background: 'white' }}>
                    <h1 className="welcome-title" style={{ fontSize: '2rem', marginBottom: '2rem', color: '#0f172a' }}>
                        Admin Login
                    </h1>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: '#64748b' }}>ADMIN EMAIL</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="admin@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                className="input-field"
                                style={{ border: '1px solid #e2e8f0' }}
                            />
                            {errors.email && <p className="error-text">{errors.email}</p>}
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: '#64748b' }}>PASSWORD</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input-field"
                                    style={{ border: '1px solid #e2e8f0' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            {errors.password && <p className="error-text">{errors.password}</p>}
                        </div>

                        <div style={{ marginTop: '2.5rem' }}>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn"
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: '#0f172a',
                                    color: 'white',
                                    fontWeight: '700',
                                    borderRadius: '12px',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {isSubmitting ? 'Verifying...' : 'Access Dashboard'}
                            </button>
                        </div>
                    </form>

                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <button
                            onClick={() => navigate('/login')}
                            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.875rem', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            Return to User Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
