# LIEN HOA WORK MANAGER

Web app quản lý và phân công công việc cho doanh nghiệp giáo dục và cung ứng lao động.

## V1
- Dashboard
- Công việc và phân công
- Nhân sự
- Giáo dục
- Cung ứng lao động
- Lịch công việc
- Lưu dữ liệu demo bằng LocalStorage
- Responsive cho máy tính/điện thoại

## Chạy
Mở `index.html` hoặc bật GitHub Pages từ Settings → Pages → Deploy from branch → main → /(root).

> V1 là bản frontend demo. Dữ liệu hiện lưu trên trình duyệt của từng máy; bước tiếp theo là kết nối Supabase để nhiều nhân viên dùng chung dữ liệu và đăng nhập phân quyền.

## V2 nâng cấp
- Chỉnh sửa công việc, trạng thái và tiến độ.
- Tìm kiếm và xuất CSV.
- Thêm nền tảng Supabase: `supabase.sql` và `config.example.js`.
- GitHub Pages chỉ là giao diện; dữ liệu dùng chung cần Supabase Auth + Database + RLS.

## Bảo mật
Không đưa `service_role` key lên GitHub. Bản LocalStorage hiện tại chỉ phù hợp demo; chưa dùng cho hồ sơ nhân sự thật.
