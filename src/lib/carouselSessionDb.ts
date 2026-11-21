import type { HookConfig, SavedHook, SlideItem } from '../types'

const DB_NAME = 'linkedin-carousel-maker'
const DB_VERSION = 1
const STORE = 'session'
const SESSION_KEY = 'active'

export type PersistedSessionV1 = {
  version: 1
  slideOrder: string[]
  slides: {
    id: string
    name: string
    type: string
    data: ArrayBuffer
  }[]
  hook: {
    config: HookConfig
    data: ArrayBuffer
    type: string
    customBackground?: {
      name: string
      type: string
      data: ArrayBuffer
    } | null
  } | null
  updatedAt: number
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'))
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE)
      }
    }
    req.onsuccess = () => resolve(req.result)
  })
}

async function fileToBuffer(file: File): Promise<ArrayBuffer> {
  return file.arrayBuffer()
}

function bufferToFile(
  data: ArrayBuffer,
  name: string,
  type: string,
  lastModified = Date.now(),
): File {
  return new File([data], name, { type, lastModified })
}

export async function slideItemsToPersisted(
  slides: SlideItem[],
): Promise<PersistedSessionV1['slides']> {
  const result: PersistedSessionV1['slides'] = []
  for (const slide of slides) {
    result.push({
      id: slide.id,
      name: slide.file.name,
      type: slide.file.type || 'image/png',
      data: await fileToBuffer(slide.file),
    })
  }
  return result
}

export function persistedToSlideItems(
  stored: PersistedSessionV1['slides'],
  order: string[],
): SlideItem[] {
  const byId = new Map(stored.map((s) => [s.id, s]))
  const ordered = order.length
    ? order.map((id) => byId.get(id)).filter(Boolean)
    : stored

  return ordered.map((s) => {
    const file = bufferToFile(s!.data, s!.name, s!.type)
    return {
      id: s!.id,
      file,
      previewUrl: URL.createObjectURL(file),
    }
  })
}

export async function savedHookToPersisted(
  hook: SavedHook,
): Promise<NonNullable<PersistedSessionV1['hook']>> {
  const customBackground = hook.customBackgroundSource
    ? {
        name: hook.customBackgroundSource.name,
        type: hook.customBackgroundSource.type,
        data: await hook.customBackgroundSource.blob.arrayBuffer(),
      }
    : null

  return {
    config: {
      backgroundStyle: hook.backgroundStyle,
      backgroundColor: hook.backgroundColor,
      text: hook.text,
      textColor: hook.textColor,
      font: hook.font,
      fontSize: hook.fontSize,
      alignment: hook.alignment,
      useTextScrim: hook.useTextScrim,
    },
    data: await hook.blob.arrayBuffer(),
    type: hook.blob.type || 'image/png',
    customBackground,
  }
}

export function persistedToSavedHook(
  hook: NonNullable<PersistedSessionV1['hook']>,
): SavedHook {
  const blob = new Blob([hook.data], { type: hook.type })
  const useTextScrim = hook.config.useTextScrim ?? true
  const customBackgroundSource = hook.customBackground
  ? {
      blob: new Blob([hook.customBackground.data], {
        type: hook.customBackground.type,
      }),
      name: hook.customBackground.name,
      type: hook.customBackground.type,
    }
    : null

  return {
    ...hook.config,
    useTextScrim,
    blob,
    previewUrl: URL.createObjectURL(blob),
    customBackgroundSource,
  }
}

export async function saveCarouselSession(
  slides: SlideItem[],
  hook: SavedHook | null,
): Promise<void> {
  const persisted: PersistedSessionV1 = {
    version: 1,
    slideOrder: slides.map((s) => s.id),
    slides: await slideItemsToPersisted(slides),
    hook: hook ? await savedHookToPersisted(hook) : null,
    updatedAt: Date.now(),
  }

  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.oncomplete = () => {
      db.close()
      resolve()
    }
    tx.onerror = () => {
      db.close()
      reject(tx.error ?? new Error('IndexedDB write failed'))
    }
    tx.objectStore(STORE).put(persisted, SESSION_KEY)
  })
}

export async function loadCarouselSession(): Promise<{
  slides: SlideItem[]
  hook: SavedHook | null
} | null> {
  const db = await openDb()
  const persisted = await new Promise<PersistedSessionV1 | undefined>(
    (resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const req = tx.objectStore(STORE).get(SESSION_KEY)
      req.onsuccess = () => resolve(req.result as PersistedSessionV1 | undefined)
      req.onerror = () => reject(req.error)
      tx.oncomplete = () => db.close()
    },
  )

  if (!persisted || persisted.version !== 1) return null

  return {
    slides: persistedToSlideItems(persisted.slides, persisted.slideOrder),
    hook: persisted.hook ? persistedToSavedHook(persisted.hook) : null,
  }
}

export async function clearCarouselSession(): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.oncomplete = () => {
      db.close()
      resolve()
    }
    tx.onerror = () => {
      db.close()
      reject(tx.error ?? new Error('IndexedDB clear failed'))
    }
    tx.objectStore(STORE).delete(SESSION_KEY)
  })
}