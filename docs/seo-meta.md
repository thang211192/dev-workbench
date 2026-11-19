# SEO Meta One Click

Chọn **SEO Meta One Click** trong popup Dev Workbench để quét ngay trang HTTP hoặc HTTPS của tab đang mở. **Quét lại** cập nhật báo cáo sau khi nội dung trang thay đổi. Giao diện dùng ngôn ngữ đã chọn trong popup.

| Mục | Nội dung |
| --- | --- |
| Tổng quan | Tiêu đề, mô tả và số ký tự, từ khóa và số mục, URL, canonical, robots, tác giả, nhà xuất bản, ngôn ngữ, số đề mục, ảnh và liên kết. Có đường dẫn tới `robots.txt` và `sitemap.xml`, danh sách thẻ link, meta, script và liên kết có `rel`. |
| Đề mục | H1–H6 theo thứ tự DOM và số lượng từng cấp. |
| Hình ảnh | URL ảnh, `alt`, `title` và số mục thiếu thuộc tính. `alt=""` được hiển thị là để trống vì ảnh trang trí có thể dùng giá trị này. |
| Liên kết | URL duy nhất, số lượt xuất hiện, nội dung và thuộc tính của lần xuất hiện đầu tiên. Số URL nội bộ tính theo cùng origin. Số liên kết thiếu `title` tính theo từng phần tử. |
| Mạng xã hội | Open Graph, X/Twitter Cards, `image_src` và các kiểu Schema.org khai báo qua `itemtype`. Ảnh chia sẻ được tải khi chọn xem trước. |
| Công cụ | Mở PageSpeed Insights, trình kiểm tra HTML/CSS của W3C, Facebook Sharing Debugger, Google Rich Results Test hoặc Schema Markup Validator trong tab mới. Các dịch vụ nhận URL trang khi bấm liên kết. Thông tin xác thực và fragment được bỏ khỏi URL. |

Báo cáo đọc DOM hiện tại của khung chính qua `chrome.scripting.executeScript()`. Iframe, shadow root và HTTP response headers nằm ngoài phạm vi. Đường dẫn tương đối được giải theo `baseURI` của phần tử. Danh sách dài có nút **Xem thêm** và báo cáo chỉ giữ trong bộ nhớ popup.

## Kiểm tra

- Thử cả tiếng Việt và tiếng Anh, đổi ngôn ngữ khi báo cáo đang mở và kiểm tra ngôn ngữ được giữ khi mở lại popup.
- Mở trang có canonical tương đối, heading nhiều cấp, ảnh thiếu `alt` và ảnh có `alt=""`, liên kết lặp, Open Graph, Twitter Cards và `itemtype`. Đối chiếu cả sáu mục.
- Thử trang thiếu dữ liệu, tab nội bộ trình duyệt, quét lại và danh sách trên 50 mục.
