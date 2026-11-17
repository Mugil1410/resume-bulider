"use client";
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2, Copy } from "lucide-react";
import { useState, type ReactNode, type ComponentProps } from "react";
import {
  DndContext, closestCenter, PointerSensor, TouchSensor, KeyboardSensor, useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const inputCls =
  "w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-3 text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20";

export function Field({ label, className = "", ...p }: { label: string } & ComponentProps<"input">) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-semibold text-zinc-600">{label}</span>
      <input {...p} className={inputCls} />
    </label>
  );
}

export function TextArea({ label, rows = 4, className = "", ...p }: { label: string } & ComponentProps<"textarea">) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-semibold text-zinc-600">{label}</span>
      <textarea rows={rows} {...p} className={`${inputCls} resize-y leading-relaxed`} />
    </label>
  );
}

export function Btn({
  variant = "secondary", className = "", ...p
}: { variant?: "primary" | "secondary" | "danger" | "ghost" } & ComponentProps<"button">) {
  const v = {
    primary: "bg-[var(--accent)] text-white hover:brightness-110 active:brightness-95",
    secondary: "bg-white text-zinc-800 border border-zinc-300 hover:bg-zinc-50 active:bg-zinc-100",
    danger: "bg-white text-red-600 border border-red-200 hover:bg-red-50",
    ghost: "text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200",
  }[variant];
  return (
    <button
      type="button"
      {...p}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${v} ${className}`}
    />
  );
}

export function IconBtn({ label, className = "", ...p }: { label: string } & ComponentProps<"button">) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...p}
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-zinc-600 hover:bg-zinc-100 active:bg-zinc-200 disabled:opacity-30 ${className}`}
    />
  );
}

export function Section({
  title, count, defaultOpen = false, children,
}: { title: string; count?: number; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex min-h-14 w-full items-center justify-between gap-3 px-4 text-left"
      >
        <span className="font-bold text-zinc-900">
          {title}
          {count !== undefined && (
            <span className="ml-2 rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-xs font-semibold text-[var(--accent)]">{count}</span>
          )}
        </span>
        {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {open && <div className="space-y-4 border-t border-zinc-100 p-4">{children}</div>}
    </section>
  );
}

export function AddButton({ children, ...p }: ComponentProps<"button">) {
  return (
    <Btn variant="primary" className="w-full" {...p}>
      <Plus size={18} /> {children}
    </Btn>
  );
}

/** Editable list of strings (bullets) with add / delete / move up / move down. */
export function BulletList({
  label, items, onChange, addLabel = "Add bullet",
}: { label: string; items: string[]; onChange: (v: string[]) => void; addLabel?: string }) {
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    onChange(arrayMove(items, i, j));
  };
  return (
    <div>
      <div className="mb-1 text-xs font-semibold text-zinc-600">{label}</div>
      <div className="space-y-2">
        {items.map((t, i) => (
          <div key={i} className="rounded-xl border border-zinc-200 bg-zinc-50 p-2">
            <textarea
              aria-label={`${label} ${i + 1}`}
              rows={3}
              value={t}
              onChange={(e) => onChange(items.map((x, k) => (k === i ? e.target.value : x)))}
              className={`${inputCls} resize-y`}
            />
            <div className="mt-1 flex justify-end gap-1">
              <IconBtn label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ChevronUp size={18} /></IconBtn>
              <IconBtn label="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)}><ChevronDown size={18} /></IconBtn>
              <IconBtn label="Delete bullet" className="text-red-600" onClick={() => onChange(items.filter((_, k) => k !== i))}><Trash2 size={18} /></IconBtn>
            </div>
          </div>
        ))}
      </div>
      <Btn variant="secondary" className="mt-2 w-full" onClick={() => onChange([...items, ""])}>
        <Plus size={16} /> {addLabel}
      </Btn>
    </div>
  );
}

function SortableRow({ id, children }: { id: string; children: (handle: ReactNode) => ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const handle = (
    <button
      type="button"
      aria-label="Drag to reorder"
      {...attributes}
      {...listeners}
      style={{ touchAction: "none" }}
      className="inline-flex h-11 w-11 shrink-0 cursor-grab items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 active:cursor-grabbing"
    >
      <GripVertical size={20} />
    </button>
  );
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        zIndex: isDragging ? 10 : undefined,
        position: "relative",
      }}
    >
      {children(handle)}
    </div>
  );
}

/** Reorderable card list: drag handle (touch + mouse + keyboard) plus move up/down, duplicate and delete buttons. */
export function SortableCards<T extends { id: string }>({
  items, onChange, title, render, onDuplicate,
}: {
  items: T[];
  onChange: (v: T[]) => void;
  title: (item: T, i: number) => string;
  render: (item: T, patch: (p: Partial<T>) => void) => ReactNode;
  onDuplicate?: (item: T) => T;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  );
  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const a = items.findIndex((x) => x.id === e.active.id);
    const b = items.findIndex((x) => x.id === e.over!.id);
    if (a >= 0 && b >= 0) onChange(arrayMove(items, a, b));
  };
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j >= 0 && j < items.length) onChange(arrayMove(items, i, j));
  };
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {items.map((item, i) => {
            const open = openId === item.id;
            return (
              <SortableRow key={item.id} id={item.id}>
                {(handle) => (
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50">
                    <div className="flex items-center gap-1 p-1">
                      {handle}
                      <button
                        type="button"
                        onClick={() => setOpenId(open ? null : item.id)}
                        aria-expanded={open}
                        className="min-h-11 flex-1 truncate px-1 text-left text-sm font-semibold text-zinc-800"
                      >
                        {title(item, i) || `Item ${i + 1}`}
                      </button>
                      <IconBtn label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ChevronUp size={18} /></IconBtn>
                      <IconBtn label="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)}><ChevronDown size={18} /></IconBtn>
                    </div>
                    {open && (
                      <div className="space-y-3 border-t border-zinc-200 p-3">
                        {render(item, (p) => onChange(items.map((x) => (x.id === item.id ? { ...x, ...p } : x))))}
                        <div className="flex gap-2">
                          {onDuplicate && (
                            <Btn
                              variant="secondary"
                              className="flex-1"
                              onClick={() => {
                                const copy = onDuplicate(item);
                                const next = [...items];
                                next.splice(i + 1, 0, copy);
                                onChange(next);
                                setOpenId(copy.id);
                              }}
                            >
                              <Copy size={16} /> Duplicate
                            </Btn>
                          )}
                          <Btn
                            variant="danger"
                            className="flex-1"
                            onClick={() => {
                              if (window.confirm("Delete this entry?")) onChange(items.filter((x) => x.id !== item.id));
                            }}
                          >
                            <Trash2 size={16} /> Delete
                          </Btn>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </SortableRow>
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
