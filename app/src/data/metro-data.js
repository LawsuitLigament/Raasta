// ============================================
// Delhi Metro Network Data — March 2026
// ============================================
// To update: Add/remove stations in the `lines` array and
// update `connections` in the stations object. That's it!

export const LINES = {
  red: { id: 'red', name: 'Red Line', color: '#E74C3C', textColor: '#fff' },
  yellow: { id: 'yellow', name: 'Yellow Line', color: '#F1C40F', textColor: '#000' },
  blue: { id: 'blue', name: 'Blue Line', color: '#2980B9', textColor: '#fff' },
  blueBranch: { id: 'blueBranch', name: 'Blue Line (Branch)', color: '#5DADE2', textColor: '#fff' },
  green: { id: 'green', name: 'Green Line', color: '#27AE60', textColor: '#fff' },
  greenBranch: { id: 'greenBranch', name: 'Green Line (Branch)', color: '#2ECC71', textColor: '#fff' },
  violet: { id: 'violet', name: 'Violet Line', color: '#8E44AD', textColor: '#fff' },
  pink: { id: 'pink', name: 'Pink Line', color: '#E91E8F', textColor: '#fff' },
  magenta: { id: 'magenta', name: 'Magenta Line', color: '#E91E63', textColor: '#fff' },
  grey: { id: 'grey', name: 'Grey Line', color: '#95A5A6', textColor: '#fff' },
  orange: { id: 'orange', name: 'Airport Express', color: '#E67E22', textColor: '#fff' },
};

