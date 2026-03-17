import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import { toast } from 'react-toastify';
import { ArrowLeft, Camera, Trash2, Check, X } from 'lucide-react';

const UserProfile = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // State for the profile image
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // State for cropping
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setPreviewImage(reader.result);
                setIsEditing(true);
            });
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleSaveCrop = async () => {
        try {
            const croppedImg = await getCroppedImg(previewImage, croppedAreaPixels);
            setImage(croppedImg);
            setIsEditing(false);
            setPreviewImage(null);
            toast.success("Profile image updated wrap successfully!");
        } catch (e) {
            console.error(e);
            toast.error("Failed to crop image");
        }
    };

    const handleCancelCrop = () => {
        setIsEditing(false);
        setPreviewImage(null);
    };

    const handleDeleteImage = () => {
        setImage(null);
        toast.info("Profile image removed");
    };

  

const handleFinalSave = async () => {
    try {

        const res = await fetch(image);
        const blob = await res.blob();

        const file = new File([blob], "profile.jpg", {
            type: "image/jpeg",
        });

        const formData = new FormData();
        formData.append("profileImage", file);

        await axios.post("http://localhost:5000/user/upload", formData);

        toast.success("Profile image added successfully");

    } catch (error) {
        console.error(error);
        toast.error("Upload failed");
    }
};

    // Helper to create the cropped image
    const getCroppedImg = (imageSrc, pixelCrop) => {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = imageSrc;
            image.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = pixelCrop.width;
                canvas.height = pixelCrop.height;

                ctx.drawImage(
                    image,
                    pixelCrop.x,
                    pixelCrop.y,
                    pixelCrop.width,
                    pixelCrop.height,
                    0,
                    0,
                    pixelCrop.width,
                    pixelCrop.height
                );

                resolve(canvas.toDataURL('image/jpeg'));
            };
            image.onerror = (error) => reject(error);
        });
    };

    return (
        <div className="user-profile-page-wrapper">
            <div className="profile-container">
                <div className="profile-header">
                    <button className="back-nav-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                        <span>Back</span>
                    </button>
                    <h1>User Profile</h1>
                </div>

                <div className="profile-content">
                    <div className="profile-image-section">
                        <div className="profile-image-wrapper">
                            {image ? (
                                <img src={image} alt="Profile" className="profile-image" />
                            ) : (
                                <div className="profile-image-placeholder">
                                    <Camera size={48} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="profile-actions-section">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />

                        <div className="button-group">
                            <button className="btn-profile btn-add" onClick={triggerFileInput}>
                                <Camera size={18} />
                                Add Profile Image
                            </button>

                            {image && (
                                <button className="btn-profile btn-save-final" onClick={handleFinalSave}>
                                    <Check size={18} />
                                    Save
                                </button>
                            )}

                            {image && (
                                <button className="btn-profile btn-delete" onClick={handleDeleteImage}>
                                    <Trash2 size={18} />
                                    Delete Image
                                </button>
                            )}

                            <button className="btn-profile btn-back" onClick={() => navigate('/home')}>
                                Back Button
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal for Cropping */}
                {isEditing && (
                    <div className="crop-modal-overlay">
                        <div className="crop-modal-content">
                            <div className="crop-modal-header">
                                <h3>Crop Your Image</h3>
                            </div>
                            <div className="crop-container">
                                <Cropper
                                    image={previewImage}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    onCropChange={setCrop}
                                    onCropComplete={onCropComplete}
                                    onZoomChange={setZoom}
                                    cropShape="round"
                                    showGrid={false}
                                />
                            </div>
                            <div className="crop-controls">
                                <div className="zoom-slider-container">
                                    <span>Zoom</span>
                                    <input
                                        type="range"
                                        value={zoom}
                                        min={1}
                                        max={3}
                                        step={0.1}
                                        aria-labelledby="Zoom"
                                        onChange={(e) => setZoom(e.target.value)}
                                        className="zoom-range"
                                    />
                                </div>
                                <div className="crop-modal-footer">
                                    <button className="btn-crop btn-cancel" onClick={handleCancelCrop}>
                                        <X size={18} />
                                        Cancel
                                    </button>
                                    <button className="btn-crop btn-save" onClick={handleSaveCrop}>
                                        <Check size={18} />
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
