/**
 * Database kategori dan kitab syarah hadits turath.io
 *
 * Sumber kategori: app.turath.io (37 kategori resmi)
 * Sumber kitab syarah: verifikasi dari turath-sdk e2e tests + API
 */

// ─── 37 Kategori Resmi turath.io ─────────────────────────────────────────────

export const KATEGORI = {
  // Aqidah & Pemikiran
  aqidah:              1,   // العقيدة
  firaq_rudud:         2,   // الفرق والردود

  // Quran
  tafsir:              3,   // التفسير
  ulum_quran:          4,   // علوم القرآن وأصول التفسير
  tajwid_qiraaat:      5,   // التجويد والقراءات

  // Hadits
  kutub_sunnah:        6,   // كتب السنة
  syuruh_hadits:       7,   // شروح الحديث  ← KATEGORI UTAMA SYARAH
  takhrij_athraf:      8,   // التخريج والأطراف
  ilal_sualat:         9,   // العلل والسؤلات الحديثية
  ulum_hadits:         10,  // علوم الحديث

  // Fiqh & Ushul
  ushul_fiqh:          11,  // أصول الفقه
  ulum_fiqh_qawaid:    12,  // علوم الفقه والقواعد الفقهية
  manthiq:             13,  // المنطق

  // Fiqh Madzhab
  fiqh_hanafi:         14,  // الفقه الحنفي
  fiqh_maliki:         15,  // الفقه المالكي
  fiqh_syafii:         16,  // الفقه الشافعي
  fiqh_hanbali:        17,  // الفقه الحنبلي
  fiqh_am:             18,  // الفقه العام
  masail_fiqhiyah:     19,  // مسائل فقهية
  siyasah_qadha:       20,  // السياسة الشرعية والقضاء
  faraid_wasaya:       21,  // الفرائض والوصايا
  fatawa:              22,  // الفتاوى

  // Akhlak & Zuhud
  raqaiq_adab_adzkar:  23,  // الرقائق والآداب والأذكار

  // Sejarah & Biografi
  sirah_nabawiyah:     24,  // السيرة النبوية
  tarikh:              25,  // التاريخ
  tarajim_thabaqat:    26,  // التراجم والطبقات
  ansab:               27,  // الأنساب
  buldan_rihlat:       28,  // البلدان والرحلات

  // Bahasa Arab
  kutub_lughah:        29,  // كتب اللغة
  gharib_maajim:       30,  // الغريب والمعاجم
  nahwu_sharf:         31,  // النحو والصرف
  adab:                32,  // الأدب
  arudh_qawafi:        33,  // العروض والقوافي
  syir_dawawin:        34,  // الشعر ودواوينه
  balaghah:            35,  // البلاغة

  // Umum
  jawami:              36,  // الجوامع
  faharis_adillah:     37,  // فهارس الكتب والأدلة
};

