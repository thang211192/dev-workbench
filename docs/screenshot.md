# Chụp màn hình và chú thích

## Điểm vào và các file

- [popup.html](../popup.html) mở công cụ từ danh sách. [popup.js](../popup.js) chụp phần đang nhìn thấy trong tab bằng `chrome.tabs.captureVisibleTab()`. Quyền `activeTab` và `scripting` nằm trong [manifest.json](../manifest.json).
- [screenshot-overlay.js](../screenshot-overlay.js) tạo hộp thoại phủ toàn bộ vùng hiển thị của tab nguồn. Iframe của tiện ích cách ly nội dung canvas với trang web và yêu cầu tính năng `clipboard-write`.
- [screenshot.html](../screenshot.html), [screenshot.css](../screenshot.css) và [screenshot.js](../screenshot.js) cung cấp trình chọn vùng, canvas, thao tác chú thích và xuất ảnh.

## Luồng chụp và chọn vùng

1. Khi bấm thẻ, popup khóa nút, chụp tab HTTP/HTTPS đang hoạt động thành PNG và kiểm tra tab vẫn đang hiển thị cùng URL. Sau đó popup chèn hộp thoại vào tab nguồn.
2. Khi iframe báo sẵn sàng, script đối chiếu cửa sổ gửi và origin, rồi chuyển PNG cùng ngôn ngữ vào iframe bằng `postMessage` với origin cụ thể của tiện ích. Trình chỉnh sửa tạo `ImageBitmap` và giữ ảnh trong bộ nhớ. Nếu iframe không tải được, hộp thoại tự dọn sau năm giây và popup hiển thị lỗi.
3. Canvas dùng kích thước ảnh thật và CSS co ảnh cho vừa cửa sổ. Hàm `point()` đổi tọa độ chuột từ kích thước hiển thị sang pixel ảnh. Kéo theo hướng bất kỳ để xác định hình chữ nhật. Chọn **Dùng vùng đã chọn** để cắt hoặc **Dùng toàn bộ ảnh** để giữ nguyên khung.
4. Khi xác nhận, nguồn vẫn là bitmap ban đầu. `redraw()` lấy đúng hình chữ nhật nguồn và vẽ vào canvas đã đổi kích thước.

## Chú thích và xuất ảnh

- Công cụ mũi tên dùng Pointer Events và pointer capture. Vị trí nhấn là đuôi, vị trí thả là đầu mũi tên. Bản xem trước cập nhật khi kéo. Đầu mũi tên và thân được vẽ theo vectơ hướng kéo. Thao tác kéo quá ngắn được bỏ qua.
- Ở chế độ văn bản, bấm vị trí cần đặt chữ để mở ô nhập ngay tại điểm đó trên canvas. Trình xử lý `pointerdown` chặn hành vi đổi focus mặc định trước khi đưa focus vào ô nhập. Enter hoặc rời ô nhập sẽ lưu, Esc hủy. Viền tương phản giúp chữ dễ đọc trên ảnh. Các icon chức năng có tooltip và nhãn truy cập bằng cả hai ngôn ngữ.
- Mũi tên và chữ dùng hai ô chọn màu riêng. Mỗi chú thích lưu màu và kích thước tại thời điểm tạo. **Hoàn tác** xóa chú thích cuối cùng. Các chú thích tồn tại trong tab chỉnh sửa hiện tại.
- **Sao chép ảnh** ghi PNG của canvas vào clipboard thông qua `ClipboardItem` để dán vào ứng dụng chat. **Tải PNG** dùng cùng hàm kết xuất và tạo blob URL tạm để lưu file. Cả hai thao tác lưu nội dung đang nhập trước khi kết xuất. **Đóng** hoặc **Esc** trở lại trang nguồn. Nếu đang nhập chữ, Esc trước tiên sẽ hủy nhập.

## Kiểm tra khi nâng cấp

- Thử kéo vùng theo hai chiều, kéo ra ngoài biên canvas và kiểm tra kích thước PNG. Thử cả ảnh toàn vùng nhìn thấy.
- Vẽ mũi tên ở nhiều hướng, đổi màu, nhập chữ tại hai vị trí, hoàn tác, sao chép và tải PNG. Kiểm tra tọa độ khi CSS co canvas và dán ảnh vào ứng dụng hỗ trợ PNG.
- Kiểm tra nhập chữ bằng thao tác chuột và bàn phím của trình duyệt để xác nhận ô vẫn nhận focus sau khi thả chuột và Enter vẽ chữ vào ảnh.
- Kiểm tra hộp thoại mở ngay trên tab nguồn, ảnh không chứa hộp thoại, nút Đóng và Esc hoạt động, và thử một trang chặn iframe.
- Kiểm tra trạng thái lỗi, nhãn và hướng dẫn ở tiếng Việt lẫn tiếng Anh.
