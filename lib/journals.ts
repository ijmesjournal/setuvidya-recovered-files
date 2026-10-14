import raw from '@/content/site.json';

/* -------------------------------------------------------------------------
   Scopus Journal List.

   The list is empty until verified records are supplied. Nothing here
   generates or infers a journal's name, ISSN, publisher, subject area or
   indexing status: every field is read from the data, and each record carries
   the source against which it was checked.
------------------------------------------------------------------------- */

export type JournalRecord = {
  name: string;
  issn: string;
  publisher: string;
  subject: string;
  /** e.g. the status recorded at the time of checking. Never inferred. */
  status: string;
  sourceName: string;
  sourceUrl: string;
};

export const scopusJournals = raw.scopusJournals as {
  kicker: string;
  title: string;
  intro: string;
  searchPlaceholder: string;
  subjects: string[];
  emptyState: string;
  verifyNote: string;
  columns: string[];
  journals: JournalRecord[];
};

/** Subjects that actually have records, with "All" first. */
export function subjectOptions(): string[] {
  const used = new Set(scopusJournals.journals.map((j) => j.subject).filter(Boolean));
  return ['All', ...scopusJournals.subjects.filter((s) => used.has(s))];
}

export function filterJournals(
  list: JournalRecord[],
  subject: string,
  query: string,
): JournalRecord[] {
  const q = query.trim().toLowerCase();
  return list.filter((j) => {
    if (subject !== 'All' && j.subject !== subject) return false;
    if (!q) return true;
    return [j.name, j.publisher, j.subject, j.issn]
      .filter(Boolean)
      .some((v) => v.toLowerCase().includes(q));
  });
}

/* The SCI/SCIE list uses the identical shape and the same rules: no record,
   ISSN, publisher or indexing status is generated here. */
export const sciJournals = raw.sciJournals as typeof scopusJournals;

export function sciSubjectOptions(): string[] {
  const used = new Set(sciJournals.journals.map((j) => j.subject).filter(Boolean));
  return ['All', ...sciJournals.subjects.filter((s) => used.has(s))];
}

/* ABDC list: identical shape and rules. No record or rating is generated. */
export const abdcJournals = raw.abdcJournals as typeof scopusJournals;

export function abdcSubjectOptions(): string[] {
  const used = new Set(abdcJournals.journals.map((j) => j.subject).filter(Boolean));
  return ['All', ...abdcJournals.subjects.filter((s) => used.has(s))];
}
