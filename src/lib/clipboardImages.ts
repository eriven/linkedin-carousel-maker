export function isMacOs(): boolean {
  if (typeof navigator === 'undefined') return false
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } }
  const platform = nav.userAgentData?.platform ?? navigator.platform ?? ''
  return /Mac|iPhone|iPad|iPod/i.test(platform)
}

export function pasteShortcutLabel(): string {
  return isMacOs() ? '⌘V' : 'Ctrl+V'
}

export function filesFromClipboardEvent(e: ClipboardEvent): File[] {
  const items = e.clipboardData?.items
  if (!items?.length) return []

  const files: File[] = []
  const stamp = Date.now()

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item.kind !== 'file') continue
    const type = item.type
    if (!type.startsWith('image/')) continue

    const raw = item.getAsFile()
    if (!raw) continue

    const ext = type.split('/')[1]?.replace('jpeg', 'jpg') ?? 'png'
    const name =
      raw.name && raw.name !== 'image.png'
        ? raw.name
        : `pasted-image-${stamp}-${i}.${ext}`
    files.push(
      raw.name === name
        ? raw
        : new File([raw], name, { type: raw.type, lastModified: raw.lastModified }),
    )
  }

  return files
}

export function imageFilesFromFileList(fileList: FileList | null): File[] {
  if (!fileList?.length) return []
  return Array.from(fileList).filter((f) => f.type.startsWith('image/'))
}