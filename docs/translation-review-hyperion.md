# HYPERION — EN / VI translation review

**Standard:** template §8.1 (wording rules + glossary) and §8.2 (side-by-side review)
**Date:** 2026-09-24
**Method:** the site was opened in `?lang=en` and `?lang=vi` and walked through 17 states in both languages. Every visible string plus `placeholder`, `aria-label`, `alt` and `title` text was collected in page order and paired line by line. Each EN | VI pair is listed once, under the first area where it appears. Pure numbers/symbols are left out.

**Result:** 249 unique pairs. After the fixes below, **no English remains in the Vietnamese view** except brand names, codes, sizes, standard card formats and legal names (marked *Same in both*). **One item needs a human decision** (bank branch name, see Open items).

> Before launch, a Vietnamese-speaking reviewer should read the VI column (template §8.1 rule 9).

## Fixed in this review

| Where | Before (VI) | After (VI) | Why |
|---|---|---|---|
| Header menu button | Danh mục | Menu | "Danh mục" means *category* and clashed with "Chọn danh mục sản phẩm" |
| Contact sales button | LIÊN HỆ SALES | kept as LIÊN HỆ SALES | Business decision (2026-09-24): "sales" stays in English |
| Add button / toast / error | Thêm vào giỏ, Đã thêm vào giỏ hàng | Thêm vào đơn hàng, Đã thêm vào đơn hàng | One term for the order: "đơn hàng", never "giỏ hàng" (English also changed "cart" → "order") |
| Amount due label | Thanh toán ngay | Số tiền cần thanh toán ngay | Old text meant "Pay now", not "Amount due now" |
| Deposit / full amount due | Tiền đặt cọc thanh toán ngay, Toàn bộ tiền hàng thanh toán ngay | Tiền cọc cần thanh toán ngay, Toàn bộ tiền hàng cần thanh toán ngay | Read as instructions; now read as amounts |
| Error messages | Nhập địa chỉ email hợp lệ, Nhập số điện thoại…, Chọn quốc gia… | Vui lòng nhập…, Vui lòng chọn… | Polite request form (§8.1 rule 4) |
| Chat links | Chat qua WhatsApp / Zalo | Nhắn tin qua WhatsApp / Zalo | Loanword "chat" replaced |
| Feature section watermark | PEOPLE SAFETY PROGRESS (English) | CON NGƯỜI · AN TOÀN · TIẾN BỘ | Was untranslated |
| Long payment buttons | Gửi mã tham chiếu chuyển khoản, Mở trang thanh toán bảo mật, Kiểm tra trạng thái thanh toán, Chọn phương thức thanh toán | Gửi mã chuyển khoản, Mở trang thanh toán, Kiểm tra thanh toán, Chọn cách thanh toán | CTA max 4 words; buttons no longer wrap |
| Order counts, search status | Built inline in code | `tn()` with `{n}` strings in `locale.js` | All text now in the translation file |
| Bank transfer pop-up | VietQR / Bank Transfer (English) | VietQR / Chuyển khoản | Value from bank settings was not translated |
| Footer address | English address | 29 Nguyễn Văn Quỳ, Phường Tân Thuận, Thành phố Hồ Chí Minh, Việt Nam | Address in Vietnamese on the VI page |
| Logo link (screen readers) | Handyman home (English) | Trang chủ Handyman | aria-label was untranslated |
| Edition card label | Size (English) | Kích thước | Missing VI entry |
| 8 sign-group names (product data) | e.g. "Xuồng cứu sinh / Xuồng cứu sinh - Hướng lên sang phải / Xuồng cứu sinh - Hướng xuống sang phải" | e.g. "Xuồng cứu sinh" | Group name listed every variant; variants stay named in the design step |
| Unused strings | ENGINEERED, FOR A SAFER TOMORROW, Cart, Configure / Order, contact-form strings | removed | Not shown anywhere |

## Open items

| Item | Current | Decision needed |
|---|---|---|
| Bank branch name (bank transfer pop-up) | VPBank - Chi nhanh Trung Son | Comes from `src/checkout/bank-transfer-config.js`. Keep without accents if it must match the bank's records; otherwise "VPBank – Chi nhánh Trung Sơn". |
| New categories (9) and design "Disabled access" | Biển báo thiết bị chữa cháy, Ký hiệu kiểm soát chữa cháy, Thẻ treo cảnh báo tạm thời, Biển báo cảng biển & sân bay (ICAO 9363), Biển báo kết hợp, Biển báo cấm, Biển báo cảnh báo, Biển báo hàng nguy hiểm, Áp phích an toàn; "Lối vào dành cho người khuyết tật" | Written by the developer for the new SKUs (`scripts/build-catalogue-data.mjs`, `scripts/catalogue-names-vi-extra.tsv`) — confirm with a Vietnamese reviewer |
| Sign-group names (product data, 8 labels) | Shortened by the developer | A Vietnamese reviewer should confirm: Xuồng cứu sinh (hướng bên), Điểm tập kết (hướng bên), Trạm tập trung (hướng bên), Lối thoát trái - Người chạy sang phải - Mũi tên phải |

