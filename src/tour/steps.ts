export type TourStepId = 'welcome' | 'modules' | 'activityTab' | 'conversionLang'
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
  { id: 'modules', tab: 'HomeScreen', titleKey: 'tutorial.modulesTitle', bodyKey: 'tutorial.modulesBody' },
  { id: 'activityTab', tab: 'HomeScreen', titleKey: 'tabs.activity', bodyKey: 'tutorial.liveActivity' },
  { id: 'conversionLang', tab: 'ProfileScreen', titleKey: 'tutorial.langTitle', bodyKey: 'tutorial.liveLang', showLangPicker: true },
]
