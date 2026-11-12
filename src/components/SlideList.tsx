import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { SavedHook, SlideItem } from '../types'

interface SlideListProps {
  slides: SlideItem[]
  hook: SavedHook | null
  onReorder: (slides: SlideItem[]) => void
  onRemove: (id: string) => void
  onCreateHook: () => void
  onSkipHook: () => void
  onContinueToPreview: () => void
}

function SortableRow({
  slide,
  index,
  onRemove,
}: {
  slide: SlideItem
  index: number
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: slide.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 rounded-lg border bg-white p-3 shadow-sm ${
        isDragging ? 'z-10 border-brand opacity-95' : 'border-gray-100'
      }`}
    >
      <button
        type="button"
        className="cursor-grab touch-none px-1 text-gray-400 hover:text-gray-600"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>
      <span className="w-6 text-sm font-medium text-gray-400">{index + 1}</span>
      <img
        src={slide.previewUrl}
        alt=""
        className="h-14 w-14 rounded object-cover"
      />
      <span className="min-w-0 flex-1 truncate text-sm text-gray-700">
        {slide.file.name}
      </span>
      <button
        type="button"
        onClick={() => onRemove(slide.id)}
        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        aria-label="Remove slide"
      >
        ×
      </button>
    </li>
  )
}

export function SlideList({
  slides,
  hook,
  onReorder,
  onRemove,
  onCreateHook,
  onSkipHook,
  onContinueToPreview,
}: SlideListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = slides.findIndex((s) => s.id === active.id)
    const newIndex = slides.findIndex((s) => s.id === over.id)
    onReorder(arrayMove(slides, oldIndex, newIndex))
  }

  return (
    <section className="mx-auto w-full max-w-xl">
      <ul className="space-y-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={slides.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {slides.map((slide, i) => (
              <SortableRow
                key={slide.id}
                slide={slide}
                index={i}
                onRemove={onRemove}
              />
            ))}
          </SortableContext>
        </DndContext>
      </ul>

      {!hook && (
        <div className="mt-10 rounded-xl border border-dashed border-gray-200 bg-gray-50/80 p-6 text-center">
          <p className="text-sm text-gray-600">
            Add a hook image? (This becomes the thumbnail on LinkedIn)
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={onCreateHook}
              className="rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
            >
              Create hook image
            </button>
            <button
              type="button"
              onClick={onSkipHook}
              className="rounded-md border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {hook && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={onContinueToPreview}
            className="rounded-md border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Continue to preview
          </button>
        </div>
      )}
    </section>
  )
}