## Side-by-side strings

### Header

| EN | VI | Note |
|---|---|---|
| [aria-label] Handyman home | [aria-label] Trang chủ Handyman |  |
| [alt] Handyman — Where jobs get done | [alt] Handyman — Where jobs get done | Same in both (logo tagline) |
| [aria-label] Menu | [aria-label] Menu | Same in both |
| PRODUCT LOOKUP | TRA CỨU SẢN PHẨM |  |
| ORDER | ĐẶT HÀNG |  |
| CATALOGUE | CATALOGUE | Same in both (glossary loanword) |
| Contact sales | Liên hệ sales | Shown in capitals; approved term |
| [aria-label] Language / Ngôn ngữ | [aria-label] Language / Ngôn ngữ | Same in both (bilingual on purpose) |
| [aria-label] English | [aria-label] English | Same in both (language name) |
| EN | EN | Same in both |
| [aria-label] Tiếng Việt | [aria-label] Tiếng Việt | Same in both (language name) |
| VI | VI | Same in both |

### Hero

| EN | VI | Note |
|---|---|---|
| HYPERION BY HANDYMAN | HYPERION BY HANDYMAN | Same in both (brand) |
| Marine safety signs | Biển báo an toàn hàng hải |  |
| for onboard safety, emergency response and wayfinding. | cho an toàn trên tàu, ứng phó khẩn cấp và chỉ dẫn. |  |
| Find your sign | Tìm biển báo | Shown in capitals |
| Download catalogue | Tải catalogue | Shown in capitals |

### Feature section

| EN | VI | Note |
|---|---|---|
| SIGN CONSTRUCTION | CẤU TẠO BIỂN BÁO |  |
| Built for marine environments. | Được chế tạo cho môi trường hàng hải. |  |
| Hyperion signs are available in durable material options designed for marine and offshore use, delivering long-lasting performance in the harshest conditions. | Biển báo Hyperion có các lựa chọn vật liệu bền bỉ dành cho môi trường hàng hải và ngoài khơi, duy trì hiệu suất lâu dài trong những điều kiện khắc nghiệt. |  |
| Photoluminescent options | Tùy chọn dạ quang |  |
| Reliable visibility in low light and emergency conditions. | Dễ nhận biết trong điều kiện thiếu sáng và tình huống khẩn cấp. |  |
| Rigid and durable materials | Vật liệu cứng và bền |  |
| Engineered for long service life in harsh marine environments. | Được thiết kế cho tuổi thọ sử dụng dài trong môi trường hàng hải khắc nghiệt. |  |
| Clear visibility | Khả năng nhận biết rõ ràng |  |
| High contrast, easy to read graphics and compliance with international standards. | Độ tương phản cao, hình ảnh dễ đọc và phù hợp với các tiêu chuẩn quốc tế. |  |
| Suitable for marine use | Phù hợp cho môi trường hàng hải |  |
| Resistant to saltwater, UV and demanding offshore conditions. | Chịu được nước mặn, tia UV và điều kiện ngoài khơi khắc nghiệt. |  |
| View Catalogue | Xem catalogue |  |
| [alt] Layered Lower Rescue Boat marine safety sign showing Hyperion sign construction. | [alt] Minh họa cấu tạo nhiều lớp của biển báo an toàn hàng hải Lower Rescue Boat. |  |
| PEOPLE SAFETY PROGRESS | CON NGƯỜI · AN TOÀN · TIẾN BỘ |  |

### Contact sales options

| EN | VI | Note |
|---|---|---|
| Call us | Gọi điện |  |
| (+84) 347 099 905 | (+84) 347 099 905 | Same in both (phone) |
| WhatsApp | WhatsApp | Same in both (brand) |
| Chat on WhatsApp | Nhắn tin qua WhatsApp |  |
| Zalo | Zalo | Same in both (brand) |
| Chat on Zalo | Nhắn tin qua Zalo |  |

### Search (empty)

