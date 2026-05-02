import React from 'react';
import { IoRestaurantOutline } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';
import { useRestaurantInfoContext } from '../../context/RestaurantInfoContext';
import './RoleSelectionModal.css';

const RoleSelectionModal = ({ onSelectRole, onClose }) => {
    const { restaurantName, restaurantSlogan } = useRestaurantInfoContext();
    const { t } = useTranslation();

    return (
        <div className="role-selection-modal-overlay">
            <div className="role-selection-modal">
                <div className="modal-header">
                    <div className="header-info">
                        <div className="header-icon-wrapper">
                            <IoRestaurantOutline className="header-icon" />
                        </div>
                        <div className="header-text">
                            <h4>{restaurantName}</h4>
                            <p>{restaurantSlogan}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>

                <div className="modal-body">
                    <h2>{t('reservationQuick.roleSelectionTitle')}</h2>
                    <p>{t('reservationQuick.roleSelectionSubtitle')}</p>
                    <div className="role-buttons">
                        <button onClick={() => onSelectRole('guest')} className="btn btn-primary">{t('reservationQuick.continueAsGuest')}</button>
                        <button onClick={() => onSelectRole('user')} className="btn btn-primary">{t('common.login')}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleSelectionModal;
