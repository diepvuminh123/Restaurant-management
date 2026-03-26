import React from 'react';
import { IoRestaurantOutline } from 'react-icons/io5';
import './RoleSelectionModal.css';

const RoleSelectionModal = ({ onSelectRole, onClose }) => {
    return (
        <div className="role-selection-modal-overlay">
            <div className="role-selection-modal">
                <div className="modal-header">
                    <div className="header-info">
                        <div className="header-icon-wrapper">
                            <IoRestaurantOutline className="header-icon" />
                        </div>
                        <div className="header-text">
                            <h4>Nhà hàng Huân Minh Quanh</h4>
                            <p>Hương vị truyền thống</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>

                <div className="modal-body">
                    <h2>Vui lòng chọn vai trò của bạn</h2>
                    <p>Bạn muốn tiếp tục với tư cách là khách hay đăng nhập để có trải nghiệm tốt hơn?</p>
                    <div className="role-buttons">
                        <button onClick={() => onSelectRole('guest')} className="btn btn-primary">Tiếp tục là khách</button>
                        <button onClick={() => onSelectRole('user')} className="btn btn-primary">Đăng nhập</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleSelectionModal;
