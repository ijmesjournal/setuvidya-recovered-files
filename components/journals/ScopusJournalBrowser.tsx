'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { filterJournals, scopusJournals, subjectOptions } from '@/lib/journals';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------
   Scopus Journal List.

   Data-driven and empty by design: content/site.json -> scopusJournals.journals
   holds no entries, because no record has been verified yet. Nothing about a
   journal is generated here — name, ISSN, publisher, subject and status all
   come from the data, and each row carries the source it was checked against.
------------------------------------------------------------------------- */

export function ScopusJournalBrowser() {
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('All');
  const subjects = subjectOptions();
  const results = useMemo(
    () => filterJournals(scopusJournals.journals, subject, query),
    [subject, query],
  );

  return (
    <>
      <div className="mt-10 flex flex-col gap-5">
        <label className="relative block">
          <span className="sr-only">{scopusJournals.searchPlaceholder}</span>
          <Search
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={scopusJournals.searchPlaceholder}
            className="w-full rounded-lg border border-rule bg-paper py-3.5 pl-12 pr-4 text-[0.95rem] text-ink outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted hover:border-navy/35 focus:border-indigo focus:ring-2 focus:ring-indigo/15"
          />
        </label>

        {subjects.length > 1 ? (
          <div role="group" aria-label="Filter by subject area" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {subjects.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={s === subject}
                onClick={() => setSubject(s)}
                className={cn(
                  'shrink-0 rounded-full border px-4 py-2 text-[0.85rem] font-medium transition-colors duration-200',
                  s === subject
                    ? 'border-ink bg-ink text-white'
                    : 'border-rule bg-paper text-body hover:border-navy/35 hover:text-ink',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {results.length} journal{results.length === 1 ? '' : 's'} shown.
      </p>

      {results.length === 0 ? (
        <p className="mt-10 rounded-lg border border-rule bg-surface p-8 text-center text-body">
          {scopusJournals.emptyState}
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-left text-[0.92rem]">
            <thead>
              <tr className="border-b border-rule">
                {scopusJournals.columns.map((c) => (
                  <th key={c} scope="col" className="py-3 pr-4 text-[0.8rem] font-semibold uppercase tracking-[0.1em] text-muted">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((j) => (
                <tr key={j.name} className="border-b border-rule align-top">
                  <td className="py-4 pr-4 font-medium text-ink">{j.name}</td>
                  <td className="py-4 pr-4">{j.issn || '—'}</td>
                  <td className="py-4 pr-4">{j.publisher || '—'}</td>
                  <td className="py-4 pr-4">{j.subject || '—'}</td>
                  <td className="py-4 pr-4">{j.status || '—'}</td>
                  <td className="py-4 pr-4">
                    {j.sourceUrl ? (
                      <a
                        href={j.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo hover:underline"
                      >
                        {j.sourceName || 'Source'}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
