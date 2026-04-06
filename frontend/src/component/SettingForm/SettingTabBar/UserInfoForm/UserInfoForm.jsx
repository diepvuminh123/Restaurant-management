import React, { useEffect, useState } from 'react';
import ApiService from '../../../../services/apiService';
import { useToastContext } from '../../../../context/ToastContext';
import './UserInfoForm.css';

const UserInfoForm = ({ user, onProfileUpdated }) => {
    const toast = useToastContext();
    const [formData, setFormData] = useState({
        username: user?.username || '',
        fullName: user?.fullName || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setFormData({
            username: user?.username || '',
            fullName: user?.fullName || '',
            email: user?.email || '',
            phone: user?.phone || '',
        });
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!isEditing || isSubmitting) {
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await ApiService.updateProfile({
                username: formData.username,
                fullName: formData.fullName,
                phone: formData.phone,
            });

            const updatedUser = response?.data?.user;
            if (updatedUser && typeof onProfileUpdated === 'function') {
                onProfileUpdated(updatedUser);
            }

            toast.success('Cập nhật thông tin cá nhân thành công!');
            setIsEditing(false);
        } catch (error) {
            toast.error(error.message || 'Không thể cập nhật thông tin cá nhân');
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="user-info-form-card">
            
            <div className="form-header">
                <span className="form-title">Thông tin cá nhân</span>
                <button 
                    className="edit-btn" 
                    onClick={() => setIsEditing(!isEditing)}
                >
                    {isEditing ? 'Hủy chỉnh sửa' : 'Chỉnh sửa thông tin'}
                </button>
            </div>

            <form onSubmit={handleUpdate} className="user-form">
                
                {/* Trường Username */}
                <div className="form-group">
                    <label htmlFor="username">Tên đăng nhập</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={isEditing ? 'editable' : 'read-only'}
                    />
                </div>

                {/* Trường Họ và tên */}
                <div className="form-group">
                    <label htmlFor="fullName">Họ và tên</label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={isEditing ? 'editable' : 'read-only'}
                    />
                </div>

                {/* Trường Email (Thường không cho phép chỉnh sửa) */}
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        readOnly // Email thường là trường read-only
                        className='read-only'
                    />
                </div>

                {/* Trường Số điện thoại */}
                <div className="form-group">
                    <label htmlFor="phone">Số điện thoại</label>
                    <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={isEditing ? 'editable' : 'read-only'}
                    />
                </div>

                {isEditing && (
                    <button type="submit" className="save-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                )}
            </form>
            
            <p className="note-text">
                Email này sẽ được dùng để gửi xác nhận và hóa đơn điện tử.
            </p>
        </div>
    );
};

export default UserInfoForm;