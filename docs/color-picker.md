# Color Picker

Bấm biểu tượng Dev Workbench rồi chọn **Color Picker** trên trang HTTP hoặc HTTPS. Menu tự đóng và con trỏ chuyển thành dấu chữ thập. Bấm vào một điểm để tự động sao chép mã HEX viết hoa. Nhấn Esc hoặc chuyển tab để hủy.

[popup.js](../popup.js) dùng `chrome.tabs.captureVisibleTab()` để chụp vùng đang hiển thị, sau đó kiểm tra tab còn hoạt động và mở bộ chọn trong tài liệu nguồn. [color-picker.js](../color-picker.js) dùng ảnh chụp làm nền để đọc đúng pixel dưới con trỏ. Mỗi tab có tối đa một bộ chọn đang mở. Sau khi chọn, thông báo sao chép tự ẩn sau ba giây. Các nhãn và thông báo dùng ngôn ngữ đã chọn trong menu.

Bộ chọn lấy màu trong vùng đã chụp của trang. Nếu kích thước vùng hiển thị thay đổi trong lúc chọn, bộ chọn tự đóng.

## Kiểm tra khi nâng cấp

- Mở trang có mảng màu đồng nhất. Bấm thẻ **Color Picker**, kiểm tra menu tự đóng và con trỏ chuyển thành dấu chữ thập. Bấm vào mảng màu rồi dán để kiểm tra mã HEX.
- Thử Esc, chuyển tab và thay đổi kích thước cửa sổ. Clipboard phải giữ nguyên khi hủy. Mở công cụ nhiều lần và kiểm tra số tab và cửa sổ.
- Thử trên trang nội bộ của trình duyệt để kiểm tra thông báo lỗi. Lặp lại với tiếng Việt và tiếng Anh.