// All line station sequences (ordered)
export const LINE_STATIONS = {
  red: [
    'rithala', 'rohini-west', 'rohini-east', 'pitampura', 'kohat-enclave',
    'netaji-subhash-place', 'keshav-puram', 'kanhaiya-nagar', 'inderlok',
    'shastri-nagar', 'pratap-nagar', 'pul-bangash', 'tis-hazari',
    'kashmere-gate', 'shastri-park', 'seelampur', 'welcome', 'shahdara',
    'mansarovar-park', 'jhilmil', 'dilshad-garden', 'shaheed-nagar',
    'raj-bagh', 'rajendra-nagar', 'shyam-park', 'mohan-nagar',
    'arthala', 'hindon-river', 'shaheed-sthal'
  ],
  yellow: [
    'samaypur-badli', 'rohini-sector-18-19', 'haiderpur-badli-mor',
    'jahangirpuri', 'adarsh-nagar', 'azadpur', 'model-town',
    'gtb-nagar', 'vishwavidyalaya', 'vidhan-sabha', 'civil-lines',
    'kashmere-gate', 'chandni-chowk', 'chawri-bazar', 'new-delhi',
    'rajiv-chowk', 'patel-chowk', 'central-secretariat', 'udyog-bhawan',
    'lok-kalyan-marg', 'jorbagh', 'dilli-haat-ina', 'aiims',
    'green-park', 'hauz-khas', 'malviya-nagar', 'saket',
    'qutab-minar', 'chhattarpur', 'sultanpur', 'ghitorni',
    'arjan-garh', 'guru-dronacharya', 'sikandarpur', 'mg-road',
    'iffco-chowk', 'huda-city-centre'
  ],
  blue: [
    'dwarka-sector-21', 'dwarka-sector-8', 'dwarka-sector-9',
    'dwarka-sector-10', 'dwarka-sector-11', 'dwarka-sector-12',
    'dwarka-sector-13', 'dwarka-sector-14', 'dwarka', 'dwarka-mor',
    'nawada', 'uttam-nagar-west', 'uttam-nagar-east', 'janakpuri-west',
    'janakpuri-east', 'tilak-nagar', 'subhash-nagar', 'tagore-garden',
    'rajouri-garden', 'ramesh-nagar', 'moti-nagar', 'kirti-nagar',
    'shadipur', 'patel-nagar', 'rajendra-place', 'karol-bagh',
    'jhandewalan', 'rk-ashram-marg', 'rajiv-chowk', 'barakhamba-road',
    'mandi-house', 'supreme-court', 'indraprastha', 'yamuna-bank',
    'akshardham', 'mayur-vihar-1', 'mayur-vihar-ext', 'new-ashok-nagar',
    'noida-sector-15', 'noida-sector-16', 'noida-sector-18',
    'botanical-garden', 'golf-course', 'noida-city-centre',
    'noida-sector-34', 'noida-sector-52', 'noida-sector-61',
    'noida-sector-59', 'noida-sector-62', 'noida-electronic-city'
  ],
  blueBranch: [
    'yamuna-bank', 'laxmi-nagar', 'nirman-vihar', 'preet-vihar',
    'karkarduma', 'anand-vihar', 'kaushambi', 'vaishali'
  ],
  green: [
    'inderlok', 'ashok-park-main', 'punjabi-bagh', 'shivaji-park',
    'madipur', 'paschim-vihar-east', 'paschim-vihar-west', 'peeragarhi',
    'udyog-nagar', 'surajmal-stadium', 'nangloi', 'nangloi-railway',
    'rajdhani-park', 'mundka', 'mundka-industrial', 'ghevra',
    'tikri-kalan', 'tikri-border', 'pandit-shree-ram-sharma',
    'bahadurgarh-city', 'brigadier-hoshiar-singh'
  ],
  greenBranch: [
    'ashok-park-main', 'satguru-ram-singh-marg', 'kirti-nagar'
  ],
  violet: [
    'kashmere-gate', 'lal-quila', 'jama-masjid', 'delhi-gate',
    'ito', 'mandi-house', 'janpath', 'central-secretariat',
    'khan-market', 'jln-stadium', 'jangpura', 'lajpat-nagar',
    'moolchand', 'kailash-colony', 'nehru-place', 'kalkaji-mandir',
    'govind-puri', 'harkesh-nagar-okhla', 'jasola-apollo',
    'sarita-vihar', 'mohan-estate', 'tughlakabad', 'badarpur-border',
    'sarai', 'nhpc-chowk', 'mewala-maharajpur', 'sector-28',
    'badkal-mor', 'old-faridabad', 'neelam-chowk-ajronda',
    'bata-chowk', 'escorts-mujesar', 'sant-surdas-sihi',
    'raja-nahar-singh'
  ],
  pink: [
    'majlis-park', 'azadpur', 'shalimar-bagh', 'netaji-subhash-place',
    'shakurpur', 'punjabi-bagh', 'esi-basai-darapur',
    'rajouri-garden', 'maya-puri', 'naraina-vihar', 'delhi-cantt',
    'dhaula-kuan', 'sir-vishweshwaraiah-moti-bagh',
    'bhikaji-cama-place', 'sarojini-nagar', 'dilli-haat-ina',
    'south-extension', 'lajpat-nagar', 'vinobapuri', 'ashram',
    'sarai-kale-khan', 'mayur-vihar-pocket-1', 'mayur-vihar-phase-1',
    'trilokpuri-sanjay-lake', 'vinod-nagar-east',
    'mandawali-west-vinod-nagar', 'ip-extension', 'anand-vihar',
    'karkarduma', 'karkarduma-court', 'krishna-nagar',
    'east-azad-nagar', 'welcome', 'gokulpuri', 'johri-enclave',
    'shiv-vihar', 'maujpur-babarpur', 'yamuna-vihar',
    'bhajanpura', 'khajuri-khas', 'nanaksar-sonia-vihar',
    'soorghat', 'jagatpur-wazirabad', 'jharoda-majra', 'burari',
    'majlis-park'
  ],
  magenta: [
    'janakpuri-west', 'dabri-mor', 'dashrath-puri', 'palam',
    'sadar-bazar-cantonment', 'terminal-1-igi', 'shankar-vihar',
    'vasant-vihar', 'munirka', 'rk-puram', 'iit-delhi', 'hauz-khas',
    'panchsheel-park', 'chirag-delhi', 'greater-kailash',
    'nehru-enclave', 'kalkaji-mandir', 'okhla-nsic', 'sukhdev-vihar',
    'jamia-millia-islamia', 'okhla-vihar', 'jasola-vihar-shaheen-bagh',
    'kalindi-kunj', 'okhla-bird-sanctuary', 'botanical-garden'
  ],
  grey: [
    'dwarka', 'nangli', 'najafgarh', 'dhansa-bus-stand'
  ],
  orange: [
    'new-delhi', 'shivaji-stadium', 'dhaula-kuan', 'delhi-aerocity',
    'igi-airport-t3', 'dwarka-sector-21', 'yashobhoomi-dwarka-sector-25'
  ]
};

// Station information database
// Each station: { name, lines[], exitInfo }
export const STATIONS = {};

// Helper to register stations from line data
function registerStation(id, name, lines) {
  if (STATIONS[id]) {
    // Add new lines to existing station
    lines.forEach(l => {
      if (!STATIONS[id].lines.includes(l)) {
        STATIONS[id].lines.push(l);
      }
    });
  } else {
    STATIONS[id] = { id, name, lines: [...lines], exitInfo: '' };
  }
}

