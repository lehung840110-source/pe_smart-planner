export interface FormationDiagram {
  id: string;
  name: string;
  code: string;
  phase: 'nhan_lop' | 'khoi_dong' | 'tap_mau' | 'dong_loat' | 'to_nhom' | 'cap_doi' | 'thi_dua' | 'tro_choi' | 'hoi_tinh' | 'xuong_lop';
  description: string;
  svgDataUrl: string;
}

import { formationStudioPresets, renderFormationSvgString } from '../utils/formationStudioUtils';

const escXml = (str: string) =>
  (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export function createFormationSvg(
  title: string,
  subtitle: string,
  type: string,
  theme: 'clean' | 'turf' | 'court' = 'clean'
): string {
  let content = '';

  if (type === 'nhan_lop') {
    // 4 hàng ngang tập trung cự ly hẹp
    content = `
      <!-- Teacher -->
      <polygon points="160,35 150,55 170,55" fill="#dc2626" />
      <text x="160" y="70" font-family="sans-serif" font-size="11" font-weight="bold" fill="#dc2626" text-anchor="middle"> GV</text>
      
      <!-- Cán sự -->
      <circle cx="160" cy="95" r="6.5" fill="#2563eb" />
      <text x="160" y="90" font-family="sans-serif" font-size="9" font-weight="bold" fill="#2563eb" text-anchor="middle">CS</text>

      <!-- 4 Hàng ngang tập trung -->
      <g fill="#1e293b">
        <circle cx="70" cy="115" r="5"/><circle cx="100" cy="115" r="5"/><circle cx="130" cy="115" r="5"/><circle cx="160" cy="115" r="5"/><circle cx="190" cy="115" r="5"/><circle cx="220" cy="115" r="5"/><circle cx="250" cy="115" r="5"/>
        <circle cx="70" cy="135" r="5"/><circle cx="100" cy="135" r="5"/><circle cx="130" cy="135" r="5"/><circle cx="160" cy="135" r="5"/><circle cx="190" cy="135" r="5"/><circle cx="220" cy="135" r="5"/><circle cx="250" cy="135" r="5"/>
        <circle cx="70" cy="155" r="5"/><circle cx="100" cy="155" r="5"/><circle cx="130" cy="155" r="5"/><circle cx="160" cy="155" r="5"/><circle cx="190" cy="155" r="5"/><circle cx="220" cy="155" r="5"/><circle cx="250" cy="155" r="5"/>
        <circle cx="70" cy="175" r="5"/><circle cx="100" cy="175" r="5"/><circle cx="130" cy="175" r="5"/><circle cx="160" cy="175" r="5"/><circle cx="190" cy="175" r="5"/><circle cx="220" cy="175" r="5"/><circle cx="250" cy="175" r="5"/>
      </g>
      <text x="160" y="202" font-family="sans-serif" font-size="10" font-weight="600" fill="#475569" text-anchor="middle">Đội hình 4 hàng ngang tập trung cự ly hẹp</text>
    `;
  } else if (type === 'khoi_dong') {
    // 4 hàng ngang giãn cách 1 sải tay so le
    content = `
      <polygon points="160,35 150,52 170,52" fill="#dc2626" />
      <text x="160" y="65" font-family="sans-serif" font-size="10" font-weight="bold" fill="#dc2626" text-anchor="middle"> GV</text>
      
      <g fill="#0284c7">
        <circle cx="50" cy="85" r="5.5"/><circle cx="95" cy="85" r="5.5"/><circle cx="140" cy="85" r="5.5"/><circle cx="185" cy="85" r="5.5"/><circle cx="230" cy="85" r="5.5"/><circle cx="270" cy="85" r="5.5"/>
        <circle cx="72" cy="115" r="5.5"/><circle cx="117" cy="115" r="5.5"/><circle cx="162" cy="115" r="5.5"/><circle cx="207" cy="115" r="5.5"/><circle cx="252" cy="115" r="5.5"/>
        <circle cx="50" cy="145" r="5.5"/><circle cx="95" cy="145" r="5.5"/><circle cx="140" cy="145" r="5.5"/><circle cx="185" cy="145" r="5.5"/><circle cx="230" cy="145" r="5.5"/><circle cx="270" cy="145" r="5.5"/>
        <circle cx="72" cy="175" r="5.5"/><circle cx="117" cy="175" r="5.5"/><circle cx="162" cy="175" r="5.5"/><circle cx="207" cy="175" r="5.5"/><circle cx="252" cy="175" r="5.5"/>
      </g>
      <line x1="95" y1="73" x2="140" y2="73" stroke="#e11d48" stroke-width="1.5" stroke-dasharray="3,2"/>
      <text x="117" y="70" font-family="sans-serif" font-size="8.5" fill="#e11d48" font-weight="bold" text-anchor="middle">↔ 1 sải tay</text>
      <text x="160" y="202" font-family="sans-serif" font-size="10" font-weight="600" fill="#475569" text-anchor="middle">Đội hình khởi động 4 hàng ngang so le</text>
    `;
  } else if (type === 'tap_mau') {
    // Quan sát mẫu / tranh SGK
    content = `
      <rect x="75" y="32" width="60" height="36" rx="4" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
      <text x="105" y="53" font-family="sans-serif" font-size="8" font-weight="bold" fill="#b45309" text-anchor="middle">TRANH SGK</text>
      
      <polygon points="195,34 185,52 205,52" fill="#dc2626" />
      <text x="195" y="65" font-family="sans-serif" font-size="10" font-weight="bold" fill="#dc2626" text-anchor="middle"> GV Mẫu</text>
      
      <g fill="#1e293b">
        <circle cx="65" cy="100" r="5.5"/><circle cx="100" cy="100" r="5.5"/><circle cx="135" cy="100" r="5.5"/><circle cx="170" cy="100" r="5.5"/><circle cx="205" cy="100" r="5.5"/><circle cx="240" cy="100" r="5.5"/>
        <circle cx="82" cy="125" r="5.5"/><circle cx="117" cy="125" r="5.5"/><circle cx="152" cy="125" r="5.5"/><circle cx="187" cy="125" r="5.5"/><circle cx="222" cy="125" r="5.5"/>
        <circle cx="65" cy="150" r="5.5"/><circle cx="100" cy="150" r="5.5"/><circle cx="135" cy="150" r="5.5"/><circle cx="170" cy="150" r="5.5"/><circle cx="205" cy="150" r="5.5"/><circle cx="240" cy="150" r="5.5"/>
        <circle cx="82" cy="175" r="5.5"/><circle cx="117" cy="175" r="5.5"/><circle cx="152" cy="175" r="5.5"/><circle cx="187" cy="175" r="5.5"/><circle cx="222" cy="175" r="5.5"/>
      </g>
      <text x="160" y="202" font-family="sans-serif" font-size="10" font-weight="600" fill="#475569" text-anchor="middle">Đội hình HS quan sát tranh ảnh & GV làm mẫu</text>
    `;
  } else if (type === 'dong_loat') {
    // Tập đồng loạt
    content = `
      <polygon points="160,35 150,52 170,52" fill="#dc2626" />
      <text x="160" y="65" font-family="sans-serif" font-size="10" font-weight="bold" fill="#dc2626" text-anchor="middle"> GV Hô Nhịp</text>
      
      <g fill="#16a34a">
        <circle cx="60" cy="90" r="5.5"/><circle cx="100" cy="90" r="5.5"/><circle cx="140" cy="90" r="5.5"/><circle cx="180" cy="90" r="5.5"/><circle cx="220" cy="90" r="5.5"/><circle cx="260" cy="90" r="5.5"/>
        <circle cx="80" cy="118" r="5.5"/><circle cx="120" cy="118" r="5.5"/><circle cx="160" cy="118" r="5.5"/><circle cx="200" cy="118" r="5.5"/><circle cx="240" cy="118" r="5.5"/>
        <circle cx="60" cy="146" r="5.5"/><circle cx="100" cy="146" r="5.5"/><circle cx="140" cy="146" r="5.5"/><circle cx="180" cy="146" r="5.5"/><circle cx="220" cy="146" r="5.5"/><circle cx="260" cy="146" r="5.5"/>
        <circle cx="80" cy="174" r="5.5"/><circle cx="120" cy="174" r="5.5"/><circle cx="160" cy="174" r="5.5"/><circle cx="200" cy="174" r="5.5"/><circle cx="240" cy="174" r="5.5"/>
      </g>
      <text x="160" y="202" font-family="sans-serif" font-size="10" font-weight="600" fill="#475569" text-anchor="middle">Đội hình tập luyện đồng loạt cả lớp (2x8 nhịp)</text>
    `;
  } else if (type === 'to_nhom') {
    // 4 tổ ở 4 góc sân
    content = `
      <polygon points="160,110 150,128 170,128" fill="#dc2626" />
      <text x="160" y="142" font-family="sans-serif" font-size="10" font-weight="bold" fill="#dc2626" text-anchor="middle"> GV</text>
      
      <rect x="25" y="30" width="105" height="68" rx="8" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.2" stroke-dasharray="4,3"/>
      <text x="77" y="44" font-family="sans-serif" font-size="9" font-weight="bold" fill="#1d4ed8" text-anchor="middle">TỔ 1 (Khu A)</text>
      <circle cx="45" cy="62" r="5" fill="#f59e0b"/><text x="45" y="58" font-size="7" font-weight="bold" fill="#b45309" text-anchor="middle">TT</text>
      <circle cx="65" cy="62" r="4.5" fill="#1e293b"/><circle cx="82" cy="62" r="4.5" fill="#1e293b"/><circle cx="99" cy="62" r="4.5" fill="#1e293b"/><circle cx="116" cy="62" r="4.5" fill="#1e293b"/>
      <circle cx="55" cy="80" r="4.5" fill="#1e293b"/><circle cx="73" cy="80" r="4.5" fill="#1e293b"/><circle cx="91" cy="80" r="4.5" fill="#1e293b"/><circle cx="109" cy="80" r="4.5" fill="#1e293b"/>

      <rect x="190" y="30" width="105" height="68" rx="8" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.2" stroke-dasharray="4,3"/>
      <text x="242" y="44" font-family="sans-serif" font-size="9" font-weight="bold" fill="#1d4ed8" text-anchor="middle">TỔ 2 (Khu B)</text>
      <circle cx="210" cy="62" r="5" fill="#f59e0b"/><text x="210" y="58" font-size="7" font-weight="bold" fill="#b45309" text-anchor="middle">TT</text>
      <circle cx="230" cy="62" r="4.5" fill="#1e293b"/><circle cx="247" cy="62" r="4.5" fill="#1e293b"/><circle cx="264" cy="62" r="4.5" fill="#1e293b"/><circle cx="281" cy="62" r="4.5" fill="#1e293b"/>
      <circle cx="220" cy="80" r="4.5" fill="#1e293b"/><circle cx="238" cy="80" r="4.5" fill="#1e293b"/><circle cx="256" cy="80" r="4.5" fill="#1e293b"/><circle cx="274" cy="80" r="4.5" fill="#1e293b"/>

      <rect x="25" y="125" width="105" height="68" rx="8" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.2" stroke-dasharray="4,3"/>
      <text x="77" y="139" font-family="sans-serif" font-size="9" font-weight="bold" fill="#1d4ed8" text-anchor="middle">TỔ 3 (Khu C)</text>
      <circle cx="45" cy="157" r="5" fill="#f59e0b"/><text x="45" y="153" font-size="7" font-weight="bold" fill="#b45309" text-anchor="middle">TT</text>
      <circle cx="65" cy="157" r="4.5" fill="#1e293b"/><circle cx="82" cy="157" r="4.5" fill="#1e293b"/><circle cx="99" cy="157" r="4.5" fill="#1e293b"/><circle cx="116" cy="157" r="4.5" fill="#1e293b"/>
      <circle cx="55" cy="175" r="4.5" fill="#1e293b"/><circle cx="73" cy="175" r="4.5" fill="#1e293b"/><circle cx="91" cy="175" r="4.5" fill="#1e293b"/><circle cx="109" cy="175" r="4.5" fill="#1e293b"/>

      <rect x="190" y="125" width="105" height="68" rx="8" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.2" stroke-dasharray="4,3"/>
      <text x="242" y="139" font-family="sans-serif" font-size="9" font-weight="bold" fill="#1d4ed8" text-anchor="middle">TỔ 4 (Khu D)</text>
      <circle cx="210" cy="157" r="5" fill="#f59e0b"/><text x="210" y="153" font-size="7" font-weight="bold" fill="#b45309" text-anchor="middle">TT</text>
      <circle cx="230" cy="157" r="4.5" fill="#1e293b"/><circle cx="247" cy="157" r="4.5" fill="#1e293b"/><circle cx="264" cy="157" r="4.5" fill="#1e293b"/><circle cx="281" cy="157" r="4.5" fill="#1e293b"/>
      <circle cx="220" cy="175" r="4.5" fill="#1e293b"/><circle cx="238" cy="175" r="4.5" fill="#1e293b"/><circle cx="256" cy="175" r="4.5" fill="#1e293b"/><circle cx="274" cy="175" r="4.5" fill="#1e293b"/>

      <text x="160" y="204" font-family="sans-serif" font-size="10" font-weight="600" fill="#475569" text-anchor="middle">Đội hình tập luyện theo 4 tổ tại 4 khu vực sân</text>
    `;
  } else if (type === 'cap_doi') {
    content = `
      <polygon points="160,32 150,48 170,48" fill="#dc2626" />
      <text x="160" y="60" font-family="sans-serif" font-size="10" font-weight="bold" fill="#dc2626" text-anchor="middle"> GV Quan sát & Sửa sai</text>
      
      <g>
        <circle cx="60" cy="90" r="5.5" fill="#2563eb"/><text x="75" y="93" font-size="9" fill="#e11d48">↔</text><circle cx="90" cy="90" r="5.5" fill="#16a34a"/>
        <circle cx="145" cy="90" r="5.5" fill="#2563eb"/><text x="160" y="93" font-size="9" fill="#e11d48">↔</text><circle cx="175" cy="90" r="5.5" fill="#16a34a"/>
        <circle cx="230" cy="90" r="5.5" fill="#2563eb"/><text x="245" y="93" font-size="9" fill="#e11d48">↔</text><circle cx="260" cy="90" r="5.5" fill="#16a34a"/>
      </g>
      <g>
        <circle cx="60" cy="135" r="5.5" fill="#2563eb"/><text x="75" y="138" font-size="9" fill="#e11d48">↔</text><circle cx="90" cy="135" r="5.5" fill="#16a34a"/>
        <circle cx="145" cy="135" r="5.5" fill="#2563eb"/><text x="160" y="138" font-size="9" fill="#e11d48">↔</text><circle cx="175" cy="135" r="5.5" fill="#16a34a"/>
        <circle cx="230" cy="135" r="5.5" fill="#2563eb"/><text x="245" y="138" font-size="9" fill="#e11d48">↔</text><circle cx="260" cy="135" r="5.5" fill="#16a34a"/>
      </g>
      <g>
        <circle cx="60" cy="175" r="5.5" fill="#2563eb"/><text x="75" y="178" font-size="9" fill="#e11d48">↔</text><circle cx="90" cy="175" r="5.5" fill="#16a34a"/>
        <circle cx="145" cy="175" r="5.5" fill="#2563eb"/><text x="160" y="178" font-size="9" fill="#e11d48">↔</text><circle cx="175" cy="175" r="5.5" fill="#16a34a"/>
        <circle cx="230" cy="175" r="5.5" fill="#2563eb"/><text x="245" y="178" font-size="9" fill="#e11d48">↔</text><circle cx="260" cy="175" r="5.5" fill="#16a34a"/>
      </g>
      <text x="160" y="202" font-family="sans-serif" font-size="10" font-weight="600" fill="#475569" text-anchor="middle">Đội hình cặp đôi quay mặt vào nhau tập và sửa sai</text>
    `;
  } else if (type === 'thi_dua') {
    content = `
      <polygon points="160,30 150,47 170,47" fill="#dc2626" />
      <text x="160" y="58" font-family="sans-serif" font-size="10" font-weight="bold" fill="#dc2626" text-anchor="middle"> Ban Giám Khảo / GV</text>
      
      <rect x="90" y="75" width="140" height="48" rx="6" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
      <text x="160" y="90" font-family="sans-serif" font-size="9" font-weight="bold" fill="#b91c1c" text-anchor="middle">⭐ TỔ LÊN TRÌNH DIỄN ⭐</text>
      <g fill="#b91c1c">
        <circle cx="110" cy="107" r="5"/><circle cx="130" cy="107" r="5"/><circle cx="150" cy="107" r="5"/><circle cx="170" cy="107" r="5"/><circle cx="190" cy="107" r="5"/><circle cx="210" cy="107" r="5"/>
      </g>
      <text x="70" y="145" font-size="8.5" font-weight="bold" fill="#64748b">Tổ 2 (Cổ vũ)</text>
      <g fill="#64748b"><circle cx="50" cy="160" r="4"/><circle cx="65" cy="160" r="4"/><circle cx="80" cy="160" r="4"/><circle cx="95" cy="160" r="4"/></g>
      <text x="160" y="145" font-size="8.5" font-weight="bold" fill="#64748b" text-anchor="middle">Tổ 3 (Quan sát)</text>
      <g fill="#64748b"><circle cx="140" cy="160" r="4"/><circle cx="155" cy="160" r="4"/><circle cx="170" cy="160" r="4"/><circle cx="185" cy="160" r="4"/></g>
      <text x="250" y="145" font-size="8.5" font-weight="bold" fill="#64748b" text-anchor="end">Tổ 4 (Nhận xét)</text>
      <g fill="#64748b"><circle cx="225" cy="160" r="4"/><circle cx="240" cy="160" r="4"/><circle cx="255" cy="160" r="4"/><circle cx="270" cy="160" r="4"/></g>
      <text x="160" y="202" font-family="sans-serif" font-size="10" font-weight="600" fill="#475569" text-anchor="middle">Đội hình thi đua trình diễn giữa các tổ</text>
    `;
  } else if (type === 'tro_choi_tam_giac') {
    // SƠ ĐỒ CHÍNH XÁC: TRÒ CHƠI CHẠY THEO HÌNH TAM GIÁC (3 CỌC MỐC A, B, C)
    content = `
      <!-- Teacher / Timer -->
      <polygon points="160,30 152,45 168,45" fill="#dc2626" />
      <text x="160" y="55" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#dc2626" text-anchor="middle"> GV / Bấm Giờ</text>

      <!-- Triangle Perimeter Path -->
      <polygon points="60,175 160,65 260,175" fill="#f0fdf4" stroke="#16a34a" stroke-width="2.2" stroke-dasharray="5,4"/>

      <!-- 3 Cones A, B, C -->
      <!-- Cone A (Start & Finish) -->
      <polygon points="60,165 52,185 68,185" fill="#ea580c"/>
      <circle cx="60" cy="180" r="9" fill="#ea580c" opacity="0.3"/>
      <text x="60" y="196" font-family="sans-serif" font-size="10" font-weight="bold" fill="#c2410c" text-anchor="middle">Cọc A (XP/Đích)</text>

      <!-- Cone B (Top Vertex) -->
      <polygon points="160,55 152,75 168,75" fill="#0284c7"/>
      <circle cx="160" cy="70" r="9" fill="#0284c7" opacity="0.3"/>
      <text x="160" y="86" font-family="sans-serif" font-size="10" font-weight="bold" fill="#0369a1" text-anchor="middle">Cọc B</text>

      <!-- Cone C (Right Vertex) -->
      <polygon points="260,165 252,185 268,185" fill="#0284c7"/>
      <circle cx="260" cy="180" r="9" fill="#0284c7" opacity="0.3"/>
      <text x="260" y="196" font-family="sans-serif" font-size="10" font-weight="bold" fill="#0369a1" text-anchor="middle">Cọc C</text>

      <!-- Running Directional Arrows -->
      <!-- A -> B -->
      <path d="M 85 145 L 135 90" stroke="#15803d" stroke-width="2" marker-end="url(#arrow-green)" fill="none"/>
      <!-- B -> C -->
      <path d="M 185 90 L 235 145" stroke="#15803d" stroke-width="2" marker-end="url(#arrow-green)" fill="none"/>
      <!-- C -> A -->
      <path d="M 235 175 L 85 175" stroke="#15803d" stroke-width="2" marker-end="url(#arrow-green)" fill="none"/>

      <!-- Runner currently on course -->
      <circle cx="108" cy="120" r="5" fill="#e11d48"/>
      <text x="122" y="123" font-size="8" font-weight="bold" fill="#e11d48">HS chạy</text>

      <!-- Waiting queue behind Start Line A -->
      <line x1="30" y1="175" x2="60" y2="175" stroke="#dc2626" stroke-width="2"/>
      <g fill="#1e293b">
        <circle cx="45" cy="175" r="4.5"/>
        <circle cx="35" cy="175" r="4.5"/>
        <circle cx="25" cy="175" r="4.5"/>
        <circle cx="15" cy="175" r="4.5"/>
      </g>
      <text x="35" y="165" font-size="8" font-weight="bold" fill="#475569" text-anchor="middle">Hàng chờ</text>

      <text x="160" y="204" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#15803d" text-anchor="middle">
        Sơ đồ: Chạy vòng qua 3 cọc A → B → C → Về A (Cự ly 8-10m mỗi cạnh)
      </text>
    `;
  } else if (type === 'tro_choi_chuyen_gay') {
    // SƠ ĐỒ TRÒ CHƠI CHUYỀN GẬY TIẾP SỨC (4 LÀN TIẾP SỨC CHẠY VÒNG CỌC CỜ)
    content = `
      <!-- Teacher / Referee -->
      <polygon points="160,30 152,45 168,45" fill="#dc2626" />
      <text x="160" y="55" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#dc2626" text-anchor="middle"> GV / Trọng Tài</text>

      <!-- Vạch xuất phát -->
      <line x1="60" y1="65" x2="60" y2="175" stroke="#dc2626" stroke-width="2"/>
      <text x="50" y="60" font-size="8" font-weight="bold" fill="#dc2626" text-anchor="middle">Vạch XP</text>

      <!-- Vạch đích / Cọc cờ quay đầu -->
      <line x1="255" y1="65" x2="255" y2="175" stroke="#2563eb" stroke-width="2" stroke-dasharray="3,3"/>
      <text x="255" y="60" font-size="8" font-weight="bold" fill="#2563eb" text-anchor="middle">Cọc cờ quay đầu</text>

      <!-- 4 Lanes -->
      <!-- Lane 1 -->
      <text x="15" y="82" font-size="8.5" font-weight="bold" fill="#475569">Tổ 1</text>
      <g fill="#1e293b"><circle cx="28" cy="80" r="4"/><circle cx="38" cy="80" r="4"/><circle cx="48" cy="80" r="4"/></g>
      <circle cx="68" cy="80" r="4.5" fill="#f59e0b"/><line x1="66" y1="76" x2="72" y2="76" stroke="#b45309" stroke-width="2"/>
      <path d="M 75 77 L 245 77" stroke="#16a34a" stroke-width="1.5" stroke-dasharray="3,2" marker-end="url(#arrow-green)"/>
      <polygon points="255,75 250,85 260,85" fill="#dc2626"/>

      <!-- Lane 2 -->
      <text x="15" y="112" font-size="8.5" font-weight="bold" fill="#475569">Tổ 2</text>
      <g fill="#1e293b"><circle cx="28" cy="110" r="4"/><circle cx="38" cy="110" r="4"/><circle cx="48" cy="110" r="4"/></g>
      <circle cx="68" cy="110" r="4.5" fill="#f59e0b"/><line x1="66" y1="106" x2="72" y2="106" stroke="#b45309" stroke-width="2"/>
      <path d="M 75 107 L 245 107" stroke="#16a34a" stroke-width="1.5" stroke-dasharray="3,2" marker-end="url(#arrow-green)"/>
      <polygon points="255,105 250,115 260,115" fill="#dc2626"/>

      <!-- Lane 3 -->
      <text x="15" y="142" font-size="8.5" font-weight="bold" fill="#475569">Tổ 3</text>
      <g fill="#1e293b"><circle cx="28" cy="140" r="4"/><circle cx="38" cy="140" r="4"/><circle cx="48" cy="140" r="4"/></g>
      <circle cx="68" cy="140" r="4.5" fill="#f59e0b"/><line x1="66" y1="136" x2="72" y2="136" stroke="#b45309" stroke-width="2"/>
      <path d="M 75 137 L 245 137" stroke="#16a34a" stroke-width="1.5" stroke-dasharray="3,2" marker-end="url(#arrow-green)"/>
      <polygon points="255,135 250,145 260,145" fill="#dc2626"/>

      <!-- Lane 4 -->
      <text x="15" y="172" font-size="8.5" font-weight="bold" fill="#475569">Tổ 4</text>
      <g fill="#1e293b"><circle cx="28" cy="170" r="4"/><circle cx="38" cy="170" r="4"/><circle cx="48" cy="170" r="4"/></g>
      <circle cx="68" cy="170" r="4.5" fill="#f59e0b"/><line x1="66" y1="166" x2="72" y2="166" stroke="#b45309" stroke-width="2"/>
      <path d="M 75 167 L 245 167" stroke="#16a34a" stroke-width="1.5" stroke-dasharray="3,2" marker-end="url(#arrow-green)"/>
      <polygon points="255,165 250,175 260,175" fill="#dc2626"/>

      <text x="160" y="203" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#1e293b" text-anchor="middle">
        Sơ đồ: 4 Tổ chạy tiếp sức chuyền gậy, vòng qua cọc cờ cự ly 10m
      </text>
    `;
  } else if (type === 'tro_choi_lo_co_tiep_suc') {
    // SƠ ĐỒ NHẢY LÒ CÒ TIẾP SỨC
    content = `
      <polygon points="160,30 152,45 168,45" fill="#dc2626" />
      <text x="160" y="55" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#dc2626" text-anchor="middle"> GV Quản trò</text>

      <line x1="65" y1="65" x2="65" y2="175" stroke="#dc2626" stroke-width="2"/>
      <text x="50" y="60" font-size="8" font-weight="bold" fill="#dc2626" text-anchor="middle">Vạch XP</text>

      <!-- 4 Lanes with hop marks -->
      <g fill="#38bdf8" stroke="#0284c7">
        <circle cx="105" cy="85" r="7"/><circle cx="145" cy="85" r="7"/><circle cx="185" cy="85" r="7"/><circle cx="225" cy="85" r="7"/>
        <circle cx="105" cy="115" r="7"/><circle cx="145" cy="115" r="7"/><circle cx="185" cy="115" r="7"/><circle cx="225" cy="115" r="7"/>
        <circle cx="105" cy="145" r="7"/><circle cx="145" cy="145" r="7"/><circle cx="185" cy="145" r="7"/><circle cx="225" cy="145" r="7"/>
        <circle cx="105" cy="175" r="7"/><circle cx="145" cy="175" r="7"/><circle cx="185" cy="175" r="7"/><circle cx="225" cy="175" r="7"/>
      </g>
      <!-- Cones -->
      <polygon points="260,78 252,92 268,92" fill="#ea580c"/>
      <polygon points="260,108 252,122 268,122" fill="#ea580c"/>
      <polygon points="260,138 252,152 268,152" fill="#ea580c"/>
      <polygon points="260,168 252,182 268,182" fill="#ea580c"/>

      <!-- Team queues -->
      <g fill="#1e293b">
        <circle cx="35" cy="85" r="4"/><circle cx="48" cy="85" r="4"/>
        <circle cx="35" cy="115" r="4"/><circle cx="48" cy="115" r="4"/>
        <circle cx="35" cy="145" r="4"/><circle cx="48" cy="145" r="4"/>
        <circle cx="35" cy="175" r="4"/><circle cx="48" cy="175" r="4"/>
      </g>
      <text x="160" y="203" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#0369a1" text-anchor="middle">
        Sơ đồ: Nhảy lò cò từng ô tiếp sức vòng qua cọc mốc
      </text>
    `;
  } else if (type === 'tro_choi_meo_duoi_chuot') {
    // SƠ ĐỒ MÈO ĐUỔI CHUỘT
    content = `
      <polygon points="160,25 152,40 168,40" fill="#dc2626" />
      <text x="160" y="50" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#dc2626" text-anchor="middle"> Quản trò GV</text>

      <!-- Vòng tròn nắm tay -->
      <circle cx="160" cy="120" r="62" fill="#fdf4ff" stroke="#c084fc" stroke-width="2" stroke-dasharray="4,4"/>
      
      <!-- HS làm hang -->
      <g fill="#9333ea">
        <circle cx="160" cy="58" r="4.5"/><circle cx="198" cy="68" r="4.5"/><circle cx="218" cy="98" r="4.5"/>
        <circle cx="222" cy="120" r="4.5"/><circle cx="218" cy="144" r="4.5"/><circle cx="198" cy="172" r="4.5"/>
        <circle cx="160" cy="182" r="4.5"/><circle cx="122" cy="172" r="4.5"/><circle cx="102" cy="144" r="4.5"/>
        <circle cx="98" cy="120" r="4.5"/><circle cx="102" cy="98" r="4.5"/><circle cx="122" cy="68" r="4.5"/>
      </g>
      <!-- Chuột bên trong luồn lách -->
      <circle cx="145" cy="120" r="6.5" fill="#10b981"/>
      <text x="145" y="116" font-size="8" font-weight="bold" fill="#047857" text-anchor="middle">🐭 Chuột</text>
      <!-- Mèo bên ngoài đuổi theo -->
      <circle cx="185" cy="130" r="6.5" fill="#ef4444"/>
      <text x="185" y="126" font-size="8" font-weight="bold" fill="#b91c1c" text-anchor="middle">🐱 Mèo</text>

      <text x="160" y="203" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#7e22ce" text-anchor="middle">
        Sơ đồ: Vòng tròn nắm tay giơ cao tạo hang, Mèo luồn đuổi Chuột
      </text>
    `;
  } else if (type === 'tro_choi_tho_nhuong_hang') {
    // SƠ ĐỒ THỎ NHƯỜNG HANG / ĐỔI HANG
    content = `
      <polygon points="160,25 152,40 168,40" fill="#dc2626" />
      <text x="160" y="50" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#dc2626" text-anchor="middle"> Quản trò GV</text>

      <!-- 4 Hang Thỏ (Mỗi hang 2 bạn nắm tay + 1 bạn thỏ ở trong) -->
      <!-- Hang 1 (Tây Bắc) -->
      <circle cx="90" cy="85" r="22" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
      <circle cx="75" cy="85" r="4" fill="#3b82f6"/><circle cx="105" cy="85" r="4" fill="#3b82f6"/>
      <circle cx="90" cy="85" r="5" fill="#f59e0b"/><text x="90" y="82" font-size="7" font-weight="bold" fill="#b45309" text-anchor="middle">🐰1</text>

      <!-- Hang 2 (Đông Bắc) -->
      <circle cx="230" cy="85" r="22" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
      <circle cx="215" cy="85" r="4" fill="#3b82f6"/><circle cx="245" cy="85" r="4" fill="#3b82f6"/>
      <circle cx="230" cy="85" r="5" fill="#f59e0b"/><text x="230" y="82" font-size="7" font-weight="bold" fill="#b45309" text-anchor="middle">🐰2</text>

      <!-- Hang 3 (Tây Nam) -->
      <circle cx="90" cy="155" r="22" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
      <circle cx="75" cy="155" r="4" fill="#3b82f6"/><circle cx="105" cy="155" r="4" fill="#3b82f6"/>
      <circle cx="90" cy="155" r="5" fill="#f59e0b"/><text x="90" y="152" font-size="7" font-weight="bold" fill="#b45309" text-anchor="middle">🐰3</text>

      <!-- Hang 4 (Đông Nam) -->
      <circle cx="230" cy="155" r="22" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
      <circle cx="215" cy="155" r="4" fill="#3b82f6"/><circle cx="245" cy="155" r="4" fill="#3b82f6"/>
      <circle cx="230" cy="155" r="5" fill="#f59e0b"/><text x="230" y="152" font-size="7" font-weight="bold" fill="#b45309" text-anchor="middle">🐰4</text>

      <!-- Thỏ tìm hang ở giữa -->
      <circle cx="160" cy="120" r="5.5" fill="#dc2626"/>
      <text x="160" y="112" font-size="8" font-weight="bold" fill="#b91c1c" text-anchor="middle">🐰 Thỏ tìm hang</text>
      <!-- Mũi tên đổi hang -->
      <path d="M 115 95 L 205 145" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3,2" marker-end="url(#arrow-orange)"/>

      <text x="160" y="203" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#1e293b" text-anchor="middle">
        Sơ đồ: 4 Cụm hang thỏ, nghe hiệu lệnh thỏ nhanh chóng đổi hang
      </text>
    `;
  } else if (type === 'di_deu_vong_quanh_san') {
    // SƠ ĐỒ ĐI ĐỀU VÒNG QUANH SÂN (VÒNG PHẢI, VÒNG TRÁI)
    content = `
      <polygon points="160,30 152,45 168,45" fill="#dc2626" />
      <text x="160" y="55" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#dc2626" text-anchor="middle"> GV Hô: Vòng Phải (Trái) - Bước!</text>

      <!-- Sân hình chữ nhật bước đều -->
      <rect x="40" y="65" width="240" height="110" rx="8" fill="#f8fafc" stroke="#64748b" stroke-width="2" stroke-dasharray="6,4"/>

      <!-- Directional marching arrows -->
      <path d="M 60 75 L 240 75" stroke="#2563eb" stroke-width="2" marker-end="url(#arrow)"/>
      <path d="M 260 85 L 260 165" stroke="#2563eb" stroke-width="2" marker-end="url(#arrow)"/>
      <path d="M 240 165 L 60 165" stroke="#2563eb" stroke-width="2" marker-end="url(#arrow)"/>
      <path d="M 50 155 L 50 85" stroke="#2563eb" stroke-width="2" marker-end="url(#arrow)"/>

      <!-- Students marching in single file -->
      <g fill="#1e293b">
        <circle cx="80" cy="75" r="4.5"/><circle cx="110" cy="75" r="4.5"/><circle cx="140" cy="75" r="4.5"/><circle cx="170" cy="75" r="4.5"/><circle cx="200" cy="75" r="4.5"/>
        <circle cx="260" cy="100" r="4.5"/><circle cx="260" cy="125" r="4.5"/><circle cx="260" cy="150" r="4.5"/>
        <circle cx="220" cy="165" r="4.5"/><circle cx="190" cy="165" r="4.5"/><circle cx="160" cy="165" r="4.5"/>
      </g>
      <!-- Corner flags -->
      <polygon points="40,65 35,72 45,72" fill="#ea580c"/>
      <polygon points="280,65 275,72 285,72" fill="#ea580c"/>
      <polygon points="280,175 275,182 285,182" fill="#ea580c"/>
      <polygon points="40,175 35,182 45,182" fill="#ea580c"/>

      <text x="160" y="203" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#1d4ed8" text-anchor="middle">
        Sơ đồ: Đội hình 4 hàng dọc đi đều vòng quanh sân tập theo nhịp 1 - 2
      </text>
    `;
  } else if (type === 'tap_the_duc_voi_gay') {
    // SƠ ĐỒ BÀI TẬP THỂ DỤC VỚI GẬY CỰ LY RỘNG 1.5M
    content = `
      <polygon points="160,32 152,48 168,48" fill="#dc2626" />
      <text x="160" y="58" font-family="sans-serif" font-size="10" font-weight="bold" fill="#dc2626" text-anchor="middle"> GV Hô Nhịp</text>

      <!-- 4 Hàng ngang với gậy thể dục -->
      <!-- Row 1 -->
      <g>
        <circle cx="55" cy="85" r="5" fill="#0284c7"/><line x1="45" y1="85" x2="65" y2="85" stroke="#b45309" stroke-width="2.2"/>
        <circle cx="108" cy="85" r="5" fill="#0284c7"/><line x1="98" y1="85" x2="118" y2="85" stroke="#b45309" stroke-width="2.2"/>
        <circle cx="160" cy="85" r="5" fill="#0284c7"/><line x1="150" y1="85" x2="170" y2="85" stroke="#b45309" stroke-width="2.2"/>
        <circle cx="212" cy="85" r="5" fill="#0284c7"/><line x1="202" y1="85" x2="222" y2="85" stroke="#b45309" stroke-width="2.2"/>
        <circle cx="265" cy="85" r="5" fill="#0284c7"/><line x1="255" y1="85" x2="275" y2="85" stroke="#b45309" stroke-width="2.2"/>
      </g>
      <!-- Row 2 (Staggered) -->
      <g>
        <circle cx="80" cy="115" r="5" fill="#0284c7"/><line x1="70" y1="115" x2="90" y2="115" stroke="#b45309" stroke-width="2.2"/>
        <circle cx="134" cy="115" r="5" fill="#0284c7"/><line x1="124" y1="115" x2="144" y2="115" stroke="#b45309" stroke-width="2.2"/>
        <circle cx="186" cy="115" r="5" fill="#0284c7"/><line x1="176" y1="115" x2="196" y2="115" stroke="#b45309" stroke-width="2.2"/>
        <circle cx="240" cy="115" r="5" fill="#0284c7"/><line x1="230" y1="115" x2="250" y2="115" stroke="#b45309" stroke-width="2.2"/>
      </g>
      <!-- Row 3 -->
      <g>
        <circle cx="55" cy="145" r="5" fill="#0284c7"/><line x1="45" y1="145" x2="65" y2="145" stroke="#b45309" stroke-width="2.2"/>
        <circle cx="108" cy="145" r="5" fill="#0284c7"/><line x1="98" y1="145" x2="118" y2="145" stroke="#b45309" stroke-width="2.2"/>
        <circle cx="160" cy="145" r="5" fill="#0284c7"/><line x1="150" y1="145" x2="170" y2="145" stroke="#b45309" stroke-width="2.2"/>
        <circle cx="212" cy="145" r="5" fill="#0284c7"/><line x1="202" y1="145" x2="222" y2="145" stroke="#b45309" stroke-width="2.2"/>
        <circle cx="265" cy="145" r="5" fill="#0284c7"/><line x1="255" y1="145" x2="275" y2="145" stroke="#b45309" stroke-width="2.2"/>
      </g>
      <!-- Row 4 -->
      <g>
        <circle cx="80" cy="175" r="5" fill="#0284c7"/><line x1="70" y1="175" x2="90" y2="175" stroke="#b45309" stroke-width="2.2"/>
        <circle cx="134" cy="175" r="5" fill="#0284c7"/><line x1="124" y1="175" x2="144" y2="175" stroke="#b45309" stroke-width="2.2"/>
        <circle cx="186" cy="175" r="5" fill="#0284c7"/><line x1="176" y1="175" x2="196" y2="175" stroke="#b45309" stroke-width="2.2"/>
        <circle cx="240" cy="175" r="5" fill="#0284c7"/><line x1="230" y1="175" x2="250" y2="175" stroke="#b45309" stroke-width="2.2"/>
      </g>

      <line x1="108" y1="73" x2="160" y2="73" stroke="#e11d48" stroke-width="1.5" stroke-dasharray="3,2"/>
      <text x="134" y="70" font-family="sans-serif" font-size="8.5" fill="#e11d48" font-weight="bold" text-anchor="middle">↔ 1.5m cự ly gậy</text>
      <text x="160" y="203" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#0369a1" text-anchor="middle">
        Sơ đồ: 4 Hàng ngang so le khoảng cách an toàn khi tập bài thể dục với gậy
      </text>
    `;
  } else if (type === 'hoi_tinh') {
    content = `
      <polygon points="160,35 150,52 170,52" fill="#dc2626" />
      <text x="160" y="65" font-family="sans-serif" font-size="10" font-weight="bold" fill="#dc2626" text-anchor="middle"> GV Hướng Dẫn Thả Lỏng</text>
      
      <g fill="#0ea5e9">
        <circle cx="60" cy="95" r="5"/><circle cx="100" cy="95" r="5"/><circle cx="140" cy="95" r="5"/><circle cx="180" cy="95" r="5"/><circle cx="220" cy="95" r="5"/><circle cx="260" cy="95" r="5"/>
        <circle cx="80" cy="125" r="5"/><circle cx="120" cy="125" r="5"/><circle cx="160" cy="125" r="5"/><circle cx="200" cy="125" r="5"/><circle cx="240" cy="125" r="5"/>
        <circle cx="60" cy="155" r="5"/><circle cx="100" cy="155" r="5"/><circle cx="140" cy="155" r="5"/><circle cx="180" cy="155" r="5"/><circle cx="220" cy="155" r="5"/><circle cx="260" cy="155" r="5"/>
      </g>
      <path d="M120 180 Q160 170 200 180" stroke="#38bdf8" stroke-width="2" fill="none"/>
      <text x="160" y="202" font-family="sans-serif" font-size="10" font-weight="600" fill="#475569" text-anchor="middle">Đội hình hồi tĩnh, thả lỏng toàn thân theo điệu nhạc</text>
    `;
  } else if (type === 'tro_choi_vong_tron') {
    // Vòng tròn trò chơi chung
    content = `
      <polygon points="160,25 150,42 170,42" fill="#dc2626" />
      <text x="160" y="53" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#dc2626" text-anchor="middle"> Quản trò GV</text>
      
      <circle cx="160" cy="120" r="62" fill="#faf5ff" stroke="#a855f7" stroke-width="2" stroke-dasharray="4,4"/>
      
      <g fill="#9333ea">
        <circle cx="160" cy="58" r="5"/><circle cx="198" cy="68" r="5"/><circle cx="218" cy="98" r="5"/><circle cx="222" cy="120" r="5"/>
        <circle cx="218" cy="144" r="5"/><circle cx="198" cy="172" r="5"/><circle cx="160" cy="182" r="5"/><circle cx="122" cy="172" r="5"/>
        <circle cx="102" cy="144" r="5"/><circle cx="98" cy="120" r="5"/><circle cx="102" cy="98" r="5"/><circle cx="122" cy="68" r="5"/>
      </g>
      <text x="160" y="202" font-family="sans-serif" font-size="10" font-weight="600" fill="#475569" text-anchor="middle">Đội hình vòng tròn tham gia trò chơi vận động</text>
    `;
  } else if (type === 'tro_choi_keo_co') {
    // SƠ ĐỒ TRÒ CHƠI KÉO CO ĐỒNG ĐỘI
    content = `
      <polygon points="160,25 152,40 168,40" fill="#dc2626" />
      <text x="160" y="50" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#dc2626" text-anchor="middle"> Trọng tài GV (Còi)</text>

      <!-- Vạch phân chia ranh giới giữa sân -->
      <line x1="160" y1="65" x2="160" y2="175" stroke="#ef4444" stroke-width="2.5"/>
      <circle cx="160" cy="120" r="14" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3,2"/>

      <!-- Sợi dây thừng kéo co -->
      <line x1="50" y1="120" x2="270" y2="120" stroke="#78350f" stroke-width="5" stroke-linecap="round"/>
      <!-- Dải lụa đỏ buộc giữa dây thừng -->
      <polygon points="160,115 154,138 166,138" fill="#dc2626"/>

      <!-- Đội A (Bên Trái) -->
      <text x="75" y="98" font-size="9" font-weight="bold" fill="#1d4ed8">ĐỘI 1 (Kéo lùi ◀)</text>
      <g fill="#2563eb">
        <circle cx="65" cy="120" r="6"/><circle cx="85" cy="120" r="6"/><circle cx="105" cy="120" r="6"/><circle cx="125" cy="120" r="6"/>
      </g>
      <path d="M 120 106 L 70 106" stroke="#2563eb" stroke-width="2" marker-end="url(#arrow)"/>

      <!-- Đội B (Bên Phải) -->
      <text x="245" y="98" font-size="9" font-weight="bold" fill="#ea580c" text-anchor="end">ĐỘI 2 (Kéo lùi ▶)</text>
      <g fill="#ea580c">
        <circle cx="195" cy="120" r="6"/><circle cx="215" cy="120" r="6"/><circle cx="235" cy="120" r="6"/><circle cx="255" cy="120" r="6"/>
      </g>
      <path d="M 200 106 L 250 106" stroke="#ea580c" stroke-width="2" marker-end="url(#arrow-orange)"/>

      <text x="160" y="203" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#1e293b" text-anchor="middle">
        Sơ đồ: Kéo co đồng đội theo hiệu lệnh còi, dải lụa qua vạch 1m là thắng
      </text>
    `;
  } else if (type === 'tro_choi_cuop_co') {
    // SƠ ĐỒ TRÒ CHƠI CƯỚP CỜ
    content = `
      <polygon points="160,25 152,40 168,40" fill="#dc2626" />
      <text x="160" y="50" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#dc2626" text-anchor="middle"> Quản trò GV</text>

      <!-- Vạch xuất phát 2 đội 2 bên -->
      <line x1="55" y1="65" x2="55" y2="175" stroke="#2563eb" stroke-width="2"/>
      <line x1="265" y1="65" x2="265" y2="175" stroke="#ea580c" stroke-width="2"/>

      <!-- Đội 1 đứng hàng ngang sau vạch A -->
      <text x="45" y="60" font-size="8.5" font-weight="bold" fill="#1d4ed8" text-anchor="middle">Đội A</text>
      <g fill="#2563eb">
        <circle cx="45" cy="80" r="5"/><circle cx="45" cy="105" r="5"/><circle cx="45" cy="130" r="5"/><circle cx="45" cy="155" r="5"/>
      </g>
      <!-- Số áo 1, 2, 3, 4 -->
      <text x="32" y="83" font-size="8" fill="#1d4ed8">1</text><text x="32" y="108" font-size="8" fill="#1d4ed8">2</text><text x="32" y="133" font-size="8" fill="#1d4ed8">3</text><text x="32" y="158" font-size="8" fill="#1d4ed8">4</text>

      <!-- Đội 2 đứng hàng ngang sau vạch B -->
      <text x="275" y="60" font-size="8.5" font-weight="bold" fill="#ea580c" text-anchor="middle">Đội B</text>
      <g fill="#ea580c">
        <circle cx="275" cy="80" r="5"/><circle cx="275" cy="105" r="5"/><circle cx="275" cy="130" r="5"/><circle cx="275" cy="155" r="5"/>
      </g>
      <text x="288" y="83" font-size="8" fill="#ea580c">1</text><text x="288" y="108" font-size="8" fill="#ea580c">2</text><text x="288" y="133" font-size="8" fill="#ea580c">3</text><text x="288" y="158" font-size="8" fill="#ea580c">4</text>

      <!-- Vòng tròn cờ ở trung tâm -->
      <circle cx="160" cy="120" r="18" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
      <polygon points="160,105 160,128 172,116" fill="#dc2626"/>
      <line x1="160" y1="105" x2="160" y2="132" stroke="#78350f" stroke-width="2"/>

      <!-- Mũi tên 2 người cùng số lao vào cướp cờ -->
      <path d="M 60 105 Q 110 95 140 115" stroke="#2563eb" stroke-width="2" stroke-dasharray="3,2" marker-end="url(#arrow)"/>
      <path d="M 260 105 Q 210 95 180 115" stroke="#ea580c" stroke-width="2" stroke-dasharray="3,2" marker-end="url(#arrow-orange)"/>

      <text x="160" y="203" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#1e293b" text-anchor="middle">
        Sơ đồ: Gọi số nào thì 2 bạn số đó nhanh chóng lao lên cướp cờ về đích
      </text>
    `;
  } else if (type === 'tro_choi_nem_bong') {
    // SƠ ĐỒ TRÒ CHƠI NÉM BÓNG TRÚNG ĐÍCH
    content = `
      <polygon points="160,25 152,40 168,40" fill="#dc2626" />
      <text x="160" y="50" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#dc2626" text-anchor="middle"> GV Hướng Dẫn & Đếm Điểm</text>

      <!-- Vạch giới hạn ném bóng -->
      <line x1="75" y1="65" x2="75" y2="175" stroke="#dc2626" stroke-width="2.5"/>
      <text x="65" y="60" font-size="8.5" font-weight="bold" fill="#dc2626" text-anchor="middle">Vạch Ném</text>

      <!-- 4 Hàng ném bóng -->
      <g fill="#1e293b">
        <circle cx="40" cy="80" r="4.5"/><circle cx="55" cy="80" r="4.5"/><circle cx="70" cy="80" r="5" fill="#f59e0b"/>
        <circle cx="40" cy="110" r="4.5"/><circle cx="55" cy="110" r="4.5"/><circle cx="70" cy="110" r="5" fill="#f59e0b"/>
        <circle cx="40" cy="140" r="4.5"/><circle cx="55" cy="140" r="4.5"/><circle cx="70" cy="140" r="5" fill="#f59e0b"/>
        <circle cx="40" cy="170" r="4.5"/><circle cx="55" cy="170" r="4.5"/><circle cx="70" cy="170" r="5" fill="#f59e0b"/>
      </g>

      <!-- Quỹ đạo ném bóng hình parabol -->
      <path d="M 75 80 Q 160 40 240 80" stroke="#16a34a" stroke-width="2" stroke-dasharray="3,2" fill="none" marker-end="url(#arrow-green)"/>
      <path d="M 75 110 Q 160 70 240 110" stroke="#16a34a" stroke-width="2" stroke-dasharray="3,2" fill="none" marker-end="url(#arrow-green)"/>
      <path d="M 75 140 Q 160 100 240 140" stroke="#16a34a" stroke-width="2" stroke-dasharray="3,2" fill="none" marker-end="url(#arrow-green)"/>
      <path d="M 75 170 Q 160 130 240 170" stroke="#16a34a" stroke-width="2" stroke-dasharray="3,2" fill="none" marker-end="url(#arrow-green)"/>

      <!-- 4 Đích ném (Rổ / Vòng tròn) cự ly 3-5m -->
      <ellipse cx="250" cy="80" rx="14" ry="9" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
      <ellipse cx="250" cy="110" rx="14" ry="9" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
      <ellipse cx="250" cy="140" rx="14" ry="9" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
      <ellipse cx="250" cy="170" rx="14" ry="9" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
      <text x="250" y="83" font-size="7.5" font-weight="bold" fill="#15803d" text-anchor="middle">Rổ 1</text>
      <text x="250" y="113" font-size="7.5" font-weight="bold" fill="#15803d" text-anchor="middle">Rổ 2</text>
      <text x="250" y="143" font-size="7.5" font-weight="bold" fill="#15803d" text-anchor="middle">Rổ 3</text>
      <text x="250" y="173" font-size="7.5" font-weight="bold" fill="#15803d" text-anchor="middle">Rổ 4</text>

      <text x="160" y="203" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#16a34a" text-anchor="middle">
        Sơ đồ: Ném bóng trúng đích (Cự ly 3 - 5m), tính điểm thi đua giữa các tổ
      </text>
    `;
  } else if (type === 'vong_tron_khoi_dong') {
    // VÒNG TRÒN KHỞI ĐỘNG CỰ LY RỘNG
    content = `
      <polygon points="160,110 152,125 168,125" fill="#dc2626" />
      <text x="160" y="137" font-family="sans-serif" font-size="9" font-weight="bold" fill="#dc2626" text-anchor="middle"> GV Trung Tâm</text>

      <circle cx="160" cy="115" r="70" fill="none" stroke="#0284c7" stroke-width="2" stroke-dasharray="5,4"/>

      <!-- 16 HS đứng đều quanh vòng tròn xoay khớp -->
      <g fill="#0284c7">
        <circle cx="160" cy="45" r="5"/><circle cx="187" cy="50" r="5"/><circle cx="210" cy="67" r="5"/><circle cx="225" cy="90" r="5"/>
        <circle cx="230" cy="115" r="5"/><circle cx="225" cy="140" r="5"/><circle cx="210" cy="163" r="5"/><circle cx="187" cy="180" r="5"/>
        <circle cx="160" cy="185" r="5"/><circle cx="133" cy="180" r="5"/><circle cx="110" cy="163" r="5"/><circle cx="95" cy="140" r="5"/>
        <circle cx="90" cy="115" r="5"/><circle cx="95" cy="90" r="5"/><circle cx="110" cy="67" r="5"/><circle cx="133" cy="50" r="5"/>
      </g>
      <!-- Mũi tên xoay vòng theo chiều kim đồng hồ -->
      <path d="M 175 46 A 70 70 0 0 1 229 100" stroke="#0369a1" stroke-width="2" fill="none" marker-end="url(#arrow)"/>
      <text x="160" y="203" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#0369a1" text-anchor="middle">
        Sơ đồ: Đội hình vòng tròn cự ly rộng xoay khớp toàn thân và chạy bước nhỏ
      </text>
    `;
  } else if (type === 'hang_doc_tap_trung') {
    // 4 HÀNG DỌC TẬP TRUNG
    content = `
      <polygon points="160,30 150,48 170,48" fill="#dc2626" />
      <text x="160" y="60" font-family="sans-serif" font-size="10" font-weight="bold" fill="#dc2626" text-anchor="middle"> GV</text>
      
      <g fill="#1e293b">
        <!-- 4 Cột dọc -->
        <circle cx="85" cy="85" r="5"/><circle cx="85" cy="105" r="5"/><circle cx="85" cy="125" r="5"/><circle cx="85" cy="145" r="5"/><circle cx="85" cy="165" r="5"/><circle cx="85" cy="185" r="5"/>
        <circle cx="135" cy="85" r="5"/><circle cx="135" cy="105" r="5"/><circle cx="135" cy="125" r="5"/><circle cx="135" cy="145" r="5"/><circle cx="135" cy="165" r="5"/><circle cx="135" cy="185" r="5"/>
        <circle cx="185" cy="85" r="5"/><circle cx="185" cy="105" r="5"/><circle cx="185" cy="125" r="5"/><circle cx="185" cy="145" r="5"/><circle cx="185" cy="165" r="5"/><circle cx="185" cy="185" r="5"/>
        <circle cx="235" cy="85" r="5"/><circle cx="235" cy="105" r="5"/><circle cx="235" cy="125" r="5"/><circle cx="235" cy="145" r="5"/><circle cx="235" cy="165" r="5"/><circle cx="235" cy="185" r="5"/>
      </g>
      <text x="85" y="74" font-size="8" font-weight="bold" fill="#475569" text-anchor="middle">Tổ 1</text>
      <text x="135" y="74" font-size="8" font-weight="bold" fill="#475569" text-anchor="middle">Tổ 2</text>
      <text x="185" y="74" font-size="8" font-weight="bold" fill="#475569" text-anchor="middle">Tổ 3</text>
      <text x="235" y="74" font-size="8" font-weight="bold" fill="#475569" text-anchor="middle">Tổ 4</text>
      <text x="160" y="204" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#1e293b" text-anchor="middle">
        Sơ đồ: Đội hình 4 hàng dọc tập trung, gióng hàng thẳng tắp
      </text>
    `;
  } else if (type === 'bac_thang_chu_u') {
    // ĐỘI HÌNH BẬC THANG HÌNH CHỮ U
    content = `
      <polygon points="160,30 150,48 170,48" fill="#dc2626" />
      <text x="160" y="58" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#dc2626" text-anchor="middle"> GV / Sân Khấu Thị Phạm</text>

      <g fill="#0284c7">
        <!-- Nhánh Trái -->
        <circle cx="65" cy="75" r="5"/><circle cx="65" cy="105" r="5"/><circle cx="65" cy="135" r="5"/><circle cx="65" cy="165" r="5"/>
        <!-- Nhánh Đáy -->
        <circle cx="100" cy="175" r="5"/><circle cx="130" cy="175" r="5"/><circle cx="160" cy="175" r="5"/><circle cx="190" cy="175" r="5"/><circle cx="220" cy="175" r="5"/>
        <!-- Nhánh Phải -->
        <circle cx="255" cy="75" r="5"/><circle cx="255" cy="105" r="5"/><circle cx="255" cy="135" r="5"/><circle cx="255" cy="165" r="5"/>
      </g>
      <text x="160" y="125" font-size="9" font-weight="bold" fill="#64748b" text-anchor="middle">Khu vực trình diễn kỹ thuật</text>
      <text x="160" y="203" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#0369a1" text-anchor="middle">
        Sơ đồ: Đội hình chữ U tập trung quan sát toàn cảnh mẫu động tác
      </text>
    `;
  } else {
    // Xuống lớp
    content = `
      <polygon points="160,35 150,52 170,52" fill="#dc2626" />
      <text x="160" y="65" font-family="sans-serif" font-size="10" font-weight="bold" fill="#dc2626" text-anchor="middle"> GV</text>
      
      <g fill="#334155">
        <circle cx="90" cy="95" r="5"/><circle cx="90" cy="115" r="5"/><circle cx="90" cy="135" r="5"/><circle cx="90" cy="155" r="5"/><circle cx="90" cy="175" r="5"/>
        <circle cx="135" cy="95" r="5"/><circle cx="135" cy="115" r="5"/><circle cx="135" cy="135" r="5"/><circle cx="135" cy="155" r="5"/><circle cx="135" cy="175" r="5"/>
        <circle cx="185" cy="95" r="5"/><circle cx="185" cy="115" r="5"/><circle cx="185" cy="135" r="5"/><circle cx="185" cy="155" r="5"/><circle cx="185" cy="175" r="5"/>
        <circle cx="230" cy="95" r="5"/><circle cx="230" cy="115" r="5"/><circle cx="230" cy="135" r="5"/><circle cx="230" cy="155" r="5"/><circle cx="230" cy="175" r="5"/>
      </g>
      <path d="M160 180 L160 195" stroke="#2563eb" stroke-width="2" marker-end="url(#arrow)"/>
      <text x="160" y="204" font-family="sans-serif" font-size="10" font-weight="600" fill="#475569" text-anchor="middle">Đội hình 4 hàng dọc giải tán, trật tự về lớp học</text>
    `;
  }

  // Tùy biến hình nền theo kiểu sân: Sân Cỏ Xanh, Sàn Gỗ Nhà Thi Đấu, hoặc Chuẩn Sư Phạm Nền Trắng
  let backgroundLayers = '';
  let titleColor = '#1e293b';
  let subtitleColor = '#64748b';

  if (theme === 'turf') {
    titleColor = '#ffffff';
    subtitleColor = '#bbf7d0';
    backgroundLayers = `
      <!-- Sân cỏ thể thao chuyên nghiệp với sọc cắt cỏ 3D -->
      <rect width="320" height="215" rx="10" fill="#15803d"/>
      <rect x="0" y="0" width="320" height="215" rx="10" fill="url(#turfPattern)" opacity="0.18"/>
      <!-- Vạch kẻ sân thi đấu thể dục màu trắng chuẩn quốc gia -->
      <rect x="12" y="32" width="296" height="170" rx="4" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-opacity="0.8"/>
      <line x1="160" y1="32" x2="160" y2="202" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.7"/>
      <circle cx="160" cy="117" r="28" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.7"/>
      <!-- Header bar mờ -->
      <rect x="0" y="0" width="320" height="28" rx="9" fill="#0f172a" fill-opacity="0.35"/>
      <line x1="0" y1="28" x2="320" y2="28" stroke="#ffffff" stroke-width="1" stroke-opacity="0.2"/>
    `;
  } else if (theme === 'court') {
    titleColor = '#ffffff';
    subtitleColor = '#fef08a';
    backgroundLayers = `
      <!-- Sàn gỗ nhà thi đấu cao cấp (Gymnasium Parquet) -->
      <rect width="320" height="215" rx="10" fill="#9a3412"/>
      <rect x="0" y="0" width="320" height="215" rx="10" fill="url(#woodGrad)"/>
      <rect x="12" y="32" width="296" height="170" rx="4" fill="none" stroke="#fef08a" stroke-width="1.8" stroke-opacity="0.85"/>
      <line x1="160" y1="32" x2="160" y2="202" stroke="#fef08a" stroke-width="1.5" stroke-opacity="0.75"/>
      <circle cx="160" cy="117" r="28" fill="none" stroke="#fef08a" stroke-width="1.5" stroke-opacity="0.75"/>
      <rect x="0" y="0" width="320" height="28" rx="9" fill="#0f172a" fill-opacity="0.4"/>
      <line x1="0" y1="28" x2="320" y2="28" stroke="#fef08a" stroke-width="1" stroke-opacity="0.3"/>
    `;
  } else {
    // Chuẩn Sư Phạm CV 5512 (Clean White)
    backgroundLayers = `
      <rect width="320" height="215" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <rect x="0" y="0" width="320" height="26" rx="9" fill="#f8fafc"/>
      <line x1="0" y1="26" x2="320" y2="26" stroke="#e2e8f0" stroke-width="1"/>
    `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="215" viewBox="0 0 320 215">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb"/>
        </marker>
        <marker id="arrow-green" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#15803d"/>
        </marker>
        <marker id="arrow-orange" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#ea580c"/>
        </marker>
        
        <pattern id="turfPattern" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="20" height="40" fill="#000000" fill-opacity="0.08"/>
          <rect x="20" width="20" height="40" fill="#ffffff" fill-opacity="0.05"/>
        </pattern>

        <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#b45309" stop-opacity="0.95"/>
          <stop offset="50%" stop-color="#d97706" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#92400e" stop-opacity="0.95"/>
        </linearGradient>

        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#000000" flood-opacity="0.25"/>
        </filter>
      </defs>
      
      ${backgroundLayers}
      <text x="12" y="18" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="${titleColor}">${escXml(title)}</text>
      <text x="308" y="18" font-family="sans-serif" font-size="9" font-weight="600" fill="${subtitleColor}" text-anchor="end">${escXml(subtitle)}</text>
      <g filter="url(#shadow)">
        ${content.replace(/ & /g, ' &amp; ').replace(/&(?!(amp|lt|gt|quot|apos);)/g, '&amp;')}
      </g>
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const standardFormationDiagrams: FormationDiagram[] = [
  {
    id: 'f_nhan_lop',
    name: 'Đội hình nhận lớp (4 hàng ngang cự ly hẹp)',
    code: 'DH_NHAN_LOP',
    phase: 'nhan_lop',
    description: 'Cán sự tập trung lớp thành 4 hàng ngang, điểm số báo cáo sĩ số cho GV.',
    svgDataUrl: createFormationSvg('SƠ ĐỒ: ĐỘI HÌNH NHẬN LỚP', 'Cự ly hẹp', 'nhan_lop')
  },
  {
    id: 'f_khoi_dong',
    name: 'Đội hình khởi động (4 hàng ngang so le 1 sải tay)',
    code: 'DH_KHOI_DONG',
    phase: 'khoi_dong',
    description: 'Giãn cách 1 sải tay so le, các khớp xoay đúng biên độ an toàn.',
    svgDataUrl: createFormationSvg('SƠ ĐỒ: ĐỘI HÌNH KHỞI ĐỘNG', 'Giãn cách 1 sải tay', 'khoi_dong')
  },
  {
    id: 'f_tap_mau',
    name: 'Đội hình quan sát tập mẫu & Tranh SGK',
    code: 'DH_TAP_MAU',
    phase: 'tap_mau',
    description: 'HS hướng lên phía trước quan sát GV thị phạm và tranh ảnh kỹ thuật.',
    svgDataUrl: createFormationSvg('SƠ ĐỒ: QUAN SÁT MẪU & TRANH SGK', 'Tập trung chú ý', 'tap_mau')
  },
  {
    id: 'f_dong_loat',
    name: 'Đội hình tập luyện đồng loạt (Cả lớp)',
    code: 'DH_DONG_LOAT',
    phase: 'dong_loat',
    description: 'Cả lớp tập đồng loạt theo nhịp hô dứt khoát của GV hoặc cán sự.',
    svgDataUrl: createFormationSvg('SƠ ĐỒ: TẬP LUYỆN ĐỒNG LOẠT', 'Đều và chuẩn nhịp', 'dong_loat')
  },
  {
    id: 'f_to_nhom',
    name: 'Đội hình tập luyện theo tổ nhóm (4 góc sân)',
    code: 'DH_TO_NHOM',
    phase: 'to_nhom',
    description: '4 tổ phân tán về 4 khu vực quy định, tổ trưởng chỉ huy, GV di chuyển uốn nắn.',
    svgDataUrl: createFormationSvg('SƠ ĐỒ: TẬP THEO TỔ NHÓM', '4 khu vực sân bãi', 'to_nhom')
  },
  {
    id: 'f_cap_doi',
    name: 'Đội hình cặp đôi đối diện sửa sai',
    code: 'DH_CAP_DOI',
    phase: 'cap_doi',
    description: 'Từng cặp đôi đứng đối diện nhau, 1 bạn tập và 1 bạn đếm nhịp góp ý sửa tư thế.',
    svgDataUrl: createFormationSvg('SƠ ĐỒ: TẬP LUYỆN CẶP ĐÔI', 'Hỗ trợ sửa sai', 'cap_doi')
  },
  {
    id: 'f_thi_dua',
    name: 'Đội hình thi đua giữa các tổ',
    code: 'DH_THI_DUA',
    phase: 'thi_dua',
    description: 'Từng tổ lần lượt lên biểu diễn, các tổ còn lại quan sát chấm điểm và cổ vũ.',
    svgDataUrl: createFormationSvg('SƠ ĐỒ: THI ĐUA GIỮA CÁC TỔ', 'Đánh giá & khen thưởng', 'thi_dua')
  },
  {
    id: 'f_tro_choi_tam_giac',
    name: 'Sơ đồ Trò chơi: Chạy theo hình tam giác (3 cọc mốc A-B-C)',
    code: 'DH_TRO_CHOI_TAM_GIAC',
    phase: 'tro_choi',
    description: '3 cọc mốc A, B, C cự ly 8-10m. Học sinh chạy vòng quanh 3 cọc theo chiều kim đồng hồ.',
    svgDataUrl: createFormationSvg('SƠ ĐỒ TRÒ CHƠI: CHẠY THEO HÌNH TAM GIÁC', '3 Cọc mốc A-B-C', 'tro_choi_tam_giac')
  },
  {
    id: 'f_tro_choi_chuyen_gay',
    name: 'Sơ đồ Trò chơi: Chuyền gậy tiếp sức (4 làn chạy)',
    code: 'DH_TRO_CHOI_CHUYEN_GAY',
    phase: 'tro_choi',
    description: '4 làn tiếp sức chạy vòng qua cọc cờ 10m và chuyền gậy cho bạn tiếp theo.',
    svgDataUrl: createFormationSvg('SƠ ĐỒ TRÒ CHƠI: CHUYỀN GẬY TIẾP SỨC', '4 Làn tiếp sức', 'tro_choi_chuyen_gay')
  },
  {
    id: 'f_tro_choi_lo_co',
    name: 'Sơ đồ Trò chơi: Nhảy lò cò tiếp sức (Vòng qua cọc mốc)',
    code: 'DH_TRO_CHOI_LO_CO',
    phase: 'tro_choi',
    description: '4 tổ nhảy lò cò qua các ô đích và vòng qua cọc mốc tiếp sức cho đồng đội.',
    svgDataUrl: createFormationSvg('SƠ ĐỒ TRÒ CHƠI: NHẢY LÒ CÒ TIẾP SỨC', 'Tiếp sức vòng cọc', 'tro_choi_lo_co_tiep_suc')
  },
  {
    id: 'f_tro_choi_meo_duoi_chuot',
    name: 'Sơ đồ Trò chơi: Mèo đuổi chuột',
    code: 'DH_TRO_CHOI_MEO_DUOI_CHUOT',
    phase: 'tro_choi',
    description: 'Vòng tròn HS giơ cao tay làm hang, Mèo luồn lách đuổi bắt Chuột.',
    svgDataUrl: createFormationSvg('SƠ ĐỒ TRÒ CHƠI: MÈO ĐUỔI CHUỘT', 'Vòng tròn tạo hang', 'tro_choi_meo_duoi_chuot')
  },
  {
    id: 'f_tro_choi_tho_nhuong_hang',
    name: 'Sơ đồ Trò chơi: Thỏ nhường hang (Đổi hang)',
    code: 'DH_TRO_CHOI_THO_NHUONG_HANG',
    phase: 'tro_choi',
    description: 'Các cụm hang thỏ 2 bạn làm vòm, các chú thỏ nhanh chóng đổi hang khi nghe hiệu lệnh.',
    svgDataUrl: createFormationSvg('SƠ ĐỒ TRÒ CHƠI: THỎ NHƯỜNG HANG', 'Cụm hang thỏ', 'tro_choi_tho_nhuong_hang')
  },
  {
    id: 'f_di_deu_vong',
    name: 'Sơ đồ Đội hình: Đi đều vòng quanh sân (Vòng phải / Vòng trái)',
    code: 'DH_DI_DEU_VONG',
    phase: 'dong_loat',
    description: '4 hàng dọc bước đều vòng theo chu vi sân bãi, thực hiện động tác vòng phải / vòng trái.',
    svgDataUrl: createFormationSvg('SƠ ĐỒ: ĐI ĐỀU VÒNG QUANH SÂN', 'Vòng phải / Vòng trái', 'di_deu_vong_quanh_san')
  },
  {
    id: 'f_the_duc_voi_gay',
    name: 'Sơ đồ Đội hình: Bài tập thể dục với gậy (Cự ly rộng 1.5m)',
    code: 'DH_THE_DUC_VOI_GAY',
    phase: 'dong_loat',
    description: '4 hàng ngang so le khoảng cách 1.5m đảm bảo biên độ vung gậy an toàn.',
    svgDataUrl: createFormationSvg('SƠ ĐỒ: BÀI TẬP THỂ DỤC VỚI GẬY', 'Giãn cách 1.5m', 'tap_the_duc_voi_gay')
  },
  {
    id: 'f_tro_choi_vong_tron',
    name: 'Sơ đồ Đội hình: Trò chơi vòng tròn vận động',
    code: 'DH_TRO_CHOI_VONG_TRON',
    phase: 'tro_choi',
    description: 'Đội hình vòng tròn tham gia trò chơi vận động vui tươi, an toàn.',
    svgDataUrl: createFormationSvg('SƠ ĐỒ: TRÒ CHƠI VẬN ĐỘNG', 'Vòng tròn an toàn', 'tro_choi_vong_tron')
  },
  {
    id: 'f_hoi_tinh',
    name: 'Đội hình hồi tĩnh (Thả lỏng toàn thân)',
    code: 'DH_HOI_TINH',
    phase: 'hoi_tinh',
    description: 'Đội hình hàng ngang thả lỏng cơ bắp, điều hòa hô hấp và lắng nghe nhận xét.',
    svgDataUrl: createFormationSvg('SƠ ĐỒ: ĐỘI HÌNH HỒI TĨNH', 'Thả lỏng sâu', 'hoi_tinh')
  },
  {
    id: 'f_tro_choi_keo_co',
    name: 'Sơ đồ Trò chơi: Kéo co đồng đội (Dây thừng & Vạch ranh giới)',
    code: 'DH_TRO_CHOI_KEO_CO',
    phase: 'tro_choi',
    description: 'Hai đội đối kháng kéo dây thừng, dải lụa đỏ qua vạch giới hạn 1m là phân định thắng thua.',
    svgDataUrl: createFormationSvg('SƠ ĐỒ TRÒ CHƠI: KÉO CO ĐỒNG ĐỘI', 'Thi đấu đối kháng', 'tro_choi_keo_co')
  },
  {
    id: 'f_tro_choi_cuop_co',
    name: 'Sơ đồ Trò chơi: Cướp cờ (Gọi số cướp cờ trung tâm)',
    code: 'DH_TRO_CHOI_CUOP_CO',
    phase: 'tro_choi',
    description: 'Hai đội đứng sau hai vạch xuất phát, nghe gọi số nào thì hai bạn lao vào vòng tròn trung tâm cướp cờ về đích.',
    svgDataUrl: createFormationSvg('SƠ ĐỒ TRÒ CHƠI: CƯỚP CỜ', 'Cờ mốc trung tâm', 'tro_choi_cuop_co')
  },
  {
    id: 'f_tro_choi_nem_bong',
    name: 'Sơ đồ Trò chơi: Ném bóng trúng đích (Rổ ném cự ly 3-5m)',
    code: 'DH_TRO_CHOI_NEM_BONG',
    phase: 'tro_choi',
    description: '4 tổ ném bóng khéo léo vào rổ hoặc vòng tròn đích cách 3 - 5m, tính điểm thi đua đồng đội.',
    svgDataUrl: createFormationSvg('SƠ ĐỒ TRÒ CHƠI: NÉM BÓNG TRÚNG ĐÍCH', 'Cự ly 3 - 5m', 'tro_choi_nem_bong')
  },
  {
    id: 'f_vong_tron_khoi_dong',
    name: 'Sơ đồ Đội hình: Vòng tròn khởi động mở rộng (GV Trung tâm)',
    code: 'DH_VONG_TRON_KHOI_DONG',
    phase: 'khoi_dong',
    description: 'Đội hình vòng tròn cự ly rộng xoay các khớp cổ tay cổ chân, chạy bước nhỏ và nâng cao đùi.',
    svgDataUrl: createFormationSvg('SƠ ĐỒ: VÒNG TRÒN KHỞI ĐỘNG', 'Xoay khớp nhịp nhàng', 'vong_tron_khoi_dong')
  },
  {
    id: 'f_hang_doc_tap_trung',
    name: 'Sơ đồ Đội hình: 4 Hàng dọc tập trung (Gióng hàng thẳng)',
    code: 'DH_HANG_DOC_TAP_TRUNG',
    phase: 'nhan_lop',
    description: '4 tổ xếp thành 4 hàng dọc thẳng tắp, cự ly 1 cánh tay.',
    svgDataUrl: createFormationSvg('SƠ ĐỒ: 4 HÀNG DỌC TẬP TRUNG', 'Gióng hàng thẳng', 'hang_doc_tap_trung')
  },
  {
    id: 'f_bac_thang_chu_u',
    name: 'Sơ đồ Đội hình: Chữ U quan sát thị phạm kỹ thuật',
    code: 'DH_BAC_THANG_CHU_U',
    phase: 'tap_mau',
    description: 'Học sinh đứng hình chữ U bao quanh sân khấu trung tâm để quan sát rõ nét từng nhịp mẫu.',
    svgDataUrl: createFormationSvg('SƠ ĐỒ: ĐỘI HÌNH HÌNH CHỮ U', 'Quan sát đa góc', 'bac_thang_chu_u')
  },
  {
    id: 'f_xuong_lop',
    name: 'Đội hình xuống lớp (Giải tán theo hàng)',
    code: 'DH_XUONG_LOP',
    phase: 'xuong_lop',
    description: 'HS theo hàng dọc trật tự di chuyển về lớp học an toàn.',
    svgDataUrl: createFormationSvg('SƠ ĐỒ: ĐỘI HÌNH XUỐNG LỚP', 'Trật tự về lớp', 'xuong_lop')
  },
  // --- BỔ SUNG CÁC SƠ ĐỒ ĐỘI HÌNH MẪU THEO YÊU CẦU ---
  {
    id: 'f_p_1_hang_doc',
    name: 'Đội hình 1 hàng dọc (Tập trung thẳng tắp)',
    code: 'DH_1_HANG_DOC',
    phase: 'dong_loat',
    description: '1 hàng dọc ở giữa sân, cán sự đứng đầu, cự ly nhìn gáy bạn trước.',
    svgDataUrl: renderFormationSvgString(formationStudioPresets.find((p) => p.id === 'p_1_hang_doc')!.elements, 'clean', 'SƠ ĐỒ: ĐỘI HÌNH 1 HÀNG DỌC', 'Gióng hàng thẳng tắp')
  },
  {
    id: 'f_p_2_hang_doc',
    name: 'Đội hình 2 hàng dọc (2 tổ song song)',
    code: 'DH_2_HANG_DOC',
    phase: 'dong_loat',
    description: '2 hàng dọc song song đối xứng, cự ly giữa 2 hàng 1.5 - 2m.',
    svgDataUrl: renderFormationSvgString(formationStudioPresets.find((p) => p.id === 'p_2_hang_doc')!.elements, 'clean', 'SƠ ĐỒ: ĐỘI HÌNH 2 HÀNG DỌC', '2 Tổ song song')
  },
  {
    id: 'f_p_3_hang_doc',
    name: 'Đội hình 3 hàng dọc (3 cột thẳng hàng)',
    code: 'DH_3_HANG_DOC',
    phase: 'dong_loat',
    description: '3 hàng dọc gióng hàng theo Tổ 1, cự ly 1 cánh tay.',
    svgDataUrl: renderFormationSvgString(formationStudioPresets.find((p) => p.id === 'p_3_hang_doc')!.elements, 'clean', 'SƠ ĐỒ: ĐỘI HÌNH 3 HÀNG DỌC', '3 Cột thẳng hàng')
  },
  {
    id: 'f_p_1_hang_ngang',
    name: 'Đội hình 1 hàng ngang (Cự ly hẹp)',
    code: 'DH_1_HANG_NGANG',
    phase: 'dong_loat',
    description: '1 hàng ngang dàn trải trước mặt GV, chống tay vào hông gióng hàng.',
    svgDataUrl: renderFormationSvgString(formationStudioPresets.find((p) => p.id === 'p_1_hang_ngang')!.elements, 'clean', 'SƠ ĐỒ: ĐỘI HÌNH 1 HÀNG NGANG', 'Cự ly hẹp')
  },
  {
    id: 'f_p_2_hang_ngang',
    name: 'Đội hình 2 hàng ngang (So le quan sát rõ)',
    code: 'DH_2_HANG_NGANG',
    phase: 'dong_loat',
    description: '2 hàng ngang so le nhau, hàng sau đứng vào khe hở hàng trước.',
    svgDataUrl: renderFormationSvgString(formationStudioPresets.find((p) => p.id === 'p_2_hang_ngang')!.elements, 'clean', 'SƠ ĐỒ: ĐỘI HÌNH 2 HÀNG NGANG SO LE', 'Quan sát rõ ràng')
  },
  {
    id: 'f_p_3_hang_ngang',
    name: 'Đội hình 3 hàng ngang (Đồng loạt theo nhịp)',
    code: 'DH_3_HANG_NGANG',
    phase: 'dong_loat',
    description: '3 hàng ngang giãn cách 1 sải tay, tập bài phát triển chung.',
    svgDataUrl: renderFormationSvgString(formationStudioPresets.find((p) => p.id === 'p_3_hang_ngang')!.elements, 'clean', 'SƠ ĐỒ: ĐỘI HÌNH 3 HÀNG NGANG', 'Đồng loạt theo nhịp')
  },
  {
    id: 'f_p_tap_ca_nhan',
    name: 'Đội hình tập cá nhân (Tự giác hoàn thiện)',
    code: 'DH_TAP_CA_NHAN',
    phase: 'dong_loat',
    description: 'Học sinh phân tán đều độc lập trên sân, không gian riêng tự kiểm soát tư thế.',
    svgDataUrl: renderFormationSvgString(formationStudioPresets.find((p) => p.id === 'p_tap_ca_nhan')!.elements, 'clean', 'SƠ ĐỒ: ĐỘI HÌNH TẬP CÁ NHÂN', 'Tự giác hoàn thiện động tác')
  },
  {
    id: 'f_p_tro_choi_tiep_suc',
    name: 'Sơ đồ Trò chơi tiếp sức (4 làn chạy + Cọc tiêu)',
    code: 'DH_TRO_CHOI_TIEP_SUC',
    phase: 'tro_choi',
    description: '4 làn chạy sau vạch xuất phát, chạy vòng qua cọc tiêu 10m về tiếp sức.',
    svgDataUrl: renderFormationSvgString(formationStudioPresets.find((p) => p.id === 'p_tro_choi_tiep_suc')!.elements, 'clean', 'SƠ ĐỒ TRÒ CHƠI TIẾP SỨC', '4 Làn chạy & Cọc mốc')
  },
  {
    id: 'f_p_tro_choi_vong_tron',
    name: 'Sơ đồ Trò chơi theo vòng tròn (GV / Bóng tâm)',
    code: 'DH_TRO_CHOI_VONG_TRON_TAM',
    phase: 'tro_choi',
    description: 'Vòng tròn 12 học sinh bao quanh tâm có bóng/cờ, di chuyển theo chiều kim đồng hồ.',
    svgDataUrl: renderFormationSvgString(formationStudioPresets.find((p) => p.id === 'p_tro_choi_vong_tron')!.elements, 'clean', 'SƠ ĐỒ TRÒ CHƠI THEO VÒNG TRÒN', 'Vận động vòng tròn')
  }
];

export function getSavedCustomFormations(): FormationDiagram[] {
  try {
    const raw = localStorage.getItem('gdtc_custom_formations');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    
    // Sanitize: ensure valid SVG data URL so broken icons never appear and ID is uniquely prefixed
    return parsed.map((item, idx) => {
      let svg = item.svgDataUrl;
      if (!svg || typeof svg !== 'string' || (!svg.startsWith('data:image/svg+xml') && !svg.startsWith('data:image/png'))) {
        svg = createFormationSvg(item.name || 'SƠ ĐỒ TỰ CHỌN', 'Tự thiết kế', 'dong_loat');
      }
      const rawId = String(item.id || `custom_${idx}_${Date.now()}`);
      const cleanId = rawId.startsWith('custom_') ? rawId : `custom_${rawId}`;
      return {
        id: cleanId,
        name: item.name || 'Sơ đồ tự thiết kế',
        code: item.code || 'DH_TU_CHON',
        phase: item.phase || 'dong_loat',
        description: item.description || 'Sơ đồ đội hình phục vụ giảng dạy GDTC.',
        svgDataUrl: svg
      } as FormationDiagram;
    });
  } catch (e) {
    return [];
  }
}

export function saveCustomFormationToStorage(formation: FormationDiagram) {
  try {
    const current = getSavedCustomFormations();
    const rawId = String(formation.id || `custom_${Date.now()}`);
    const cleanId = rawId.startsWith('custom_') ? rawId : `custom_${rawId}`;
    const cleanFormation = { ...formation, id: cleanId };
    const updated = [cleanFormation, ...current.filter((item) => item.id !== cleanId)];
    localStorage.setItem('gdtc_custom_formations', JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving custom formation:', e);
  }
}

export function deleteCustomFormationFromStorage(id: string): FormationDiagram[] {
  try {
    const current = getSavedCustomFormations();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem('gdtc_custom_formations', JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error deleting custom formation:', e);
    return [];
  }
}

export function resetCustomFormations(): void {
  try {
    localStorage.removeItem('gdtc_custom_formations');
  } catch (e) {
    console.error('Error resetting custom formations:', e);
  }
}


/**
 * Intelligent helper to match the most appropriate diagram based on Vietnamese text keywords.
 * Specifically prevents the triangle game from getting a circle diagram!
 */
export function getFormationDiagramByKeyword(text: string, defaultPhase?: string): FormationDiagram {
  const lower = (text || '').toLowerCase();

  // 1. Trò chơi tam giác (Highest priority check!)
  if (lower.includes('tam giác') || lower.includes('hình tam giác') || lower.includes('tam giac')) {
    return standardFormationDiagrams.find((f) => f.id === 'f_tro_choi_tam_giac') || standardFormationDiagrams[7];
  }

  // 1b. Trò chơi Kéo co
  if (lower.includes('kéo co') || lower.includes('keo co')) {
    return standardFormationDiagrams.find((f) => f.id === 'f_tro_choi_keo_co') || standardFormationDiagrams[7];
  }

  // 1c. Trò chơi Cướp cờ
  if (lower.includes('cướp cờ') || lower.includes('cuop co')) {
    return standardFormationDiagrams.find((f) => f.id === 'f_tro_choi_cuop_co') || standardFormationDiagrams[7];
  }

  // 1d. Trò chơi Ném bóng trúng đích
  if (lower.includes('ném bóng') || lower.includes('trúng đích') || lower.includes('nem bong')) {
    return standardFormationDiagrams.find((f) => f.id === 'f_tro_choi_nem_bong') || standardFormationDiagrams[7];
  }

  // 1e. 1 Hàng dọc
  if (lower.includes('1 hàng dọc') || lower.includes('một hàng dọc')) {
    return standardFormationDiagrams.find((f) => f.id === 'f_p_1_hang_doc') || standardFormationDiagrams[0];
  }

  // 1f. 2 Hàng dọc
  if (lower.includes('2 hàng dọc') || lower.includes('hai hàng dọc')) {
    return standardFormationDiagrams.find((f) => f.id === 'f_p_2_hang_doc') || standardFormationDiagrams[0];
  }

  // 1g. 3 Hàng dọc
  if (lower.includes('3 hàng dọc') || lower.includes('ba hàng dọc')) {
    return standardFormationDiagrams.find((f) => f.id === 'f_p_3_hang_doc') || standardFormationDiagrams[0];
  }

  // 1h. 1 Hàng ngang
  if (lower.includes('1 hàng ngang') || lower.includes('một hàng ngang')) {
    return standardFormationDiagrams.find((f) => f.id === 'f_p_1_hang_ngang') || standardFormationDiagrams[0];
  }

  // 1i. 2 Hàng ngang
  if (lower.includes('2 hàng ngang') || lower.includes('hai hàng ngang')) {
    return standardFormationDiagrams.find((f) => f.id === 'f_p_2_hang_ngang') || standardFormationDiagrams[0];
  }

  // 1j. 3 Hàng ngang
  if (lower.includes('3 hàng ngang') || lower.includes('ba hàng ngang')) {
    return standardFormationDiagrams.find((f) => f.id === 'f_p_3_hang_ngang') || standardFormationDiagrams[0];
  }

  // 1k. Cá nhân
  if (lower.includes('cá nhân') || lower.includes('tự giác') || lower.includes('độc lập')) {
    return standardFormationDiagrams.find((f) => f.id === 'f_p_tap_ca_nhan') || standardFormationDiagrams[3];
  }

  // 1l. Tiếp sức 4 làn
  if (lower.includes('tiếp sức') && (lower.includes('làn') || lower.includes('cọc tiêu') || lower.includes('chạy'))) {
    return standardFormationDiagrams.find((f) => f.id === 'f_p_tro_choi_tiep_suc') || standardFormationDiagrams[8];
  }

  // 2. Chuyền gậy tiếp sức
  if (lower.includes('chuyền gậy') || (lower.includes('gậy') && lower.includes('tiếp sức'))) {
    return standardFormationDiagrams.find((f) => f.id === 'f_tro_choi_chuyen_gay') || standardFormationDiagrams[8];
  }

  // 3. Nhảy lò cò tiếp sức
  if (lower.includes('lò cò') || lower.includes('lo co')) {
    return standardFormationDiagrams.find((f) => f.id === 'f_tro_choi_lo_co') || standardFormationDiagrams[9];
  }

  // 4. Mèo đuổi chuột
  if (lower.includes('mèo đuổi chuột') || (lower.includes('mèo') && lower.includes('chuột'))) {
    return standardFormationDiagrams.find((f) => f.id === 'f_tro_choi_meo_duoi_chuot') || standardFormationDiagrams[10];
  }

  // 5. Thỏ nhường hang / thỏ đổi hang
  if (lower.includes('thỏ') || lower.includes('nhường hang') || lower.includes('đổi hang')) {
    return standardFormationDiagrams.find((f) => f.id === 'f_tro_choi_tho_nhuong_hang') || standardFormationDiagrams[11];
  }

  // 6. Đi đều vòng quanh sân / vòng phải / vòng trái
  if (lower.includes('đi đều') && (lower.includes('vòng') || lower.includes('quanh sân'))) {
    return standardFormationDiagrams.find((f) => f.id === 'f_di_deu_vong') || standardFormationDiagrams[12];
  }

  // 7. Bài tập với gậy
  if (lower.includes('với gậy') || lower.includes('gậy thể dục')) {
    return standardFormationDiagrams.find((f) => f.id === 'f_the_duc_voi_gay') || standardFormationDiagrams[13];
  }

  // 8. Trò chơi chung (vòng tròn)
  if (lower.includes('trò chơi') || lower.includes('vòng tròn') || lower.includes('làm theo hiệu lệnh')) {
    return standardFormationDiagrams.find((f) => f.id === 'f_tro_choi_vong_tron') || standardFormationDiagrams[14];
  }

  // 9. Cặp đôi
  if (lower.includes('cặp đôi') || lower.includes('đối diện')) {
    return standardFormationDiagrams.find((f) => f.id === 'f_cap_doi') || standardFormationDiagrams[5];
  }

  // 10. Tổ nhóm
  if (lower.includes('tổ nhóm') || lower.includes('theo tổ') || lower.includes('4 tổ')) {
    return standardFormationDiagrams.find((f) => f.id === 'f_to_nhom') || standardFormationDiagrams[4];
  }

  // 11. Thi đua
  if (lower.includes('thi đua') || lower.includes('trình diễn') || lower.includes('biểu diễn')) {
    return standardFormationDiagrams.find((f) => f.id === 'f_thi_dua') || standardFormationDiagrams[6];
  }

  // 12. Hồi tĩnh / thả lỏng
  if (lower.includes('hồi tĩnh') || lower.includes('thả lỏng') || lower.includes('vận dụng')) {
    return standardFormationDiagrams.find((f) => f.id === 'f_hoi_tinh') || standardFormationDiagrams[15];
  }

  // 13. Khởi động
  if (lower.includes('khởi động')) {
    return standardFormationDiagrams.find((f) => f.id === 'f_khoi_dong') || standardFormationDiagrams[1];
  }

  // 14. Nhận lớp
  if (lower.includes('nhận lớp') || lower.includes('mở đầu')) {
    return standardFormationDiagrams.find((f) => f.id === 'f_nhan_lop') || standardFormationDiagrams[0];
  }

  // 15. Fallback based on phase
  if (defaultPhase) {
    const byPhase = standardFormationDiagrams.find((f) => f.phase === defaultPhase);
    if (byPhase) return byPhase;
  }

  return standardFormationDiagrams[0];
}
