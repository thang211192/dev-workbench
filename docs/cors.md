# CORS theo từng tab

## Điểm vào và các file

- [popup.html](../popup.html) chứa thẻ CORS, icon trạng thái cạnh mũi tên, công tắc, trang hiện tại và phạm vi áp dụng.
- [popup.js](../popup.js) đọc tab đang hoạt động, quản lý trạng thái và tạo hoặc xóa quy tắc phiên.
- [popup.css](../popup.css) dùng chung kiểu công tắc cho nút trong màn hình CORS và chỉ báo thu nhỏ trên thẻ. Chỉ báo có tooltip và nhãn truy cập theo ngôn ngữ đang chọn.
- [manifest.json](../manifest.json) khai báo quyền Declarative Net Request và quyền truy cập host HTTP/HTTPS. [background.js](../background.js) xóa quy tắc khi đóng tab.

## Luồng bật và tắt

1. Khi mở popup, công tắc bị khóa trong lúc đọc tab đang hoạt động qua `chrome.tabs.query()`. Tab HTTP hoặc HTTPS có thể bật CORS. Với các trang khác, giao diện hiển thị trạng thái tắt và hướng dẫn.
2. Mỗi tab có tối đa một quy tắc phiên, dùng ID bằng ID tab cộng một. Popup lấy quy tắc qua `getSessionRules()` và so sánh giá trị header cho phép origin với origin hiện tại, gồm giao thức, hostname và cổng.
3. Khi bật, `updateSessionRules()` thay quy tắc cũ bằng quy tắc cho origin hiện tại. Khi tắt, lệnh này chỉ xóa quy tắc. Sau cập nhật, popup đọc lại quy tắc và đồng bộ công tắc cùng icon.
4. Nếu đọc hoặc cập nhật thất bại, popup ghi nhận lỗi, khóa công tắc và yêu cầu mở lại. Quy tắc tồn tại trong phiên trình duyệt. Đóng tab sẽ xóa quy tắc. Các tab khác có trạng thái riêng, kể cả khi mở cùng URL.
5. Đổi origin trong cùng tab làm popup hiện tắt. Nếu quay lại origin cũ, quy tắc phiên cũ có thể dùng lại cho đến khi bị thay thế hoặc xóa.

## Phạm vi và header

Rule lọc theo ID tab và hostname khởi tạo yêu cầu. Rule áp dụng cho `xmlhttprequest` (bao gồm fetch), `font`, `image`, `stylesheet`, `script` và `media`.

| Header phản hồi | Giá trị được đặt |
| --- | --- |
| `Access-Control-Allow-Origin` | Origin cụ thể của trang đã bật |
| `Access-Control-Allow-Methods` | `GET, HEAD, POST, PATCH, PUT, DELETE, OPTIONS` |
| `Access-Control-Allow-Headers` | `*` |

Bộ lọc hostname của Chrome có thể khớp cả tên miền con. Header origin cụ thể giới hạn quyền CORS được cấp cho đúng origin đã bật. Tính năng hỗ trợ fetch hoặc XMLHttpRequest không gửi thông tin xác thực. Nếu trình duyệt gửi preflight `OPTIONS`, API vẫn cần trả về mã 2xx.

## Ngôn ngữ và kiểm tra

Tiếng Việt của các mục `data-key` lấy từ HTML. Bản tiếng Anh và các chuỗi động của cả hai ngôn ngữ nằm trong `messages` ở `popup.js`. Bộ chọn lưu ngôn ngữ trong `localStorage.language`.

- Bật CORS trong một tab localhost. Kiểm tra tab thứ hai cùng URL và tab có origin khác đều hiện tắt.
- Kiểm tra tải lại cùng origin, đổi cổng trong cùng tab, tắt công tắc và đóng tab.
- Kiểm tra icon nằm ngang hàng với mũi tên, nhãn trạng thái cập nhật bằng tiếng Việt và tiếng Anh.
