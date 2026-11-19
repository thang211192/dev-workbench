# Dev Workbench Privacy Policy / Chính sách quyền riêng tư

## English

**Effective date:** 19 November 2026.

This policy applies to the Dev Workbench extension for Microsoft Edge.

### What the extension accesses

- **CORS:** Reads the current tab's URL to identify its origin. When you enable CORS, Microsoft Edge applies a session rule scoped to the selected tab and origin. The extension does not store a history of visited pages.
- **JSON Viewer:** Reads JSON already displayed in a matching tab and formats it in that tab. You can disable automatic formatting in Settings.
- **Color Picker and Screenshot:** Read the visible pixels of the current tab when you invoke the respective tool. The captured image and screenshot annotations are processed in memory for the active editing session.
- **Link Extractor:** Reads link destinations from the current page or the block you choose. Extracted links and regex filters stay in memory while the tool is open.
- **Clipboard and downloads:** The tools write a color code, URL list, or PNG to your clipboard when you use a copy action. The screenshot editor can save a PNG when you choose to download it. The extension does not read your clipboard.

### Where data is stored and shared

Dev Workbench runs locally. It has no developer-operated data collection endpoint, telemetry, advertising, or user account. The extension does not send or sell page content, screenshots, URLs, or copied data to the developer or third parties. Clipboard items and PNG files are handed to the browser or operating system when requested. If you paste or send them into another app, that app handles the content under its own privacy terms.

The language and JSON Viewer preference are saved locally in your browser profile. Microsoft Edge holds active CORS rules for the browser session. The extension removes a tab's rule when the tab closes. You can turn off a rule in its tab, change language or JSON settings, or uninstall the extension to remove its locally stored preferences. Files you download or data you copy can be removed separately through your operating system.

For privacy questions, contact the maintainer through the [Dev Workbench GitHub repository](https://github.com/thang211192/dev-workbench).

## Tiếng Việt

**Ngày hiệu lực:** 19 tháng 11 năm 2026.

Chính sách này áp dụng cho tiện ích Dev Workbench trên Microsoft Edge.

### Dữ liệu tiện ích truy cập

- **CORS:** Đọc URL của tab hiện tại để xác định origin. Khi bạn bật CORS, Edge áp dụng quy tắc phiên theo tab và origin đã chọn. Tiện ích không lưu lịch sử các trang đã truy cập.
- **Xem JSON:** Đọc JSON trình duyệt đã hiển thị trong tab phù hợp và định dạng tại chỗ. Có thể tắt định dạng tự động trong Cài đặt.
- **Lấy màu và chụp màn hình:** Đọc các điểm ảnh đang hiển thị trong tab khi bạn mở công cụ tương ứng. Ảnh chụp và chú thích được xử lý trong bộ nhớ của phiên chỉnh sửa.
- **Lấy liên kết:** Đọc địa chỉ liên kết trên trang hoặc trong khối được chọn. Danh sách và biểu thức lọc nằm trong bộ nhớ trong lúc mở công cụ.
- **Clipboard và tải file:** Khi bạn chọn sao chép, tiện ích ghi mã màu, danh sách URL hoặc PNG vào clipboard. Khi bạn chọn tải ảnh, trình chỉnh sửa lưu file PNG. Tiện ích không đọc clipboard.

### Lưu trữ và chia sẻ

Dev Workbench hoạt động cục bộ. Tiện ích không dùng máy chủ thu thập dữ liệu của nhà phát triển, đo lường từ xa, quảng cáo hoặc tài khoản người dùng. Tiện ích không gửi hoặc bán nội dung trang, ảnh chụp, URL hay dữ liệu đã sao chép cho nhà phát triển hoặc bên thứ ba. Trình duyệt hoặc hệ điều hành nhận dữ liệu clipboard hay file PNG khi bạn yêu cầu. Nếu bạn dán hoặc gửi nội dung sang ứng dụng khác, ứng dụng đó xử lý nội dung theo chính sách riêng.

Ngôn ngữ và lựa chọn Xem JSON được lưu cục bộ trong hồ sơ trình duyệt. Edge giữ quy tắc CORS trong phiên trình duyệt. Tiện ích xóa quy tắc của tab khi đóng tab. Bạn có thể tắt CORS, đổi ngôn ngữ hoặc cài đặt JSON, hoặc gỡ tiện ích để xóa các tùy chọn đã lưu. File tải về và dữ liệu đã sao chép có thể được xóa riêng qua hệ điều hành.

Nếu có câu hỏi về quyền riêng tư, hãy liên hệ người bảo trì qua [repo Dev Workbench trên GitHub](https://github.com/thang211192/dev-workbench).
