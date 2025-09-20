# 👥 Team Collaboration Guide - Restaurant Management

Hướng dẫn chi tiết cho team phát triển dự án Restaurant Management System.

## 🎯 Quy Trình Làm Việc Nhóm

### 1. Git Workflow (Luồng làm việc với Git)

#### Lần đầu thiết lập dự án:
```bash
# Clone repository về máy
git clone https://github.com/diepvuminh123/Restaurant-management.git

# Vào thư mục dự án
cd Restaurant-management

# Kiểm tra branch hiện tại
git branch
```

#### Quy trình phát triển feature mới:

**Bước 1: Tạo branch mới**
```bash
# Đảm bảo đang ở branch main và có code mới nhất
git checkout main
git pull origin main

# Tạo branch mới cho feature của bạn
git checkout -b feature/ten-feature-cua-ban
# Ví dụ: git checkout -b feature/menu-management
```

**Bước 2: Phát triển code**
```bash
# Làm việc trên code của bạn...
# Kiểm tra những file đã thay đổi
git status

# Thêm file vào staging area
git add .
# Hoặc thêm từng file cụ thể: git add src/components/Menu.js

# Commit với message rõ ràng
git commit -m "Add: menu item creation functionality"
```

**Bước 3: Push code lên GitHub (Auto-Deploy)**
```bash
# Push branch lên GitHub
git push origin feature/ten-feature-cua-ban

# 🎯 Tự động deploy khi merge vào main:
# - Vercel sẽ tự động deploy frontend
# - GitHub Actions chạy tests và build
# - Preview URL được tạo cho PR
```

**Bước 4: Tạo Pull Request**
1. Vào GitHub repository
2. Click "New Pull Request"
3. Chọn branch của bạn để merge vào main
4. Viết mô tả chi tiết về changes
5. Assign reviewer (thành viên khác trong team)

#### Quy tắc đặt tên branch:
- `feature/` - Tính năng mới (feature/user-login)
- `bugfix/` - Sửa lỗi (bugfix/menu-display-error)
- `hotfix/` - Sửa lỗi khẩn cấp (hotfix/security-patch)
- `refactor/` - Cải thiện code (refactor/database-queries)

#### Quy tắc commit message:
- `Add:` - Thêm tính năng mới
- `Fix:` - Sửa lỗi
- `Update:` - Cập nhật tính năng có sẵn
- `Remove:` - Xóa code/file
- `Refactor:` - Cải thiện code structure

## 🚀 Auto-Deployment từ GitHub

### Cách hoạt động:
1. **Push to main branch** → Tự động deploy production
2. **Create Pull Request** → Tạo preview deployment
3. **Merge PR** → Deploy lên production URL chính

### URLs:
- **Production**: https://restaurant-management-test-adcb0h667-diepvuminh123s-projects.vercel.app
- **Preview**: Mỗi PR có URL riêng để test

### Workflow:
```bash
# 1. Tạo feature branch
git checkout -b feature/new-feature

# 2. Develop và commit
git add .
git commit -m "Add: new feature"

# 3. Push và tạo PR
git push origin feature/new-feature
# → GitHub tự tạo preview deployment

# 4. Merge PR vào main
# → Tự động deploy production
```

### Kiểm tra deployment:
- **GitHub Actions**: Tab "Actions" trong repository
- **Vercel Dashboard**: Dashboard Vercel để xem build logs
- **Build Status**: Status hiển thị trong PR

## 🏗 Thiết Lập Môi Trường Phát Triển

### Yêu cầu hệ thống:
- **Node.js** >= 16.0.0
- **npm** >= 8.0.0
- **Git** >= 2.30.0
- **VS Code** (khuyến nghị)

### Thiết lập lần đầu:

**1. Cài đặt dependencies cho Backend:**
```bash
cd backend
npm install
```

**2. Cài đặt dependencies cho Frontend:**
```bash
cd frontend
npm install
```

**3. Tạo file environment variables:**