// Register all stations with human-readable names
const stationNames = {
  // Red Line
  'rithala': 'Rithala', 'rohini-west': 'Rohini West', 'rohini-east': 'Rohini East',
  'pitampura': 'Pitampura', 'kohat-enclave': 'Kohat Enclave',
  'netaji-subhash-place': 'Netaji Subhash Place', 'keshav-puram': 'Keshav Puram',
  'kanhaiya-nagar': 'Kanhaiya Nagar', 'inderlok': 'Inderlok',
  'shastri-nagar': 'Shastri Nagar', 'pratap-nagar': 'Pratap Nagar',
  'pul-bangash': 'Pul Bangash', 'tis-hazari': 'Tis Hazari',
  'kashmere-gate': 'Kashmere Gate', 'shastri-park': 'Shastri Park',
  'seelampur': 'Seelampur', 'welcome': 'Welcome', 'shahdara': 'Shahdara',
  'mansarovar-park': 'Mansarovar Park', 'jhilmil': 'Jhilmil',
  'dilshad-garden': 'Dilshad Garden', 'shaheed-nagar': 'Shaheed Nagar',
  'raj-bagh': 'Raj Bagh', 'rajendra-nagar': 'Major Mohit Sharma Rajendra Nagar',
  'shyam-park': 'Shyam Park', 'mohan-nagar': 'Mohan Nagar',
  'arthala': 'Arthala', 'hindon-river': 'Hindon River',
  'shaheed-sthal': 'Shaheed Sthal (New Bus Adda)',

  // Yellow Line
  'samaypur-badli': 'Samaypur Badli', 'rohini-sector-18-19': 'Rohini Sector 18, 19',
  'haiderpur-badli-mor': 'Haiderpur Badli Mor', 'jahangirpuri': 'Jahangirpuri',
  'adarsh-nagar': 'Adarsh Nagar', 'azadpur': 'Azadpur', 'model-town': 'Model Town',
  'gtb-nagar': 'GTB Nagar', 'vishwavidyalaya': 'Vishwavidyalaya',
  'vidhan-sabha': 'Vidhan Sabha', 'civil-lines': 'Civil Lines',
  'chandni-chowk': 'Chandni Chowk', 'chawri-bazar': 'Chawri Bazar',
  'new-delhi': 'New Delhi', 'rajiv-chowk': 'Rajiv Chowk',
  'patel-chowk': 'Patel Chowk', 'central-secretariat': 'Central Secretariat',
  'udyog-bhawan': 'Udyog Bhawan', 'lok-kalyan-marg': 'Lok Kalyan Marg',
  'jorbagh': 'Jor Bagh', 'dilli-haat-ina': 'Dilli Haat - INA', 'aiims': 'AIIMS',
  'green-park': 'Green Park', 'hauz-khas': 'Hauz Khas',
  'malviya-nagar': 'Malviya Nagar', 'saket': 'Saket', 'qutab-minar': 'Qutab Minar',
  'chhattarpur': 'Chhattarpur', 'sultanpur': 'Sultanpur', 'ghitorni': 'Ghitorni',
  'arjan-garh': 'Arjan Garh', 'guru-dronacharya': 'Guru Dronacharya',
  'sikandarpur': 'Sikandarpur', 'mg-road': 'MG Road', 'iffco-chowk': 'IFFCO Chowk',
  'huda-city-centre': 'Millennium City Centre Gurugram',

  // Blue Line
  'dwarka-sector-21': 'Dwarka Sector 21', 'dwarka-sector-8': 'Dwarka Sector 8',
  'dwarka-sector-9': 'Dwarka Sector 9', 'dwarka-sector-10': 'Dwarka Sector 10',
  'dwarka-sector-11': 'Dwarka Sector 11', 'dwarka-sector-12': 'Dwarka Sector 12',
  'dwarka-sector-13': 'Dwarka Sector 13', 'dwarka-sector-14': 'Dwarka Sector 14',
  'dwarka': 'Dwarka', 'dwarka-mor': 'Dwarka Mor',
  'nawada': 'Nawada', 'uttam-nagar-west': 'Uttam Nagar West',
  'uttam-nagar-east': 'Uttam Nagar East', 'janakpuri-west': 'Janakpuri West',
  'janakpuri-east': 'Janakpuri East', 'tilak-nagar': 'Tilak Nagar',
  'subhash-nagar': 'Subhash Nagar', 'tagore-garden': 'Tagore Garden',
  'rajouri-garden': 'Rajouri Garden', 'ramesh-nagar': 'Ramesh Nagar',
  'moti-nagar': 'Moti Nagar', 'kirti-nagar': 'Kirti Nagar',
  'shadipur': 'Shadipur', 'patel-nagar': 'Patel Nagar',
  'rajendra-place': 'Rajendra Place', 'karol-bagh': 'Karol Bagh',
  'jhandewalan': 'Jhandewalan', 'rk-ashram-marg': 'RK Ashram Marg',
  'rajiv-chowk': 'Rajiv Chowk', 'barakhamba-road': 'Barakhamba Road',
  'mandi-house': 'Mandi House', 'supreme-court': 'Supreme Court',
  'indraprastha': 'Indraprastha', 'yamuna-bank': 'Yamuna Bank',
  'akshardham': 'Akshardham', 'mayur-vihar-1': 'Mayur Vihar-I',
  'mayur-vihar-ext': 'Mayur Vihar Extension', 'new-ashok-nagar': 'New Ashok Nagar',
  'noida-sector-15': 'Noida Sector 15', 'noida-sector-16': 'Noida Sector 16',
  'noida-sector-18': 'Noida Sector 18', 'botanical-garden': 'Botanical Garden',
  'golf-course': 'Golf Course', 'noida-city-centre': 'Noida City Centre',
  'noida-sector-34': 'Noida Sector 34', 'noida-sector-52': 'Noida Sector 52',
  'noida-sector-61': 'Noida Sector 61', 'noida-sector-59': 'Noida Sector 59',
  'noida-sector-62': 'Noida Sector 62', 'noida-electronic-city': 'Noida Electronic City',

  // Blue Branch
  'laxmi-nagar': 'Laxmi Nagar', 'nirman-vihar': 'Nirman Vihar',
  'preet-vihar': 'Preet Vihar', 'karkarduma': 'Karkarduma',
  'anand-vihar': 'Anand Vihar ISBT', 'kaushambi': 'Kaushambi', 'vaishali': 'Vaishali',

  // Green Line
  'ashok-park-main': 'Ashok Park Main', 'punjabi-bagh': 'Punjabi Bagh (West)',
  'shivaji-park': 'Shivaji Park', 'madipur': 'Madipur',
  'paschim-vihar-east': 'Paschim Vihar East', 'paschim-vihar-west': 'Paschim Vihar West',
  'peeragarhi': 'Peeragarhi', 'udyog-nagar': 'Udyog Nagar',
  'surajmal-stadium': 'Surajmal Stadium', 'nangloi': 'Nangloi',
  'nangloi-railway': 'Nangloi Railway Station', 'rajdhani-park': 'Rajdhani Park',
  'mundka': 'Mundka', 'mundka-industrial': 'Mundka Industrial Area',
  'ghevra': 'Ghevra', 'tikri-kalan': 'Tikri Kalan', 'tikri-border': 'Tikri Border',
  'pandit-shree-ram-sharma': 'Pandit Shree Ram Sharma',
  'bahadurgarh-city': 'Bahadurgarh City',
  'brigadier-hoshiar-singh': 'Brigadier Hoshiar Singh',
  'satguru-ram-singh-marg': 'Satguru Ram Singh Marg',

  // Violet Line
  'lal-quila': 'Lal Quila', 'jama-masjid': 'Jama Masjid',
  'delhi-gate': 'Delhi Gate', 'ito': 'ITO', 'janpath': 'Janpath',
  'khan-market': 'Khan Market', 'jln-stadium': 'JLN Stadium',
  'jangpura': 'Jangpura', 'lajpat-nagar': 'Lajpat Nagar',
  'moolchand': 'Moolchand', 'kailash-colony': 'Kailash Colony',
  'nehru-place': 'Nehru Place', 'kalkaji-mandir': 'Kalkaji Mandir',
  'govind-puri': 'Govind Puri', 'harkesh-nagar-okhla': 'Harkesh Nagar Okhla',
  'jasola-apollo': 'Jasola Apollo', 'sarita-vihar': 'Sarita Vihar',
  'mohan-estate': 'Mohan Estate', 'tughlakabad': 'Tughlakabad',
  'badarpur-border': 'Badarpur Border', 'sarai': 'Sarai',
  'nhpc-chowk': 'NHPC Chowk', 'mewala-maharajpur': 'Mewala Maharajpur',
  'sector-28': 'Sector 28', 'badkal-mor': 'Badkal Mor',
  'old-faridabad': 'Old Faridabad', 'neelam-chowk-ajronda': 'Neelam Chowk Ajronda',
  'bata-chowk': 'Bata Chowk', 'escorts-mujesar': 'Escorts Mujesar',
  'sant-surdas-sihi': 'Sant Surdas (Sihi)',
  'raja-nahar-singh': 'Raja Nahar Singh (Ballabhgarh)',

  // Pink Line
  'majlis-park': 'Majlis Park', 'shalimar-bagh': 'Shalimar Bagh',
  'shakurpur': 'Shakurpur',
  'esi-basai-darapur': 'ESI Basai Darapur', 'maya-puri': 'Maya Puri',
  'naraina-vihar': 'Naraina Vihar', 'delhi-cantt': 'Delhi Cantt',
  'sir-vishweshwaraiah-moti-bagh': 'Sir Vishweshwaraiah Moti Bagh',
  'bhikaji-cama-place': 'Bhikaji Cama Place', 'sarojini-nagar': 'Sarojini Nagar',
  'south-extension': 'South Extension', 'vinobapuri': 'Vinobapuri',
  'ashram': 'Ashram', 'sarai-kale-khan': 'Sarai Kale Khan Hazrat Nizamuddin',
  'mayur-vihar-pocket-1': 'Mayur Vihar Pocket 1',
  'mayur-vihar-phase-1': 'Mayur Vihar Phase-1',
  'trilokpuri-sanjay-lake': 'Trilokpuri Sanjay Lake',
  'vinod-nagar-east': 'Vinod Nagar East',
  'mandawali-west-vinod-nagar': 'Mandawali - West Vinod Nagar',
  'ip-extension': 'IP Extension', 'karkarduma-court': 'Karkarduma Court',
  'krishna-nagar': 'Krishna Nagar', 'east-azad-nagar': 'East Azad Nagar',
  'gokulpuri': 'Gokulpuri', 'johri-enclave': 'Johri Enclave',
  'shiv-vihar': 'Shiv Vihar', 'maujpur-babarpur': 'Maujpur-Babarpur',
  'yamuna-vihar': 'Yamuna Vihar', 'bhajanpura': 'Bhajanpura',
  'khajuri-khas': 'Khajuri Khas', 'nanaksar-sonia-vihar': 'Nanaksar-Sonia Vihar',
  'soorghat': 'Soorghat', 'jagatpur-wazirabad': 'Jagatpur-Wazirabad',
  'jharoda-majra': 'Jharoda Majra', 'burari': 'Burari',

  // Magenta Line
  'dabri-mor': 'Dabri Mor - Janakpuri South', 'dashrath-puri': 'Dashrath Puri',
  'palam': 'Palam', 'sadar-bazar-cantonment': 'Sadar Bazar Cantonment',
  'terminal-1-igi': 'Terminal 1 - IGI Airport', 'shankar-vihar': 'Shankar Vihar',
  'vasant-vihar': 'Vasant Vihar', 'munirka': 'Munirka', 'rk-puram': 'RK Puram',
  'iit-delhi': 'IIT Delhi', 'panchsheel-park': 'Panchsheel Park',
  'chirag-delhi': 'Chirag Delhi', 'greater-kailash': 'Greater Kailash',
  'nehru-enclave': 'Nehru Enclave', 'okhla-nsic': 'Okhla NSIC',
  'sukhdev-vihar': 'Sukhdev Vihar', 'jamia-millia-islamia': 'Jamia Millia Islamia',
  'okhla-vihar': 'Okhla Vihar',
  'jasola-vihar-shaheen-bagh': 'Jasola Vihar Shaheen Bagh',
  'kalindi-kunj': 'Kalindi Kunj', 'okhla-bird-sanctuary': 'Okhla Bird Sanctuary',

  // Grey Line
  'nangli': 'Nangli', 'najafgarh': 'Najafgarh', 'dhansa-bus-stand': 'Dhansa Bus Stand',

  // Airport Express
  'shivaji-stadium': 'Shivaji Stadium', 'dhaula-kuan': 'Dhaula Kuan (South Campus)',
  'delhi-aerocity': 'Delhi Aerocity', 'igi-airport-t3': 'IGI Airport (T3)',
  'yashobhoomi-dwarka-sector-25': 'Yashobhoomi Dwarka Sector 25',
};

