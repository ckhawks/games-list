"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  closestCorners,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreVertical } from "react-feather";
import GameCard, { GameRow } from "./GameCard";
import { reorderGames } from "@/app/[username]/actions";
import styles from "./SortableGameList.module.scss";

type Items = Record<string, string[]>; // tier (rating as string) -> playerGameId[]

function buildItems(games: GameRow[]): Items {
  const items: Items = {};
  for (const g of games) {
    const tier = String(g.rating ?? 0);
    (items[tier] ??= []).push(g.playerGameId);
  }
  return items;
}

// Contiguous tiers from the highest present rating down to the lowest, so gaps
// in between show as empty drop zones you can re-rate into.
function tierRange(games: GameRow[]): string[] {
  const ratings = games.map((g) => g.rating ?? 0);
  const max = Math.max(...ratings, 0);
  const min = Math.min(...ratings, max);
  const tiers: string[] = [];
  for (let r = max; r >= min; r--) tiers.push(String(r));
  return tiers;
}

function SortableRow({
  id,
  game,
  rank,
}: {
  id: string;
  game: GameRow;
  rank: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className={styles["row"]}>
      <button
        className={styles["handle"]}
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <MoreVertical size={18} />
      </button>
      <div className={styles["card"]}>
        <GameCard game={game} rank={rank} isOwner={true} />
      </div>
    </div>
  );
}

function Tier({
  tier,
  ids,
  byId,
  startRank,
}: {
  tier: string;
  ids: string[];
  byId: Record<string, GameRow>;
  startRank: number;
}) {
  const { setNodeRef } = useDroppable({ id: tier });
  return (
    <div className={styles["tier"]}>
      <div className={styles["tier-header"]}>{tier}</div>
      <SortableContext id={tier} items={ids} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className={styles["tier-items"]}>
          {ids.length === 0 ? (
            <div className={styles["empty-tier"]}>Drop here to rate {tier}</div>
          ) : (
            ids.map((id, i) => (
              <SortableRow key={id} id={id} game={byId[id]} rank={startRank + i} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function SortableGameList({
  username,
  games,
}: {
  username: string;
  games: GameRow[];
}) {
  const byId = useMemo(
    () => Object.fromEntries(games.map((g) => [g.playerGameId, g])),
    [games]
  ) as Record<string, GameRow>;
  const tiers = useMemo(() => tierRange(games), [games]);

  const [items, setItems] = useState<Items>(() => buildItems(games));
  const [activeId, setActiveId] = useState<string | null>(null);
  const snapshot = useRef<Items | null>(null);
  const [, startTransition] = useTransition();

  // Re-sync from the server whenever the underlying data changes (e.g. editing a
  // rating via the inline form moves a game to a new tier). A drag's own save
  // round-trips to the same arrangement, so this causes no visual jump there.
  const signature = useMemo(
    () => games.map((g) => `${g.playerGameId}:${g.rating}:${g.order}`).join("|"),
    [games]
  );
  const [prevSignature, setPrevSignature] = useState(signature);
  if (signature !== prevSignature) {
    setPrevSignature(signature);
    setItems(buildItems(games));
    setActiveId(null);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findContainer = (id: string): string | undefined => {
    if (id in items) return id; // id is a tier key
    return tiers.find((t) => (items[t] ?? []).includes(id));
  };

  function persist(next: Items) {
    const payload = {
      username,
      items: tiers.flatMap((tier) =>
        (next[tier] ?? []).map((playerGameId, i) => ({
          playerGameId,
          rating: Number(tier),
          order: i + 1,
        }))
      ),
    };
    startTransition(async () => {
      try {
        await reorderGames(payload);
      } catch {
        if (snapshot.current) setItems(snapshot.current); // revert on failure
      }
    });
  }

  function onDragStart(e: DragStartEvent) {
    snapshot.current = items;
    setActiveId(String(e.active.id));
  }

  function onDragOver(e: DragOverEvent) {
    const activeId = String(e.active.id);
    const overId = e.over ? String(e.over.id) : null;
    if (!overId) return;
    const from = findContainer(activeId);
    const to = findContainer(overId);
    if (!from || !to || from === to) return;

    setItems((prev) => {
      const fromItems = prev[from] ?? [];
      const toItems = prev[to] ?? [];
      const overIsContainer = overId in prev;
      const overIndex = overIsContainer ? toItems.length : toItems.indexOf(overId);
      const insertAt = overIndex < 0 ? toItems.length : overIndex;
      return {
        ...prev,
        [from]: fromItems.filter((id) => id !== activeId),
        [to]: [
          ...toItems.slice(0, insertAt),
          activeId,
          ...toItems.slice(insertAt),
        ],
      };
    });
  }

  function onDragEnd(e: DragEndEvent) {
    const activeId = String(e.active.id);
    const overId = e.over ? String(e.over.id) : null;
    const container = findContainer(activeId);
    let next = items;

    if (container && overId) {
      const arr = items[container] ?? [];
      const oldIndex = arr.indexOf(activeId);
      const newIndex = overId in items ? arr.length - 1 : arr.indexOf(overId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        next = { ...items, [container]: arrayMove(arr, oldIndex, newIndex) };
        setItems(next);
      }
    }

    setActiveId(null);
    persist(next);
  }

  // running global rank across tiers, high to low
  let rankCounter = 1;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className={styles["tiers"]}>
        {tiers.map((tier) => {
          const ids = items[tier] ?? [];
          const startRank = rankCounter;
          rankCounter += ids.length;
          return (
            <Tier
              key={tier}
              tier={tier}
              ids={ids}
              byId={byId}
              startRank={startRank}
            />
          );
        })}
      </div>
      <DragOverlay>
        {activeId && byId[activeId] ? (
          <div className={styles["overlay"]}>
            <GameCard game={byId[activeId]} rank={0} isOwner={false} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
