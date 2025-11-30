
import { Company, ConsumerUser } from './types';

export const CATEGORIES = [
  "All",
  "Technology",
  "Finance",
  "Marketing",
  "Logistics",
  "Consulting",
  "Legal"
];

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
    name: 'Nexus Solutions',
    shortDescription: 'Enterprise-grade cloud architecture and AI integration services.',
    description: 'Nexus Solutions is a premier technology consultancy specializing in scalable cloud infrastructure and artificial intelligence integration for Fortune 500 companies. We bridge the gap between legacy systems and future-tech.',
    logoUrl: 'https://picsum.photos/id/42/200/200',
    bannerUrl: 'https://picsum.photos/id/48/1200/400',
    isVerified: true,
    rating: 4.9,
    reviewCount: 124,
    category: 'Technology',
    location: 'København',
    tags: ['Cloud', 'AI', 'Enterprise'],
    pricingTier: 'Elite',
    contactEmail: 'hello@nexussolutions.com',
    website: 'nexussolutions.com',
    services: [
      { title: 'Cloud Migration', description: 'Seamless transition of on-premise infrastructure to AWS, Azure, or GCP.' },
      { title: 'AI Integration', description: 'Custom machine learning models integrated into your existing business workflows.' },
      { title: 'Cybersecurity Audit', description: 'Comprehensive security analysis and penetration testing.' }
    ],
    portfolio: [
      { title: 'FinTech Core Overhaul', category: 'Development', imageUrl: 'https://picsum.photos/id/6/600/400' },
      { title: 'Retail AI Assistant', category: 'AI', imageUrl: 'https://picsum.photos/id/119/600/400' },
      { title: 'Logistics Dashboard', category: 'UX/UI', imageUrl: 'https://picsum.photos/id/180/600/400' }
    ],
    testimonials: [
      { author: 'Lars Hansen', role: 'CTO', company: 'Nordic Bank', content: 'Nexus Solutions transformed our infrastructure. Highly recommended.', rating: 5 },
      { author: 'Sarah Jensen', role: 'Product Owner', company: 'RetailGiant', content: 'Their AI team is top-notch. Delivered ahead of schedule.', rating: 5 }
    ]
  },
  {
    id: '2',
    name: 'Summit Capital',
    shortDescription: 'Strategic venture funding for Series A+ startups.',
    description: 'We provide more than just capital. Summit Capital offers strategic mentorship, network access, and operational support to high-growth startups in the fintech and healthtech sectors.',
    logoUrl: 'https://picsum.photos/id/60/200/200',
    bannerUrl: 'https://picsum.photos/id/20/1200/400',
    isVerified: true,
    rating: 4.8,
    reviewCount: 89,
    category: 'Finance',
    location: 'Aarhus',
    tags: ['VC', 'Funding', 'Growth'],
    pricingTier: 'Premium',
    contactEmail: 'partners@summitcap.com',
    website: 'summitcap.com',
    services: [
      { title: 'Series A Funding', description: 'Capital injection for scaling operations and market reach.' },
      { title: 'Strategic Mentorship', description: 'Access to our network of industry veterans.' },
      { title: 'IPO Preparation', description: 'Guidance on financial structuring for public listing.' }
    ],
    portfolio: [
      { title: 'MediTech Growth', category: 'Healthcare', imageUrl: 'https://picsum.photos/id/201/600/400' },
      { title: 'PayFast Scaling', category: 'Fintech', imageUrl: 'https://picsum.photos/id/20/600/400' }
    ],
    testimonials: [
      { author: 'Mads Mikkelsen', role: 'Founder', company: 'StartUp X', content: 'Summit Capital was the catalyst we needed.', rating: 5 }
    ]
  },
  {
    id: '3',
    name: 'Alpha Design Studio',
    shortDescription: 'Minimalist branding for modern businesses.',
    description: 'Alpha Design Studio creates visual identities that stand the test of time. Less is more.',
    logoUrl: 'https://picsum.photos/id/96/200/200',
    bannerUrl: 'https://picsum.photos/id/1/1200/400',
    isVerified: false,
    rating: 4.5,
    reviewCount: 32,
    category: 'Marketing',
    location: 'Odense',
    tags: ['Branding', 'UI/UX'],
    pricingTier: 'Standard',
    contactEmail: 'design@alpha.com',
    website: 'alphadesign.com',
    services: [
      { title: 'Brand Identity', description: 'Logo, typography, and color palette creation.' },
      { title: 'Web Design', description: 'Responsive and aesthetic websites.' }
    ],
    portfolio: [
      { title: 'Coffee Shop Rebrand', category: 'Branding', imageUrl: 'https://picsum.photos/id/225/600/400' },
      { title: 'Tech Corp UI', category: 'Web', imageUrl: 'https://picsum.photos/id/3/600/400' },
      { title: 'Eco Packaging', category: 'Print', imageUrl: 'https://picsum.photos/id/5/600/400' }
    ],
    testimonials: [
      { author: 'Peter Nielsen', role: 'CEO', company: 'GreenEnergy', content: 'Clean, modern, and exactly what we asked for.', rating: 4 }
    ]
  },
  {
    id: '4',
    name: 'Swift Logistics',
    shortDescription: 'Global supply chain optimization.',
    description: 'Efficient, reliable, and transparent logistics solutions for international trade.',
    logoUrl: 'https://picsum.photos/id/119/200/200',
    bannerUrl: 'https://picsum.photos/id/195/1200/400',
    isVerified: false,
    rating: 4.2,
    reviewCount: 15,
    category: 'Logistics',
    location: 'Aalborg',
    tags: ['Shipping', 'Supply Chain'],
    pricingTier: 'Standard',
    contactEmail: 'ops@swift.com',
    website: 'swiftlogistics.com',
    services: [
      { title: 'Freight Forwarding', description: 'Air, sea, and land transport coordination.' },
      { title: 'Warehousing', description: 'Secure storage solutions across Europe.' }
    ],
    portfolio: [],
    testimonials: []
  },
  {
    id: '5',
    name: 'Vanguard Legal',
    shortDescription: 'Corporate law and IP protection specialists.',
    description: 'Protecting your intellectual property and ensuring corporate compliance in over 50 jurisdictions.',
    logoUrl: 'https://picsum.photos/id/160/200/200',
    bannerUrl: 'https://picsum.photos/id/180/1200/400',
    isVerified: true,
    rating: 5.0,
    reviewCount: 210,
    category: 'Legal',
    location: 'København',
    tags: ['IP Law', 'Corporate'],
    pricingTier: 'Premium',
    contactEmail: 'contact@vanguard.law',
    website: 'vanguard.law',
    services: [
      { title: 'IP Registration', description: 'Trademark and patent filing globally.' },
      { title: 'Contract Review', description: 'Thorough legal analysis of business agreements.' }
    ],
    portfolio: [],
    testimonials: [
       { author: 'Anna K.', role: 'Director', company: 'InnovateDK', content: 'Saved us from a major lawsuit. Worth every penny.', rating: 5 }
    ]
  },
  {
    id: '6',
    name: 'Nordic Consult',
    shortDescription: 'Business strategy for Scandinavian markets.',
    description: 'Helping foreign businesses enter and thrive in the Danish and Swedish markets with local expertise.',
    logoUrl: 'https://picsum.photos/id/180/200/200',
    bannerUrl: 'https://picsum.photos/id/200/1200/400',
    isVerified: true,
    rating: 4.7,
    reviewCount: 56,
    category: 'Consulting',
    location: 'Roskilde',
    tags: ['Strategy', 'Market Entry'],
    pricingTier: 'Premium',
    contactEmail: 'info@nordicconsult.dk',
    website: 'nordicconsult.dk',
    services: [
      { title: 'Market Analysis', description: 'Deep dive into Scandinavian consumer behavior.' },
      { title: 'Regulatory Compliance', description: 'Navigating local laws and tax regulations.' }
    ],
    portfolio: [
       { title: 'US Tech Expansion', category: 'Strategy', imageUrl: 'https://picsum.photos/id/101/600/400' }
    ],
    testimonials: []
  }
];