| EN | VI | Note |
|---|---|---|
| Product search / lookup | Tìm kiếm / tra cứu sản phẩm |  |
| Search by product code or name | Tìm theo mã hoặc tên sản phẩm |  |
| [placeholder] Search by IMPA, ISSA, barcode or product name | [placeholder] Tìm theo IMPA, ISSA, mã vạch hoặc tên sản phẩm | Phones: "IMPA, ISSA, barcode or name" / "IMPA, ISSA, mã vạch hoặc tên" |
| Find products | Tìm sản phẩm | Shown in capitals |

### Search (no results)

| EN | VI | Note |
|---|---|---|
| [aria-label] Clear search | [aria-label] Xóa tìm kiếm |  |
| 0 matching SKUs | 0 mã sản phẩm phù hợp |  |
| No matching Hyperion product found | Không tìm thấy sản phẩm Hyperion phù hợp |  |
| Check the code or try another English or Vietnamese product name. | Kiểm tra mã hoặc thử tên sản phẩm khác bằng tiếng Việt hoặc tiếng Anh. |  |

### Search (results) — first page for "lifebuoy"

| EN | VI | Note |
|---|---|---|
| 18 matching SKUs · showing 8 | 18 mã sản phẩm phù hợp · đang hiển thị 8 |  |
| [aria-label] Matching products | [aria-label] Sản phẩm phù hợp |  |
| Loading image… | Đang tải ảnh… |  |
| Lifebuoy | Phao cứu sinh | Product name (data) |
| Lifebuoy With Line | Phao cứu sinh có dây thừng | Product name (data) |
| Lifebuoy With Light | Phao cứu sinh có đèn phát sáng | Product name (data) |
| Lifebuoy With Light & Smoke | Phao cứu sinh có đèn & tín hiệu khói | Product name (data) |
| IMPA 334056 | IMPA 334056 | Same in both (code) |
| 150 × 150 mm | 150 × 150 mm | Same in both (size) |
| Standard | Tiêu chuẩn | Edition |
| Barcode 23.7.8.5.1662 | Mã vạch 23.7.8.5.1662 |  |
| Unit price | Đơn giá |  |
| $2.85 | 74.000 ₫ | Currency follows language |
| [aria-label] Add to order: 23.7.8.5.1662 | [aria-label] Thêm vào đơn hàng: 23.7.8.5.1662 |  |
| [aria-label] Decrease quantity for 23.7.8.5.1662 | [aria-label] Giảm số lượng cho 23.7.8.5.1662 |  |
| [aria-label] Quantity for 23.7.8.5.1662 | [aria-label] Số lượng cho 23.7.8.5.1662 |  |
| [aria-label] Increase quantity for 23.7.8.5.1662 | [aria-label] Tăng số lượng cho 23.7.8.5.1662 |  |
| Add | Thêm | Shown in capitals |
| Show more results | Xem thêm kết quả | Shown in capitals |

*(The same labels repeat for every result row; only the codes change.)*

### Configurator

| EN | VI | Note |
|---|---|---|
| FIND YOUR HYPERION SIGN | TÌM BIỂN BÁO HYPERION |  |
| Reset selection | Đặt lại lựa chọn | Shown in capitals |
| Choose a product category | Chọn danh mục sản phẩm |  |
| Lifesaving Signs (LSS/LSA) | Biển báo cứu sinh | Category (data) |
| Means of Escape Signs (MES) | Biển báo thoát hiểm | Category (data) |
| Emergency Equipment Signs (EES) | Biển báo thiết bị khẩn cấp | Category (data) |
| Mandatory Signs (MSS) | Biển báo bắt buộc | Category (data) |
| General Shipboard / Port & Leisure Signs | Biển báo chung trên tàu / cảng & khu vực dịch vụ | Category (data) |
| Choose a category to begin. | Chọn một danh mục để bắt đầu. | Screen-reader status |
| Choose a sign | Chọn biển báo |  |
| Select a product category first | Chọn danh mục sản phẩm trước | Unlock hint |
| Filter these signs | Lọc biển báo |  |
| [placeholder] Type a sign name or IMPA | [placeholder] Nhập tên biển báo hoặc mã IMPA |  |
| Survival Craft Pyrotechnics | Pháo hiệu cứu sinh | Sign group (data) |
| Rocket Parachute | Pháo dù cứu hộ | Sign group (data) |
| Line Throwing Appliance | Thiết bị phóng dây cứu hộ | Sign group (data) |
| Lifeboat | Xuồng cứu sinh | Sign group (data) — fixed |
| Rescue Boat | Thuyền cứu hộ | Sign group (data) |
| Liferaft | Bè cứu sinh | Sign group (data) |
| Davit Launched Liferaft | Bè cứu sinh hạ bằng cẩu | Sign group (data) |
| Embarkation Ladder | Thang xuống xuồng cứu sinh | Sign group (data) |
| Show more | Xem thêm | Shown in capitals |
| Choose a design | Chọn mẫu biển báo |  |
| Select a sign first | Chọn biển báo trước | Unlock hint |
| IMPA 334056 · Barcode 23.7.8.5.1662 \| 150 × 150 mm | IMPA 334056 · Mã vạch 23.7.8.5.1662 \| 150 × 150 mm |  |
| Choose size | Chọn kích thước |  |
| [title] Not available for this design | [title] Không có kích thước này cho mẫu đã chọn |  |
| 100 × 100 mm … 300 × 300 mm | 100 × 100 mm … 300 × 300 mm | Same in both (sizes) |
| Complete the previous step | Hoàn thành bước trước | Unlock hint |
| Choose edition | Chọn phiên bản |  |
| Size 150 × 150 mm | Kích thước 150 × 150 mm | Fixed (was English) |
| Standard | Tiêu chuẩn | Edition |
| Outdoor | Ngoài trời | Edition |
| Quantity | Số lượng |  |
| Add to order | Thêm vào đơn hàng | Shown in capitals |

