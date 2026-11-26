# Tự chuyển Facebook Reels / Auto-advance Facebook Reels

Trong popup Dev Workbench, mở **Cài đặt** để bật hoặc tắt **Tự chuyển Facebook Reels**. Công tắc mặc định bật. Lựa chọn đã lưu được giữ lại và áp dụng cho các tab Facebook đang mở sau khi đã nạp tiện ích. Sau khi cập nhật hoặc nạp lại tiện ích, tải lại tab Facebook một lần.

Trên đường dẫn `/reel` hoặc `/reels`, tiện ích theo dõi Reel đang hiển thị trong khung xem, kể cả khi bạn chuyển sang tab khác. Nếu video đang phát trước khi bạn rời tab, tiện ích thử phát tiếp khi Facebook tạm dừng và thử phát Reel kế tiếp trong tab nền. Nếu bạn đã tạm dừng trước khi chuyển tab, tiện ích giữ trạng thái đó. Edge có thể chặn lệnh phát hoặc tạm ngưng tab nền.

Khi video kết thúc hoặc quay về đầu sau khi phát đến gần cuối, tiện ích bấm nút sang Reel/video tiếp theo nếu nhận diện được. Trong giao diện có nút **Thẻ tiếp theo / Next card**, tiện ích nhận diện nút này trong vùng của Reel đang xem. Nếu không tìm thấy nút, tiện ích cuộn tới video bên dưới nếu video đó đã được tải vào trang.

Trong tab nền, khi không có nút chuyển, tiện ích mở đường dẫn Reel kế tiếp nếu xác định được từ thẻ video. Nếu chỉ có phần tử video, tiện ích cuộn tới đó ngay để tránh phụ thuộc vào hiệu ứng cuộn.

Trong tab nền, tiện ích kiểm tra lại mỗi giây. Nếu sau 3 giây Reel chưa đổi, tiện ích thử lại tối đa 3 lần, bỏ qua nút chuyển và dùng đường dẫn hoặc cuộn. Nếu Reel mới bị tạm dừng, tiện ích thử phát lại tối đa 3 lần, rồi mở đường dẫn riêng của Reel đó nếu có. Trình duyệt có thể không phát Reel bị tắt tiếng hoặc không có âm thanh trong tab nền.

Nếu Reel đang xem có nhãn **Được tài trợ**, **Được quảng cáo** hoặc **Sponsored**, tiện ích chuyển ngay khi nhận diện được nhãn. Reel bán hàng được xử lý như video thường nếu Facebook hiển thị dưới dạng bài đăng công khai.

Trong tab nền, tiện ích cũng kiểm tra nhãn tài trợ trên các Reel kế tiếp đã tải trong bảng tin trước khi mở đường dẫn riêng. Cách này giữ được thông tin tài trợ khi nhãn chỉ xuất hiện trong bảng tin.

Thanh kéo **Thời lượng video tối đa** mặc định là 60 phút và có thể chỉnh từ 1 phút đến 10 giờ theo từng phút. Khi bật tự chuyển, tiện ích bỏ qua Reel ngay khi biết video dài hơn giới hạn. Reel dài đúng bằng giới hạn vẫn phát bình thường. Thay đổi đã lưu áp dụng ngay cho các tab Facebook đang mở.

Nếu trình phát chưa báo tổng thời lượng, tiện ích kiểm tra mốc cuối có thể tua từ đầu video hoặc tổng thời lượng trên thanh tiến độ. Nếu Reel tiếp theo chưa có phần tử video, tiện ích có thể cuộn một khung trong vùng Reels có điểm dừng cuộn.

In the Dev Workbench popup, open **Settings** to toggle **Auto-advance Facebook Reels**. It defaults to on and keeps any saved choice. Reload the Facebook tab once after installing or reloading the extension. If a Reel was playing when you switched tabs, the extension attempts to resume it if Facebook pauses it and start the next Reel in the background. It preserves pauses made before switching tabs. In a background tab, it checks every second, retries a stalled advance up to three times without the Next button, and retries playback up to three times. Edge may block playback or suspend the tab, and the browser may not play muted or silent Reels in the background.

Set **Maximum video duration** from 1 minute to 10 hours in one-minute increments in the Facebook Reels panel. The default is 60 minutes. When auto-advance is on, Reels longer than the limit are skipped as soon as the player reports their duration. Saved changes apply immediately to open Facebook tabs.

## Kiểm tra / Verification

- Kiểm tra công tắc, nhãn trợ năng và thông báo lỗi trong Cài đặt bằng tiếng Việt và tiếng Anh.
- Thử Reel phát hết, Reel tự lặp, tạm dừng, tua, đổi Reel thủ công và chuyển tab. Mỗi lần phát hết chỉ chuyển một Reel.
- Trong tab nền, để nhiều Reel phát hết liên tiếp (có tiếng và tắt tiếng), và chuyển tab bằng Ctrl+Tab lẫn bằng chuột.
- Kiểm tra Reel tự lặp trong tab nền khi mốc cập nhật tiến độ cuối cùng còn cách điểm kết thúc hơn nửa giây.
- Kiểm tra nhãn tài trợ xuất hiện sau khi Reel đã tải, hai Reel tài trợ liên tiếp, và Reel thường có nhãn tài trợ trên thẻ khác.
- Kiểm tra nút chuyển và phương án cuộn trên giao diện Facebook đã đăng nhập. Cấu trúc trang và nhãn nút có thể khác tùy giao diện.
- Thử Reel dài đúng và vượt giới hạn, thời lượng tải muộn, và thay đổi giới hạn khi tab Facebook đang mở.