// Nama Arab & Indonesia untuk setiap kategori
export const KATEGORI_INFO = {
  1:  { ar: 'العقيدة',                          id: 'Aqidah & Tauhid' },
  2:  { ar: 'الفرق والردود',                    id: 'Firqah & Bantahan' },
  3:  { ar: 'التفسير',                           id: 'Tafsir Al-Quran' },
  4:  { ar: 'علوم القرآن وأصول التفسير',        id: 'Ulumul Quran & Ushul Tafsir' },
  5:  { ar: 'التجويد والقراءات',                id: 'Tajwid & Qiraaat' },
  6:  { ar: 'كتب السنة',                         id: 'Kitab-kitab Sunnah/Hadits' },
  7:  { ar: 'شروح الحديث',                      id: 'Syarah Hadits' },
  8:  { ar: 'التخريج والأطراف',                 id: 'Takhrij & Athraf' },
  9:  { ar: 'العلل والسؤلات الحديثية',          id: 'Ilal & Sualat Hadits' },
  10: { ar: 'علوم الحديث',                       id: 'Ulumul Hadits' },
  11: { ar: 'أصول الفقه',                        id: 'Ushul Fiqh' },
  12: { ar: 'علوم الفقه والقواعد الفقهية',      id: 'Ulumul Fiqh & Qawaid Fiqhiyah' },
  13: { ar: 'المنطق',                            id: 'Mantiq/Logika' },
  14: { ar: 'الفقه الحنفي',                     id: 'Fiqh Hanafi' },
  15: { ar: 'الفقه المالكي',                    id: 'Fiqh Maliki' },
  16: { ar: 'الفقه الشافعي',                    id: 'Fiqh Syafii' },
  17: { ar: 'الفقه الحنبلي',                    id: 'Fiqh Hanbali' },
  18: { ar: 'الفقه العام',                       id: 'Fiqh Umum' },
  19: { ar: 'مسائل فقهية',                      id: 'Masail Fiqhiyah' },
  20: { ar: 'السياسة الشرعية والقضاء',          id: 'Siyasah Syariyah & Qadha' },
  21: { ar: 'الفرائض والوصايا',                 id: 'Faraid & Wasiat' },
  22: { ar: 'الفتاوى',                           id: 'Fatawa' },
  23: { ar: 'الرقائق والآداب والأذكار',          id: 'Raqaiq, Adab & Adzkar' },
  24: { ar: 'السيرة النبوية',                   id: 'Sirah Nabawiyah' },
  25: { ar: 'التاريخ',                           id: 'Sejarah Islam' },
  26: { ar: 'التراجم والطبقات',                 id: 'Biografi & Thabaqat' },
  27: { ar: 'الأنساب',                           id: 'Nasab/Genealogi' },
  28: { ar: 'البلدان والرحلات',                 id: 'Geografi & Perjalanan' },
  29: { ar: 'كتب اللغة',                         id: 'Kitab-kitab Bahasa Arab' },
  30: { ar: 'الغريب والمعاجم',                  id: 'Gharib & Kamus Arab' },
  31: { ar: 'النحو والصرف',                     id: 'Nahwu & Sharaf' },
  32: { ar: 'الأدب',                             id: 'Sastra Arab' },
  33: { ar: 'العروض والقوافي',                  id: 'Arudh & Qawafi (Prosodi)' },
  34: { ar: 'الشعر ودواوينه',                   id: 'Syair & Diwan' },
  35: { ar: 'البلاغة',                           id: 'Balaghah' },
  36: { ar: 'الجوامع',                           id: 'Ensiklopedi/Jawami' },
  37: { ar: 'فهارس الكتب والأدلة',              id: 'Faharis & Indeks Kitab' },
};

// ─── Kitab-kitab Syarah Hadits (19 kitab) ────────────────────────────────────
// Dicari menggunakan cat_id=7 (شروح الحديث) yang merupakan kategori
// khusus syarah hadits di turath.io

