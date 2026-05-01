/**
 * Category taxonomy.
 * The `dbValue` fields must match the `category` / `subcategory` values in MongoDB.
 */
export const CATEGORIES = [
  {
    dbValue: 'Thiết Bị Vệ Sinh',
    label: 'Thiết Bị Vệ Sinh',
    slug: 'thiet-bi-ve-sinh',
    icon: '🚿',
    subcategories: [
      { dbValue: 'Bồn cầu',            label: 'Bồn Cầu',           slug: 'bon-cau' },
      { dbValue: 'Bồn cầu điện tử',    label: 'Bồn Cầu Điện Tử',  slug: 'bon-cau-dien-tu' },
      { dbValue: 'Chậu Lavabo',        label: 'Chậu Lavabo',       slug: 'chau-lavabo' },
      { dbValue: 'Vòi chậu',           label: 'Vòi Chậu',          slug: 'voi-chau' },
      { dbValue: 'Vòi sen',            label: 'Vòi Sen',            slug: 'voi-sen' },
      { dbValue: 'Sen cây',            label: 'Sen Cây',            slug: 'sen-cay' },
      { dbValue: 'Bồn tắm',            label: 'Bồn Tắm',           slug: 'bon-tam' },
      { dbValue: 'Bồn tiểu',           label: 'Bồn Tiểu',          slug: 'bon-tieu' },
      { dbValue: 'Phụ kiện',           label: 'Phụ Kiện',          slug: 'phu-kien' },
    ],
  },
  {
    dbValue: 'Thiết Bị Nhà Bếp',
    label: 'Thiết Bị Nhà Bếp',
    slug: 'thiet-bi-nha-bep',
    icon: '🍳',
    subcategories: [
      { dbValue: 'Bếp Điện Từ',       label: 'Bếp Điện Từ',       slug: 'bep-dien-tu' },
      { dbValue: 'Bếp Gas',            label: 'Bếp Gas',            slug: 'bep-gas' },
      { dbValue: 'Máy Hút Mùi',        label: 'Máy Hút Mùi',        slug: 'may-hut-mui' },
      { dbValue: 'Chậu rửa chén',      label: 'Chậu Rửa Chén',     slug: 'chau-rua-chen' },
      { dbValue: 'Vòi rửa chén',       label: 'Vòi Rửa Chén',      slug: 'voi-rua-chen' },
    ],
  },
  {
    dbValue: 'Thiết Bị Nước',
    label: 'Thiết Bị Nước',
    slug: 'thiet-bi-nuoc',
    icon: '💧',
    subcategories: [],
  },
];

export const BRANDS = ['TOTO', 'INAX', 'VIGLACERA', 'AMERICAN STANDARD', 'ATTAX', 'HAPHAKO', 'Caesar'];

export const SORT_OPTIONS = [
  { value: 'newest',     label: 'Mới nhất' },
  { value: 'price_asc',  label: 'Giá: Thấp → Cao' },
  { value: 'price_desc', label: 'Giá: Cao → Thấp' },
  { value: 'rating',     label: 'Đánh giá cao nhất' },
];

export const DELIVERY_OPTIONS = [
  { id: 1, name: 'Giao hàng tiêu chuẩn', cost: 300000,  duration: '24–72 giờ' },
  { id: 2, name: 'Giao hàng nhanh',       cost: 1000000, duration: '1–24 giờ' },
];

export const PAGE_SIZES = [12, 24, 48];
