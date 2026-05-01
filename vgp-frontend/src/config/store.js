/**
 * Store configuration — all business-specific content lives here.
 *
 * Change this file to customise the store name, contact details,
 * showrooms, hero banners, trust features, and footer copy without
 * touching any component.
 */
const storeConfig = {
  // ── Identity ─────────────────────────────────────────────────────────
  name:    'VƯƠNG GIA PHÚ',
  tagline: 'Thiết Bị Vệ Sinh & Nội Thất Cao Cấp',
  /** Short description used in footer and meta tags */
  description:
    'Chuyên cung cấp thiết bị vệ sinh, nội thất cao cấp chính hãng từ các thương hiệu TOTO, INAX, Caesar, Viglacera và nhiều hơn nữa.',

  // ── Contact ──────────────────────────────────────────────────────────
  hotlines: ['0963 345 099'],
  email:    'info@vuonggiaphu.vn',
  zalo:     '0963345099',
  workingHours: 'Thứ 2 – Chủ nhật: 7:00 – 20:00',

  // ── Social media ─────────────────────────────────────────────────────
  social: {
    facebook:  'https://facebook.com/vuonggiaphu',
    youtube:   '',
    instagram: '',
    tiktok:    '',
  },

  // ── Showrooms ────────────────────────────────────────────────────────
  showrooms: [
    {
      name:    'Showroom Tôn Đức Thắng',
      address: '951 Tôn Đức Thắng, phường Đồng Xoài, tp Đồng Nai',
      phone:   '0963 345 099',
      hours:   '7:00 – 20:00 (Thứ 2 – Chủ nhật)',
      mapsUrl: 'https://maps.app.goo.gl/gRq9hnHu3VXc9GPcA',
    }
  ],

  // ── Hero banner slides ────────────────────────────────────────────────
  // Each slide: tag, title, subtitle, bg (CSS gradient or color), links[]
  heroBanners: [
    {
      tag:      'Chính Hãng – Giá Tốt',
      title:    'VƯƠNG GIA PHÚ',
      subtitle: 'Chuyên cung cấp thiết bị vệ sinh & nội thất cao cấp chính hãng — giao hàng toàn quốc',
      bg:       'linear-gradient(135deg, #c0392b 0%, #8e1010 100%)',
      links: [
        { label: 'Xem Sản Phẩm',   href: '/all'  },
        { label: '🔥 Khuyến Mãi', href: '/sale' },
      ],
    },
    {
      tag:      'Thiết Bị Vệ Sinh',
      title:    'TOTO · INAX · Caesar · Viglacera',
      subtitle: 'Bồn cầu điện tử, lavabo, vòi sen, bồn tắm — bảo hành chính hãng, lắp đặt tận nơi',
      bg:       'linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)',
      links: [
        { label: 'Xem Thiết Bị Vệ Sinh', href: '/category/thiet-bi-ve-sinh/bon-cau' },
        { label: 'Tất Cả Sản Phẩm',      href: '/all' },
      ],
    },
    {
      tag:      'Thiết Bị Nhà Bếp',
      title:    'Bếp & Phụ Kiện Cao Cấp',
      subtitle: 'Bếp từ, máy hút mùi, chậu rửa inox — đa dạng mẫu mã, giá cạnh tranh nhất thị trường',
      bg:       'linear-gradient(135deg, #16a085 0%, #0d6655 100%)',
      links: [
        { label: 'Xem Thiết Bị Bếp', href: '/category/thiet-bi-nha-bep/bep-dien-tu' },
        { label: '🔥 Sản Phẩm Sale', href: '/sale' },
      ],
    },
  ],

  // ── Trust / policy features (below hero) ─────────────────────────────
  features: [
    { icon: '🚚', title: 'Giao Hàng Nhanh Chóng', desc: 'Đảm bảo giao hàng nhanh chóng' },
    { icon: '✅', title: 'Hàng Chính Hãng 100%',   desc: 'Cam kết sản phẩm xác thực' },
    { icon: '🔧', title: 'Lắp Đặt Chuyên Nghiệp',  desc: 'Đội ngũ kỹ thuật giàu kinh nghiệm' },
    { icon: '💰', title: 'Giá Cạnh Tranh',          desc: 'Cam kết giá tốt nhất thị trường' },
  ],

  // ── Brand showcase ────────────────────────────────────────────────────
  brands: [
    { name: 'TOTO',             slug: 'TOTO',             category: 'Thiết Bị Vệ Sinh' },
    { name: 'INAX',             slug: 'INAX',             category: 'Thiết Bị Vệ Sinh' },
    { name: 'Caesar',           slug: 'Caesar',           category: 'Thiết Bị Vệ Sinh' },
    { name: 'Viglacera',        slug: 'VIGLACERA',        category: 'Thiết Bị Vệ Sinh' },
    { name: 'American Standard',slug: 'AMERICAN STANDARD',category: 'Thiết Bị Vệ Sinh' },
    { name: 'ATTAX',            slug: 'ATTAX',            category: 'Thiết Bị Vệ Sinh' },
    { name: 'HAPHAKO',          slug: 'HAPHAKO',          category: 'Thiết Bị Vệ Sinh' },
    { name: 'JOMOO',          slug: 'JOMOO',          category: 'Thiết Bị Vệ Sinh' },
    { name: 'PANASONIC',      slug: 'PANASONIC',      category: 'Thiết Bị Vệ Sinh' },
    { name: 'HAFELE',         slug: 'HAFELE',         category: 'Thiết Bị Vệ Sinh' },
    { name: 'MALLORCA',       slug: 'MALLORCA',       category: 'Thiết Bị Vệ Sinh' },
    { name: 'GROHE',          slug: 'GROHE',          category: 'Thiết Bị Vệ Sinh' },
    { name: 'FERROLI',        slug: 'FERROLI',        category: 'Thiết Bị Vệ Sinh' },
    { name: 'ARISTON',        slug: 'ARISTON',        category: 'Thiết Bị Vệ Sinh' },
    { name: 'BOSCH',          slug: 'BOSCH',          category: 'Thiết Bị Vệ Sinh' },
    { name: 'SIEMENS',        slug: 'SIEMENS',        category: 'Thiết Bị Vệ Sinh' },
    { name: 'ELECTROLUX',     slug: 'ELECTROLUX',     category: 'Thiết Bị Vệ Sinh' },
    { name: 'WHIRLPOOL',      slug: 'WHIRLPOOL',      category: 'Thiết Bị Vệ Sinh' },
    { name: 'LG',             slug: 'LG',             category: 'Thiết Bị Vệ Sinh' },
    { name: 'SAMSUNG',        slug: 'SAMSUNG',        category: 'Thiết Bị Vệ Sinh' },
    { name: 'GARIS',          slug: 'GARIS',          category: 'Thiết Bị Vệ Sinh' },
    { name: 'THIÊN THANH',    slug: 'THIÊN THANH',    category: 'Thiết Bị Vệ Sinh' },
    { name: 'HC',             slug: 'HC',             category: 'Thiết Bị Vệ Sinh' },
  ],

  // ── Footer links ──────────────────────────────────────────────────────
  footerLinks: [
    { label: 'Tất cả sản phẩm', href: '/all' },
    { label: 'Bồn Cầu',         href: '/category/thiet-bi-ve-sinh/bon-cau' },
    { label: 'Chậu Lavabo',     href: '/category/thiet-bi-ve-sinh/chau-lavabo' },
    { label: 'Vòi Sen',         href: '/category/thiet-bi-ve-sinh/voi-sen' },
    { label: 'Bếp Điện Từ',    href: '/category/thiet-bi-nha-bep/bep-dien-tu' },
    { label: 'Máy Hút Mùi',    href: '/category/thiet-bi-nha-bep/may-hut-mui' },
    { label: 'Khuyến Mãi',     href: '/sale' },
    { label: 'Danh Sách Yêu Thích', href: '/wishlist' },
  ],

  footerPolicies: [
    'Giao hàng toàn quốc',
    'Hàng chính hãng 100%',
    'Bảo hành chính hãng',
    'Lắp đặt chuyên nghiệp',
    'Đổi trả trong 7 ngày',
    'Hỗ trợ kỹ thuật 24/7',
  ],

  footerServices: [
    'Tư vấn thiết kế phòng tắm',
    'Dịch vụ lắp đặt tận nơi',
    'Bảo trì định kỳ',
    'Báo giá miễn phí',
  ],
};

export default storeConfig;
