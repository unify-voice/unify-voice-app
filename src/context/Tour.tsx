import auth from '@react-native-firebase/auth'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { View, type ViewStyle } from 'react-native'

import { markTutorialComplete } from '../services/tutorial'
import { TOUR_STEPS, type TourStepId, type TourTab } from '../tour/steps'

export type TourRect = { x: number; y: number; width: number; height: number }

type TourContextValue = {
  active: boolean
  stepIndex: number
  stepId: TourStepId | null
  hole?: TourRect
  measureNonce: number
  registerTarget: (id: string, rect: TourRect | null) => void
  registerTabNavigation: (fn: ((tab: TourTab) => void) | null) => void
  startTour: () => void
  next: () => void
  back: () => void
  skip: () => void
}

const TourContext = createContext<TourContextValue | null>(null)

export const TourProvider = ({ children }: { children: React.ReactNode }) => {
  const [active, setActive] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [rects, setRects] = useState<Record<string, TourRect>>({})
  const [measureNonce, setMeasureNonce] = useState(0)
  const tabNavRef = useRef<((tab: TourTab) => void) | null>(null)

  const step = active ? TOUR_STEPS[stepIndex] : undefined
  const stepId = step?.id ?? null

  const refreshMeasures = useCallback(() => {
    setMeasureNonce((n) => n + 1)
  }, [])

  const registerTarget = useCallback((id: string, rect: TourRect | null) => {
    setRects((prev) => {
      if (!rect) {
        if (!(id in prev)) return prev
        const next = { ...prev }
        delete next[id]
        return next
      }
      const old = prev[id]
      if (old && old.x === rect.x && old.y === rect.y && old.width === rect.width && old.height === rect.height) {
        return prev
      }
      return { ...prev, [id]: rect }
    })
  }, [])

  const registerTabNavigation = useCallback((fn: ((tab: TourTab) => void) | null) => {
    tabNavRef.current = fn
  }, [])

  const goToStep = useCallback((index: number) => {
    const nextStep = TOUR_STEPS[index]
    if (!nextStep) return
    setStepIndex(index)
    tabNavRef.current?.(nextStep.tab)
    setTimeout(() => setMeasureNonce((n) => n + 1), 80)
    setTimeout(() => setMeasureNonce((n) => n + 1), 380)
  }, [])

  const finish = useCallback(async () => {
    setActive(false)
    setStepIndex(0)
    tabNavRef.current?.('HomeScreen')
    const uid = auth().currentUser?.uid
    if (uid) await markTutorialComplete(uid)
  }, [])

  const startTour = useCallback(() => {
    setActive(true)
    goToStep(0)
  }, [goToStep])

  const next = useCallback(() => {
    if (stepIndex >= TOUR_STEPS.length - 1) {
      void finish()
      return
    }
    goToStep(stepIndex + 1)
  }, [finish, goToStep, stepIndex])

  const back = useCallback(() => {
    if (stepIndex <= 0) return
    goToStep(stepIndex - 1)
  }, [goToStep, stepIndex])

  useEffect(() => {
    if (!active) return undefined
    const t1 = setTimeout(refreshMeasures, 120)
    const t2 = setTimeout(refreshMeasures, 450)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [active, stepIndex, refreshMeasures])

  const hole = stepId ? rects[stepId] : undefined

  const value = useMemo(
    () => ({
      active,
      stepIndex,
      stepId,
      hole,
      measureNonce,
      registerTarget,
      registerTabNavigation,
      startTour,
      next,
      back,
      skip: () => void finish(),
    }),
    [active, stepIndex, stepId, hole, measureNonce, registerTarget, registerTabNavigation, startTour, next, back, finish],
  )

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>
}

export const useTour = () => {
  const ctx = useContext(TourContext)
  if (!ctx) throw new Error('useTour must be used within TourProvider')
  return ctx
}

export const useOptionalTour = () => useContext(TourContext)

type TargetProps = {
  id: TourStepId
  children: React.ReactNode
  style?: ViewStyle
}

export const TourTarget = ({ id, children, style }: TargetProps) => {
  const tour = useOptionalTour()
  const ref = useRef<View>(null)

  const measure = useCallback(() => {
    if (!tour?.active) return
    ref.current?.measureInWindow((x, y, width, height) => {
      if (width < 2 || height < 2) return
      tour.registerTarget(id, { x, y, width, height })
    })
  }, [id, tour])

  useEffect(() => {
    measure()
  }, [measure, tour?.measureNonce, tour?.stepId, tour?.active])

  if (!tour) return <>{children}</>

  return (
    <View ref={ref} collapsable={false} onLayout={measure} style={style}>
      {children}
    </View>
  )
}