// Register all stations with their lines
Object.entries(LINE_STATIONS).forEach(([lineId, stations]) => {
  stations.forEach(sId => {
    registerStation(sId, stationNames[sId] || sId, [lineId]);
  });
});

// ============================================
// Graph: adjacency with travel times (minutes)
// ~2 min between regular stations
// ============================================
export const GRAPH = {};

function addEdge(s1, s2, time, line) {
  if (!GRAPH[s1]) GRAPH[s1] = [];
  if (!GRAPH[s2]) GRAPH[s2] = [];
  GRAPH[s1].push({ to: s2, time, line });
  GRAPH[s2].push({ to: s1, time, line });
}

// Build graph from line sequences
Object.entries(LINE_STATIONS).forEach(([lineId, stations]) => {
  for (let i = 0; i < stations.length - 1; i++) {
    const s1 = stations[i];
    const s2 = stations[i + 1];
    // Pink line loop: last station connects back to first
    addEdge(s1, s2, 2, lineId);
  }
});

// ============================================
// Interchange transfer times (variable)
// ============================================
export const INTERCHANGE_TIMES = {
  'kashmere-gate': { 'red-yellow': 5, 'red-violet': 6, 'yellow-violet': 4, 'yellow-red': 5, 'violet-red': 6, 'violet-yellow': 4 },
  'rajiv-chowk': { 'yellow-blue': 3, 'blue-yellow': 3 },
  'central-secretariat': { 'yellow-violet': 3, 'violet-yellow': 3 },
  'mandi-house': { 'blue-violet': 4, 'violet-blue': 4 },
  'inderlok': { 'red-green': 3, 'green-red': 3 },
  'kirti-nagar': { 'blue-greenBranch': 4, 'greenBranch-blue': 4 },
  'hauz-khas': { 'yellow-magenta': 4, 'magenta-yellow': 4 },
  'botanical-garden': { 'blue-magenta': 3, 'magenta-blue': 3 },
  'kalkaji-mandir': { 'violet-magenta': 3, 'magenta-violet': 3 },
  'janakpuri-west': { 'blue-magenta': 3, 'magenta-blue': 3 },
  'yamuna-bank': { 'blue-blueBranch': 2, 'blueBranch-blue': 2 },
  'new-delhi': { 'yellow-orange': 5, 'orange-yellow': 5 },
  'dwarka-sector-21': { 'blue-orange': 4, 'orange-blue': 4 },
  'dwarka': { 'blue-grey': 3, 'grey-blue': 3 },
  'netaji-subhash-place': { 'red-pink': 4, 'pink-red': 4 },
  'azadpur': { 'yellow-pink': 4, 'pink-yellow': 4 },
  'dilli-haat-ina': { 'yellow-pink': 3, 'pink-yellow': 3 },
  'welcome': { 'red-pink': 4, 'pink-red': 4 },
  'anand-vihar': { 'blueBranch-pink': 4, 'pink-blueBranch': 4 },
  'karkarduma': { 'blueBranch-pink': 3, 'pink-blueBranch': 3 },
  'lajpat-nagar': { 'violet-pink': 3, 'pink-violet': 3 },
  'rajouri-garden': { 'blue-pink': 4, 'pink-blue': 4 },
  'mayur-vihar-phase-1': { 'blue-pink': 4, 'pink-blue': 4 },
  'ashok-park-main': { 'green-greenBranch': 2, 'greenBranch-green': 2 },
  'dhaula-kuan': { 'pink-orange': 8, 'orange-pink': 8 },
  'punjabi-bagh': { 'pink-green': 5, 'green-pink': 5 },
};

