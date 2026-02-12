
import { Company, ConsumerUser } from './types';

// Popular categories are listed first (indices 1-10), followed by other categories

export interface Category {
  id: string;
  isCore: boolean; // Bucket A: Shown everywhere
  isLongTail: boolean; // Bucket B: Hidden by default, searchable
}

export const CATEGORY_LIST: Category[] = [
  // Bucket A: CORE (shown everywhere)
  { id: "Elektriker", isCore: true, isLongTail: false },
  { id: "VVS", isCore: true, isLongTail: false },
  { id: "Tømrer", isCore: true, isLongTail: false },
  { id: "Maler", isCore: true, isLongTail: false },
  { id: "Murer", isCore: true, isLongTail: false },
  { id: "Anlægsgartner", isCore: true, isLongTail: false },
  { id: "Rengøring", isCore: true, isLongTail: false },
  { id: "Flytning", isCore: true, isLongTail: false },
  { id: "Låsesmed", isCore: true, isLongTail: false },
  { id: "Vinduespudser", isCore: true, isLongTail: false },

  // Bucket B: LONG-TAIL (searchable, specific pages)
  { id: "Snedker", isCore: false, isLongTail: true },
  { id: "Blikkenslager", isCore: false, isLongTail: true },
  { id: "Kloakmester", isCore: false, isLongTail: true },
  { id: "Entreprenør", isCore: false, isLongTail: true },
  { id: "Tagdækker", isCore: false, isLongTail: true },
  { id: "Glarmester", isCore: false, isLongTail: true },
  { id: "Gulvlægger", isCore: false, isLongTail: true },
  { id: "Fugemand", isCore: false, isLongTail: true },
  { id: "Brolægger", isCore: false, isLongTail: true },
  { id: "Betonarbejder", isCore: false, isLongTail: true },
  { id: "Stilladsmontør", isCore: false, isLongTail: true },
  { id: "Nedrivning", isCore: false, isLongTail: true },
  { id: "Gulvsliber", isCore: false, isLongTail: true },
  { id: "Skorstensfejer", isCore: false, isLongTail: true },
  { id: "Skadedyrsbekæmpelse", isCore: false, isLongTail: true },
  { id: "Mekaniker", isCore: false, isLongTail: true },
  { id: "Autohjælp", isCore: false, isLongTail: true },
  { id: "SEO", isCore: false, isLongTail: true },
  { id: "Google Ads", isCore: false, isLongTail: true },
];

export const CATEGORIES = ["All", ...CATEGORY_LIST.map(c => c.id)];
export const CORE_CATEGORIES = CATEGORY_LIST.filter(c => c.isCore).map(c => c.id);
export const POPULAR_CATEGORIES = CORE_CATEGORIES;

export const MOCK_CONSUMER: ConsumerUser = {
  id: 'c1',
  name: 'Anders Jensen',
  email: 'anders.jensen@example.com',
  avatarUrl: 'https://i.pravatar.cc/150?img=11',
  location: 'København'
};

