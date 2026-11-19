# Lấy liên kết

## Điểm vào và các file

- [popup.html](../popup.html) và [popup.js](../popup.js) mở công cụ từ thẻ **Lấy liên kết**. Popup chèn `openLinkExtractor()` vào tab HTTP/HTTPS đang mở qua `chrome.scripting.executeScript()` và truyền ngôn ngữ đang chọn.
- [link-extractor.js](../link-extractor.js) chứa giao diện hồng–tím trong Shadow DOM, logic chọn khối, chuẩn hóa URL, lọc và sao chép. Chuỗi tiếng Việt và tiếng Anh được khai báo ngay trong hàm chèn.

## Chọn phạm vi

1. Khi mở, **Lấy toàn bộ trang** mặc định được chọn. Bỏ tích để chỉ xem các liên kết trong khối đã chọn.
2. **Chọn khối** tạm đóng hộp thoại và mở lớp chọn trên trang. Khi rê chuột, công cụ đánh dấu phần tử dưới con trỏ. Khi bấm, công cụ giữ phần tử đó và mở lại hộp thoại. **Chọn khối cha** mở rộng phạm vi lên một cấp. Esc hủy chọn và giữ phạm vi trước đó.
3. Khi thay đổi phạm vi, công cụ đọc lại các phần tử `a[href]` trong DOM của tài liệu hoặc khối đã chọn. Nếu bản thân phần tử được chọn là một thẻ liên kết, URL của nó cũng được lấy.

## Chuẩn hóa, lọc và sao chép

- Giá trị `href` được chuyển thành URL tuyệt đối theo `baseURI` của phần tử. Một `Set` lọc trùng theo chuỗi URL tuyệt đối và giữ thứ tự xuất hiện đầu tiên. Các query và fragment khác nhau vẫn tạo thành URL riêng.
- Ô lọc nhận mẫu biểu thức chính quy JavaScript trực tiếp, chẳng hạn `example\.com|/docs/`. Khi gõ, bộ lọc kiểm tra từng URL đã chuẩn hóa. Mẫu rỗng hiển thị tất cả, mẫu lỗi có thông báo và khóa nút sao chép.
- **Sao chép tất cả URL** lấy toàn bộ kết quả đang hiển thị, mỗi URL một dòng. Công cụ thử Clipboard API, sau đó thử sao chép văn bản đã chọn. Nếu cả hai cách đều lỗi, danh sách được bôi chọn để sao chép thủ công.
- Công cụ đọc DOM của khung chính. Liên kết trong iframe hoặc shadow root riêng của trang nằm ngoài phạm vi.

## Kiểm tra khi nâng cấp

- Thử URL tương đối và tuyệt đối trỏ cùng địa chỉ, rồi kiểm tra link có query hoặc fragment khác.
- Thử chọn một khối, mở rộng lên khối cha, hủy chọn bằng Esc, rồi tích lấy toàn trang.
- Thử regex hợp lệ, regex sai và mẫu không khớp. Kiểm tra clipboard chứa đúng danh sách sau lọc.
- Chạy lại luồng bằng cả tiếng Việt và tiếng Anh.
