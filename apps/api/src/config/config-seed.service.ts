import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GotraConfigEntity } from './gotra-config.entity';
import { SiteConfigEntity } from './site-config.entity';

const GOTRA_SEED = [
  { gotra: 'ANGIRAS',       nepali: 'अंगिरास',     surnames: ['Joshi', 'Sedai', 'Saunak', 'Shahi'],                                                    sortOrder: 1 },
  { gotra: 'AGASTI',        nepali: 'अगस्ती',      surnames: ['Dhungel'],                                                                                 sortOrder: 2 },
  { gotra: 'ATRI',          nepali: 'अत्रि',        surnames: ['Chapagai', 'Wosti', 'Mishra', 'Khatiwada', 'Ojha', 'Adhikari', 'Gotame', 'Kshatri Malla', 'Pahari'], sortOrder: 3 },
  { gotra: 'ATREYA',        nepali: 'आत्रेय',       surnames: ['Paudel', 'Devkota', 'Pokhrel', 'Kalikote', 'Sharma', 'Aryal', 'Sigdel', 'Bagale Thapa'],  sortOrder: 4 },
  { gotra: 'UPAMANYU',      nepali: 'उपमन्यु',      surnames: ['Mainali', 'Dhakal', 'Bartaula', 'Bhatta', 'Pandey'],                                       sortOrder: 5 },
  { gotra: 'KASYAP',        nepali: 'कश्यप',        surnames: ['Shah', 'Sahi', 'Rayamajhi', 'Ghimire', 'Godhar', 'Kathayat', 'Gartaula', 'Adhikari', 'Bogati', 'Budhathoki', 'Badaal'], sortOrder: 6 },
  { gotra: 'KAUDINYA',      nepali: 'कौण्डिन्य',    surnames: ['Achraya', 'Neupane', 'Pakurel', 'Paneru', 'Sapkota', 'Satyal', 'Marashini', 'Parajuli', 'Baskota', 'Trital', 'Khadka', 'Joshi'], sortOrder: 7 },
  { gotra: 'KAUSHIK',       nepali: 'कौशिक',        surnames: ['Regmi', 'Gaudel', 'Khapatari', 'Khadka', 'Bidari', 'Rimal', 'Lamichhane', 'Dhungana', 'Dhital', 'Phuyal', 'Tiwari', 'Majhi', 'Luitel', 'Pudasaini', 'Baniya', 'Raghubansi', 'Bhandari', 'Bastakoti'], sortOrder: 8 },
  { gotra: 'KUNDIN',        nepali: 'कुण्डिन',      surnames: ['Trital', 'Banjad', 'Banjade'],                                                             sortOrder: 9 },
  { gotra: 'GARGA',         nepali: 'गर्ग',          surnames: ['Bastola', 'Lamichhane', 'Bhurtel', 'Gajurel'],                                             sortOrder: 10 },
  { gotra: 'GAUTAM',        nepali: 'गौतम',          surnames: ['Chanda', 'Tripathi', 'Bam', 'Dangal', 'Mahat', 'Pandey', 'Tiwari'],                        sortOrder: 11 },
  { gotra: 'GHRITAKAUSHIK', nepali: 'घृत कौशिक',    surnames: ['Sutar', 'Karki', 'Baral', 'Pandit', 'Khanal', 'Nepal', 'Baraily'],                         sortOrder: 12 },
  { gotra: 'MANDABYA',      nepali: 'माण्डव्य',     surnames: ['Bajagai', 'Gyawali', 'Panthi', 'Bajhai'],                                                   sortOrder: 13 },
  { gotra: 'DHANANJAYA',    nepali: 'धनञ्जय',       surnames: ['Kunwar', 'Humagai', 'Rijal', 'Karki', 'Thapa', 'Pangeni', 'Basel', 'Kukurkote', 'Dhamala', 'Guragai', 'Khulal', 'Basnet', 'Bhusal'], sortOrder: 14 },
  { gotra: 'PARASAR',       nepali: 'परासर',         surnames: ['Marhattha', 'Karki', 'Kattel', 'Dev', 'Raila'],                                             sortOrder: 15 },
  { gotra: 'BHARADWAJ',     nepali: 'भरद्वाज',       surnames: ['Chaulagai', 'Subedi', 'Thapaliya', 'Panthi', 'Upadhaya', 'Wagle', 'Lohani', 'Pantha', 'Adhikari', 'Dudhpokhrel', 'Siwakoti', 'Devkota', 'Niraula', 'Jamarkattel', 'Pandey', 'Rajopadhyay'], sortOrder: 16 },
  { gotra: 'MAUDAGALYA',    nepali: 'मौद्गल्य',     surnames: ['Timsina', 'Timilsina', 'Koirala', 'Upreti', 'Mudula', 'Karki', 'Rume', 'Kuinkel', 'Simkhada', 'Belkadhi'], sortOrder: 17 },
  { gotra: 'VASTA',         nepali: 'वत्स',          surnames: ['Rana', 'Lamsal', 'Dahal', 'Ruphakheti Dahal'],                                              sortOrder: 18 },
  { gotra: 'BASISTHA',      nepali: 'वशिष्ठ',       surnames: ['Suyal', 'Raut', 'Bhattarai', 'Dwadi', 'Thangsine', 'Bhandari', 'Kharel', 'Chalise', 'Mudabhari', 'Gaire', 'Paneru'], sortOrder: 19 },
];

