// src/lib/sriLankaDistricts.ts
export const DISTRICTS: Record<string, string[]> = {
  // Western Province
 Colombo: [
  // Core Colombo Municipal Council divisions (Colombo 1–15)
  "Colombo 01 - Fort",
  "Colombo 02 - Slave Island",
  "Colombo 03 - Kollupitiya",
  "Colombo 04 - Bambalapitiya",
  "Colombo 05 - Havelock Town",
  "Colombo 06 - Wellawatte",
  "Colombo 07 - Cinnamon Gardens",
  "Colombo 08 - Borella",
  "Colombo 09 - Dematagoda",
  "Colombo 10 - Maradana",
  "Colombo 11 - Pettah",
  "Colombo 12 - Hulftsdorp",
  "Colombo 13 - Kotahena",
  "Colombo 14 - Grandpass",
  "Colombo 15 - Modara",

  // Greater Colombo / suburbs
  "Sri Jayawardenepura Kotte",
  "Dehiwala",
  "Mount Lavinia",
  "Moratuwa",
  "Kaduwela",
  "Maharagama",
  "Kesbewa",
  "Homagama",
  "Kolonnawa",
  "Rajagiriya",
  "Nugegoda",
  "Pannipitiya",
  "Boralesgamuwa",
  "Malabe",
  "Kottawa",
  "Pelawatta",
  "Ratmalana",
  "Kohuwala",
  "Battaramulla",
  "Thalawathugoda",
  "Nawinna",
  "Piliyandala",
  "Angoda",
  "Athurugiriya"
]
,
  Gampaha: [
    "Gampaha", "Negombo", "Wattala", "Ja-Ela", "Ragama", "Kiribathgoda",
    "Kadawatha", "Minuwangoda", "Veyangoda", "Divulapitiya", "Seeduwa", "Katunayake",
    "Ganemulla", "Nittambuwa", "Kelaniya" 
  ],
  Kalutara: [
    "Kalutara", "Panadura", "Horana", "Beruwala", "Aluthgama", "Wadduwa",
    "Bentota", "Mathugama", "Ingiriya", "Akalankapura", "Bandaragama", "Madurawala"
  ],

  // Central Province
  Kandy: [
    "Kandy", "Peradeniya", "Katugastota", "Gampola", "Nawalapitiya", "Mawanella",
     "Kadugannawa", "Hatton", "Kundasale"
  ],
  Matale: [
    "Matale", "Dambulla", "Sigiriya", "Habarana", "Galewela", "Ukuwela", "Rattota",
    "Naula", "Kandy View / Aluvihara area"
  ],
  "Nuwara Eliya": [
    "Nuwara Eliya", "Nanu Oya", "Hatton", "Talawakelle", "Ginigathhena", "Ramboda",
    "Walapane", "Kotmale"
  ],

  // Southern Province
  Galle: [
    "Galle", "Hikkaduwa", "Unawatuna", "Ambalangoda", "Bentota",
    "Karandeniya", "Imaduwa", "Baddegama"
  ],
  Matara: [
    "Matara", "Weligama", "Mirissa", "Dikwella", "Akuressa", "Ahangama",
    "Kamburupitiya", "Hakmana", "Polwathumodara"
  ],
  Hambantota: [
    "Hambantota", "Tangalle", "Tissamaharama", "Ambalantota", "Beliatta",
    "Weeraketiya", "Suriyawewa", "Sooriyawewa (industrial zone)"
  ],

  // Northern Province
  Jaffna: [
    "Jaffna", "Nallur", "Chavakachcheri", "Point Pedro", "Karainagar", "Valvettithurai",
    "Kankesanthurai", "Uduvil"
  ],
  Kilinochchi: [
    "Kilinochchi", "Poonakary", "Madhu", "Kandavalai"
  ],
  Mannar: [
    "Mannar", "Mannar Island", "Talaimannar", "Musali", "Manthai"
  ],
  Vavuniya: [
    "Vavuniya", "Mankulam", "Welioya", "Vavuniya Town"
  ],
  Mullaitivu: [
    "Mullaitivu", "Puthukkudiyiruppu", "Oddusuddan", "Mullaitivu Town"
  ],

  // North Western Province
  Puttalam: [
    "Puttalam", "Chilaw", "Wennappuwa", "Marawila", "Mundalama", "Kalpitiya",
    "Nikaweratiya", "Nattandiya"
  ],
  Kurunegala: [
    "Kurunegala", "Mawathagama", "Kuliyapitiya", "Polgahawela", "Wariyapola",
    "Melsiripura", "Ibbagamuwa", "Hettipola", "Kegalle (border note)"
  ],

  // North Central Province
  Anuradhapura: [
    "Anuradhapura", "Medawachchiya", "Padaviya", "Mihintale", "Tambuttegama",
    "Horowpothana", "Galenbindunuwewa"
  ],
  Polonnaruwa: [
    "Polonnaruwa", "Hingurakgoda", "Medirigiriya", "Dimbulagala", "Girithale",
    "Minneriya"
  ],

  // Eastern Province
  Trincomalee: [
    "Trincomalee", "Nilaveli", "Uppuveli", "Kinniya", "Muttur", "China Bay"
  ],
  Batticaloa: [
    "Batticaloa", "Eravur", "Valaichenai", "Kattankudy", "Pothuvil", "Kalkudah",
    "Manmunai"
  ],
  Ampara: [
    "Ampara", "Kalmunai", "Akkaraipattu", "Sainthamaruthu", "Sammanthurai",
    "Pottuvil", "Addalachchenai", "Arugam Bay"
  ],

  // Sabaragamuwa
  Ratnapura: [
    "Ratnapura", "Balangoda", "Pelmadulla", "Eheliyagoda", "Rakwana", "Kuruwita",
    "Imbulpe"
  ],
  Kegalle: [
    "Kegalle", "Mawanella", "Kitulgala", "Ruwanwella", "Belilgalla"
  ],

  // Uva Province
  Badulla: [
    "Badulla", "Bandarawela", "Ella", "Hali-Ela", "Passara", "Welimada", "Demodara"
  ],
  Moneragala: [
    "Moneragala", "Buttala", "Wellawaya", "Siyambalanduwa", "Medagama", "Bibile"
  ]
};