// Get transfer time between two lines at a station
export function getTransferTime(stationId, fromLine, toLine) {
  const key1 = `${fromLine}-${toLine}`;
  const key2 = `${toLine}-${fromLine}`;
  const times = INTERCHANGE_TIMES[stationId];
  if (times) {
    return times[key1] || times[key2] || 4; // default 4 min if not specified
  }
  return 4; // default interchange time
}

// ============================================
// Fare Chart (August 2025 revised, still valid March 2026)
// Distance-based in km
// ============================================
export const FARE_CHART = {
  slabs: [
    { maxKm: 2, tokenFare: 11 },
    { maxKm: 5, tokenFare: 21 },
    { maxKm: 12, tokenFare: 32 },
    { maxKm: 21, tokenFare: 43 },
    { maxKm: 32, tokenFare: 54 },
    { maxKm: Infinity, tokenFare: 64 },
  ],
  cardDiscountPercent: 10,
  offPeakDiscountPercent: 20,
};

// Check if currently off-peak (Sundays, 06:00-08:00, 12:00-17:00, 21:00-onwards)
export function isOffPeak(date = new Date()) {
  const day = date.getDay();
  if (day === 0) return true; 
  
  const hour = date.getHours();
  if (hour >= 6 && hour < 8) return true;
  if (hour >= 12 && hour < 17) return true;
  if (hour >= 21 || hour < 6) return true;
  return false;
}