**Backend** - Tạo file `.env` trong thư mục `backend/`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=mongodb://localhost:27017/restaurant-db
JWT_SECRET=your-secret-key-here
```

**Frontend** - Tạo file `.env` trong thư mục `frontend/`:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
```

### Chạy dự án:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

## 📋 Phân Chia Công Việc

### Frontend Tasks:
- **Components**: Menu, Order, Table, Dashboard
- **Pages**: Login, Home, Settings
- **State Management**: Redux/Context API
- **Styling**: Responsive CSS, Theme system
- **Testing**: Unit tests, E2E tests

### Backend Tasks:
- **API Routes**: Menu, Orders, Tables, Users
- **Database Models**: MongoDB schemas
- **Authentication**: JWT, middleware
- **Validation**: Input validation, error handling
- **Documentation**: API docs, Swagger

### DevOps Tasks:
- **Deployment**: Vercel, Heroku setup
- **CI/CD**: GitHub Actions
- **Monitoring**: Error tracking, performance
- **Security**: HTTPS, data validation

## 🤝 Code Review Guidelines

### Reviewer Checklist:
- [ ] Code hoạt động đúng chức năng
- [ ] Code style consistent với project
- [ ] Không có hardcoded values
- [ ] Error handling đầy đủ
- [ ] Performance tối ưu
- [ ] Security considerations
- [ ] Tests (nếu có)

### Author Checklist (trước khi tạo PR):
- [ ] Test locally trên cả frontend và backend
- [ ] Code đã được format
- [ ] Commit message rõ ràng
- [ ] PR description đầy đủ
- [ ] Screenshots (nếu có UI changes)

## 🚨 Quy Tắc Quan Trọng

### DO ✅:
- Luôn pull code mới nhất trước khi bắt đầu làm việc
- Test kỹ trước khi push code
- Viết commit message rõ ràng
- Tạo PR cho mọi thay đổi
- Review code của người khác
- Backup dữ liệu quan trọng

### DON'T ❌:
- Không push trực tiếp lên main branch
- Không commit node_modules, .env files
- Không merge PR của chính mình
- Không làm việc trên cùng file cùng lúc (trừ khi bàn bạc)
- Không xóa code của người khác mà không thảo luận

## 📞 Communication Channels

### Daily Standup:
- **Thời gian**: 9:00 AM hàng ngày
- **Format**: 
  - Hôm qua làm gì?
  - Hôm nay sẽ làm gì?
  - Có khó khăn gì không?

### Team Meetings:
- **Weekly Planning**: Thứ 2 hàng tuần
- **Sprint Review**: Cuối tuần
- **Code Review Sessions**: Khi cần thiết

### Tools:
- **Chat**: Discord/Slack team channel
- **Project Management**: Trello/Notion
- **Code Review**: GitHub Pull Requests
- **Documentation**: GitHub Wiki/Notion

## 🐛 Bug Reporting

### Bug Report Template:
```markdown
**Bug Description**
Mô tả ngắn gọn về bug

**Steps to Reproduce**
1. Đi đến trang...
2. Click vào...
3. Thực hiện...

**Expected Behavior**
Kết quả mong đợi

**Actual Behavior**
Kết quả thực tế

**Screenshots**
(Nếu có)

**Environment**
- OS: Windows/Mac/Linux
- Browser: Chrome/Firefox/Safari
- Version: v1.0.0
```

## 📈 Performance Standards

### Code Quality:
- **ESLint**: No errors
- **Performance**: < 3s load time
- **Bundle Size**: < 500KB
- **Test Coverage**: > 80%

### Git Standards:
- **Commit Size**: < 50 files changed
- **PR Size**: < 400 lines changed
- **Review Time**: < 24 hours
- **Merge Time**: < 48 hours

## 🎓 Learning Resources

### React/Frontend:
- [React Docs](https://react.dev/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [CSS Tricks](https://css-tricks.com/)

### Node.js/Backend:
- [Node.js Docs](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB University](https://university.mongodb.com/)

### Git/Collaboration:
- [Git Handbook](https://guides.github.com/introduction/git-handbook/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://conventionalcommits.org/)

---

**Happy Coding Together! 🚀👥**