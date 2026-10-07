/* =====================================================================
   CONTENT — the only file you edit for wording, dates, venue, contacts.
   Anything in [square brackets] is a placeholder still to be filled in.
   ===================================================================== */
window.CONTENT = {
  // Default look. Preview others with ?theme=awan, ?theme=melur or ?theme=malam
  theme: 'marun',

  couple: {
    a: 'Hazwan',
    b: 'Ayu',
    aFull: 'Muhammad Hazwan Fakhri',
    bFull: 'Nur Ayu Nabila',
    monoA: 'H',
    monoB: 'A'
  },

  parents: {
    father: '[Nama Bapa]',
    mother: '[Nama Ibu]'
  },

  event: {
    // ISO dates with Malaysia offset. Drive the countdown + pre/day/post phases.
    start: '2027-07-03T11:00:00+08:00',
    end:   '2027-07-03T16:00:00+08:00',
    dateLong:  'Sabtu · 3 Julai 2027',
    dateShort: '03 · 07 · 2027',
    dateCard:  '3 Julai 2027',
    timeCard:  '[11 pg – 4 ptg]',
    dayStart:  '[11:00 pagi]',
    hijri:     '28 Muharram 1449H'
  },

  venue: {
    name: '[Nama Dewan]',
    address: '[Alamat penuh, poskod, negeri]',
    waze: 'https://waze.com/ul',          // replace with your Waze share link
    maps: 'https://maps.google.com'       // replace with your Google Maps share link
  },

  schedule: [
    { time: '[11:00 pagi]', label: 'Ketibaan tetamu' },
    { time: '[12:30 tgh]',  label: 'Ketibaan pengantin' },
    { time: '[4:00 petang]', label: 'Majlis bersurai' }
  ],

  contacts: [
    { name: '[Nama]', role: 'Bapa', phone: '' },   // phone as 60123456789
    { name: '[Nama]', role: 'Ibu',  phone: '' }
  ],

  music: {
    src: 'assets/audio/lagu.mp3'   // drop an MP3 here (≈2–3 MB). Missing file = silent toggle.
  },

  rsvp: { maxPax: 5 },

  features: {
    intro: true,    // songket loom intro (skip with ?nointro)
    petals: true    // hujan bunga
  }
};
