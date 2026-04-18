import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Star, X } from 'lucide-react';
import ApiService from '../../../services/apiService';
import { useToastContext } from '../../../context/ToastContext';
import './ReviewModal.css';

const RATING_OPTIONS = [5, 4, 3, 2, 1];
const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'offensive', label: 'Ngôn từ xúc phạm' },
  { value: 'harassment', label: 'Quấy rối' },
  { value: 'fake', label: 'Nội dung giả mạo' },
  { value: 'irrelevant', label: 'Không liên quan món ăn' },
];

const formatRelativeTime = (value) => {
  if (!value) return 'Vừa xong';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Vừa xong';

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Vừa xong';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;

  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getReviewerName = (review) => {
  return review?.full_name || review?.username || `Khách #${review?.user_id || '?'}`;
};

const getCurrentUserId = (user) => {
  return Number(user?.id || user?.userId || user?.user_id || 0);
};

export default function ReviewModal({ dish, user, onClose, onRequestLogin }) {
  const toast = useToastContext();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [sort, setSort] = useState('newest');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [activeReportReviewId, setActiveReportReviewId] = useState(null);
  const [reportReason, setReportReason] = useState('spam');
  const [reportNote, setReportNote] = useState('');
  const [reportingId, setReportingId] = useState(null);

  const canSubmit = Boolean(user);
  const currentUserId = getCurrentUserId(user);

  const reviewStats = useMemo(() => {
    const total = reviews.length;

    const counts = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    let sum = 0;

    reviews.forEach((item) => {
      const itemRating = toNumber(item?.rating);
      if (counts[itemRating] !== undefined) {
        counts[itemRating] += 1;
      }
      sum += itemRating;
    });

    const average = total > 0 ? sum / total : 0;

    return {
      total,
      counts,
      average,
    };
  }, [reviews]);

  const fetchReviews = async () => {
    if (!dish?.id) return;

    setLoading(true);
    try {
      const response = await ApiService.getPublicReviewsByMenuItem(dish.id, {
        limit: 20,
        page: 1,
        sort,
      });

      setReviews(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      setReviews([]);
      toast.error(error?.message || 'Không tải được đánh giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [dish?.id, sort]);

  useEffect(() => {
    const handler = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canSubmit) {
      toast.warning('Bạn cần đăng nhập để gửi đánh giá');
      return;
    }

    if (!rating) {
      toast.warning('Vui lòng chọn số sao đánh giá');
      return;
    }

    setSubmitting(true);
    try {
      await ApiService.createReview({
        menu_item_id: dish.id,
        rating,
        comment,
      });

      setRating(0);
      setComment('');
      toast.success('Gửi đánh giá thành công');
      await fetchReviews();
    } catch (error) {
      toast.error(error?.message || 'Không thể gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const openReportForm = (reviewId) => {
    setActiveReportReviewId(reviewId);
    setReportReason('spam');
    setReportNote('');
  };

  const closeReportForm = () => {
    setActiveReportReviewId(null);
    setReportReason('spam');
    setReportNote('');
  };

  const handleSubmitReport = async (event) => {
    event.preventDefault();

    if (!user) {
      toast.warning('Bạn cần đăng nhập để tố cáo đánh giá');
      onRequestLogin();
      return;
    }

    if (!activeReportReviewId) return;

    setReportingId(activeReportReviewId);
    try {
      await ApiService.reportReview(activeReportReviewId, {
        reason: reportReason,
        note: reportNote,
      });

      toast.success('Tố cáo đã được gửi tới quản trị viên');
      closeReportForm();
    } catch (error) {
      toast.error(error?.message || 'Không thể gửi tố cáo');
    } finally {
      setReportingId(null);
    }
  };

  const stopPropagation = (event) => event.stopPropagation();

  return (
    <div className="review-modal__backdrop" onClick={onClose}>
      <div className="review-modal" onClick={stopPropagation} role="dialog" aria-modal="true">
        <div className="review-modal__header">
          <div>
            <h2>Đánh giá & bình luận món ăn</h2>
            <p>Khám phá ý kiến khách hàng và chia sẻ trải nghiệm của bạn.</p>
          </div>
          <button type="button" className="review-modal__close" onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>

        <div className="review-modal__dish">
          <img
            src={dish?.images?.[0] || ''}
            alt={dish?.name || 'Dish'}
            onError={(e) => {
              e.currentTarget.style.visibility = 'hidden';
            }}
          />
          <div>
            <h3>{dish?.name}</h3>
            <div className="review-modal__dish-price">
              {Number(dish?.sale_price || dish?.price || 0).toLocaleString('vi-VN')}đ
            </div>
            <p>{dish?.description_short || dish?.description || 'Món ăn đặc sắc của nhà hàng'}</p>
          </div>
        </div>

        <div className="review-modal__summary">
          <div className="review-modal__summary-score">
            <div className="review-modal__average">{reviewStats.average.toFixed(1)}</div>
            <div className="review-modal__total">trên 5</div>
          </div>
          <div className="review-modal__breakdown">
            {RATING_OPTIONS.map((value) => {
              const count = reviewStats.counts[value] || 0;
              const ratio = reviewStats.total > 0 ? (count / reviewStats.total) * 100 : 0;

              return (
                <div key={value} className="review-modal__bar-row">
                  <span>{value} sao</span>
                  <div className="review-modal__bar-track">
                    <div className="review-modal__bar-fill" style={{ width: `${ratio}%` }} />
                  </div>
                  <span>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="review-modal__controls">
          <label htmlFor="review-sort">Sắp xếp</label>
          <select
            id="review-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            disabled={loading}
          >
            <option value="newest">Mới nhất</option>
            <option value="highest">Sao cao nhất</option>
            <option value="lowest">Sao thấp nhất</option>
          </select>
        </div>

        <div className="review-modal__list">
          {loading ? <div className="review-modal__state">Đang tải đánh giá...</div> : null}
          {!loading && reviews.length === 0 ? (
            <div className="review-modal__state">Chưa có đánh giá nào cho món này.</div>
          ) : null}

          {!loading
            ? reviews.map((item) => (
                <div key={item.id} className="review-modal__item">
                  <div className="review-modal__item-head">
                    <div>
                      <div className="review-modal__name">{getReviewerName(item)}</div>
                      <div className="review-modal__time">{formatRelativeTime(item.created_at)}</div>
                    </div>
                    <div className="review-modal__stars" aria-label={`Đánh giá ${item.rating} sao`}>
                      {Array.from({ length: 5 }).map((_, idx) => {
                        const active = idx < toNumber(item.rating);
                        return <Star key={idx} size={15} fill={active ? '#e36a2d' : 'none'} color="#e36a2d" />;
                      })}
                    </div>
                  </div>
                  <p>{item.comment || 'Không có bình luận'}</p>

                  <div className="review-modal__item-actions">
                    {Number(item.user_id) !== currentUserId ? (
                      <button
                        type="button"
                        className="review-modal__report-btn"
                        onClick={() => {
                          if (!user) {
                            onRequestLogin();
                            return;
                          }
                          openReportForm(item.id);
                        }}
                      >
                        Tố cáo
                      </button>
                    ) : (
                      <span className="review-modal__self-review-note">Đánh giá của bạn</span>
                    )}
                  </div>

                  {activeReportReviewId === item.id ? (
                    <form className="review-modal__report-form" onSubmit={handleSubmitReport}>
                      <select
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        disabled={reportingId === item.id}
                      >
                        {REPORT_REASONS.map((reason) => (
                          <option key={reason.value} value={reason.value}>
                            {reason.label}
                          </option>
                        ))}
                      </select>

                      <textarea
                        value={reportNote}
                        onChange={(e) => setReportNote(e.target.value)}
                        placeholder="Mô tả thêm (tùy chọn)"
                        maxLength={500}
                        disabled={reportingId === item.id}
                      />

                      <div className="review-modal__report-actions">
                        <button
                          type="button"
                          className="review-modal__report-cancel"
                          onClick={closeReportForm}
                          disabled={reportingId === item.id}
                        >
                          Hủy
                        </button>
                        <button type="submit" disabled={reportingId === item.id}>
                          {reportingId === item.id ? 'Đang gửi...' : 'Gửi tố cáo'}
                        </button>
                      </div>
                    </form>
                  ) : null}
                </div>
              ))
            : null}
        </div>

        <form className="review-modal__form" onSubmit={handleSubmit}>
          <h4>Gửi đánh giá của bạn</h4>

          {!canSubmit ? (
            <div className="review-modal__login-note">
              Bạn cần đăng nhập trước khi gửi đánh giá.
              <button type="button" onClick={onRequestLogin}>
                Đăng nhập ngay
              </button>
            </div>
          ) : null}

          <div className="review-modal__rating-picker">
            {Array.from({ length: 5 }).map((_, idx) => {
              const current = idx + 1;
              const active = current <= rating;

              return (
                <button
                  type="button"
                  key={current}
                  onClick={() => setRating(current)}
                  className={`review-modal__star-btn ${active ? 'active' : ''}`}
                  aria-label={`Chọn ${current} sao`}
                >
                  <Star size={20} fill={active ? '#e36a2d' : 'none'} color="#e36a2d" />
                </button>
              );
            })}
          </div>

          <textarea
            placeholder="Nhập cảm nhận về món ăn..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            disabled={!canSubmit || submitting}
          />

          <button type="submit" disabled={!canSubmit || submitting || !rating}>
            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </form>
      </div>
    </div>
  );
}

ReviewModal.propTypes = {
  dish: PropTypes.object,
  user: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onRequestLogin: PropTypes.func.isRequired,
};
