import { useEffect } from 'react';
import { GradeLevel } from '../types/gdtc';

interface SeoMetaParams {
  activeTab: string;
  grade: GradeLevel;
  week: number;
  title?: string;
}

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonicalLink(href: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

const TAB_SLUG_MAP: Record<string, string> = {
  'tab-scan': 'scan',
  'tab-img-library': 'extract',
  'tab-template': 'template',
  'tab-library': 'library',
  'tab-generator': 'generator',
  'tab-export': 'export',
  'tab-template-lab': 'template-lab',
  'tab-intro': 'intro',
  'tab-feedback': 'feedback',
};

export function useSeoMeta({ activeTab, grade, week, title }: SeoMetaParams) {
  useEffect(() => {
    const semesterLabel = week <= 18 ? 'Học kỳ I' : 'Học kỳ II';
    const cleanLesson = (title || '').replace(/\s+/g, ' ').trim();

    let pageTitle = 'PE SmartPlan 2.0 – Giáo Án GDTC Tiểu Học Kết Nối Tri Thức';
    let pageDescription =
      'Tải giáo án GDTC lớp 1–5 Kết nối tri thức theo tuần, trọn bộ học kỳ & giáo án tích hợp năm học. Kho ảnh động tác bài thể dục SGK, sơ đồ đội hình GDPT 2018.';

    switch (activeTab) {
      case 'tab-scan':
        pageTitle = `Sách Giáo Khoa GDTC Lớp ${grade} Kết Nối Tri Thức – PE SmartPlan 2.0`;
        pageDescription = `Xem & bóc tách hình ảnh động tác bài thể dục từ Sách giáo khoa GDTC Lớp ${grade} (Bộ sách Kết nối tri thức với cuộc sống) sắc nét để chèn giáo án Word.`;
        break;
      case 'tab-img-library':
        pageTitle = `Hình Ảnh Động Tác Bài Thể Dục Lớp ${grade} SGK GDTC – PE SmartPlan 2.0`;
        pageDescription = `Thư viện hình ảnh động tác bài thể dục lớp 1–5, trò chơi vận động và sơ đồ đội hình chuẩn SGK GDTC Tiểu học Kết nối tri thức.`;
        break;
      case 'tab-library':
        pageTitle = `Kế Hoạch Dạy Học & Kịch Bản GDTC Lớp ${grade} Tuần ${week} – PE SmartPlan 2.0`;
        pageDescription = `Kho kịch bản khởi động, luyện tập, trò chơi vận động và kế hoạch dạy học tuần ${week} (${semesterLabel}) môn GDTC Tiểu học GDPT 2018.`;
        break;
      case 'tab-generator':
        pageTitle = cleanLesson
          ? `Giáo Án GDTC Lớp ${grade} Tuần ${week}: ${cleanLesson.slice(0, 32)} – PE SmartPlan`
          : `Giáo Án GDTC Lớp ${grade} Tuần ${week} (${semesterLabel}) – PE SmartPlan 2.0`;
        pageDescription = `Soạn giáo án tuần ${week} (${semesterLabel}) môn GDTC Lớp ${grade} Kết nối tri thức tích hợp KNS, BVMT, QCN, ATGT, Năng lực số chuẩn GDPT 2018.`;
        break;
      case 'tab-export':
        pageTitle = `Tải Giáo Án GDTC Lớp ${grade} Tuần ${week} & Trọn Bộ Học Kỳ – PE SmartPlan 2.0`;
        pageDescription = `Xem trước, in A4 và tải file Word (.DOCX) giáo án GDTC Lớp ${grade} Tuần ${week}, tải trọn bộ Học kỳ I, Học kỳ II và giáo án tích hợp cả năm học.`;
        break;
      case 'tab-intro':
        pageTitle = 'PE SmartPlan 2.0 – Kho Giáo Án & Học Liệu GDTC Tiểu Học Kết Nối Tri Thức';
        pageDescription =
          'Khám phá PE SmartPlan 2.0: Giáo án GDTC lớp 1–5 Kết nối tri thức, kế hoạch dạy học 35 tuần, hình ảnh động tác bài thể dục SGK và tải trọn bộ học kỳ.';
        break;
      case 'tab-feedback':
        pageTitle = 'Đánh Giá & Góp Ý Cộng Đồng Giáo Viên GDTC – PE SmartPlan 2.0';
        pageDescription =
          'Nhận xét thực tế từ giáo viên Thể dục Tiểu học và hòm thư đóng góp phát triển kho học liệu PE SmartPlan 2.0.';
        break;
      default:
        break;
    }

    document.title = pageTitle;
    setMetaTag('name', 'description', pageDescription);
    setMetaTag('property', 'og:title', pageTitle);
    setMetaTag('property', 'og:description', pageDescription);
    setMetaTag('name', 'twitter:title', pageTitle);
    setMetaTag('name', 'twitter:description', pageDescription);

    try {
      const origin = window.location.origin;
      const slug = TAB_SLUG_MAP[activeTab] || 'generator';
      const canonicalParams = new URLSearchParams();
      canonicalParams.set('tab', slug);
      if (activeTab === 'tab-export' || activeTab === 'tab-generator') {
        canonicalParams.set('khoi', String(grade));
        canonicalParams.set('tuan', String(week));
      } else if (activeTab === 'tab-scan' || activeTab === 'tab-img-library') {
        canonicalParams.set('khoi', String(grade));
      }
      const canonicalUrl = `${origin}/?${canonicalParams.toString()}`;
      setCanonicalLink(canonicalUrl);
      setMetaTag('property', 'og:url', canonicalUrl);
      setMetaTag('property', 'og:image', `${origin}/pwa-512x512.png`);
      setMetaTag('name', 'twitter:image', `${origin}/pwa-512x512.png`);
    } catch {
      // Ignore URL errors in restricted sandbox environments
    }
  }, [activeTab, grade, week, title]);
}