export const MOCK_COMPANIES: Company[] = [
  {
    id: '1',
    name: 'Mesterbyg Tømrer & Snedker',
    shortDescription: 'Kvalitetsarbejde inden for tømrer- og snedkerfaget.',
    description: 'Vi er din lokale tømrermester i København med over 20 års erfaring. Vi klarer alt fra tagudskiftning til specialfremstillede møbler og køkkener. Vi lægger vægt på høj kvalitet og godt solidt håndværk.',
    logoUrl: 'https://picsum.photos/id/42/200/200',
    bannerUrl: 'https://picsum.photos/id/48/1200/400',
    isVerified: true,
    rating: 4.9,
    reviewCount: 124,
    category: 'Tømrer',
    location: 'København',
    postalCode: '2100',
    tags: ['Tagarbejde', 'Køkken', 'Vinduer'],
    pricingTier: 'Gold',
    contactEmail: 'info@mesterbyg.dk',
    website: 'mesterbyg.dk',
    services: [
      { id: 's1', title: 'Tagarbejde', description: 'Nyt tag eller reparation af det gamle. Vi arbejder med alle typer materialer.' },
      { id: 's2', title: 'Køkkenmontering', description: 'Vi monterer dit nye drømmekøkken med præcision og finish.' },
      { id: 's3', title: 'Vinduer & Døre', description: 'Udskiftning af vinduer og døre for bedre isolering og æstetik.' }
    ],
    portfolio: [
      { id: 'p1', title: 'Nyt Tag på Villia', category: 'Tag', imageUrl: 'https://picsum.photos/id/6/600/400' },
      { id: 'p2', title: 'Snedkerkøkken', category: 'Køkken', imageUrl: 'https://picsum.photos/id/119/600/400' },
      { id: 'p3', title: 'Speciallavet Trappe', category: 'Snedker', imageUrl: 'https://picsum.photos/id/180/600/400' }
    ],
    testimonials: [
      { id: 't1', author: 'Lars Hansen', role: 'Boligejer', company: 'Privat', content: 'Mesterbyg leverede et fantastisk resultat på vores nye tag. Punktlige og professionelle.', rating: 5 },
      { id: 't2', author: 'Sarah Jensen', role: 'Boligejer', company: 'Privat', content: 'Super flot snedkerarbejde i vores køkken. Kan varmt anbefales!', rating: 5 }
    ]
  },
  {
    id: '2',
    name: 'Jensen & Sønns Murerfirma',
    shortDescription: 'Alt i murerarbejde – fra fliser til facaderenovering.',
    description: 'Vi udfører alle former for murerarbejde med fokus på kvalitet og holdbarhed. Specialister i badeværelser og pudseopgaver.',
    logoUrl: 'https://picsum.photos/id/60/200/200',
    bannerUrl: 'https://picsum.photos/id/20/1200/400',
    isVerified: true,
    rating: 4.8,
    reviewCount: 89,
    category: 'Murer',
    location: 'Aarhus',
    postalCode: '8000',
    tags: ['Badeværelse', 'Fliser', 'Facade'],
    pricingTier: 'Gold',
    contactEmail: 'murer@jensenson.dk',
    website: 'jensenson.dk',
    services: [
      { id: 's4', title: 'Badeværelsesrenovering', description: 'Komplet murerarbejde ved renovering af bad og toilet.' },
      { id: 's5', title: 'Flisearbejde', description: 'Præcis opsætning af fliser og klinker i alle rum.' },
      { id: 's6', title: 'Facadepuds', description: 'Giv dit hus et nyt liv med en professionel facadepuds.' }
    ],
    portfolio: [
      { id: 'p4', title: 'Moderne Badeværelse', category: 'Bad', imageUrl: 'https://picsum.photos/id/201/600/400' },
      { id: 'p5', title: 'Havemur i Natursten', category: 'Udendørs', imageUrl: 'https://picsum.photos/id/20/600/400' }
    ],
    testimonials: [
      { id: 't3', author: 'Mads Mikkelsen', role: 'Husejer', company: 'Privat', content: 'Flot arbejde på vores facade. De kom som aftalt.', rating: 5 }
    ]
  },
  {
    id: '3',
    name: 'Hansen VVS-Service',
    shortDescription: 'Din trygge partner til alle VVS-opgaver.',
    description: 'Vi løser alt fra dryppende vandhaner til installation af varmepumper. Altid med kunden i fokus.',
    logoUrl: 'https://picsum.photos/id/96/200/200',
    bannerUrl: 'https://picsum.photos/id/1/1200/400',
    isVerified: false,
    rating: 4.5,
    reviewCount: 32,
    category: 'VVS-installatør',
    location: 'Odense',
    postalCode: '5000',
    tags: ['VVS', 'Varme', 'Afløb'],
    pricingTier: 'Basic',
    contactEmail: 'vvs@hansen-service.dk',
    website: 'hansenvvs.dk',
    services: [
      { id: 's7', title: 'Vand & Sanitet', description: 'Reparation og installation af alt inden for vand og sanitet.' },
      { id: 's8', title: 'Varmeinstallation', description: 'Optimering og vedligeholdelse af dit varmeanlæg.' }
    ],
    portfolio: [
      { id: 'p6', title: 'Udskiftning af Faldstamme', category: 'VVS', imageUrl: 'https://picsum.photos/id/225/600/400' },
      { id: 'p7', title: 'Nyt Gasfyr', category: 'Varme', imageUrl: 'https://picsum.photos/id/3/600/400' }
    ],
    testimonials: [
      { id: 't4', author: 'Peter Nielsen', role: 'Ejer', company: 'Ejendomsinvest', content: 'Hurtig og effektiv service da vi havde rørsprængning.', rating: 4 }
    ]
  },
  {
    id: '4',
    name: 'Aalborg Malerforretning',
    shortDescription: 'Professionelt malerarbejde til private og erhverv.',
    description: 'Vi maler alt fra små lejligheder til store erhvervsbyggerier. Kvalitet og finish er vores varemærke.',
    logoUrl: 'https://picsum.photos/id/119/200/200',
    bannerUrl: 'https://picsum.photos/id/195/1200/400',
    isVerified: false,
    rating: 4.2,
    reviewCount: 15,
    category: 'Maler',
    location: 'Aalborg',
    postalCode: '9000',
    tags: ['Maling', 'Tapet', 'Finish'],
    pricingTier: 'Basic',
    contactEmail: 'aalborg@maler.dk',
    website: 'aalborgmaler.dk',
    services: [
      { id: 's9', title: 'Indvendig Maling', description: 'Vi maler vægge, lofter og træværk med øje for detaljen.' },
      { id: 's10', title: 'Facademaling', description: 'Beskyt dit hus med en professionel facademaling.' }
    ],
    portfolio: [
      { id: 'p9', title: 'Lejlighedsrenovering', category: 'Maling', imageUrl: 'https://picsum.photos/id/225/600/400' }
    ],
    testimonials: []
  },
  {
    id: '5',
    name: 'Københavns El-Service',
    shortDescription: 'Din autoriserede el-installatør i hovedstaden.',
    description: 'Vi udfører alle typer el-installationer for både private og erhverv. Hurtig udrykning ved akutte problemer.',
    logoUrl: 'https://picsum.photos/id/160/200/200',
    bannerUrl: 'https://picsum.photos/id/180/1200/400',
    isVerified: true,
    rating: 4.8,
    reviewCount: 95,
    category: 'Elektriker',
    location: 'København',
    postalCode: '1000',
    tags: ['El-installation', 'Akut', 'Belysning'],
    pricingTier: 'Gold',
    contactEmail: 'info@kbh-el.dk',
    website: 'kbh-el.dk',
    services: [
      { id: 's11', title: 'Eltjek', description: 'Gennemgang af din boligs el-installationer.' },
      { id: 's12', title: 'Lysstyring', description: 'Intelligent belysning og lysdæmpning.' }
    ],
    portfolio: [],
    testimonials: [
      { id: 't5', author: 'Anna K.', role: 'Ejer', company: 'InnovateDK', content: 'Hurtig hjælp og god pris.', rating: 5 }
    ]
  }
];
