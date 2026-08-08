export type TourStepId = 'welcome' | 'signToText' | 'speechToSign' | 'speechToText' | 'activityTab' | 'conversionLang'
export type TourTab = 'HomeScreen' | 'ActivityScreen' | 'ProfileScreen'

export type TourStep = {
  id: TourStepId
  tab: TourTab
  titleKey: string
  bodyKey: string
  showLangPicker?: boolean
}

export const TOUR_STEPS: TourStep[] = [
  { id: 'welcome', tab: 'HomeScreen', titleKey: 'tutorial.welcomeTitle', bodyKey: 'tutorial.liveWelcome' },
  { id: 'signToText', tab: 'HomeScreen', titleKey: 'feature.signToText', bodyKey: 'tutorial.liveS2t' },
  { id: 'speechToSign', tab: 'HomeScreen', titleKey: 'feature.speechToSign', bodyKey: 'tutorial.liveSts' },
  { id: 'speechToText', tab: 'HomeScreen', titleKey: 'feature.speechToText', bodyKey: 'tutorial.liveStt' },
  { id: 'activityTab', tab: 'HomeScreen', titleKey: 'tabs.activity', bodyKey: 'tutorial.liveActivity' },
  { id: 'conversionLang', tab: 'ProfileScreen', titleKey: 'tutorial.langTitle', bodyKey: 'tutorial.liveLang', showLangPicker: true },
]
