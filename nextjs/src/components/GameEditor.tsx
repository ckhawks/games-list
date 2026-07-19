"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Edit2, Trash2 } from "react-feather";
import { updatePlayerGame, removePlayerGame } from "@/app/[username]/actions";
import styles from "./GameEditor.module.scss";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles["save"]} disabled={pending}>
      {pending ? "Saving…" : "Save"}
    </button>
  );
}

export default function GameEditor({
  playerGameId,
  rating,
  hoursPlayed,
  reviewBlurb,
}: {
  playerGameId: string;
  rating: number | null;
  hoursPlayed: number | null;
  reviewBlurb: string | null;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button className={styles["edit-toggle"]} onClick={() => setOpen(true)}>
        <Edit2 size={13} /> Edit
      </button>
    );
  }

  return (
    <div className={styles["editor"]}>
      <form action={updatePlayerGame} className={styles["fields"]}>
        <input type="hidden" name="playerGameId" value={playerGameId} />
        <div className={styles["row"]}>
          <label className={styles["field"]}>
            <span>Rating (0–10)</span>
            <input
              name="rating"
              type="number"
              min={0}
              max={10}
              defaultValue={rating ?? ""}
              required
            />
          </label>
          <label className={styles["field"]}>
            <span>Hours played</span>
            <input
              name="hoursPlayed"
              type="number"
              min={0}
              defaultValue={hoursPlayed ?? ""}
            />
          </label>
        </div>
        <label className={styles["field"]}>
          <span>Review</span>
          <textarea
            name="reviewBlurb"
            rows={3}
            defaultValue={reviewBlurb ?? ""}
            placeholder="Your thoughts on this game…"
          />
        </label>
        <div className={styles["actions"]}>
          <SaveButton />
          <button
            type="button"
            className={styles["cancel"]}
            onClick={() => setOpen(false)}
          >
            Cancel
          </button>
        </div>
      </form>

      <form
        action={removePlayerGame}
        onSubmit={(e) => {
          if (!confirm("Remove this game from your list?")) e.preventDefault();
        }}
      >
        <input type="hidden" name="playerGameId" value={playerGameId} />
        <button type="submit" className={styles["remove"]}>
          <Trash2 size={13} /> Remove from list
        </button>
      </form>
    </div>
  );
}