export const KITAB_SYARAH = [
  // ── Syarah Shahih Bukhari ────────────────────────────────────────────────
  {
    key: 'fathul_bari',
    nama: 'فتح الباري شرح صحيح البخاري',
    pengarang: 'ابن حجر العسقلاني',
    query_kitab: 'فتح الباري ابن حجر',
    cat_id: KATEGORI.syuruh_hadits,
  },
  {
    key: 'umdatul_qari',
    nama: 'عمدة القاري شرح صحيح البخاري',
    pengarang: 'العيني',
    query_kitab: 'عمدة القاري العيني',
    cat_id: KATEGORI.syuruh_hadits,
  },
  {
    key: 'irsyadussari',
    nama: 'إرشاد الساري لشرح صحيح البخاري',
    pengarang: 'القسطلاني',
    query_kitab: 'إرشاد الساري القسطلاني',
    cat_id: KATEGORI.syuruh_hadits,
  },
  // ── Syarah Shahih Muslim ─────────────────────────────────────────────────
  {
    key: 'al_minhaj_nawawi',
    nama: 'المنهاج شرح صحيح مسلم بن الحجاج',
    pengarang: 'النووي',
    query_kitab: 'المنهاج شرح صحيح مسلم النووي',
    cat_id: KATEGORI.syuruh_hadits,
  },
  {
    key: 'ikmal_muallim',
    nama: 'إكمال المعلم بفوائد مسلم',
    pengarang: 'القاضي عياض',
    query_kitab: 'إكمال المعلم عياض',
    cat_id: KATEGORI.syuruh_hadits,
  },
  // ── Syarah Sunan Abu Dawud ───────────────────────────────────────────────
  {
    key: 'awnul_mabud',
    nama: 'عون المعبود شرح سنن أبي داود',
    pengarang: 'العظيم آبادي',
    query_kitab: 'عون المعبود أبو داود',
    cat_id: KATEGORI.syuruh_hadits,
  },
  {
    key: 'badlul_majhud',
    nama: 'بذل المجهود في حل سنن أبي داود',
    pengarang: 'خليل السهارنفوري',
    query_kitab: 'بذل المجهود أبو داود',
    cat_id: KATEGORI.syuruh_hadits,
  },
  // ── Syarah Jami' Tirmidzi ────────────────────────────────────────────────
  {
    key: 'tuhfatul_ahwadzi',
    nama: 'تحفة الأحوذي بشرح جامع الترمذي',
    pengarang: 'المباركفوري',
    query_kitab: 'تحفة الأحوذي الترمذي',
    cat_id: KATEGORI.syuruh_hadits,
  },
  // ── Syarah Sunan Nasai ───────────────────────────────────────────────────
  {
    key: 'dzakhiratul_uqba',
    nama: 'ذخيرة العقبى في شرح المجتبى',
    pengarang: 'الإتيوبي',
    query_kitab: 'ذخيرة العقبى النسائي',
    cat_id: KATEGORI.syuruh_hadits,
  },
  // ── Syarah Sunan Ibn Majah ───────────────────────────────────────────────
  {
    key: 'misbahuz_zujajah',
    nama: 'مصباح الزجاجة في زوائد ابن ماجه',
    pengarang: 'البوصيري',
    query_kitab: 'مصباح الزجاجة ابن ماجه',
    cat_id: KATEGORI.syuruh_hadits,
  },
  // ── Syarah Muwatha Malik ─────────────────────────────────────────────────
  {
    key: 'al_tamhid',
    nama: 'التمهيد لما في الموطأ من المعاني والأسانيد',
    pengarang: 'ابن عبد البر',
    query_kitab: 'التمهيد ابن عبد البر الموطأ',
    cat_id: KATEGORI.syuruh_hadits,
  },
  {
    key: 'al_istidzkar',
    nama: 'الاستذكار الجامع لمذاهب فقهاء الأمصار',
    pengarang: 'ابن عبد البر',
    query_kitab: 'الاستذكار ابن عبد البر',
    cat_id: KATEGORI.syuruh_hadits,
  },
  // ── Syarah Arba'in Nawawiyah ─────────────────────────────────────────────
  {
    key: 'syarah_arbain_utsaimin',
    nama: 'شرح الأربعين النووية',
    pengarang: 'ابن عثيمين',
    query_kitab: 'شرح الأربعين النووية ابن عثيمين',
    cat_id: KATEGORI.syuruh_hadits,
  },
  {
    key: 'fathul_qawi',
    nama: 'فتح القوي المتين في شرح الأربعين',
    pengarang: 'عبد المحسن العباد',
    query_kitab: 'فتح القوي المتين شرح الأربعين',
    cat_id: KATEGORI.syuruh_hadits,
  },
  // ── Syarah Bulughul Maram ────────────────────────────────────────────────
  {
    key: 'subulus_salam',
    nama: 'سبل السلام شرح بلوغ المرام',
    pengarang: 'الصنعاني',
    query_kitab: 'سبل السلام بلوغ المرام الصنعاني',
    cat_id: KATEGORI.syuruh_hadits,
  },
  {
    key: 'nail_awthar',
    nama: 'نيل الأوطار من أسرار منتقى الأخبار',
    pengarang: 'الشوكاني',
    query_kitab: 'نيل الأوطار الشوكاني',
    cat_id: KATEGORI.syuruh_hadits,
  },
  {
    key: 'taysir_allam',
    nama: 'تيسير العلام شرح عمدة الأحكام',
    pengarang: 'عبد الله البسام',
    query_kitab: 'تيسير العلام عمدة الأحكام البسام',
    cat_id: KATEGORI.syuruh_hadits,
  },
  // ── Syarah Riyadhus Shalihin ─────────────────────────────────────────────
  {
    key: 'dalilul_falihin',
    nama: 'دليل الفالحين لطرق رياض الصالحين',
    pengarang: 'ابن علان',
    query_kitab: 'دليل الفالحين رياض الصالحين ابن علان',
    cat_id: KATEGORI.syuruh_hadits,
  },
  {
    key: 'syarah_riyadh_utsaimin',
    nama: 'شرح رياض الصالحين',
    pengarang: 'ابن عثيمين',
    query_kitab: 'شرح رياض الصالحين ابن عثيمين',
    cat_id: KATEGORI.syuruh_hadits,
  },
];

export const KITAB_SYARAH_MAP = Object.fromEntries(
  KITAB_SYARAH.map(k => [k.key, k])
);
