// types/ads.d.ts
export interface ScreenAdConfig {
  _id: string;
  screenType: string;
  screenName: string;
  adType: string;
  position: string;
  adsEnabled: boolean;
  useAdMob: boolean;
  useStartApp: boolean;
  adMobAppId: string;
  adMobBannerId: string;
  adMobInterstitialId: string;
  adMobRewardedId: string;
  startAppAppId: string;
  adFrequency: number;
  createdAt: string;
  updatedAt: string;
}