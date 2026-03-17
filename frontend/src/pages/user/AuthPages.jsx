import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../../features/auth/authReducer";
import Home from '../user/Home';

const Authpage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const isLoginMode = location.pathname === "/login";
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

        if (!isLoginMode && !formData.fullName.trim()) {
            newErrors.fullName = "Full Name is required";
        }

        if (!isLoginMode && !formData.phoneNumber.trim()) {
            newErrors.phoneNumber = "Phone Number is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Invalid email address";
        }



        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (!isLoginMode) {
            if (!formData.confirmPassword) {
                newErrors.confirmPassword = "Confirm Password is required";
            } else if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = "Passwords do not match";
            }
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
            let response
            if (isLoginMode) {
                response = await axios.post("http://localhost:5000/login", {
                    email: formData.email,
                    password: formData.password
                },
                    { withCredentials: true },
                )
                dispatch(loginSuccess(response.data.user));
                navigate("/home");
            } else {
                response = await axios.post('http://localhost:5000/register', {
                    fullName: formData.fullName,
                    email: formData.email,
                    phoneNumber: formData.phoneNumber,
                    password: formData.password
                },
                    { withCredentials: true },
                )

            }
            toast.success(response.data.message);
            navigate("/login");

            setFormData({
                fullName: "",
                email: "",
                phoneNumber: "",
                password: "",
                confirmPassword: ""
            })
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        }

        setIsSubmitting(false);

    };

    const toggleMode = (e) => {
        e.preventDefault();
        navigate(isLoginMode ? '/register' : "/login")
        setErrors({});
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                {/* Left Side: Welcome Panel */}
                <div className="auth-sidebar">
                    <h2 className="welcome-title" style={{ color: 'white', fontSize: '2.5rem' }}>
                        {isLoginMode ? 'Welcome Back!' : 'Hello, Friend!'}
                    </h2>
                    <p className="app-description" style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>
                        {isLoginMode
                            ? 'To keep connected with us please login with your personal info'
                            : 'Enter your personal details and start journey with us'}
                    </p>
                    <button onClick={toggleMode} className="btn btn-outline" style={{ color: 'white', borderColor: 'white' }}>
                        {isLoginMode ? 'Register' : 'Login'}
                    </button>
                </div>

                {/* Right Side: Form Panel */}
                <div className="auth-main">
                    <h1 className="welcome-title" style={{ fontSize: '2rem', marginBottom: '2rem' }}>
                        {isLoginMode ? 'Sign In' : 'Create Account'}
                    </h1>

                    <form onSubmit={handleSubmit}>
                        {!isLoginMode && (
                            <div className="form-group">
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="Full Name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                                {errors.fullName && <p className="error-text">{errors.fullName}</p>}
                            </div>
                        )}

                        {!isLoginMode && (
                            <div className="form-group">
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    placeholder="Phone Number"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                                {errors.phoneNumber && <p className="error-text">{errors.phoneNumber}</p>}
                            </div>
                        )}

                        <div className="form-group">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                className="input-field"
                            />
                            {errors.email && <p className="error-text">{errors.email}</p>}
                        </div>



                        <div className="form-group">
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder={isLoginMode ? "Password" : "Create Password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input-field"
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

                        {!isLoginMode && (
                            <div className="form-group">
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        placeholder="Confirm Password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}
                                    >
                                        {showConfirmPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
                            </div>
                        )}

                        <div style={{ marginTop: '2rem' }}>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '1rem' }}
                            >
                                {isSubmitting
                                    ? (isLoginMode ? 'Signing In...' : 'Signing Up...')
                                    : (isLoginMode ? 'Sign In' : 'Sign Up')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Authpage;
