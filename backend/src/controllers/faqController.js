const Faq = require('../models/Faq');

const faqController = {
  // Public: Lấy danh sách FAQ đang active
  getActiveFaqs: async (req, res) => {
    try {
      const faqs = await Faq.getAllActive();
      res.json(faqs);
    } catch (error) {
      console.error('Error fetching public FAQs:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // Admin: Lấy toàn bộ FAQ
  getAllFaqs: async (req, res) => {
    try {
      const faqs = await Faq.getAll();
      res.json(faqs);
    } catch (error) {
      console.error('Error fetching all FAQs:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // Admin: Thêm FAQ mới
  createFaq: async (req, res) => {
    try {
      const { question, answer, is_active, sort_order } = req.body;
      if (!question || !answer) {
        return res.status(400).json({ error: 'Question and answer are required' });
      }
      const newFaq = await Faq.create({ question, answer, is_active, sort_order });
      res.status(201).json(newFaq);
    } catch (error) {
      console.error('Error creating FAQ:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // Admin: Cập nhật FAQ
  updateFaq: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedFaq = await Faq.update(id, req.body);
      if (!updatedFaq) {
        return res.status(404).json({ error: 'FAQ not found' });
      }
      res.json(updatedFaq);
    } catch (error) {
      console.error('Error updating FAQ:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // Admin: Xóa FAQ
  deleteFaq: async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await Faq.delete(id);
      if (!deleted) {
        return res.status(404).json({ error: 'FAQ not found' });
      }
      res.json({ message: 'FAQ deleted successfully' });
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // Admin: Cập nhật thứ tự
  updateOrder: async (req, res) => {
    try {
      const { items } = req.body; // [{id: 1, sort_order: 1}, ...]
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: 'Items array is required' });
      }
      await Faq.updateOrder(items);
      res.json({ message: 'FAQ order updated successfully' });
    } catch (error) {
      console.error('Error updating FAQ order:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

module.exports = faqController;
