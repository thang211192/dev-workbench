# Nộp Dev Workbench lên Microsoft Edge Add-ons

Gói phát hành đầu tiên là **1.3.0**. Các file để tải lên nằm trong `dist/edge/`. Chỉ file ZIP được tải lên mục **Packages**.

| File | Dùng ở đâu |
| --- | --- |
| `dev-workbench-edge-1.3.0.zip` | **Packages** |
| `store-logo-300.png` | **Store listings → Extension logo**, dùng cho cả hai ngôn ngữ |
| `store-tools-vi-1280x800.png` | **Screenshots**, bản tiếng Việt |
| `store-tools-en-1280x800.png` | **Screenshots**, bản tiếng Anh |
| [PRIVACY.md](../PRIVACY.md) | Nội dung chính sách quyền riêng tư, dùng URL công khai trong **Privacy** |

## 1. Thử đúng gói sẽ nộp

1. Giải nén ZIP vào một thư mục riêng.
2. Mở `edge://extensions` trong Microsoft Edge, bật **Developer mode**, bấm **Load unpacked** và chọn thư mục chứa `manifest.json` ở cấp đầu tiên.
3. Ghim Dev Workbench vào thanh công cụ. Trên một trang HTTP/HTTPS, thử Color Picker, Chụp màn hình và Lấy liên kết. Mở bánh răng để kiểm tra công tắc JSON và đổi ngôn ngữ trong popup. Dùng các bước ở mục **Notes for certification** để thử CORS.

## 2. Tạo tài khoản nhà phát triển