// Average distance between stations in km (estimated)
// Some lines have longer spacing (Airport Express, extensions)
export const AVG_DISTANCE_KM = {
  red: 1.2,
  yellow: 1.35,
  blue: 1.15,
  blueBranch: 1.25,
  green: 1.45,
  greenBranch: 1.55,
  violet: 1.4,
  pink: 1.55,
  magenta: 1.55,
  grey: 1.7,
  orange: 4.5,
};

// Calculate fare from distance
export function calculateFare(distanceKm) {
  const offPeak = isOffPeak();
  const currentDiscount = offPeak ? FARE_CHART.offPeakDiscountPercent : FARE_CHART.cardDiscountPercent;

  for (const slab of FARE_CHART.slabs) {
    if (distanceKm <= slab.maxKm) {
      const tokenFare = slab.tokenFare;
      const cardFare = Math.round(tokenFare * (1 - currentDiscount / 100));
      return { tokenFare, cardFare, savings: tokenFare - cardFare, isOffPeak: offPeak };
    }
  }
  const last = FARE_CHART.slabs[FARE_CHART.slabs.length - 1];
  const tokenFare = last.tokenFare;
  const cardFare = Math.round(tokenFare * (1 - currentDiscount / 100));
  return { tokenFare, cardFare, savings: tokenFare - cardFare, isOffPeak: offPeak };
}

