export type GoogleAdsCampaignRow = {
  name: string;
  clicks: number;
  impressions: number;
  costMicros: number;
  conversions: number;
};

export type GoogleAdsCache = {
  connected?: boolean;
  customerId?: string;
  customerName?: string;
  impressions?: number;
  clicks?: number;
  costMicros?: number;
  conversions?: number;
  campaigns?: GoogleAdsCampaignRow[];
  syncedAt?: string;
};

export type GoogleAdsSnapshot = {
  connected: boolean;
  customerId?: string;
  customerName?: string;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  costDkk?: string;
  campaigns?: GoogleAdsCampaignRow[];
  syncedAt?: string;
  source: 'google' | 'unavailable' | 'demo';
  pendingAccountSelection?: boolean;
};

export type GoogleAdsAccountOption = {
  customerId: string;
  descriptiveName: string;
  manager: boolean;
};
