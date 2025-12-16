import React, { useState } from 'react';
import './UserInfoForm.css';

const UserInfoForm = ({ user }) => {
    // Khởi tạo state cho form bằng dữ liệu người dùng (userInfo)
    const [formData, setFormData] = useState({
        name: user?.username || '',
        email: user?.email || '',
        date_of_birth: user?.date_of_birth || '',
        phone: user?.phone || '',
    });
    const [isEditing, setIsEditing] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        // 🎯 LOGIC TÍCH HỢP API CẬP NHẬT Ở ĐÂY
        console.log("Dữ liệu cập nhật:", formData);
        setIsEditing(false); // Tắt chế độ chỉnh sửa sau khi cập nhật thành công
    };
    
    // Hàm này format ngày tháng năm sinh (giả sử nó là chuỗi 'DD/MM/YYYY')
    const formatDOB = (dateString) => {
        return dateString ? dateString : 'Chưa cập nhật';
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
                
                {/* Trường Tên */}
                <div className="form-group">
                    <label htmlFor="name">Tên</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
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

                {/* Trường Ngày sinh */}
                <div className="form-group">
                    <label htmlFor="date_of_birth">Ngày sinh</label>
                    <input
                        type="text"
                        name="date_of_birth"
                        value={formatDOB(formData.date_of_birth)}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={isEditing ? 'editable' : 'read-only'}
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
                    <button type="submit" className="save-btn">Lưu thay đổi</button>
                )}
            </form>
            
            <p className="note-text">
                Email này sẽ được dùng để gửi xác nhận và hóa đơn điện tử.
            </p>
        </div>
    );
};

export default UserInfoForm;