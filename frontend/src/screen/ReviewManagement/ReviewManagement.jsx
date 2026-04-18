import React, { useEffect, useMemo, useState } from 'react';
import ApiService from '../../services/apiService';
import { useToastContext } from '../../context/ToastContext';
import './ReviewManagement.css';

const REASON_OPTIONS = [
  { value: 'all', label: 'Tất cả lý do' },
  { value: 'spam', label: 'Spam' },
  { value: 'offensive', label: 'Offensive' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'fake', label: 'Fake' },
  { value: 'irrelevant', label: 'Irrelevant' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'visible', label: 'Đang hiển thị' },
  { value: 'hidden', label: 'Đang ẩn' },
];

const formatDateTime = (value) => {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleString('vi-VN');
};

const ReviewManagement = () => {
  const toast = useToastContext();
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1, total: 0 });
  const [filters, setFilters] = useState({
    status: 'all',
    reason: 'all',
  });

  const normalizedFilters = useMemo(() => {
    const next = {};
    if (filters.status && filters.status !== 'all') next.status = filters.status;
    if (filters.reason && filters.reason !== 'all') next.reason = filters.reason;
    return next;
  }, [filters]);

  const fetchReportedReviews = async (page = 1) => {
    setLoading(true);
    try {
      const response = await ApiService.getReportedReviews({
        ...normalizedFilters,
        page,
        limit: 10,
      });

      setReviews(Array.isArray(response?.data) ? response.data : []);
      setPagination(response?.pagination || { page: 1, total_pages: 1, total: 0 });
    } catch (error) {
      setReviews([]);
      toast.error(error?.message || 'Không thể tải review bị report');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    setSummaryLoading(true);
    try {
      const response = await ApiService.getMenuItemReportSummary({
        reason: filters.reason !== 'all' ? filters.reason : undefined,
        page: 1,
        limit: 6,
      });

      setSummary(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      setSummary([]);
      toast.error(error?.message || 'Không thể tải thống kê report theo món');
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchReportedReviews(1);
    fetchSummary();
  }, [normalizedFilters]);

  const toggleVisibility = async (review) => {
    if (!review?.id) return;

    const nextHidden = !review.is_hidden;
    let hiddenReason = null;

    if (nextHidden) {
      hiddenReason = window.prompt('Nhập lý do ẩn review:');
      if (!hiddenReason || !hiddenReason.trim()) {
        toast.warning('Cần nhập lý do khi ẩn review');
        return;
      }
    }

    setBusyId(review.id);
    try {
      const response = await ApiService.updateReviewVisibility(review.id, {
        is_hidden: nextHidden,
        hidden_reason: hiddenReason,
      });

      toast.success(response?.message || (nextHidden ? 'Đã ẩn review' : 'Đã bỏ ẩn review'));
      await Promise.all([fetchReportedReviews(pagination.page || 1), fetchSummary()]);
    } catch (error) {
      toast.error(error?.message || 'Không thể cập nhật trạng thái review');
    } finally {
      setBusyId(null);
    }
  };

  const goPrevPage = () => {
    const nextPage = Math.max(1, (pagination.page || 1) - 1);
    if (nextPage === pagination.page) return;
    fetchReportedReviews(nextPage);
  };

  const goNextPage = () => {
    const nextPage = Math.min(pagination.total_pages || 1, (pagination.page || 1) + 1);
    if (nextPage === pagination.page) return;
    fetchReportedReviews(nextPage);
  };

  return (
    <section className="review-admin">
      <header className="review-admin__header">
        <div>
          <h1>Kiểm duyệt đánh giá món ăn</h1>
          <p>Theo dõi review bị report và điều chỉnh hiển thị công khai.</p>
        </div>
      </header>

      <div className="review-admin__summary-grid">
        {summaryLoading ? <div className="review-admin__state">Đang tải thống kê...</div> : null}
        {!summaryLoading && summary.length === 0 ? (
          <div className="review-admin__state">Chưa có dữ liệu report theo món.</div>
        ) : null}

        {summary.map((item) => (
          <article key={item.menu_item_id} className="review-admin__summary-card">
            <h3>{item.menu_item_name || `Món #${item.menu_item_id}`}</h3>
            <div className="review-admin__summary-meta">
              <span>Tổng report: {Number(item.total_reports || 0)}</span>
              <span>Review bị report: {Number(item.total_reported_reviews || 0)}</span>
              <span>Review đã ẩn: {Number(item.hidden_review_count || 0)}</span>
            </div>
            <div className="review-admin__summary-time">Report gần nhất: {formatDateTime(item.latest_report_at)}</div>
          </article>
        ))}
      </div>

      <div className="review-admin__filters">
        <label>
          Trạng thái
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Lý do report
          <select
            value={filters.reason}
            onChange={(e) => setFilters((prev) => ({ ...prev, reason: e.target.value }))}
          >
            {REASON_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="review-admin__table-wrap">
        {loading ? <div className="review-admin__state">Đang tải danh sách review bị report...</div> : null}
        {!loading && reviews.length === 0 ? <div className="review-admin__state">Không có review phù hợp bộ lọc.</div> : null}

        {!loading && reviews.length > 0 ? (
          <table className="review-admin__table">
            <thead>
              <tr>
                <th>Món</th>
                <th>Người đánh giá</th>
                <th>Nội dung</th>
                <th>Report</th>
                <th>Trạng thái</th>
                <th>Cập nhật</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.menu_item_name || `Món #${item.menu_item_id}`}</strong>
                    <div className="review-admin__muted">Sao: {Number(item.rating || 0)}</div>
                  </td>
                  <td>
                    <div>{item.full_name || item.username || `User #${item.user_id}`}</div>
                  </td>
                  <td>
                    <div className="review-admin__comment">{item.comment || 'Không có bình luận'}</div>
                    {item.hidden_reason ? (
                      <div className="review-admin__hidden-reason">Lý do ẩn: {item.hidden_reason}</div>
                    ) : null}
                  </td>
                  <td>
                    <div>{Number(item.report_count || 0)} report</div>
                    <div className="review-admin__muted">{Array.isArray(item.reasons) ? item.reasons.join(', ') : '--'}</div>
                    <div className="review-admin__report-notes">
                      {Array.isArray(item.report_notes) && item.report_notes.length > 0
                        ? item.report_notes.join(' | ')
                        : 'Không có mô tả thêm'}
                    </div>
                  </td>
                  <td>
                    <span className={`review-admin__status ${item.is_hidden ? 'review-admin__status--hidden' : 'review-admin__status--visible'}`}>
                      {item.is_hidden ? 'Đang ẩn' : 'Đang hiển thị'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="review-admin__action"
                      onClick={() => toggleVisibility(item)}
                      disabled={busyId === item.id}
                    >
                      {busyId === item.id ? 'Đang xử lý...' : item.is_hidden ? 'Bỏ ẩn' : 'Ẩn review'}
                    </button>
                    <div className="review-admin__muted">{formatDateTime(item.updated_at)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>

      <div className="review-admin__pagination">
        <button type="button" onClick={goPrevPage} disabled={(pagination.page || 1) <= 1 || loading}>
          Trang trước
        </button>
        <span>
          Trang {pagination.page || 1}/{pagination.total_pages || 1} ({pagination.total || 0} review)
        </span>
        <button
          type="button"
          onClick={goNextPage}
          disabled={(pagination.page || 1) >= (pagination.total_pages || 1) || loading}
        >
          Trang sau
        </button>
      </div>
    </section>
  );
};

export default ReviewManagement;
