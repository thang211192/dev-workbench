# Tự chuyển Facebook Reels / Auto-advance Facebook Reels

Trong popup Dev Workbench, mở **Cài đặt** để bật hoặc tắt **Tự chuyển Facebook Reels**. Công tắc mặc định bật. Lựa chọn đã lưu được giữ lại và áp dụng cho các tab Facebook đang mở sau khi đã nạp tiện ích. Sau khi cập nhật hoặc nạp lại tiện ích, tải lại tab Facebook một lần.

Khi tab Facebook đang hiển thị trên đường dẫn `/reel` hoặc `/reels`, tiện ích theo dõi video đang hiển thị gần giữa màn hình. Khi video kết thúc hoặc quay về đầu sau khi phát đến gần cuối, tiện ích bấm nút sang Reel/video tiếp theo nếu nhận diện được. Nếu không tìm thấy nút, tiện ích cuộn tới video bên dưới nếu video đó đã được tải vào trang.

Nếu Reel đang xem có nhãn **Được tài trợ**, **Được quảng cáo** hoặc **Sponsored**, tiện ích chuyển ngay khi nhận diện được nhãn. Reel bán hàng được xử lý như video thường nếu Facebook hiển thị dưới dạng bài đăng công khai.

Thanh kéo **Thời lượng video tối đa** mặc định là 15 phút và có thể chỉnh từ 1 đến 60 phút. Khi bật tự chuyển, tiện ích bỏ qua Reel ngay khi biết video dài hơn giới hạn. Reel dài đúng bằng giới hạn vẫn phát bình thường. Thay đổi đã lưu áp dụng ngay cho các tab Facebook đang mở.

Nếu trình phát chưa báo tổng thời lượng, tiện ích kiểm tra mốc cuối có thể tua từ đầu video hoặc tổng thời lượng trên thanh tiến độ. Nếu Reel tiếp theo chưa có phần tử video, tiện ích có thể cuộn một khung trong vùng Reels có điểm dừng cuộn.

In the Dev Workbench popup, open **Settings** to toggle **Auto-advance Facebook Reels**. It defaults to on and keeps any saved choice. Reload the Facebook tab once after installing or reloading the extension. In a visible Reels tab, the extension advances when playback ends or when it detects a sponsored label on the current Reel. It uses the next button or scrolls to the next video already present on the page.

Set **Maximum video duration** from 1 to 60 minutes in the Facebook Reels panel. The default is 15 minutes. When auto-advance is on, Reels longer than the limit are skipped as soon as the player reports their duration. Saved changes apply immediately to open Facebook tabs.

## Kiểm tra / Verification

- Kiểm tra công tắc, nhãn trợ năng và thông báo lỗi trong Cài đặt bằng tiếng Việt và tiếng Anh.
- Thử Reel phát hết, Reel tự lặp, tạm dừng, tua, đổi Reel thủ công và chuyển tab. Mỗi lần phát hết chỉ chuyển một Reel.
- Kiểm tra nhãn tài trợ xuất hiện sau khi Reel đã tải, hai Reel tài trợ liên tiếp, và Reel thường có nhãn tài trợ trên thẻ khác.
- Kiểm tra nút chuyển và phương án cuộn trên giao diện Facebook đã đăng nhập. Cấu trúc trang và nhãn nút có thể khác tùy giao diện.
- Thử Reel dài đúng và vượt giới hạn, thời lượng tải muộn, và thay đổi giới hạn khi tab Facebook đang mở.
