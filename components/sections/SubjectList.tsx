'use client';

import { useState } from 'react';

/* -------------------------------------------------------------------------
   Subjects for one research-area card.

   Collapsed, it shows the first few examples; expanded, the full list. Each
   card holds its own state, so opening one never opens the others. The button
   is a real <button> with aria-expanded and aria-controls, so screen readers
   announce the state and keyboard users can operate it.
------------------------------------------------------------------------- */

const PREVIEW = 4;

export function SubjectList({ id, subjects }: { id: string; subjects: string[] }) {
  const [open, setOpen] = useState(false);
  const listId = `subjects-${id}`;
  const hasMore = subjects.length > PREVIEW;
  const shown = open ? subjects : subjects.slice(0, PREVIEW);

  return (
    <div className="mt-3 flex flex-1 flex-col">
      <p id={listId} className="flex-1 text-[0.9rem]">
        {shown.join(' · ')}
      </p>
      {hasMore ? (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((v) => !v)}
          className="mt-4 self-start text-[0.86rem] font-medium text-indigo transition-colors duration-200 hover:text-indigo-lift"
        >
          {open ? 'Show less ↑' : 'View all subjects →'}
        </button>
      ) : null}
    </div>
  );
}
