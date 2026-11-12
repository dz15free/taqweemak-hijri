// Reference coordinates for the cities whose times we verified against published tables.
// method: key of METHODS in prayer.js (ksa = Umm al-Qura, uae, kuwait, qatar).
export const CITIES = [
  { slug: 'riyadh', name: 'الرياض', lat: 24.7136, lng: 46.6753, method: 'ksa' },
  { slug: 'makkah', name: 'مكة المكرمة', lat: 21.4225, lng: 39.8262, method: 'ksa' },
  { slug: 'madinah', name: 'المدينة المنورة', lat: 24.5247, lng: 39.5692, method: 'ksa' },
  { slug: 'jeddah', name: 'جدة', lat: 21.4858, lng: 39.1925, method: 'ksa' },
  { slug: 'dammam', name: 'الدمام', lat: 26.4207, lng: 50.0888, method: 'ksa' },
  { slug: 'taif', name: 'الطائف', lat: 21.2703, lng: 40.4158, method: 'ksa' },
  { slug: 'al-ahsa', name: 'الأحساء', lat: 25.3833, lng: 49.5864, method: 'ksa' },
  { slug: 'buraidah', name: 'بريدة', lat: 26.326, lng: 43.975, method: 'ksa' },
  { slug: 'tabuk', name: 'تبوك', lat: 28.3835, lng: 36.5662, method: 'ksa' },
  { slug: 'hail', name: 'حائل', lat: 27.5114, lng: 41.7208, method: 'ksa' },
  { slug: 'abha', name: 'أبها', lat: 18.2164, lng: 42.5053, method: 'ksa' },
  { slug: 'jazan', name: 'جازان', lat: 16.8892, lng: 42.5511, method: 'ksa' },
  { slug: 'najran', name: 'نجران', lat: 17.5656, lng: 44.2289, method: 'ksa' },
  { slug: 'al-baha', name: 'الباحة', lat: 20.0129, lng: 41.4677, method: 'ksa' },
  { slug: 'arar', name: 'عرعر', lat: 30.9753, lng: 41.0381, method: 'ksa' },
  { slug: 'sakaka', name: 'سكاكا', lat: 29.9697, lng: 40.2064, method: 'ksa' },
  { slug: 'dubai', name: 'دبي', lat: 25.2048, lng: 55.2708, method: 'uae' },
  { slug: 'abu-dhabi', name: 'أبوظبي', lat: 24.4539, lng: 54.3773, method: 'uae' },
  { slug: 'sharjah', name: 'الشارقة', lat: 25.3463, lng: 55.4209, method: 'uae' },
  { slug: 'kuwait-city', name: 'الكويت', lat: 29.3759, lng: 47.9774, method: 'kuwait' },
  { slug: 'doha', name: 'الدوحة', lat: 25.2854, lng: 51.531, method: 'qatar' },
];
export const cityBySlug = (slug) => CITIES.find((c) => c.slug === slug);
