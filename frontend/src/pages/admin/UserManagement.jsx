import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useDispatch } from "react-redux";
import { logout } from "../../../features/auth/authReducer";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';

const UserManagement = () => {
    // Initial Mock Data
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const [users, setUsers] = useState([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [searchTerm, setSearchTerm] = useState('')

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [id, setSelectedUserId] = useState(null);
    const [formData, setFormData] = useState({ fullName: '', email: '', phoneNumber: '', password: '' });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchuser();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, page]);

    const fetchuser = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/admin/users?page=${page}&limit=5&search=${searchTerm}`, {
                withCredentials: true
            })

            const fetchedUsers = response?.data.users || [];
            setUsers(fetchedUsers)
            setTotalPages(response?.data.pages || 1)

            // Handle edge case: empty page after deletion
            if (fetchedUsers.length === 0 && page > 1) {
                setPage(prev => prev - 1);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Error while fetching data");
        }
    }

    const handleLogout = async () => {
        try {
            let response = await axios.post('http://localhost:5000/admin/logout', {}, { withCredentials: true })
            dispatch(logout());
            toast.success(response.data.message);
            navigate('/admin/login')
        } catch (error) {
            console.error(error)
            toast.error(error)
        }
    }


    // Input Change Handler
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    // Form Validation Logic
    const validateForm = () => {
        let tempErrors = {};
        if (!formData.fullName.trim()) tempErrors.fullName = "Full name is required";
        if (!formData.email.trim()) {
            tempErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            tempErrors.email = "Invalid email format";
        }
        if (!formData.phoneNumber.trim()) {
            tempErrors.phoneNumber = "Phone number is required";
        } else if (!/^\d{10,}$/.test(formData.phoneNumber.replace(/[\s-]/g, ''))) {
            tempErrors.phoneNumber = "Must be a valid numeric phone number";
        }

        if (modalMode == "add") {
            if (!formData.password) {
                tempErrors.password = "Password is required";
            } else if (formData.password.length < 6) {
                tempErrors.password = "Password must be at least 6 characters";
            }
        }
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };




    const handleBlockToggle = async (user) => {
        const { value: confirm } = await Swal.fire({
            title: user.isBlocked ? `Unblock ${user.fullName}?` : `Block ${user.fullName}?`,
            html: `<p style="font-size:16px;">Are you sure you want to ${user.isBlocked ? 'unblock' : 'block'} <strong>${user.fullName}</strong>?</p>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            allowOutsideClick: false,
        });

        if (confirm) {
            try {
                const id = user._id;
                const url = user.isBlocked
                    ? `http://localhost:5000/admin/unblock-user/${id}`
                    : `http://localhost:5000/admin/block-user/${id}`;

                const response = await axios.patch(url, {}, { withCredentials: true });

                // Update UI
                setUsers(prev =>
                    prev.map(u =>
                        u._id === id ? { ...u, isBlocked: !u.isBlocked } : u
                    )
                );

                Swal.close(); // close loader
                toast.success(response.data.message);

            } catch (error) {
                Swal.close(); // close loader
                toast.error(error.response?.data?.message || "Something went wrong");
            }
        }
    };

    const openAddModal = () => {
        setModalMode('add');
        setSelectedUserId(null);
        setFormData({ fullName: '', email: '', phoneNumber: '', password: '' });
        setErrors({});
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setModalMode('edit');
        setSelectedUserId(user._id);
        setFormData({
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const isValid = validateForm();

        if (!isValid) return;
        if (modalMode === "add") {
            try {
                let response = await axios.post('http://localhost:5000/admin/create-user', {
                    fullName: formData.fullName,
                    email: formData.email,
                    phoneNumber: formData.phoneNumber,
                    password: formData.password
                }
                    , { withCredentials: true })
                setFormData({ fullName: '', email: '', phoneNumber: '', password: '' })
                setIsModalOpen(false)
                toast.success(response.data.message);
                fetchuser();
            } catch (error) {
                toast.error(error.response?.data.message || "Something went wrong")
            }
        } else if (modalMode === "edit") {
            try {
                const editdata = { fullName: formData.fullName, email: formData.email, phoneNumber: formData.phoneNumber }
                let response = await axios.put(`http://localhost:5000/admin/edit-user/${id}`, editdata, { withCredentials: true })
                setIsModalOpen(false)
                setModalMode(null)
                setFormData({ fullName: "", email: "", phoneNumber: "" })
                toast.success(response.data.message || "User updated successFully")
                setSelectedUserId("")
                fetchuser()

            } catch (error) {
                toast.error(error.response?.data.message || "Something went wrong")
            }
        }
        closeModal();
    }

    const handleDeleteUser = async (user) => {
        const { value: confirm } = await Swal.fire({
            title: `Delete ${user.fullName}?`,
            html: `<p style="font-size:16px;">Are you sure you want to delete <strong>${user.fullName}</strong>?</p>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete',
            cancelButtonText: 'No',
            allowOutsideClick: false,
        });

        if (confirm) {
            // Show loading while API runs
            Swal.fire({
                title: 'Deleting...',
                didOpen: () => Swal.showLoading(),
                allowOutsideClick: false,
            });

            try {
                const id = user._id;
                // axios.delete only needs 2 args: url and config
                const response = await axios.delete(
                    `http://localhost:5000/admin/delete-user/${id}`,
                    { withCredentials: true }
                );

                Swal.close(); // close loader
                toast.success(response.data.message);

                // Optionally remove the user from UI
                setUsers(prev => prev.filter(u => u._id !== id));

            } catch (error) {
                Swal.close(); // close loader
                toast.error(error.response?.data?.message || "Something went wrong");
            }
        }
    };

    return (
        <div className="admin-user-management">
            {/* Page Header Box */}
            <div className="admin-um-header-box">
                <h1 className="admin-um-title">User Management</h1>
                <div className="admin-um-header-buttons">
                    <button className="admin-um-btn-add" onClick={openAddModal}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Add User
                    </button>
                    <button onClick={handleLogout} className="admin-um-btn-logout">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        Logout
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="admin-um-search-container" style={{ width: '100%', marginBottom: '24px' }}>
                <div style={{ position: 'relative' }}>
                    <svg style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input
                        type="text"
                        placeholder="Search by name, email or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 16px 12px 48px',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            fontSize: '14px',
                            outline: 'none',
                            backgroundColor: 'white',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                        }}
                    />
                </div>
            </div>

            {/* Table Container */}
            <div className="admin-um-table-container">
                <table className="admin-um-table">
                    <thead>
                        <tr>
                            <th>Avatar</th>
                            <th>Full Name</th>
                            <th>Email Address</th>
                            <th>Phone Number</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td>
                                    <div className="admin-um-avatar-container">
                                        <img src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`} alt={user.fullName} className="admin-um-avatar" />
                                    </div>
                                </td>
                                <td>
                                    <span className="admin-um-user-name">{user.fullName}</span>
                                </td>
                                <td className="admin-um-cell-text">{user.email}</td>
                                <td className="admin-um-cell-text">{user.phoneNumber}</td>
                                <td>
                                    <div className="admin-um-actions">
                                        <button
                                            onClick={() => handleBlockToggle(user)}
                                            className={`admin-um-action-btn admin-um-btn-block`}
                                        >
                                            {user.isBlocked ? 'Unblock' : 'Block'}
                                        </button>
                                        <button
                                            onClick={() => openEditModal(user)}
                                            className={`admin-um-action-btn admin-um-btn-edit`}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user)}
                                            className={`admin-um-action-btn admin-um-btn-delete`}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls in a Small Centered Box */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px', paddingBottom: '40px' }}>
                    <div style={{ 
                        backgroundColor: 'white', 
                        padding: '12px 24px', 
                        borderRadius: '16px', 
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                            style={{ 
                                padding: '8px', 
                                borderRadius: '10px',
                                border: '1px solid #e2e8f0',
                                backgroundColor: 'white',
                                color: page === 1 ? '#cbd5e1' : '#1e293b',
                                cursor: page === 1 ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'all 0.2s'
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setPage(i + 1)}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        backgroundColor: page === i + 1 ? '#3b82f6' : 'transparent',
                                        color: page === i + 1 ? 'white' : '#64748b',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        fontSize: '14px'
                                    }}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                            style={{ 
                                padding: '8px', 
                                borderRadius: '10px',
                                border: '1px solid #e2e8f0',
                                backgroundColor: 'white',
                                color: page === totalPages ? '#cbd5e1' : '#1e293b',
                                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'all 0.2s'
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Modals Overlay */}
            {isModalOpen && (
                <div className="admin-um-modal-overlay">
                    <div className="admin-um-modal-content">
                        <div className="admin-um-modal-header">
                            <h3 className="admin-um-modal-title">
                                {modalMode === 'add' ? 'Add New User' : 'Edit User Profile'}
                            </h3>
                        </div>

                        <div className="admin-um-modal-body">
                            <div className="admin-um-form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="e.g. John Doe"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className={`admin-um-form-input ${errors.fullName ? 'admin-um-input-error' : ''}`}
                                />
                                {errors.fullName && <p className="admin-um-error-text">{errors.fullName}</p>}
                            </div>

                            <div className="admin-um-form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="name@company.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`admin-um-form-input ${errors.email ? 'admin-um-input-error' : ''}`}
                                />
                                {errors.email && <p className="admin-um-error-text">{errors.email}</p>}
                            </div>

                            <div className="admin-um-form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    placeholder="Enter phone digits"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    className={`admin-um-form-input ${errors.phoneNumber ? 'admin-um-input-error' : ''}`}
                                />
                                {errors.phoneNumber && <p className="admin-um-error-text">{errors.phoneNumber}</p>}
                            </div>
                            {modalMode === 'add' && (
                                <div className="admin-um-form-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Enter  password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className={`admin-um-form-input ${errors.password ? 'admin-um-input-error' : ''}`}
                                    />
                                    {errors.password && <p className="admin-um-error-text">{errors.password}</p>}
                                </div>
                            )}
                        </div>
                        <div className="admin-um-modal-actions">
                            <button
                                onClick={closeModal}
                                className="admin-um-btn-cancel"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="admin-um-btn-save"
                            >
                                {modalMode === 'add' ? 'Create User' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