// Estimate distance for a route (list of station IDs with their lines)
export function estimateDistance(segments) {
  let totalKm = 0;
  segments.forEach(seg => {
    const avgKm = AVG_DISTANCE_KM[seg.line] || 1.3;
    totalKm += (seg.stationCount - 1) * avgKm;
  });
  return Math.round(totalKm * 10) / 10;
}

// Get all station IDs sorted alphabetically by name
export function getAllStationsSorted() {
  return Object.values(STATIONS)
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Search stations by name (fuzzy)
export function searchStations(query) {
  if (!query || query.trim().length === 0) return getAllStationsSorted();
  const q = query.toLowerCase().trim();
  return Object.values(STATIONS)
    .filter(s => s.name.toLowerCase().includes(q))
    .sort((a, b) => {
      const aStartsWith = a.name.toLowerCase().startsWith(q);
      const bStartsWith = b.name.toLowerCase().startsWith(q);
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      return a.name.localeCompare(b.name);
    });
}

// ============================================
// Exit Gates Information
// ============================================
export const EXIT_GATES = {
  'rajiv-chowk': [
    { gates: '1, 2, 3, 4', landmark: 'B Block / Minto Road' },
    { gates: '5, 6', landmark: 'Janpath / Palika Bazaar' },
    { gates: '7, 8', landmark: 'A Block / Radial Road' }
  ],
  'kashmere-gate': [
    { gates: '1, 2, 3', landmark: 'ISBT / Mori Gate' },
    { gates: '4, 5, 6', landmark: 'Nicholson Road / Ritz Cinema' },
    { gates: '7', landmark: 'Lal Quila / Old Delhi' },
    { gates: '8', landmark: 'GPO / Inter State Bus Terminus' }
  ],
  'new-delhi': [
    { gates: '1', landmark: 'New Delhi Railway Station (Paharganj)' },
    { gates: '2', landmark: 'New Delhi Railway Station (Ajmeri Gate)' },
    { gates: '3', landmark: 'Airport Express Line Transfer' }
  ],
  'chandni-chowk': [
    { gates: '1', landmark: 'Town Hall / HC Sen Marg' },
    { gates: '2', landmark: 'Delhi Public Library' },
    { gates: '3, 4', landmark: 'Red Fort / Old Delhi Railway Station' },
    { gates: '5', landmark: 'Fatehpuri Mosque / Gurdwara Sis Ganj Sahib' }
  ],
  'chawri-bazar': [
    { gates: '1', landmark: 'Jama Masjid' },
    { gates: '2', landmark: 'Hauz Qazi / Nai Sarak' },
    { gates: '3', landmark: 'Ajmeri Gate' }
  ],
  'mandi-house': [
    { gates: '1', landmark: 'National School of Drama (NSD) / Kamani Aud.' },
    { gates: '2', landmark: 'Doordarshan Bhavan' },
    { gates: '3', landmark: 'Triveni Kala Sangam' },
    { gates: '4', landmark: 'Modern School / Barakhamba Road' }
  ],
  'supreme-court': [
    { gates: '1, 2', landmark: 'Supreme Court of India' },
    { gates: '3, 4', landmark: 'Pragati Maidan / ITPO' },
    { gates: '5', landmark: 'Appu Ghar / Mathura Road' }
  ],
  'ito': [
    { gates: '1', landmark: 'Delhi Police Headquarters' },
    { gates: '2', landmark: 'Income Tax Office' },
    { gates: '3', landmark: 'Vikas Minar' },
    { gates: '4', landmark: 'School of Planning and Architecture' }
  ],
  'central-secretariat': [
    { gates: '1', landmark: 'Krishi Bhawan / Parliament House' },
    { gates: '2', landmark: 'Rashtrapati Bhavan / North Block' },
    { gates: '3', landmark: 'Sena Bhawan' },
    { gates: '4', landmark: 'India Gate / Rajpath' }
  ],
  'dilli-haat-ina': [
    { gates: '1', landmark: 'Dilli Haat / Kidwai Nagar' },
    { gates: '2', landmark: 'INA Market' },
    { gates: '3', landmark: 'Safdarjung Hospital' }
  ],
  'aiims': [
    { gates: '1', landmark: 'AIIMS Main Campus' },
    { gates: '2', landmark: 'Safdarjung Hospital' },
    { gates: '3, 4', landmark: 'Gautam Nagar / Medical Enclave' }
  ],
  'hauz-khas': [
    { gates: '1, 2', landmark: 'Hauz Khas Village / IIT Delhi' },
    { gates: '3', landmark: 'Khel Gaon Marg / Panchsheel Park' },
    { gates: '4', landmark: 'SDA Market' }
  ],
  'saket': [
    { gates: '1', landmark: 'Select Citywalk / DLF Avenue' },
    { gates: '2', landmark: 'PVR Anupam Complex' },
    { gates: '3', landmark: 'Garden of Five Senses' }
  ],
  'qutab-minar': [
    { gates: '1', landmark: 'Mehrauli Archaeological Park' },
    { gates: '2', landmark: 'Qutub Minar Complex' },
    { gates: '3', landmark: 'Lado Sarai' }
  ],
  'nehru-place': [
    { gates: '1', landmark: 'Nehru Place IT Market' },
    { gates: '2', landmark: 'Epicuria Food Mall' },
    { gates: '3', landmark: 'Paras Cinema / Kalkaji' }
  ],
  'kalkaji-mandir': [
    { gates: '1', landmark: 'Kalkaji Temple' },
    { gates: '2', landmark: 'Lotus Temple / Bahai House of Worship' },
    { gates: '3', landmark: 'Okhla NSIC / Nehru Place' }
  ],
  'botanical-garden': [
    { gates: '1, 2', landmark: 'Botanical Garden / Sector 38A' },
    { gates: '3', landmark: 'Noida Sector 37 / Bus Stand' },
    { gates: '4', landmark: 'The Great India Place Mall' }
  ],
  'jama-masjid': [
    { gates: '1', landmark: 'Kasturba Hospital' },
    { gates: '2', landmark: 'Jama Masjid / Meena Bazaar' },
    { gates: '3', landmark: 'Red Fort / Netaji Subhash Marg' }
  ],
  'lal-quila': [
    { gates: '1', landmark: 'Red Fort / Lahori Gate' },
    { gates: '2', landmark: 'Chandni Chowk Market' },
    { gates: '3', landmark: 'Kashmere Gate ISBT / Old Delhi Station' },
    { gates: '4', landmark: 'Gauri Shankar Mandir' }
  ],
  'janpath': [
    { gates: '1', landmark: 'Janpath Market / Tibetan Market' },
    { gates: '2', landmark: 'Jantar Mantar' },
    { gates: '3', landmark: 'National Museum' },
    { gates: '4', landmark: 'Connaught Place / Palika Bazaar' }
  ],
  'khan-market': [
    { gates: '1, 3', landmark: 'Khan Market / Lok Nayak Bhawan' },
    { gates: '2', landmark: 'Sujan Singh Park' },
    { gates: '4', landmark: 'Taj Mahal Hotel / Humayun Road' }
  ],
  'vishwavidyalaya': [
    { gates: '1, 2', landmark: 'Delhi University North Campus / Arts Faculty' },
    { gates: '3', landmark: 'Mall Road / Cavalry Lane' },
    { gates: '4', landmark: 'Kamla Nagar Market' }
  ],
  'vidhan-sabha': [
    { gates: '1', landmark: 'Delhi Legislative Assembly' },
    { gates: '2', landmark: 'Old Secretariat' },
    { gates: '3', landmark: 'Majnu Ka Tilla' }
  ],
  'akshardham': [
    { gates: '1', landmark: 'Swaminarayan Akshardham Temple' },
    { gates: '2', landmark: 'Commonwealth Games Village' }
  ],
  'igi-airport-t3': [
    { gates: '1', landmark: 'Terminal 3 Departures' },
    { gates: '2', landmark: 'Terminal 3 Arrivals' }
  ]
};
