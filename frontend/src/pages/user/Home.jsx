import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../../features/auth/authReducer";
import axios from 'axios';
import { toast } from 'react-toastify';

const Home = () => {
    const user = useSelector((state) => state.auth.user);
    const name = user?.name || "Guest";
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const response = await axios.post('http://localhost:5000/logout', {}, { withCredentials: true });
            dispatch(logout());
            navigate('/login');
            toast.success(response.data.message);
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="app-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header with Profile Icon */}
            <header style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Link to="/profile" title="User Profile" style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    color: '#64748b',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    border: '3px solid white',
                    transition: 'transform 0.2s ease-in-out'
                }} className="hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </Link>
            </header>

            <main className="container" style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 2rem 2rem 2rem' }}>

                {/* Welcome Section */}
                <div className="welcome-banner" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 className="welcome-title" style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>
                        Welcome, <span style={{ color: '#4a90e2' }}>{name}</span>
                    </h1>
                </div>

                {/* Primary Actions Centered */}
                <div className="action-area" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', width: '100%', maxWidth: '300px' }}>

                    <Link to="/profile" className="btn btn-primary" style={{
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.8rem',
                        width: '100%',
                        padding: '1rem',
                        fontSize: '1.1rem',
                        borderRadius: '8px'
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        Manage Profile
                    </Link>

                    <button onClick={handleLogout} className="btn-logout" style={{
                        background: '#ff4d4d',
                        color: 'white',
                        border: 'none',
                        padding: '1rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        width: '100%',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.8rem',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        Logout
                    </button>
                </div>
            </main>

            <footer className="footer" style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: '#888', margin: 0 }}>&copy; 2026 Personal Dashboard. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Home;
