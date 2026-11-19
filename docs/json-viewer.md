# JSON Viewer

## Điểm vào và các file

- [manifest.json](../manifest.json) đăng ký content script và stylesheet cho tab HTTP/HTTPS. Script chạy ở khung chính theo cấu hình mặc định của Chrome.
- [json-viewer.js](../json-viewer.js) nhận diện, định dạng và tạo nút mở/thu gọn ngay trong tab.
- [json-viewer.css](../json-viewer.css) định kiểu khối JSON, màu cú pháp, nút thu gọn và giao diện tối theo tùy chọn hệ thống.
- [popup.html](../popup.html) và [popup.js](../popup.js) đặt công tắc **Xem JSON tự động** trong màn hình **Cài đặt**, mở bằng bánh răng bên phải tiêu đề **Công cụ**. Nhãn và mô tả có cả tiếng Việt lẫn tiếng Anh.

## Lưu và áp dụng cài đặt

- `chrome.storage.local.jsonViewerEnabled` lưu lựa chọn cho toàn tiện ích. Khi chưa có giá trị, JSON Viewer mặc định bật như trước. Công tắc CORS hoạt động độc lập.
- Các tab JSON đã tải content script nghe `chrome.storage.onChanged`. Tắt sẽ trả thẻ `pre` về văn bản gốc và bỏ kiểu của Dev Workbench. Bật lại sẽ dựng lại khối JSON ở trạng thái mở. Tab mới đọc cài đặt khi tải.

## Nhận diện phản hồi

1. Khi người dùng mở URL, script đọc `document.contentType`. Các kiểu được xét là `text/plain`, `application/json`, `text/json` và các MIME có hậu tố `+json`.
2. Script tìm `body > pre` chứa văn bản thô. Nếu thiếu thẻ này hoặc thẻ đã chứa phần tử con, script kết thúc.
3. `JSON.parse()` xác thực toàn bộ `pre.textContent`. Khi phân tích thất bại, trang giữ nguyên nội dung gốc. Script đọc dữ liệu trình duyệt đã tải trong tab.

## Định dạng và tô màu

- Sau khi xác thực, script tách từ tố từ văn bản gốc để giữ nguyên cách biểu diễn chuỗi, khóa trùng và số vượt giới hạn số nguyên an toàn của JavaScript.
- Vòng lặp định dạng xuống dòng quanh nội dung object và mảng, dùng hai dấu cách cho mỗi cấp với mức thụt tối đa 40 cấp. Dấu hai chấm có một khoảng trắng phía sau. Object và mảng rỗng giữ dạng `{}` và `[]`.
- Tối đa 30.000 từ tố, script tô màu riêng cho khóa, chuỗi, số và các giá trị `true`, `false`, `null`. Trên ngưỡng đó, thụt dòng và thu gọn vẫn hoạt động.
- Script dựng nội dung trong `DocumentFragment` bằng node văn bản và `textContent`. Chuỗi chứa HTML được hiển thị như dữ liệu. Cuối cùng, script thay nội dung của `pre` và gắn lớp `dev-workbench-json`.

## Mở và thu gọn

- Mỗi object hoặc mảng có nội dung, kể cả phần tử gốc, bắt đầu ở trạng thái mở. `openGroup()` tạo nút mũi tên, đặt `aria-expanded="true"` và tạo một thẻ `span` chứa nội dung con.
- Ngăn xếp `groups` lưu vùng đích của các cấp cha. Khi gặp dấu đóng của nhóm có nội dung, script trả vùng đích về cấp cha trước khi ghi dấu đóng. Hai dấu ngoặc nằm ngoài vùng ẩn.
- Bấm nút đảo thuộc tính `hidden` của vùng con và cập nhật `aria-expanded`. CSS hiển thị dấu ba chấm giữa hai dấu ngoặc khi nhóm được thu gọn.
- Thu gọn nhóm cha ẩn toàn bộ hậu duệ. Các nút con vẫn giữ trạng thái riêng trong DOM, nên trạng thái đó xuất hiện lại khi mở cha. Trạng thái chỉ tồn tại trong lần tải tab hiện tại.
- Nút hỗ trợ bàn phím theo hành vi mặc định của `button`. Nhãn truy cập dùng từ `JSON` cùng khóa gốc hoặc ký hiệu `{}` / `[]`, dùng chung cho cả hai ngôn ngữ.

## Kiểm tra khi nâng cấp

- Tải lại tiện ích rồi mở JSON mẫu dưới dạng `text/plain` và `application/json`. Kiểm tra thụt dòng, màu cú pháp và thử mở/thu gọn object, mảng và nút gốc.
- Thu gọn một mục con rồi đóng và mở mục cha. Kiểm tra mục con vẫn đóng và các nhánh bên cạnh vẫn thao tác độc lập.
- Thử JSON có số nguyên lớn, khóa trùng, chuỗi chứa HTML, giá trị gốc đơn và container rỗng. Thử thêm văn bản không phải JSON và một trang HTML thông thường để kiểm tra chúng giữ nguyên.
- Kiểm tra bánh răng, công tắc và mô tả ở cả tiếng Việt lẫn tiếng Anh. Kiểm tra tắt/bật khi tab JSON đang mở, khi mở tab JSON mới và khi đóng rồi mở lại popup. Nếu thêm chữ vào trình xem, áp dụng yêu cầu song ngữ trong [AGENTS.md](../AGENTS.md).
