import { ref, computed } from 'vue'
import {
  collection, addDoc, doc, updateDoc, deleteDoc,
  query, where, orderBy, onSnapshot, arrayUnion, arrayRemove,
} from 'firebase/firestore'
import { db } from '@/services/firebase'
import type { Plan, Activity } from '~/types/plan'

const plans = ref<Plan[]>([])
const isLoading = ref(false)

export function usePlan() {
  // ── Real-time listener ──────────────────────────────────────────────────
  const fetchPlans = (groupId: string) => {
    isLoading.value = true
    let first = true

    const q = query(
      collection(db, 'plans'),
      where('groupId', '==', groupId),
      orderBy('date', 'desc'),
    )

    onSnapshot(q, (snapshot) => {
      plans.value = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
      })) as Plan[]

      if (first) { isLoading.value = false; first = false }
    })
  }

  // ── Plan CRUD ───────────────────────────────────────────────────────────
  const createPlan = async (groupId: string, plan: Omit<Plan, 'id' | 'activities'>) => {
    await addDoc(collection(db, 'plans'), stripUndefined({
      ...plan,
      groupId,
      activities: [],
    }))
  }

  const updatePlan = async (planId: string, payload: Partial<Omit<Plan, 'id'>>) => {
    await updateDoc(doc(db, 'plans', planId), stripUndefined(payload) as Record<string, unknown>)
  }

  const deletePlan = async (planId: string) => {
    await deleteDoc(doc(db, 'plans', planId))
  }

  // ── Activity CRUD (stored as array field on the plan doc) ───────────────
  const addActivity = async (planId: string, activity: Omit<Activity, 'id'>) => {
    const newActivity: Activity = { ...activity, id: crypto.randomUUID() }
    const plan = plans.value.find(p => p.id === planId)
    const updated = plan
      ? [...plan.activities, newActivity].sort(byTime)
      : [newActivity]
    await updateDoc(doc(db, 'plans', planId), { activities: updated })
  }

  const updateActivity = async (planId: string, activityId: string, payload: Partial<Activity>) => {
    const plan = plans.value.find(p => p.id === planId)
    if (!plan) return
    const updated = plan.activities
      .map(a => (a.id === activityId ? { ...a, ...payload } : a))
      .sort(byTime)
    await updateDoc(doc(db, 'plans', planId), { activities: updated })
  }

  const deleteActivity = async (planId: string, activityId: string) => {
    const plan = plans.value.find(p => p.id === planId)
    if (!plan) return
    const target = plan.activities.find(a => a.id === activityId)
    if (!target) return
    await updateDoc(doc(db, 'plans', planId), { activities: arrayRemove(target) })
  }

  // ── Computed ────────────────────────────────────────────────────────────
  const nextUpcomingPlan = computed(() => {
    const today = new Date().toISOString().slice(0, 10)
    return plans.value
      .filter(p => p.status !== 'done' && p.status !== 'cancelled' && p.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null
  })

  return {
    plans,
    isLoading,
    nextUpcomingPlan,
    fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
    addActivity,
    updateActivity,
    deleteActivity,
  }
}

function byTime(a: Activity, b: Activity) {
  if (!a.startTime && !b.startTime) return 0
  if (!a.startTime) return 1
  if (!b.startTime) return -1
  return a.startTime.localeCompare(b.startTime)
}

function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<T>
}