1. Mở [Microsoft Partner Center](https://partner.microsoft.com/dashboard/microsoftedge/overview) và đăng nhập bằng tài khoản Microsoft cá nhân dùng làm chủ tài khoản.
2. Nếu đây là lần đầu, đăng ký chương trình **Microsoft Edge**. Chọn **Individual** nếu bạn phát hành với tư cách cá nhân, nhập quốc gia và tên nhà phát hành, đọc rồi chấp nhận thỏa thuận nếu đồng ý.
3. Hoàn thành các bước xác minh hiện trong tài khoản. Khi tài khoản hoạt động, mở dashboard Microsoft Edge. Microsoft hiện không thu phí đăng ký chương trình này. [Hướng dẫn đăng ký](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/publish/create-dev-account)

## 3. Tạo extension và tải ZIP

Mở dashboard Microsoft Edge → **Create new extension**. Trong **Packages**, chọn `dev-workbench-edge-1.3.0.zip`, đợi kiểm tra xong, đối chiếu tên **Dev Workbench** và phiên bản **1.3.0**, rồi bấm **Continue**. [Hướng dẫn nộp gói](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension#step-3-upload-the-package-for-the-extension)

## 4. Điền Availability và Properties

- **Visibility** chọn **Public** để người dùng tìm thấy trên Store. **Hidden** phù hợp nếu muốn phân phối qua link trực tiếp.
- **Markets** giữ mặc định nếu muốn phát hành ở mọi thị trường. Có thể chọn lại theo kế hoạch phát hành của bạn.
- **Category** chọn **Developer tools** nếu có. Dùng nhóm công cụ gần nhất nếu tên mục khác.
- **Website** có thể dùng URL repo `https://github.com/thang211192/dev-workbench`. **Support** có thể dùng trang [GitHub Issues](https://github.com/thang211192/dev-workbench/issues) nếu bạn tiếp nhận hỗ trợ tại đó.
- **Mature content** để tắt. Bấm **Save & Continue** sau mỗi trang. [Availability và Properties](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension#step-4-enter-availability-information)

## 5. Điền Privacy

### Single Purpose Description

> Inspect and debug web pages and API responses directly in the active Microsoft Edge tab. Dev Workbench provides tab-scoped CORS testing, JSON response formatting, color sampling, annotated screenshots, and link extraction within this web inspection workflow.

Microsoft đánh giá mục đích và phạm vi thực tế của tiện ích. Bộ công cụ có nhiều chức năng, vì vậy hãy mô tả đầy đủ thay vì cam kết rằng hồ sơ chắc chắn sẽ được duyệt. [Developer policies](https://learn.microsoft.com/en-us/legal/microsoft-edge/extensions/developer-policies#111-extensions-must-have-a-single-purpose)

### Permission justification

| Trường | Nội dung để dán |
| --- | --- |
| `declarativeNetRequestWithHostAccess` | Applies CORS response headers using a session rule when the user enables CORS for a specific tab and origin for API testing. The rule is removed when the tab closes. |
| `activeTab` | Captures the visible pixels of the active tab when the user opens the screenshot editor or color picker. |
| `scripting` | Opens the user-invoked screenshot editor, color picker, and link extractor in the current tab using code bundled with the extension. |
| `clipboardWrite` | Copies a selected color code, a filtered URL list, or an annotated PNG to the clipboard in response to a user action. |
| `storage` | Saves the automatic JSON formatting preference locally and applies it across open tabs. |
| Host access `http://*/*`, `https://*/*` | Formats JSON already displayed in HTTP/HTTPS tabs when enabled and supports user-enabled CORS rules for API endpoints on those schemes. The in-page development tools also run on the HTTP/HTTPS tab where the user invokes them. |

- **Remote code** chọn **No**. JavaScript được đóng trong ZIP.
- **Data usage** điền theo bản phát hành này. Tiện ích xử lý nội dung tại chỗ, không thu thập dữ liệu về nhà phát triển hay gửi dữ liệu cho dịch vụ bên thứ ba. Các mục hỏi về **truy cập hoặc xử lý** dữ liệu cần phản ánh việc đọc URL của tab, JSON, điểm ảnh và liên kết như trong chính sách. Đọc kỹ và xác nhận các ô chứng nhận phù hợp.
- **Privacy Policy URL** dùng `https://github.com/thang211192/dev-workbench/blob/main/PRIVACY.md`. Mở ở cửa sổ InPrivate để xác nhận URL đọc được khi chưa đăng nhập. Nếu bạn chọn một URL lưu trữ khác, dán URL công khai tương ứng.

Bấm **Save & Continue**. [Hướng dẫn mục Privacy](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension#step-6-enter-privacy-information)

## 6. Điền Store listings

1. Mở **Store listings**. Chọn **Edit details** cho từng mục tiếng Việt và tiếng Anh. Nếu thiếu một mục, dùng **Add a language**.
2. Giữ tên **Dev Workbench** và mô tả ngắn lấy từ ZIP. Dán mô tả dài tương ứng ở dưới.
3. Upload `store-logo-300.png` cho cả hai ngôn ngữ hoặc dùng **Duplicate**. Upload ảnh `store-tools-vi-1280x800.png` cho tiếng Việt và `store-tools-en-1280x800.png` cho tiếng Anh. Ảnh quảng bá và video là tùy chọn.
4. Lưu từng bản. Đảm bảo cả hai mục có trạng thái **Complete**. [Yêu cầu trang đăng và kích thước ảnh](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension#step-7-enter-store-listing-details-for-each-language)

### Mô tả tiếng Việt

Dev Workbench giúp lập trình viên kiểm tra trang web và phản hồi API ngay trong Microsoft Edge. Mở popup để chọn công cụ hoặc vào Cài đặt để bật hay tắt định dạng JSON tự động.

- CORS theo tab để thử các yêu cầu API khác nguồn. Chỉ áp dụng khi bạn bật cho tab và origin đang xem.
- Xem JSON trực tiếp trong tab với thụt dòng, tô màu cú pháp và nút thu gọn từng object hoặc mảng.
- Lấy màu từ điểm ảnh trong trang và sao chép mã HEX.
- Chụp vùng trong phần đang hiển thị của tab, vẽ mũi tên, thêm chữ, chọn màu chú thích rồi sao chép hoặc tải PNG.
- Lấy liên kết trong một khối hoặc toàn trang, loại URL trùng, lọc bằng regex và sao chép danh sách.

Giao diện có tiếng Việt và tiếng Anh. Các công cụ xử lý dữ liệu cục bộ và không yêu cầu tài khoản.

**Từ khóa gợi ý**: CORS, JSON, lấy màu, chụp màn hình, lấy liên kết.

### English description

Dev Workbench helps web developers inspect pages and API responses directly in Microsoft Edge. Open the toolbar popup to choose a tool, or open Settings to enable or disable automatic JSON formatting.

- Enable CORS for the current tab and origin while testing cross-origin API requests.
- Read raw JSON in the browser tab with indentation, syntax highlighting, and collapsible objects and arrays.
- Sample a pixel from the current page and copy its HEX color code.
- Capture a region of the visible tab, annotate it with arrows and text in your chosen colors, then copy or download the PNG.
- Extract links from a selected block or the entire page, deduplicate URLs, filter them with a regular expression, and copy the result.

The interface supports English and Vietnamese. Content is processed locally and no user account is required.

**Suggested search terms**: CORS, JSON viewer, color picker, screenshot, link extractor.

## 7. Nộp kiểm duyệt

Bấm **Publish**. Trong **Notes for certification**, dán phần bên dưới. Rà lại tài khoản nhà phát hành, quyền và các bản ngôn ngữ, rồi bấm **Publish** lần nữa để gửi. Microsoft cho biết quá trình kiểm duyệt có thể mất tối đa bảy ngày làm việc. Khi đã duyệt, trạng thái sẽ chuyển sang **In the Store**. [Quy trình kiểm duyệt](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension#step-8-enter-certification-testing-notes-and-submit-the-extension)

### Notes for certification

> No login or test credentials are required. Pin Dev Workbench and open any regular HTTP/HTTPS page containing text, colors, and links. In the popup, the language dropdown switches between Vietnamese and English.
>
> Color Picker: open the tool and click a visible pixel to copy its HEX code. Screenshot: open the tool, drag to select a region, confirm with the crop button, draw an arrow with a drag, or select Text and type at a point on the image. Use Copy or Download to export the PNG. Link Extractor: open the tool, try Entire page and Select a block, enter a regular expression, and click Copy all URLs.
>
> JSON Viewer: open a raw JSON response (for example, https://jsonplaceholder.typicode.com/todos/1), then check automatic formatting. An API response containing nested objects or arrays can be used to test collapse controls. The Settings gear in the popup controls automatic formatting.
>
> CORS: use a local development page served over HTTP and a test endpoint on a different localhost port. The test endpoint should return a successful plain response without an Access-Control-Allow-Origin header. From the page, run a fetch without credentials to that endpoint, enable CORS through the extension for the page's tab, and repeat. Confirm that another tab still shows CORS disabled. Turn the switch off when finished.

## Tạo lại ZIP cho bản cập nhật

Tăng `version` trong `manifest.json`, chạy lệnh bên dưới rồi tải file ZIP mới lên extension hiện có trong Partner Center.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\package-edge.ps1
```
