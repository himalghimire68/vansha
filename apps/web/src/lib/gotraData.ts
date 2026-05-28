export interface GotraEntry {
  gotra: string
  nepali: string
  surnames: string[]
}

export const GOTRA_LIST: GotraEntry[] = [
  { gotra: 'ANGIRAS',       nepali: 'अंगिरास',     surnames: ['Joshi', 'Sedai', 'Saunak', 'Shahi'] },
  { gotra: 'AGASTI',        nepali: 'अगस्ती',      surnames: ['Dhungel'] },
  { gotra: 'ATRI',          nepali: 'अत्रि',        surnames: ['Chapagai', 'Wosti', 'Mishra', 'Khatiwada', 'Ojha', 'Adhikari', 'Gotame', 'Kshatri Malla', 'Pahari'] },
  { gotra: 'ATREYA',        nepali: 'आत्रेय',       surnames: ['Paudel', 'Devkota', 'Pokhrel', 'Kalikote', 'Sharma', 'Aryal', 'Sigdel', 'Bagale Thapa'] },
  { gotra: 'UPAMANYU',      nepali: 'उपमन्यु',      surnames: ['Mainali', 'Dhakal', 'Bartaula', 'Bhatta', 'Pandey'] },
  { gotra: 'KASYAP',        nepali: 'कश्यप',        surnames: ['Shah', 'Sahi', 'Rayamajhi', 'Ghimire', 'Godhar', 'Kathayat', 'Gartaula', 'Adhikari', 'Bogati', 'Budhathoki', 'Badaal'] },
  { gotra: 'KAUDINYA',      nepali: 'कौण्डिन्य',    surnames: ['Achraya', 'Neupane', 'Pakurel', 'Paneru', 'Sapkota', 'Satyal', 'Marashini', 'Parajuli', 'Baskota', 'Trital', 'Khadka', 'Joshi'] },
  { gotra: 'KAUSHIK',       nepali: 'कौशिक',        surnames: ['Regmi', 'Gaudel', 'Khapatari', 'Khadka', 'Bidari', 'Rimal', 'Lamichhane', 'Dhungana', 'Dhital', 'Phuyal', 'Tiwari', 'Majhi', 'Luitel', 'Pudasaini', 'Baniya', 'Raghubansi', 'Bhandari', 'Bastakoti'] },
  { gotra: 'KUNDIN',        nepali: 'कुण्डिन',      surnames: ['Trital', 'Banjad', 'Banjade'] },
  { gotra: 'GARGA',         nepali: 'गर्ग',          surnames: ['Bastola', 'Lamichhane', 'Bhurtel', 'Gajurel'] },
  { gotra: 'GAUTAM',        nepali: 'गौतम',          surnames: ['Chanda', 'Tripathi', 'Bam', 'Dangal', 'Mahat', 'Pandey', 'Tiwari'] },
  { gotra: 'GHRITAKAUSHIK', nepali: 'घृत कौशिक',    surnames: ['Sutar', 'Karki', 'Baral', 'Pandit', 'Khanal', 'Nepal', 'Baraily'] },
  { gotra: 'MANDABYA',      nepali: 'माण्डव्य',     surnames: ['Bajagai', 'Gyawali', 'Panthi', 'Bajhai'] },
  { gotra: 'DHANANJAYA',    nepali: 'धनञ्जय',       surnames: ['Kunwar', 'Humagai', 'Rijal', 'Karki', 'Thapa', 'Pangeni', 'Basel', 'Kukurkote', 'Dhamala', 'Guragai', 'Khulal', 'Basnet', 'Bhusal'] },
  { gotra: 'PARASAR',       nepali: 'परासर',         surnames: ['Marhattha', 'Karki', 'Kattel', 'Dev', 'Raila'] },
  { gotra: 'BHARADWAJ',     nepali: 'भरद्वाज',       surnames: ['Chaulagai', 'Subedi', 'Thapaliya', 'Panthi', 'Upadhaya', 'Wagle', 'Lohani', 'Pantha', 'Adhikari', 'Dudhpokhrel', 'Siwakoti', 'Devkota', 'Niraula', 'Jamarkattel', 'Pandey', 'Rajopadhyay'] },
  { gotra: 'MAUDAGALYA',    nepali: 'मौद्गल्य',     surnames: ['Timsina', 'Timilsina', 'Koirala', 'Upreti', 'Mudula', 'Karki', 'Rume', 'Kuinkel', 'Simkhada', 'Belkadhi'] },
  { gotra: 'VASTA',         nepali: 'वत्स',          surnames: ['Rana', 'Lamsal', 'Dahal', 'Ruphakheti Dahal'] },
  { gotra: 'BASISTHA',      nepali: 'वशिष्ठ',       surnames: ['Suyal', 'Raut', 'Bhattarai', 'Dwadi', 'Thangsine', 'Bhandari', 'Kharel', 'Chalise', 'Mudabhari', 'Gaire', 'Paneru'] },
]

export function getSurnamesForGotra(gotra: string): string[] {
  return GOTRA_LIST.find(g => g.gotra === gotra)?.surnames ?? []
}

export function getGotraForSurname(surname: string): GotraEntry | undefined {
  const lower = surname.toLowerCase()
  return GOTRA_LIST.find(g =>
    g.surnames.some(s => s.toLowerCase() === lower || lower.startsWith(s.toLowerCase()))
  )
}
