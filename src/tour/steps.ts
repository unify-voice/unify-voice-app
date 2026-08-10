/** Spotlight target ids measured by `TourTarget` during the live walkthrough. */
export type TourStepId = 'welcome' | 'modules' | 'activityTab' | 'conversionLang'
/** Tab route the tour should navigate to before showing a step. */
export type TourTab = 'HomeScreen' | 'ActivityScreen' | 'ProfileScreen'

export type TourStep = {
  id: TourStepId
  tab: TourTab
  titleKey: string
  bodyKey: string
  showLangPicker?: boolean
}

/** Ordered first-run / replay tutorial steps (i18n keys + optional lang picker). */
export const TOUR_STEPS: TourStep[] = [
  { id: 'welcome', tab: 'HomeScreen', titleKey: 'tutorial.welcomeTitle', bodyKey: 'tutorial.liveWelcome' },
  { id: 'modules', tab: 'HomeScreen', titleKey: 'tutorial.modulesTitle', bodyKey: 'tutorial.modulesBody' },
  { id: 'activityTab', tab: 'HomeScreen', titleKey: 'tabs.activity', bodyKey: 'tutorial.liveActivity' },
  { id: 'conversionLang', tab: 'ProfileScreen', titleKey: 'tutorial.langTitle', bodyKey: 'tutorial.liveLang', showLangPicker: true },
]