### Order summary

| EN | VI | Note |
|---|---|---|
| Order summary | Tóm tắt đơn hàng |  |
| Your selected items will appear here. | Các sản phẩm đã chọn sẽ xuất hiện tại đây. | Empty state |
| [title] Distinct SKU rows · Total quantity | [title] Số mã sản phẩm khác nhau · Tổng số lượng |  |
| 1 product · 1 unit | 1 mã sản phẩm · 1 đơn vị |  |
| [aria-label] Added to your order | [aria-label] Đã thêm vào đơn hàng |  |
| 150 × 150 mm · Standard | 150 × 150 mm · Tiêu chuẩn |  |
| [aria-label] Remove: Lifebuoy · 150 × 150 mm · Standard | [aria-label] Xóa: Phao cứu sinh · 150 × 150 mm · Tiêu chuẩn |  |
| Remove | Xóa |  |
| Estimated total | Tổng tiền dự kiến |  |
| Order updated. 1 product · 1 unit. Estimated total: $2.85 | Đã cập nhật đơn hàng. 1 mã sản phẩm · 1 đơn vị. Tổng tiền dự kiến: 74.000 ₫ | Screen-reader announcement |
| Order | Đặt hàng | Summary button, shown in capitals |
| Pay now | Thanh toán ngay | Summary button, shown in capitals |
| View order | Xem đơn hàng | Mobile bar, shown in capitals |
| Amount due now | Số tiền cần thanh toán ngay | Fixed |
| Merchandise subtotal | Tổng tiền hàng |  |
| Shipping fee | Phí vận chuyển |  |
| To be confirmed | Sẽ được xác nhận |  |
| Remaining balance | Số dư còn lại |  |

### Contact & Shipping (step 6)

| EN | VI | Note |
|---|---|---|
| Contact & Shipping | Thông tin liên hệ & giao hàng |  |
| Add an item to your order first | Vui lòng thêm sản phẩm vào đơn hàng trước | Unlock hint |
| Full Name * | Họ và tên * |  |
| Company | Công ty |  |
| Email * | Email * | Same in both (standard term) |
| Phone / WhatsApp * | Điện thoại / WhatsApp * |  |
| Country * | Quốc gia * |  |
| City / Province * | Tỉnh / Thành phố * |  |
| [placeholder] Select a country first | [placeholder] Chọn quốc gia trước |  |
| Shipping Address * | Địa chỉ giao hàng * |  |
| Required field | Thông tin bắt buộc |  |
| Select a country from the list | Vui lòng chọn quốc gia trong danh sách |  |
| Select a province from the list | Vui lòng chọn tỉnh / thành phố trong danh sách | New |
| No provinces found | Không tìm thấy tỉnh / thành phố | New |
| Enter a valid email address | Vui lòng nhập địa chỉ email hợp lệ |  |
| Enter a valid international phone number | Vui lòng nhập số điện thoại quốc tế hợp lệ |  |

### Payment (step 7)

