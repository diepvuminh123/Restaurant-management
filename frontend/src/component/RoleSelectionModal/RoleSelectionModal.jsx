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
                <div className="role-selection-modal__header">
                    <div className="role-selection-modal__header-info">
                        <div className="role-selection-modal__icon-wrapper">
                            <IoRestaurantOutline className="role-selection-modal__icon" />
                        </div>
                        <div className="role-selection-modal__header-text">
                            <h4>{restaurantName}</h4>
                            <p>{restaurantSlogan}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="role-selection-modal__close-button" aria-label="Đóng">
                        &times;
                    </button>
                </div>

                <div className="role-selection-modal__body">
                    <h2>{t('reservationQuick.roleSelectionTitle')}</h2>
                    <p>{t('reservationQuick.roleSelectionSubtitle')}</p>
                    <div className="role-selection-modal__actions">
                        <button onClick={() => onSelectRole('guest')} className="role-selection-modal__button role-selection-modal__button--primary">{t('reservationQuick.continueAsGuest')}</button>
                        <button onClick={() => onSelectRole('user')} className="role-selection-modal__button role-selection-modal__button--primary">{t('common.login')}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleSelectionModal;