const CONFIG_DEFAULTS: { key: string; value: string }[] = [
  // Theme & typography
  { key: 'theme',               value: 'forest' },
  { key: 'font.heading',        value: 'libre-caslon' },
  { key: 'font.body',           value: 'inter' },
  // Tree defaults
  { key: 'tree.defaultView',    value: 'standard' },
  { key: 'tree.showRelations',  value: 'true' },
  { key: 'tree.showBirthYear',  value: 'true' },
  { key: 'tree.showPhoto',      value: 'true' },
  // Site content
  { key: 'content.site.name',              value: 'Vansha Lineage' },
  { key: 'content.homepage.hero.badge',    value: 'The Living Archive' },
  { key: 'content.homepage.hero.title',    value: 'Every Family Has A Story Worth Telling' },
  { key: 'content.homepage.hero.subtitle', value: 'Vansha Lineage is a private-by-default ancestral intelligence platform. Preserve your family\'s heritage, trace your lineage across generations, and discover the living threads that connect you to your ancestors.' },
  { key: 'content.homepage.showcase.name', value: 'The Ghimire Lineage' },
  { key: 'content.homepage.showcase.detail',value: 'Six generations · Gorkha, Nepal · Est. 1820' },
  { key: 'content.homepage.quote',         value: 'A people without the knowledge of their past history, origin and culture is like a tree without roots.' },
  { key: 'content.homepage.quote.author',  value: 'Marcus Garvey' },
  { key: 'content.homepage.cta.title',     value: 'Begin Your Family\'s Archive Today' },
  { key: 'content.homepage.cta.subtitle',  value: 'Join families across the world who are preserving their heritage for generations yet to come.' },
  { key: 'content.dashboard.greeting',     value: 'Welcome back, Curator' },
  { key: 'content.footer.copyright',       value: '© 2024 Vansha Lineage. Preserving history for the next generation.' },
];

@Injectable()
export class ConfigSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(GotraConfigEntity) private gotras: Repository<GotraConfigEntity>,
    @InjectRepository(SiteConfigEntity)  private configs: Repository<SiteConfigEntity>,
  ) {}

  async onModuleInit() {
    await this.seedGotras().catch(e => console.error('[ConfigSeed] gotra seed failed:', e?.message));
    await this.seedConfig().catch(e => console.error('[ConfigSeed] config seed failed:', e?.message));
  }

  private async seedGotras() {
    const count = await this.gotras.count();
    if (count > 0) return;
    const entities = GOTRA_SEED.map(g => this.gotras.create(g));
    await this.gotras.save(entities);
    console.log(`[ConfigSeed] Seeded ${entities.length} gotras`);
  }

  private async seedConfig() {
    for (const { key, value } of CONFIG_DEFAULTS) {
      const exists = await this.configs.findOne({ where: { key } });
      if (!exists) {
        await this.configs.save(this.configs.create({ key, value }));
      }
    }
  }
}