| EN | VI | Note |
|---|---|---|
| Payment | Thanh toán |  |
| Complete Contact & Shipping first | Vui lòng hoàn tất Thông tin liên hệ & giao hàng trước | Unlock hint |
| Choose payment option | Chọn hình thức thanh toán |  |
| Deposit | Đặt cọc |  |
| Pay in full | Thanh toán toàn bộ |  |
| Payment method | Phương thức thanh toán |  |
| Card | Thẻ |  |
| [aria-label] Card — Visa / Mastercard | [aria-label] Thẻ Visa / Mastercard |  |
| ZaloPay | ZaloPay | Same in both (brand) |
| Bank Transfer / VietQR | Chuyển khoản / VietQR |  |
| Select payment method | Chọn cách thanh toán | Button, shown in capitals |
| Pay by card | Thanh toán bằng thẻ | Button, shown in capitals |
| Pay with ZaloPay | Thanh toán qua ZaloPay | Button, shown in capitals |
| View bank transfer details | Xem thông tin chuyển khoản | Button, shown in capitals |
| Processing… | Đang xử lý… |  |

### Payment pop-ups

| EN | VI | Note |
|---|---|---|
| Card payment | Thanh toán bằng thẻ | Card pop-up title |
| [aria-label] Close | [aria-label] Đóng |  |
| Deposit due now | Tiền cọc cần thanh toán ngay | Fixed |
| Full product payment due now | Toàn bộ tiền hàng cần thanh toán ngay | Fixed |
| Card number | Số thẻ |  |
| [placeholder] 1234 1234 1234 1234 | [placeholder] 1234 1234 1234 1234 | Same in both (format) |
| Expiry | Ngày hết hạn |  |
| [placeholder] MM / YY | [placeholder] MM / YY | Same in both (card format) |
| CVV / CVC | CVV / CVC | Same in both (card term) |
| Card number is required. | Vui lòng nhập số thẻ. |  |
| Pay | Thanh toán | Shown in capitals |
| Open ZaloPay | Mở ZaloPay | ZaloPay pop-up |
| Open QR scanner | Mở trình quét QR |  |
| Scan and confirm | Quét và xác nhận |  |
| Open payment window | Mở cửa sổ thanh toán |  |
| Bank transfer (VietQR) | Chuyển khoản ngân hàng (VietQR) | Bank pop-up title |
| Account name | Tên tài khoản |  |
| DLV CORPORATION | DLV CORPORATION | Same in both (account name) |
| Account number | Số tài khoản |  |
| [aria-label] Copy account number | [aria-label] Sao chép số tài khoản |  |
| Bank | Ngân hàng |  |
| VPBank - Chi nhanh Trung Son | VPBank - Chi nhanh Trung Son | **Open item** — see above |
| Transfer method | Phương thức chuyển khoản |  |
| VietQR / Bank Transfer | VietQR / Chuyển khoản | Fixed (was English) |
| Transfer content | Nội dung chuyển khoản |  |
| [aria-label] Copy transfer content | [aria-label] Sao chép nội dung chuyển khoản |  |

### Footer

| EN | VI | Note |
|---|---|---|
| HYPERION by DLV Corporation | HYPERION by DLV Corporation | Same in both (brand line) |
| Clear signs. Safer operations. | Biển báo rõ ràng. Vận hành an toàn hơn. |  |
| ABOUT US | VỀ CHÚNG TÔI |  |
| CÔNG TY CP ĐẦU TƯ THƯƠNG MẠI DỊCH VỤ VÀ TƯ VẤN ĐỖ LÊ VŨ | CÔNG TY CP ĐẦU TƯ THƯƠNG MẠI DỊCH VỤ VÀ TƯ VẤN ĐỖ LÊ VŨ | Same in both (legal name) |
| DLV CORPORATION | DLV CORPORATION | Same in both (legal name) |
| Tax code: | Mã số thuế: |  |
| CONTACT | LIÊN HỆ |  |
| 29 Nguyen Van Quy Street, Tan Thuan Ward, Ho Chi Minh City, Vietnam | 29 Nguyễn Văn Quỳ, Phường Tân Thuận, Thành phố Hồ Chí Minh, Việt Nam | Fixed |
| Phone / WhatsApp / Zalo: | Điện thoại / WhatsApp / Zalo: | Screen-reader label |
| WhatsApp / Zalo (chips) | WhatsApp / Zalo | Shown in capitals |
| [aria-label] Chat on WhatsApp | [aria-label] Nhắn tin qua WhatsApp |  |
| [aria-label] Chat on Zalo | [aria-label] Nhắn tin qua Zalo |  |
| info@dlvcorp.com | info@dlvcorp.com | Same in both (email) |
| © 2026 DLV Corporation. All rights reserved. | © 2026 DLV Corporation. Bảo lưu mọi quyền. | Year is automatic |
