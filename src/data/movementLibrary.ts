export interface MovementTechnicalItem {
  id: string;
  name: string;
  grade: number;
  keywords: string[];
  category: 'dong_tac_moi' | 'on_luyen' | 'tro_choi' | 'van_dung';
  cues: string[];
  commonErrors: string[];
  svgDataUrl: string;
  defaultLvd: string;
  gvExplanation: string;
  hsTask: string;
}

export function generateMovementSvg(title: string, subtitle: string, type: string): string {
  let figure = '';

  // Realistic athletic student figure colors:
  // Skin tone: #fbcfe8 / #fed7aa
  // Uniform shirt: #2563eb (Royal Blue) with white trim
  // Shorts: #1e3a8a (Navy) with white stripe
  // Shoes: #ffffff with #dc2626 accents and dark rubber sole
  // Hair: #1e293b (Dark slate)

  if (type === 'vuon_tho') {
    // Vươn thở: Thân người vươn cao, ngực căng, 2 tay chữ V hướng lên trời, đầu ngửa nhẹ
    figure = `
      <!-- Dynamic Exercise Glow / Aura -->
      <ellipse cx="160" cy="135" rx="75" ry="90" fill="#e0f2fe" opacity="0.6"/>
      
      <!-- Inhale Breath Effect -->
      <path d="M140 68 Q160 48 180 68" stroke="#0284c7" stroke-width="2.5" stroke-dasharray="3,3" fill="none"/>
      <path d="M135 62 Q160 38 185 62" stroke="#38bdf8" stroke-width="2" stroke-dasharray="2,2" fill="none"/>
      <text x="160" y="44" font-family="sans-serif" font-size="9" font-weight="bold" fill="#0284c7" text-anchor="middle">HÍT VÀO SÂU BẰNG MŨI</text>

      <!-- Athlete Body -->
      <!-- Left Leg (Spread) -->
      <path d="M152 145 L130 185 L126 218" stroke="#fed7aa" stroke-width="13" stroke-linecap="round"/>
      <!-- Right Leg (Spread) -->
      <path d="M168 145 L190 185 L194 218" stroke="#fed7aa" stroke-width="13" stroke-linecap="round"/>
      <!-- Navy Shorts -->
      <path d="M142 135 L178 135 L186 160 L166 162 L160 148 L154 162 L134 160 Z" fill="#1e3a8a"/>
      <line x1="135" y1="140" x2="135" y2="158" stroke="#ffffff" stroke-width="2"/>
      <line x1="185" y1="140" x2="185" y2="158" stroke="#ffffff" stroke-width="2"/>
      <!-- Athletic Shoes -->
      <path d="M116 218 L136 218 L134 226 L114 226 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
      <rect x="114" y="224" width="22" height="3" fill="#dc2626"/>
      <path d="M184 218 L204 218 L206 226 L186 226 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
      <rect x="184" y="224" width="22" height="3" fill="#dc2626"/>

      <!-- Torso / PE Shirt (Vươn căng ngực) -->
      <path d="M146 95 L174 95 L176 138 L144 138 Z" fill="#2563eb" rx="4"/>
      <!-- Collar / Stripe -->
      <path d="M154 95 L160 106 L166 95" stroke="#ffffff" stroke-width="2" fill="none"/>
      
      <!-- Arms V-shaped upward (Vươn chếch chữ V) -->
      <!-- Left Arm -->
      <path d="M146 100 L115 65 L98 42" stroke="#fed7aa" stroke-width="11" stroke-linecap="round"/>
      <!-- Blue sleeve -->
      <path d="M148 98 L132 82" stroke="#2563eb" stroke-width="13" stroke-linecap="round"/>
      <!-- Left Hand open palm -->
      <circle cx="96" cy="40" r="5" fill="#fed7aa"/>
      
      <!-- Right Arm -->
      <path d="M174 100 L205 65 L222 42" stroke="#fed7aa" stroke-width="11" stroke-linecap="round"/>
      <!-- Blue sleeve -->
      <path d="M172 98 L188 82" stroke="#2563eb" stroke-width="13" stroke-linecap="round"/>
      <!-- Right Hand open palm -->
      <circle cx="224" cy="40" r="5" fill="#fed7aa"/>

      <!-- Neck & Head (Tilted slightly back) -->
      <rect x="156" y="86" width="8" height="10" fill="#fed7aa"/>
      <ellipse cx="160" cy="74" rx="12" ry="14" fill="#fed7aa"/>
      <!-- Hair -->
      <path d="M148 70 Q160 56 172 70 Q172 60 160 58 Q148 60 148 70 Z" fill="#1e293b"/>
      <!-- Eye / Brow tilted up -->
      <line x1="162" y1="70" x2="167" y2="68" stroke="#1e293b" stroke-width="1.5"/>
      <ellipse cx="165" cy="73" rx="1.5" ry="1.5" fill="#1e293b"/>
    `;
  } else if (type === 'tay') {
    // Động tác tay: Hai tay dang ngang bằng vai, lòng bàn tay ngửa, ngực ưỡn thẳng
    figure = `
      <ellipse cx="160" cy="135" rx="85" ry="85" fill="#ecfdf5" opacity="0.6"/>
      <text x="160" y="48" font-family="sans-serif" font-size="9" font-weight="bold" fill="#059669" text-anchor="middle">HAI TAY DANG NGANG · LÒNG BÀN TAY NGỬA</text>

      <!-- Legs (Đứng thẳng, chân mở bằng vai) -->
      <path d="M152 145 L144 185 L142 218" stroke="#fed7aa" stroke-width="13" stroke-linecap="round"/>
      <path d="M168 145 L176 185 L178 218" stroke="#fed7aa" stroke-width="13" stroke-linecap="round"/>
      <!-- Navy Shorts -->
      <path d="M142 135 L178 135 L182 160 L164 162 L160 148 L156 162 L138 160 Z" fill="#1e3a8a"/>
      <!-- Shoes -->
      <path d="M132 218 L152 218 L150 226 L130 226 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
      <rect x="130" y="224" width="22" height="3" fill="#10b981"/>
      <path d="M168 218 L188 218 L190 226 L170 226 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
      <rect x="168" y="224" width="22" height="3" fill="#10b981"/>

      <!-- Torso -->
      <path d="M146 95 L174 95 L175 138 L145 138 Z" fill="#2563eb"/>
      <path d="M154 95 L160 106 L166 95" stroke="#ffffff" stroke-width="2" fill="none"/>

      <!-- Left Arm Extended Horizontally -->
      <path d="M146 100 L105 100 L68 100" stroke="#fed7aa" stroke-width="11" stroke-linecap="round"/>
      <path d="M148 100 L130 100" stroke="#2563eb" stroke-width="13" stroke-linecap="round"/>
      <!-- Left Hand (Palm Up) -->
      <path d="M68 96 L58 96 Q56 100 60 103 L68 103 Z" fill="#fed7aa"/>
      
      <!-- Right Arm Extended Horizontally -->
      <path d="M174 100 L215 100 L252 100" stroke="#fed7aa" stroke-width="11" stroke-linecap="round"/>
      <path d="M172 100 L190 100" stroke="#2563eb" stroke-width="13" stroke-linecap="round"/>
      <!-- Right Hand (Palm Up) -->
      <path d="M252 96 L262 96 Q264 100 260 103 L252 103 Z" fill="#fed7aa"/>

      <!-- Direction arrow for clapping rhythm -->
      <path d="M75 88 Q110 72 145 88" stroke="#10b981" stroke-width="2" stroke-dasharray="3,3" fill="none"/>
      <path d="M245 88 Q210 72 175 88" stroke="#10b981" stroke-width="2" stroke-dasharray="3,3" fill="none"/>

      <!-- Head & Face -->
      <rect x="156" y="84" width="8" height="12" fill="#fed7aa"/>
      <ellipse cx="160" cy="72" rx="12" ry="14" fill="#fed7aa"/>
      <path d="M148 68 Q160 56 172 68 Q172 58 160 56 Q148 58 148 68 Z" fill="#1e293b"/>
      <ellipse cx="157" cy="71" rx="1.5" ry="1.5" fill="#1e293b"/>
      <ellipse cx="163" cy="71" rx="1.5" ry="1.5" fill="#1e293b"/>
      <path d="M157 78 Q160 81 163 78" stroke="#1e293b" stroke-width="1.2" fill="none"/>
    `;
  } else if (type === 'chan') {
    // Động tác chân: Kiễng gót, khuỵu gối sâu, hai tay chống hông, lưng thẳng
    figure = `
      <ellipse cx="160" cy="145" rx="80" ry="75" fill="#fef3c7" opacity="0.6"/>
      <text x="160" y="48" font-family="sans-serif" font-size="9" font-weight="bold" fill="#b45309" text-anchor="middle">KIỄNG GÓT · KHUỴU GỐI · LƯNG THẲNG</text>

      <!-- Bent Knees (Khuỵu gối 90 - 120 độ) -->
      <!-- Left Leg -->
      <path d="M150 148 L122 175 L140 216" stroke="#fed7aa" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- Right Leg -->
      <path d="M170 148 L198 175 L180 216" stroke="#fed7aa" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- Shorts -->
      <path d="M140 138 L180 138 L188 162 L164 163 L160 150 L156 163 L132 162 Z" fill="#1e3a8a"/>
      <!-- Raised heels (Kiễng gót) -->
      <path d="M136 216 L148 214 L142 224 L132 222 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
      <path d="M174 214 L186 216 L190 222 L180 224 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>

      <!-- Torso Straight -->
      <path d="M146 96 L174 96 L175 140 L145 140 Z" fill="#2563eb"/>
      <path d="M154 96 L160 107 L166 96" stroke="#ffffff" stroke-width="2" fill="none"/>

      <!-- Hands on Hips (Tay chống hông) -->
      <!-- Left Arm bent -->
      <path d="M146 102 L120 120 L144 135" stroke="#fed7aa" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M148 102 L132 113" stroke="#2563eb" stroke-width="13" stroke-linecap="round"/>
      <circle cx="144" cy="135" r="5" fill="#fed7aa"/>
      
      <!-- Right Arm bent -->
      <path d="M174 102 L200 120 L176 135" stroke="#fed7aa" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M172 102 L188 113" stroke="#2563eb" stroke-width="13" stroke-linecap="round"/>
      <circle cx="176" cy="135" r="5" fill="#fed7aa"/>

      <!-- Head & Face -->
      <rect x="156" y="86" width="8" height="12" fill="#fed7aa"/>
      <ellipse cx="160" cy="74" rx="12" ry="14" fill="#fed7aa"/>
      <path d="M148 70 Q160 58 172 70 Q172 60 160 58 Q148 60 148 70 Z" fill="#1e293b"/>
      <ellipse cx="157" cy="73" rx="1.5" ry="1.5" fill="#1e293b"/>
      <ellipse cx="163" cy="73" rx="1.5" ry="1.5" fill="#1e293b"/>
      <path d="M157 80 Q160 83 163 80" stroke="#1e293b" stroke-width="1.2" fill="none"/>
    `;
  } else if (type === 'di_deu') {
    // Khối 3: Đi đều, đứng lại (Chân trái bước nhịp 1 - tay phải gập vuông góc trước ngực)
    figure = `
      <ellipse cx="160" cy="135" rx="80" ry="85" fill="#eff6ff" opacity="0.6"/>
      <text x="160" y="46" font-family="sans-serif" font-size="9" font-weight="bold" fill="#1d4ed8" text-anchor="middle">NHỊP 1: CHÂN TRÁI BƯỚC · TAY PHẢI ĐÁNH TRƯỚC</text>

      <!-- Marching Legs -->
      <!-- Left Leg (Stepping forward with heel strike 45 deg) -->
      <path d="M152 142 L184 175 L205 212" stroke="#fed7aa" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- Right Leg (Back leg supporting) -->
      <path d="M166 142 L140 180 L132 216" stroke="#fed7aa" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- Shorts with movement crease -->
      <path d="M144 135 L176 135 L186 160 L166 162 L158 150 L146 162 L136 158 Z" fill="#1e3a8a"/>
      <line x1="138" y1="138" x2="138" y2="156" stroke="#ffffff" stroke-width="2"/>
      <!-- Shoes in marching stride -->
      <path d="M198 210 L218 206 L216 215 L196 218 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
      <rect x="198" y="212" width="20" height="3" fill="#2563eb" transform="rotate(-12 198 212)"/>
      <path d="M122 216 L142 216 L140 224 L120 224 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>

      <!-- Torso in profile Marching -->
      <path d="M148 94 L174 94 L172 138 L146 138 Z" fill="#2563eb"/>

      <!-- Right Arm bent 90 deg forward (Tay phải gập vuông góc trước ngực) -->
      <path d="M168 98 L196 114 L180 126" stroke="#fed7aa" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M166 98 L180 108" stroke="#2563eb" stroke-width="13" stroke-linecap="round"/>
      <!-- Right Hand fist -->
      <circle cx="180" cy="126" r="5.5" fill="#fed7aa"/>

      <!-- Left Arm extended backward (Tay trái đánh thẳng ra sau) -->
      <path d="M150 98 L122 118 L105 132" stroke="#fed7aa" stroke-width="11" stroke-linecap="round"/>
      <path d="M152 98 L136 110" stroke="#2563eb" stroke-width="13" stroke-linecap="round"/>
      <!-- Left Hand fist -->
      <circle cx="104" cy="133" r="5.5" fill="#fed7aa"/>

      <!-- Marching cadence arrows -->
      <path d="M190 190 Q215 195 210 205" stroke="#2563eb" stroke-width="2" fill="none" marker-end="url(#marr)"/>

      <!-- Head & Cap/Hair (Eyes looking straight ahead) -->
      <rect x="156" y="84" width="8" height="12" fill="#fed7aa"/>
      <ellipse cx="162" cy="72" rx="12" ry="14" fill="#fed7aa"/>
      <path d="M150 68 Q162 56 174 68 Q174 58 162 56 Q150 58 150 68 Z" fill="#1e293b"/>
      <ellipse cx="168" cy="71" rx="1.5" ry="1.5" fill="#1e293b"/>
    `;
  } else if (type === 'gay_the_duc') {
    // Khối 5: Bài tập thể dục với gậy (Hai tay cầm gậy thẳng đưa qua đầu, tư thế đẹp)
    figure = `
      <ellipse cx="160" cy="135" rx="85" ry="90" fill="#f0fdf4" opacity="0.6"/>
      <text x="160" y="44" font-family="sans-serif" font-size="9" font-weight="bold" fill="#15803d" text-anchor="middle">HAI TAY NÂNG GẬY THỂ DỤC THẲNG QUA ĐẦU</text>

      <!-- Realistic Gym Stick (Gậy thể dục sơn nhẵn bóng màu vàng gỗ/cam) -->
      <rect x="65" y="48" width="190" height="9" rx="4.5" fill="#d97706" stroke="#b45309" stroke-width="1.5"/>
      <line x1="75" y1="52" x2="245" y2="52" stroke="#fef08a" stroke-width="1.5" opacity="0.7"/>

      <!-- Straight Legs -->
      <path d="M152 145 L144 185 L142 218" stroke="#fed7aa" stroke-width="13" stroke-linecap="round"/>
      <path d="M168 145 L176 185 L178 218" stroke="#fed7aa" stroke-width="13" stroke-linecap="round"/>
      <!-- Shorts -->
      <path d="M142 135 L178 135 L182 160 L164 162 L160 148 L156 162 L138 160 Z" fill="#1e3a8a"/>
      <!-- Shoes -->
      <path d="M132 218 L152 218 L150 226 L130 226 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
      <rect x="130" y="224" width="22" height="3" fill="#16a34a"/>
      <path d="M168 218 L188 218 L190 226 L170 226 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
      <rect x="168" y="224" width="22" height="3" fill="#16a34a"/>

      <!-- Torso Straight -->
      <path d="M146 95 L174 95 L175 138 L145 138 Z" fill="#2563eb"/>
      <path d="M154 95 L160 106 L166 95" stroke="#ffffff" stroke-width="2" fill="none"/>

      <!-- Both Arms Reaching Upwards holding the Stick -->
      <!-- Left Arm -->
      <path d="M146 100 L122 75 L105 54" stroke="#fed7aa" stroke-width="11" stroke-linecap="round"/>
      <path d="M148 98 L134 82" stroke="#2563eb" stroke-width="13" stroke-linecap="round"/>
      <!-- Left Hand wrapping around stick -->
      <ellipse cx="104" cy="52" rx="5" ry="6" fill="#fed7aa"/>
      
      <!-- Right Arm -->
      <path d="M174 100 L198 75 L215 54" stroke="#fed7aa" stroke-width="11" stroke-linecap="round"/>
      <path d="M172 98 L186 82" stroke="#2563eb" stroke-width="13" stroke-linecap="round"/>
      <!-- Right Hand wrapping around stick -->
      <ellipse cx="216" cy="52" rx="5" ry="6" fill="#fed7aa"/>

      <!-- Head & Face (Looking forward slightly up) -->
      <rect x="156" y="84" width="8" height="12" fill="#fed7aa"/>
      <ellipse cx="160" cy="72" rx="12" ry="14" fill="#fed7aa"/>
      <path d="M148 68 Q160 56 172 68 Q172 58 160 56 Q148 58 148 68 Z" fill="#1e293b"/>
      <ellipse cx="157" cy="71" rx="1.5" ry="1.5" fill="#1e293b"/>
      <ellipse cx="163" cy="71" rx="1.5" ry="1.5" fill="#1e293b"/>
    `;
  } else if (type === 'bung') {
    // Động tác bụng: Cúi gập thân người sâu, tay hướng mũi chân, chân thẳng
    figure = `
      <ellipse cx="150" cy="150" rx="75" ry="70" fill="#faf5ff" opacity="0.6"/>
      <text x="160" y="48" font-family="sans-serif" font-size="9" font-weight="bold" fill="#7c3aed" text-anchor="middle">CÚI GẬP THÂN SÂU · TAY CHẠM MŨI CHÂN</text>

      <!-- Straight Legs planted -->
      <path d="M170 140 L168 180 L166 218" stroke="#fed7aa" stroke-width="13" stroke-linecap="round"/>
      <path d="M182 140 L180 180 L178 218" stroke="#fed7aa" stroke-width="13" stroke-linecap="round"/>
      <!-- Shorts -->
      <path d="M160 135 L190 135 L188 160 L162 160 Z" fill="#1e3a8a"/>
      <!-- Shoes -->
      <path d="M156 218 L186 218 L184 226 L154 226 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>

      <!-- Bending Torso (Gập xuống phía trước) -->
      <path d="M164 135 L125 125 L120 148 L160 152 Z" fill="#2563eb"/>
      
      <!-- Arms reaching toward toes -->
      <path d="M125 130 L130 175 L145 210" stroke="#fed7aa" stroke-width="11" stroke-linecap="round"/>
      <circle cx="145" cy="212" r="5" fill="#fed7aa"/>

      <!-- Head downward -->
      <ellipse cx="108" cy="138" rx="12" ry="13" fill="#fed7aa"/>
      <path d="M102 128 Q115 125 118 138 Q108 145 102 128 Z" fill="#1e293b"/>
    `;
  } else if (type === 'nhay') {
    // Động tác nhảy: Bật nhảy tách hai chân sang ngang, hai tay vỗ trên đỉnh đầu
    figure = `
      <ellipse cx="160" cy="135" rx="80" ry="85" fill="#fef2f2" opacity="0.6"/>
      <text x="160" y="44" font-family="sans-serif" font-size="9" font-weight="bold" fill="#dc2626" text-anchor="middle">BẬT NHẢY TÁCH CHÂN · VỖ TAY TRÊN ĐẦU</text>
      <!-- Jump motion lines -->
      <path d="M110 230 L105 240 M135 232 L130 242 M185 232 L190 242 M210 230 L215 240" stroke="#f87171" stroke-width="2" stroke-linecap="round"/>
      <!-- Legs spread wide in jump -->
      <path d="M150 145 L125 180 L112 215" stroke="#fed7aa" stroke-width="13" stroke-linecap="round"/>
      <path d="M170 145 L195 180 L208 215" stroke="#fed7aa" stroke-width="13" stroke-linecap="round"/>
      <!-- Shorts -->
      <path d="M138 135 L182 135 L192 160 L168 162 L160 148 L152 162 L128 160 Z" fill="#1e3a8a"/>
      <!-- Athletic Shoes pointing down -->
      <path d="M102 215 L122 215 L120 223 L100 223 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
      <rect x="100" y="221" width="22" height="3" fill="#dc2626"/>
      <path d="M198 215 L218 215 L220 223 L200 223 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
      <rect x="198" y="221" width="22" height="3" fill="#dc2626"/>
      <!-- Torso -->
      <path d="M146 95 L174 95 L176 138 L144 138 Z" fill="#2563eb" rx="4"/>
      <!-- Arms raised up clapping hands above head -->
      <path d="M146 100 L130 65 L150 35" stroke="#fed7aa" stroke-width="11" stroke-linecap="round"/>
      <path d="M174 100 L190 65 L170 35" stroke="#fed7aa" stroke-width="11" stroke-linecap="round"/>
      <!-- Clapping spark -->
      <circle cx="160" cy="33" r="6" fill="#fef08a" stroke="#eab308" stroke-width="1.5"/>
      <!-- Head -->
      <rect x="156" y="84" width="8" height="12" fill="#fed7aa"/>
      <ellipse cx="160" cy="72" rx="12" ry="14" fill="#fed7aa"/>
      <path d="M148 68 Q160 56 172 68 Q172 58 160 56 Q148 58 148 68 Z" fill="#1e293b"/>
    `;
  } else if (type === 'tung_bong') {
    // Tung và bắt bóng: Hai tay nâng đón quả bóng cam, thân người nhún nhẹ
    figure = `
      <ellipse cx="160" cy="140" rx="80" ry="85" fill="#fff7ed" opacity="0.6"/>
      <text x="160" y="44" font-family="sans-serif" font-size="9" font-weight="bold" fill="#c2410c" text-anchor="middle">TUNG & ĐÓN BẮT BÓNG BẰNG HAI TAY</text>
      <!-- Basketball floating above -->
      <circle cx="160" cy="55" r="16" fill="#ea580c" stroke="#9a3412" stroke-width="2"/>
      <path d="M144 55 Q160 48 176 55 M144 55 Q160 62 176 55 M160 39 L160 71" stroke="#431407" stroke-width="1.2" fill="none"/>
      <!-- Trajectory dashed arc -->
      <path d="M142 90 Q145 65 152 56" stroke="#ea580c" stroke-width="2" stroke-dasharray="3,3" fill="none"/>
      <path d="M178 90 Q175 65 168 56" stroke="#ea580c" stroke-width="2" stroke-dasharray="3,3" fill="none"/>
      <!-- Legs slightly bent in ready position -->
      <path d="M152 145 L138 185 L136 218" stroke="#fed7aa" stroke-width="13" stroke-linecap="round"/>
      <path d="M168 145 L182 185 L184 218" stroke="#fed7aa" stroke-width="13" stroke-linecap="round"/>
      <path d="M140 135 L180 135 L184 160 L164 162 L160 148 L156 162 L136 160 Z" fill="#1e3a8a"/>
      <!-- Athletic Shoes -->
      <path d="M126 218 L146 218 L144 226 L124 226 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
      <rect x="124" y="224" width="22" height="3" fill="#ea580c"/>
      <path d="M174 218 L194 218 L196 226 L176 226 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
      <rect x="174" y="224" width="22" height="3" fill="#ea580c"/>
      <!-- Torso -->
      <path d="M146 95 L174 95 L175 138 L145 138 Z" fill="#2563eb"/>
      <!-- Both Arms raised to catch ball -->
      <path d="M146 100 L132 80 L146 68" stroke="#fed7aa" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M174 100 L188 80 L174 68" stroke="#fed7aa" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- Head -->
      <rect x="156" y="84" width="8" height="12" fill="#fed7aa"/>
      <ellipse cx="160" cy="72" rx="12" ry="14" fill="#fed7aa"/>
      <path d="M148 68 Q160 56 172 68 Q172 58 160 56 Q148 58 148 68 Z" fill="#1e293b"/>
      <ellipse cx="160" cy="69" rx="1.5" ry="1.5" fill="#1e293b"/>
    `;
  } else if (type === 'dan_bong') {
    // Dẫn bóng: Khom người, 1 tay đập nhồi bóng xuống sân
    figure = `
      <ellipse cx="160" cy="145" rx="85" ry="75" fill="#fff7ed" opacity="0.6"/>
      <text x="160" y="44" font-family="sans-serif" font-size="9" font-weight="bold" fill="#ea580c" text-anchor="middle">KỸ THUẬT DẪN BÓNG BẰNG CÁC NGÓN TAY</text>
      <!-- Basketball on floor bouncing -->
      <circle cx="215" cy="190" r="15" fill="#ea580c" stroke="#9a3412" stroke-width="2"/>
      <path d="M200 190 Q215 183 230 190 M200 190 Q215 197 230 190 M215 175 L215 205" stroke="#431407" stroke-width="1.2" fill="none"/>
      <!-- Bounce lines -->
      <path d="M215 208 L215 220 M207 215 L203 222 M223 215 L227 222" stroke="#ea580c" stroke-width="1.8"/>
      <!-- Legs staggered knees bent -->
      <path d="M145 145 L125 178 L115 218" stroke="#fed7aa" stroke-width="13" stroke-linecap="round"/>
      <path d="M165 145 L175 180 L185 218" stroke="#fed7aa" stroke-width="13" stroke-linecap="round"/>
      <path d="M135 138 L175 138 L182 165 L160 166 L154 150 L145 166 L125 162 Z" fill="#1e3a8a"/>
      <!-- Shoes -->
      <path d="M105 218 L125 218 L123 226 L103 226 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
      <path d="M175 218 L195 218 L197 226 L177 226 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
      <!-- Torso inclined forward -->
      <path d="M142 98 L170 102 L165 145 L138 142 Z" fill="#2563eb"/>
      <!-- Left arm guarding -->
      <path d="M142 102 L118 115 L125 135" stroke="#fed7aa" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- Right arm pushing ball down -->
      <path d="M168 105 L195 135 L212 165" stroke="#fed7aa" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="213" cy="168" rx="6" ry="4" fill="#fed7aa"/>
      <!-- Head looking forward -->
      <rect x="156" y="86" width="8" height="12" fill="#fed7aa"/>
      <ellipse cx="162" cy="74" rx="12" ry="14" fill="#fed7aa"/>
      <path d="M150 70 Q162 58 174 70 Q174 60 162 58 Q150 60 150 70 Z" fill="#1e293b"/>
      <ellipse cx="168" cy="73" rx="1.5" ry="1.5" fill="#1e293b"/>
    `;
  } else if (type === 'boi_truon_sap') {
    // Bơi trườn sấp: Nằm ngang trong làn nước xanh, tay quạt nước, chân đập
    figure = `
      <rect x="20" y="110" width="280" height="90" rx="8" fill="#e0f2fe" opacity="0.7"/>
      <text x="160" y="44" font-family="sans-serif" font-size="9" font-weight="bold" fill="#0284c7" text-anchor="middle">KỸ THUẬT BƠI TRƯỜN SẤP HOÀN CHỈNH</text>
      <!-- Water waves -->
      <path d="M25 130 Q50 120 75 130 T125 130 T175 130 T225 130 T275 130" stroke="#0284c7" stroke-width="2.5" fill="none"/>
      <path d="M20 165 Q45 155 70 165 T120 165 T170 165 T220 165 T270 165" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4,3" fill="none"/>
      <!-- Swimmer body horizontal -->
      <!-- Legs kicking -->
      <path d="M85 142 L55 136 L30 132" stroke="#fed7aa" stroke-width="11" stroke-linecap="round"/>
      <path d="M85 146 L55 154 L30 160" stroke="#fed7aa" stroke-width="11" stroke-linecap="round"/>
      <!-- Swim trunks -->
      <path d="M80 136 L115 138 L112 152 L78 150 Z" fill="#1e3a8a"/>
      <!-- Torso -->
      <path d="M112 138 L170 136 L168 150 L110 152 Z" fill="#2563eb"/>
      <!-- Recovery Arm over water -->
      <path d="M165 136 L185 110 L220 115" stroke="#fed7aa" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- Pull Arm under water -->
      <path d="M165 148 L185 165 L210 155" stroke="#fed7aa" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- Head with swim cap & goggles -->
      <ellipse cx="178" cy="138" rx="10" ry="9" fill="#0284c7"/>
      <rect x="180" y="135" width="6" height="4" rx="2" fill="#0f172a"/>
    `;
  } else if (type === 'dung_nghiem_nghi') {
    // Đứng nghiêm, đứng nghỉ: Đội hình đội ngũ chuẩn
    figure = `
      <ellipse cx="160" cy="140" rx="75" ry="80" fill="#f1f5f9" opacity="0.7"/>
      <text x="160" y="44" font-family="sans-serif" font-size="9" font-weight="bold" fill="#0f172a" text-anchor="middle">TƯ THẾ ĐỨNG NGHIÊM · TƯ THẾ ĐỨNG NGHỈ</text>
      <!-- Feet V-shape (Gót chạm nhau, mũi mở 45-60 độ) -->
      <path d="M145 218 L160 218 L152 225 L137 225 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
      <rect x="137" y="222" width="22" height="3" fill="#2563eb"/>
      <path d="M160 218 L175 218 L183 225 L168 225 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
      <rect x="161" y="222" width="22" height="3" fill="#2563eb"/>
      <!-- Straight Legs together -->
      <path d="M152 145 L152 185 L152 218" stroke="#fed7aa" stroke-width="13" stroke-linecap="round"/>
      <path d="M168 145 L168 185 L168 218" stroke="#fed7aa" stroke-width="13" stroke-linecap="round"/>
      <path d="M142 135 L178 135 L180 160 L140 160 Z" fill="#1e3a8a"/>
      <!-- Torso Straight, Chest out -->
      <path d="M146 95 L174 95 L175 138 L145 138 Z" fill="#2563eb"/>
      <path d="M154 95 L160 106 L166 95" stroke="#ffffff" stroke-width="2" fill="none"/>
      <!-- Arms straight down at sides, fingers lightly curled -->
      <path d="M146 98 L136 125 L135 152" stroke="#fed7aa" stroke-width="11" stroke-linecap="round"/>
      <path d="M148 98 L138 115" stroke="#2563eb" stroke-width="13" stroke-linecap="round"/>
      <path d="M174 98 L184 125 L185 152" stroke="#fed7aa" stroke-width="11" stroke-linecap="round"/>
      <path d="M172 98 L182 115" stroke="#2563eb" stroke-width="13" stroke-linecap="round"/>
      <!-- Head upright looking straight -->
      <rect x="156" y="84" width="8" height="12" fill="#fed7aa"/>
      <ellipse cx="160" cy="72" rx="12" ry="14" fill="#fed7aa"/>
      <path d="M148 68 Q160 56 172 68 Q172 58 160 56 Q148 58 148 68 Z" fill="#1e293b"/>
      <ellipse cx="157" cy="72" rx="1.5" ry="1.5" fill="#1e293b"/>
      <ellipse cx="163" cy="72" rx="1.5" ry="1.5" fill="#1e293b"/>
    `;
  } else if (type === 'lan_lon') {
    // Động tác lăn, lộn xuôi: Đệm thể dục màu xanh
    figure = `
      <rect x="30" y="180" width="260" height="24" rx="4" fill="#10b981" stroke="#059669" stroke-width="1.5"/>
      <text x="160" y="44" font-family="sans-serif" font-size="9" font-weight="bold" fill="#047857" text-anchor="middle">KỸ THUẬT LỘN XUÔI VÀ LĂN TRÊN ĐỆM THỂ DỤC</text>
      <!-- Circular rolling arrow -->
      <path d="M130 110 A 35 35 0 1 1 190 150" stroke="#059669" stroke-width="2.5" stroke-dasharray="4,3" fill="none"/>
      <!-- Gymnast curled into ball -->
      <circle cx="160" cy="145" r="28" fill="#2563eb" opacity="0.9"/>
      <circle cx="178" cy="132" r="11" fill="#fed7aa"/>
      <path d="M172 124 Q182 118 188 128 Z" fill="#1e293b"/>
      <!-- Curled legs & arms -->
      <path d="M142 155 Q135 135 155 130" stroke="#fed7aa" stroke-width="9" stroke-linecap="round" fill="none"/>
    `;
  } else if (type === 'chieu_ngang_vat') {
    // Đi vượt chướng ngại vật: Cọc tiêu, vạch kẻ và bước chân
    figure = `
      <ellipse cx="160" cy="140" rx="85" ry="80" fill="#f8fafc" opacity="0.7"/>
      <text x="160" y="44" font-family="sans-serif" font-size="9" font-weight="bold" fill="#2563eb" text-anchor="middle">ĐI VƯỢT CHƯỚNG NGẠI VẬT THẤP TRÊN ĐƯỜNG THẲNG</text>
      <!-- Obstacle barrier -->
      <rect x="180" y="170" width="12" height="48" rx="2" fill="#ef4444"/>
      <rect x="175" y="170" width="22" height="6" fill="#facc15"/>
      <!-- Stepping over motion -->
      <path d="M140 145 L155 170 L195 165 L210 215" stroke="#fed7aa" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M135 145 L120 180 L115 218" stroke="#fed7aa" stroke-width="12" stroke-linecap="round"/>
      <path d="M130 135 L165 135 L160 162 L125 160 Z" fill="#1e3a8a"/>
      <path d="M136 95 L164 95 L160 138 L134 138 Z" fill="#2563eb"/>
      <path d="M136 100 L115 120" stroke="#fed7aa" stroke-width="10" stroke-linecap="round"/>
      <path d="M164 100 L185 120" stroke="#fed7aa" stroke-width="10" stroke-linecap="round"/>
      <rect x="146" y="84" width="8" height="12" fill="#fed7aa"/>
      <ellipse cx="150" cy="72" rx="12" ry="14" fill="#fed7aa"/>
      <path d="M138 68 Q150 56 162 68 Z" fill="#1e293b"/>
    `;
  } else {
    // Generic high-fidelity athletic stance
    figure = `
      <ellipse cx="160" cy="135" rx="75" ry="80" fill="#f8fafc" opacity="0.6"/>
      <path d="M152 145 L142 185 L140 218" stroke="#fed7aa" stroke-width="13" stroke-linecap="round"/>
      <path d="M168 145 L178 185 L180 218" stroke="#fed7aa" stroke-width="13" stroke-linecap="round"/>
      <path d="M142 135 L178 135 L182 160 L164 162 L160 148 L156 162 L138 160 Z" fill="#1e3a8a"/>
      <path d="M132 218 L152 218 L150 226 L130 226 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
      <path d="M168 218 L188 218 L190 226 L170 226 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
      <path d="M146 95 L174 95 L175 138 L145 138 Z" fill="#2563eb"/>
      <path d="M146 100 L115 120 L105 140" stroke="#fed7aa" stroke-width="11" stroke-linecap="round"/>
      <path d="M174 100 L205 120 L215 140" stroke="#fed7aa" stroke-width="11" stroke-linecap="round"/>
      <rect x="156" y="84" width="8" height="12" fill="#fed7aa"/>
      <ellipse cx="160" cy="72" rx="12" ry="14" fill="#fed7aa"/>
      <path d="M148 68 Q160 56 172 68 Q172 58 160 56 Q148 58 148 68 Z" fill="#1e293b"/>
    `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="250" viewBox="0 0 320 250">
      <defs>
        <marker id="marr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#0284c7"/>
        </marker>
        <linearGradient id="bgG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#f8fafc"/>
        </linearGradient>
      </defs>
      <rect width="320" height="250" rx="12" fill="url(#bgG)" stroke="#cbd5e1" stroke-width="1.5"/>
      <rect x="0" y="0" width="320" height="28" rx="11" fill="#1e293b"/>
      <text x="14" y="19" font-family="sans-serif" font-size="11" font-weight="bold" fill="#ffffff">${title}</text>
      ${figure}
      <rect x="10" y="222" width="300" height="22" rx="5" fill="#f1f5f9"/>
      <text x="160" y="237" font-family="sans-serif" font-size="9.5" font-weight="600" fill="#475569" text-anchor="middle">${subtitle}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const standardMovementsLibrary: MovementTechnicalItem[] = [
  // Khối 1
  {
    id: 'mv_k1_vuon_tho',
    name: 'Động tác Vươn thở',
    grade: 1,
    keywords: ['vươn thở', 'vuon tho', 'bài 1', 'hít thở', 'bài thể dục'],
    category: 'dong_tac_moi',
    cues: ['Bước chân trái rộng bằng vai', 'Hai tay vươn chữ V ngửa đầu', 'Nhịp 1 hít sâu bằng mũi', 'Nhịp 2 thở ra chéo bụng'],
    commonErrors: ['Cúi đầu thấp', 'Tay không căng', 'Sai nhịp thở'],
    svgDataUrl: '/assets/sgk_chuan/k1_vuon_tho.jpg',
    defaultLvd: "5 - 7'",
    gvExplanation: '- GV làm mẫu chuẩn xác 2-3 lần kết hợp phân tích kỹ thuật từng nhịp.\n- Cho HS xem hình ảnh SGK trang 36.\n- Hô nhịp chậm và hướng dẫn HS tập từng nhịp.',
    hsTask: '- Đội hình 4 hàng ngang cự ly 1 sải tay.\n- Quan sát và thực hiện từng nhịp theo hiệu lệnh GV.'
  },
  {
    id: 'mv_k1_tay',
    name: 'Động tác Tay',
    grade: 1,
    keywords: ['tay', 'động tác tay', 'dang ngang', 'vỗ tay'],
    category: 'dong_tac_moi',
    cues: ['Bước chân trái dang ngang', 'Hai tay dang ngang lòng bàn tay ngửa', 'Nhịp 2 vỗ tay trước ngực', 'Ngực ưỡn thẳng'],
    commonErrors: ['Tay buông lỏng dưới vai', 'Khuỵu gối', 'Thân người gù'],
    svgDataUrl: '/assets/sgk_chuan/k1_tay.jpg',
    defaultLvd: "5 - 7'",
    gvExplanation: '- GV thị phạm kỹ thuật tay dang ngang bằng vai, lòng bàn tay ngửa.\n- Hướng dẫn kết hợp nhịp vỗ tay trước ngực dứt khoát.',
    hsTask: '- Tập theo nhịp hô của cán sự, giữ thẳng thân người.'
  },
  {
    id: 'mv_k1_chan',
    name: 'Động tác Chân',
    grade: 1,
    keywords: ['chân', 'động tác chân', 'khuỵu gối', 'kiễng gót'],
    category: 'dong_tac_moi',
    cues: ['Nhịp 1: Kiễng gót, hai tay chống hông', 'Nhịp 2: Hạ gót khuỵu gối, vỗ tay trước ngực', 'Lưng giữ thẳng'],
    commonErrors: ['Mất thăng bằng khi kiễng gót', 'Gập lưng quá sâu'],
    svgDataUrl: '/assets/sgk_chuan/k1_chan.jpg',
    defaultLvd: "5 - 7'",
    gvExplanation: '- Hướng dẫn cách giữ thăng bằng trên nửa trước bàn chân.\n- Làm mẫu tư thế khuỵu gối đúng tầm.',
    hsTask: '- Tập luyện bắt chước và tự điều chỉnh thăng bằng.'
  },
  {
    id: 'mv_k1_bung',
    name: 'Động tác Bụng (Lườn)',
    grade: 1,
    keywords: ['bụng', 'động tác bụng', 'lườn', 'gập bụng'],
    category: 'dong_tac_moi',
    cues: ['Bước chân trái rộng hơn vai', 'Gập thân người thẳng gối', 'Hai tay chạm mu bàn chân', 'Thở ra khi gập thân'],
    commonErrors: ['Co gập đầu gối', 'Cúi gập đột ngột'],
    svgDataUrl: '/assets/sgk_chuan/k1_bung.jpg',
    defaultLvd: "5 - 7'",
    gvExplanation: '- Hướng dẫn HS gập thân sâu nhưng chân phải giữ thẳng.',
    hsTask: '- Thực hiện từng nhịp chậm rãi, an toàn.'
  },
  {
    id: 'mv_k1_van_minh',
    name: 'Động tác Vặn mình',
    grade: 1,
    keywords: ['vặn mình', 'van minh', 'xoay thân'],
    category: 'dong_tac_moi',
    cues: ['Bước chân trái, vặn mình sang trái 90 độ', 'Hai tay dang ngang', 'Bàn chân giữ cố định'],
    commonErrors: ['Xoay cả bàn chân', 'Tay không ngang vai'],
    svgDataUrl: '/assets/sgk_chuan/k1_tay.jpg',
    defaultLvd: "5 - 7'",
    gvExplanation: '- Nhắc nhở HS giữ chắc chân trụ, chỉ xoay phần thân trên.',
    hsTask: '- Tự giác quan sát và sửa tư thế cùng bạn.'
  },
  {
    id: 'mv_k1_toan_than',
    name: 'Động tác Toàn thân',
    grade: 1,
    keywords: ['toàn thân', 'toan than', 'phối hợp'],
    category: 'dong_tac_moi',
    cues: ['Bước chân trái chếch trước, khuỵu gối', 'Chân sau thẳng, hai tay vươn chếch cao', 'Đầu ngửa, trọng tâm dồn chân trước'],
    commonErrors: ['Chân sau không thẳng', 'Trọng tâm không vững'],
    svgDataUrl: '/assets/sgk_chuan/k1_chan.jpg',
    defaultLvd: "5 - 7'",
    gvExplanation: '- Phân tích cách dồn trọng tâm vào chân trước và kéo căng cơ toàn thân.',
    hsTask: '- Thực hiện theo cặp đôi quan sát hỗ trợ nhau.'
  },
  {
    id: 'mv_k1_dieu_hoa',
    name: 'Động tác Điều hòa',
    grade: 1,
    keywords: ['điều hòa', 'dieu hoa', 'thả lỏng'],
    category: 'dong_tac_moi',
    cues: ['Bước chân nhẹ nhàng, nâng đùi vuông góc', 'Hai tay dang ngang lắc cổ tay thả lỏng', 'Hít thở sâu, thư giãn toàn thân'],
    commonErrors: ['Gồng cứng cơ bắp', 'Không điều hòa nhịp thở'],
    svgDataUrl: '/assets/sgk_chuan/k1_vuon_tho.jpg',
    defaultLvd: "5 - 7'",
    gvExplanation: '- Hướng dẫn HS cách thả lỏng các khớp và hít thở nhịp nhàng.',
    hsTask: '- Lắng nghe nhạc hoặc nhịp hô chậm để điều hòa hô hấp.'
  },
  {
    id: 'mv_k1_nhay',
    name: 'Động tác Nhảy',
    grade: 1,
    keywords: ['nhảy', 'động tác nhảy', 'nhay', 'bật nhảy'],
    category: 'dong_tac_moi',
    cues: ['Nhịp 1: Bật nhảy tách hai chân sang ngang, hai tay vỗ trên đỉnh đầu', 'Nhịp 2: Bật nhảy khép chân về TTCB', 'Nhịp 3: Như nhịp 1', 'Nhịp 4: Về TTCB'],
    commonErrors: ['Tiếp đất bằng cả bàn chân gây chấn động', 'Không vỗ tay đúng nhịp'],
    svgDataUrl: '/assets/sgk_chuan/k1_chan.jpg',
    defaultLvd: "5 - 7'",
    gvExplanation: '- Nhắc nhở HS bật nhảy nhẹ nhàng, tiếp đất bằng nửa trước bàn chân.\n- Phân tích nhịp hô dứt khoát, vỗ tay trên đỉnh đầu.',
    hsTask: '- Tập bật nhảy nhịp nhàng, đúng nhịp đếm.'
  },
  {
    id: 'mv_k1_luon',
    name: 'Động tác Lườn',
    grade: 1,
    keywords: ['lườn', 'động tác lườn', 'luon', 'nghiêng người'],
    category: 'dong_tac_moi',
    cues: ['Nhịp 1: Chân trái bước sang ngang, tay trái chống hông, tay phải vươn cao nghiêng lườn', 'Nhịp 2: Về TTCB', 'Nhịp 3: Đổi bên nghiêng lườn sang phải', 'Nhịp 4: Về TTCB'],
    commonErrors: ['Xoay người thay vì nghiêng lườn', 'Chân không thẳng'],
    svgDataUrl: '/assets/sgk_chuan/k1_luon.jpg',
    defaultLvd: "5 - 7'",
    gvExplanation: '- Hướng dẫn HS nghiêng đúng mặt phẳng trán, không gập người ra trước.',
    hsTask: '- Tự cảm nhận độ căng của cơ lườn khi uốn nghiêng.'
  },

  // Khối 3
  {
    id: 'mv_k3_di_deu',
    name: 'Động tác Đi đều, Đứng lại',
    grade: 3,
    keywords: ['đi đều', 'đứng lại', 'di deu', 'dung lai', 'đội hình đội ngũ'],
    category: 'dong_tac_moi',
    cues: ['Khẩu lệnh: Đi đều - BƯỚC!', 'Nhịp 1: Chân trái tiếp đất, đánh tay phải', 'Nhịp 2: Chân phải tiếp đất, đánh tay trái', 'Khẩu lệnh: Đứng lại - ĐỨNG!'],
    commonErrors: ['Đi đều sai nhịp (chân cùng tay)', 'Bước chân không đều cự ly'],
    svgDataUrl: '/assets/sgk_chuan/k3_di_deu_dung_lai.jpg',
    defaultLvd: "7 - 8'",
    gvExplanation: '- Hô khẩu lệnh rõ ràng: "Đi đều - BƯỚC!", "Đứng lại - ĐỨNG!".\n- Hướng dẫn HS cách tiếp đất bằng nửa trước bàn chân.',
    hsTask: '- Tập trung hàng dọc/hàng ngang đi đều vòng quanh sân đúng nhịp.'
  },
  {
    id: 'mv_k3_on_di_deu',
    name: 'Ôn Đi đều, Đứng lại & Đổi chân khi sai nhịp',
    grade: 3,
    keywords: ['ôn đi đều', 'đổi chân', 'sai nhịp', 'đi đều đứng lại'],
    category: 'dong_tac_moi',
    cues: ['Chân trái nhịp 1, chân phải nhịp 2', 'Đệm bước chân ngắn khi sai nhịp', 'Khẩu lệnh Đứng lại rơi vào chân phải'],
    commonErrors: ['Đánh tay cùng chiều chân', 'Bước sải quá dài'],
    svgDataUrl: '/assets/sgk_chuan/k3_on_di_deu_doi_chan.jpg',
    defaultLvd: "7 - 8'",
    gvExplanation: '- Thị phạm kỹ thuật đệm bước chân lướt để lấy lại đúng nhịp.',
    hsTask: '- Luyện tập dậm chân tại chỗ trước khi bước đi đều.'
  },

  // Khối 5
  {
    id: 'mv_k5_gay',
    name: 'Động tác Bài thể dục với gậy (Khối 5)',
    grade: 5,
    keywords: ['gậy', 'với gậy', 'bài tập thể dục', 'khối 5', 'gậy thể dục', 'vươn thở với gậy', 'tay với gậy', 'chân với gậy'],
    category: 'dong_tac_moi',
    cues: ['Hai tay nắm hai đầu gậy thể dục', 'Nâng gậy lên cao hít sâu', 'Hạ gậy ngang vai/trước ngực thở ra', 'Giữ khoảng cách an toàn tránh va gậy'],
    commonErrors: ['Tay cầm gậy lệch tâm', 'Không kiểm soát đầu gậy an toàn'],
    svgDataUrl: '/assets/sgk_chuan/k5_vuon_tho_tay_gay.jpg',
    defaultLvd: "8 - 10'",
    gvExplanation: '- Kiểm tra độ nhẵn bóng của gậy trước khi tập.\n- Làm mẫu các tư thế cầm gậy nâng cao, hạ ngang ngực, hạ chân.',
    hsTask: '- Cầm gậy đúng kỹ thuật, duy trì khoảng cách an toàn tuyệt đối.'
  },
  {
    id: 'mv_k5_chan_gay',
    name: 'Động tác Chân với gậy (Khối 5)',
    grade: 5,
    keywords: ['chân với gậy', 'gậy chân', 'khuỵu gối gậy'],
    category: 'dong_tac_moi',
    cues: ['Kiễng gót hai chân nâng gậy', 'Khuỵu gối sâu hạ gậy song song', 'Lưng giữ thẳng'],
    commonErrors: ['Cong gập lưng', 'Lệch gậy'],
    svgDataUrl: '/assets/sgk_chuan/k5_chan_voi_gay.jpg',
    defaultLvd: "8 - 10'",
    gvExplanation: '- Làm mẫu tư thế khuỵu gối sâu giữ lưng thẳng với gậy.',
    hsTask: '- Tập trung thăng bằng và hạ gậy đúng tầm ngực.'
  },

  // Bổ sung các chuyển động chuẩn khớp hoàn toàn chương trình SGK cả 3 khối:
  // Đội hình đội ngũ: Đứng nghiêm, đứng nghỉ
  {
    id: 'mv_k1_dung_nghiem',
    name: 'Tư thế đứng nghiêm, đứng nghỉ',
    grade: 1,
    keywords: ['đứng nghiêm', 'đứng nghỉ', 'nghiêm', 'nghỉ', 'dung nghiem', 'dung nghi', 'đội hình đội ngũ'],
    category: 'dong_tac_moi',
    cues: ['Đứng nghiêm: Thân thẳng, ngực căng, gót chân sát nhau, mũi mở chữ V', 'Đứng nghỉ: Trùng gối một chân, thân người thả lỏng tự nhiên'],
    commonErrors: ['Đứng nghiêm không khép gót', 'Mắt liếc ngang ngửa đầu'],
    svgDataUrl: generateMovementSvg('TƯ THẾ ĐỨNG NGHIÊM - ĐỨNG NGHỈ', 'Gót chân khép chạm, mũi chân mở chữ V tự nhiên', 'dung_nghiem_nghi'),
    defaultLvd: "6 - 8'",
    gvExplanation: '- Hô khẩu lệnh rõ: "Nghiêm!", "Nghỉ!".\n- Uốn nắn tư thế ngực căng, hai tay khép nhẹ bên đùi.',
    hsTask: '- Chấp hành nghiêm túc khẩu lệnh của giáo viên.'
  },

  // Khối 3: Vượt chướng ngại vật
  {
    id: 'mv_k3_vuot_cnv',
    name: 'Đi vượt chướng ngại vật',
    grade: 3,
    keywords: ['vượt chướng ngại vật', 'chướng ngại vật', 'vuot chuong ngai vat', 'bước qua'],
    category: 'dong_tac_moi',
    cues: ['Mắt quan sát chướng ngại vật phía trước', 'Nâng cao đùi bước qua cọc/vạch', 'Tiếp đất êm, giữ vững thăng bằng'],
    commonErrors: ['Va quệt chân vào chướng ngại vật', 'Mất thăng bằng ngả người'],
    svgDataUrl: generateMovementSvg('ĐI VƯỢT CHƯỚNG NGẠI VẬT', 'Nâng cao đùi bước dứt khoát qua vật cản thấp', 'chieu_ngang_vat'),
    defaultLvd: "7 - 8'",
    gvExplanation: '- Sắp xếp chướng ngại vật an toàn, cự ly 1.5 - 2m.\n- Thị phạm kỹ thuật nhấc cao đùi và tiếp đất nhẹ nhàng.',
    hsTask: '- Tập trung bước qua chướng ngại vật đúng kỹ thuật.'
  },

  // Khối 3: Tung và bắt bóng tại chỗ
  {
    id: 'mv_k3_tung_bat_bong',
    name: 'Tung và bắt bóng tại chỗ',
    grade: 3,
    keywords: ['tung bóng', 'bắt bóng', 'tung và bắt bóng', 'tung bat bong', 'bóng'],
    category: 'dong_tac_moi',
    cues: ['Hai tay cầm bóng trước ngực', 'Tung bóng thẳng lên cao 0.8 - 1.2m', 'Hai tay xòe rộng đón bóng hoãn xung êm'],
    commonErrors: ['Tung bóng lệch hướng', 'Đón bóng không hoãn xung gây nảy bóng'],
    svgDataUrl: generateMovementSvg('TUNG VÀ BẮT BÓNG TẠI CHỖ', 'Tung bóng thẳng hướng, xòe ngón đón bóng êm', 'tung_bong'),
    defaultLvd: "7 - 8'",
    gvExplanation: '- Phân tích kỹ thuật nhún gối lấy đà tung bóng thẳng góc.\n- Nhắc nhở cách đón bóng hoãn xung bằng các ngón tay.',
    hsTask: '- Luyện tập cá nhân và cặp đôi tung bắt bóng tự giác.'
  },

  // Thể thao tự chọn: Bóng rổ - Dẫn bóng
  {
    id: 'mv_tttc_dan_bong',
    name: 'Kỹ thuật Dẫn bóng (Bóng rổ)',
    grade: 1,
    keywords: ['dẫn bóng', 'dan bong', 'bóng rổ', 'nhồi bóng', 'bong ro'],
    category: 'dong_tac_moi',
    cues: ['Hạ thấp trọng tâm, gối khuỵu', 'Dùng các ngón tay ấn nhồi bóng xuống sân', 'Bóng nảy ngang hông, mắt nhìn phía trước'],
    commonErrors: ['Đập cả lòng bàn tay bẹp bóng', 'Cúi gằm mặt không quan sát'],
    svgDataUrl: generateMovementSvg('KỸ THUẬT DẪN BÓNG RỔ', 'Dùng các ngón tay đẩy nhồi bóng nảy ngang hông', 'dan_bong'),
    defaultLvd: "8 - 10'",
    gvExplanation: '- Hướng dẫn cách điều khiển bóng bằng độ dẻo của cổ tay và ngón tay.\n- Thị phạm dẫn bóng tại chỗ và di chuyển chậm.',
    hsTask: '- Nhồi bóng nhịp nhàng theo hiệu lệnh của giáo viên.'
  },

  // Thể thao tự chọn: Bơi lội - Bơi trườn sấp
  {
    id: 'mv_tttc_boi',
    name: 'Kỹ thuật Bơi trườn sấp',
    grade: 1,
    keywords: ['bơi', 'boi', 'trườn sấp', 'đập chân bơi', 'khua tay', 'thở dưới nước'],
    category: 'dong_tac_moi',
    cues: ['Thân người nằm ngang mặt nước', 'Phát lực từ hông đập chân so le', 'Quạt tay ôm nước, thở nhịp nhàng'],
    commonErrors: ['Gập gối quá nhiều khi đập chân', 'Ngóc đầu quá cao làm chìm hông'],
    svgDataUrl: generateMovementSvg('KỸ THUẬT BƠI TRƯỜN SẤP', 'Thân người nổi phẳng, chân đập so le tay quạt nước', 'boi_truon_sap'),
    defaultLvd: "8 - 10'",
    gvExplanation: '- Phân tích nguyên lý lực đẩy và độ nổi của cơ thể.\n- Làm mẫu trên cạn kết hợp tập dưới nước có phao hỗ trợ.',
    hsTask: '- Thực hành thuần thục động tác chân và phối hợp thở an toàn.'
  },

  // Khối 5: Lăn và Lộn xuôi
  {
    id: 'mv_k5_lan_lon',
    name: 'Kỹ thuật Lăn và Lộn xuôi',
    grade: 5,
    keywords: ['lăn', 'lộn xuôi', 'lon xuoi', 'nhào lộn', 'đệm thể dục'],
    category: 'dong_tac_moi',
    cues: ['Ngồi xổm, hai tay chống đệm', 'Cúi đầu giấu cằm vào ngực, cong lưng hình cầu', 'Đạp chân lăn tròn lưng trên đệm tiếp đất êm'],
    commonErrors: ['Chống đỉnh đầu xuống đệm gây đau cổ', 'Lưng không cong làm rơi phịch'],
    svgDataUrl: generateMovementSvg('KỸ THUẬT LỘN XUÔI TRÊN ĐỆM', 'Cúi gập cằm sát ngực, lưng cong lăn tròn an toàn', 'lan_lon'),
    defaultLvd: "7 - 8'",
    gvExplanation: '- Kiểm tra đệm thể dục dày dặn, an toàn tuyệt đối.\n- Nhấn mạnh điểm quan trọng: giấu cằm vào ngực, không chống đỉnh đầu.',
    hsTask: '- Luân phiên từng học sinh thực hiện trên đệm có GV bảo hiểm.'
  }
];

export function findMatchingMovement(keyword: string, grade?: number): MovementTechnicalItem | undefined {
  const norm = keyword.toLowerCase().trim();
  
  // 1. Exact or keyword match
  const match = standardMovementsLibrary.find((m) => {
    if (grade && m.grade !== grade) return false;
    return m.keywords.some((kw) => norm.includes(kw));
  });

  if (match) return match;

  // 2. Loose match across any grade
  return standardMovementsLibrary.find((m) => m.keywords.some((kw) => norm.includes(kw)));
}
