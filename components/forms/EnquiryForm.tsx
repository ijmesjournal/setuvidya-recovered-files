'use client';

import { useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/primitives';
import { formOptions, pages } from '@/lib/content';
import {
  ACCEPTED_UPLOAD_EXTENSIONS,
  enquirySchema,
  validateUpload,
  type EnquiryFieldErrors,
} from '@/lib/validation';
import { cn } from '@/lib/utils';
import { SUBMISSION_DENIAL_MESSAGE } from '@/lib/deployment-policy.mjs';

const submissionsEnabled = process.env.NEXT_PUBLIC_SUBMISSIONS_ENABLED === 'true';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const initialValues = {
  fullName: '',
  email: '',
  phone: '',
  academicLevel: '',
  service: '',
  discipline: '',
  requirement: '',
  message: '',
  consent: false,
  company: '', // honeypot
};

function FieldError({ name, error }: {
  name: keyof EnquiryFieldErrors;
  error: EnquiryFieldErrors[keyof EnquiryFieldErrors];
}) {
  return error ? (
    <p id={`${name}-error`} className="mt-2 flex items-start gap-1.5 text-[0.85rem] text-red-700">
      <AlertCircle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
      {error}
    </p>
  ) : null;
}

export function EnquiryForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<EnquiryFieldErrors>({});
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [formError, setFormError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const set = (name: keyof typeof initialValues, value: string | boolean) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const onFile = (f: File | null) => {
    const problem = validateUpload(f);
    setErrors((e) => ({ ...e, document: problem ?? undefined }));
    setFile(problem ? null : f);
    if (problem && fileInput.current) fileInput.current.value = '';
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!submissionsEnabled) return;
    setFormError(null);

    const parsed = enquirySchema.safeParse(values);
    const uploadProblem = validateUpload(file);

    if (!parsed.success || uploadProblem) {
      const next: EnquiryFieldErrors = {};
      parsed.error?.issues.forEach((issue) => {
        const key = issue.path[0] as keyof EnquiryFieldErrors;
        if (!next[key]) next[key] = issue.message;
      });
      if (uploadProblem) next.document = uploadProblem;
      setErrors(next);
      setStatus('error');
      setFormError('Check the highlighted fields and send again.');
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setStatus('submitting');
    setErrors({});

    try {
      const body = new FormData();
      Object.entries(parsed.data).forEach(([k, v]) => body.append(k, String(v)));
      if (file) body.append('document', file);

      const res = await fetch('/api/enquiry', { method: 'POST', body });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Surface field errors returned by the server, if any.
        if (data?.fieldErrors) setErrors(data.fieldErrors);
        setStatus('error');
        setFormError(
          data?.message ??
            'The enquiry could not be sent. Try again, or email us directly using the address on this page.',
        );
        requestAnimationFrame(() => summaryRef.current?.focus());
        return;
      }

      setReference(data?.reference ?? null);
      setStatus('success');
      setValues(initialValues);
      setFile(null);
      if (fileInput.current) fileInput.current.value = '';
    } catch {
      setStatus('error');
      setFormError(
        'The enquiry could not be sent, probably because of a network problem. Try again, or email us directly.',
      );
      requestAnimationFrame(() => summaryRef.current?.focus());
    }
  }

  /* ------------------------------------------------------ success state */
  if (!submissionsEnabled) {
    return <p role="status" className="rounded border border-rule bg-paper p-6">{SUBMISSION_DENIAL_MESSAGE}</p>;
  }

  if (status === 'success') {
    return (
      <div
        className="rounded border border-rule bg-paper p-8 sm:p-10"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="text-teal" size={34} aria-hidden="true" />
        <h3 className="mt-5 text-display-sm">Requirement received</h3>
        <p className="mt-3 max-w-prose">
          We have your enquiry and will reply with an honest assessment of whether and how we can
          help. If we cannot help with something, we will say so rather than take the work.
        </p>
        {reference ? (
          <p className="mt-4 text-sm text-muted">
            Your reference: <span className="font-medium text-ink">{reference}</span>
          </p>
        ) : null}
        <Button
          variant="secondary"
          className="mt-7"
          onClick={() => {
            setStatus('idle');
            setReference(null);
          }}
        >
          Send another requirement
        </Button>
      </div>
    );
  }

  const fieldClass = (name: keyof EnquiryFieldErrors) =>
    cn(
      'w-full rounded border bg-paper px-4 py-3 text-[0.97rem] text-ink outline-none',
      'transition-[border-color,box-shadow] duration-200',
      'placeholder:text-muted',
      'focus:border-indigo focus:ring-2 focus:ring-indigo/15',
      errors[name] ? 'border-red-600/70' : 'border-rule hover:border-navy/35',
    );

  const labelClass = 'mb-2 block text-[0.9rem] font-medium text-ink';

  const aria = (name: keyof EnquiryFieldErrors) => ({
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {formError ? (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="flex items-start gap-3 rounded border border-red-600/40 bg-red-50 px-4 py-3.5 text-[0.92rem] text-red-800"
        >
          <AlertCircle size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>{formError}</span>
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className={labelClass}>
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            autoComplete="name"
            value={values.fullName}
            onChange={(e) => set('fullName', e.target.value)}
            className={fieldClass('fullName')}
            placeholder="Ananya Raghavan"
            {...aria('fullName')}
          />
          <FieldError name="fullName" error={errors.fullName} />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => set('email', e.target.value)}
            className={fieldClass('email')}
            placeholder="name@university.edu"
            {...aria('email')}
          />
          <FieldError name="email" error={errors.email} />
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(e) => set('phone', e.target.value)}
            className={fieldClass('phone')}
            placeholder="+91 00000 00000"
            {...aria('phone')}
          />
          <FieldError name="phone" error={errors.phone} />
        </div>

        <div>
          <label htmlFor="academicLevel" className={labelClass}>
            Academic level
          </label>
          <select
            id="academicLevel"
            name="academicLevel"
            value={values.academicLevel}
            onChange={(e) => set('academicLevel', e.target.value)}
            className={fieldClass('academicLevel')}
            {...aria('academicLevel')}
          >
            <option value="">Choose one</option>
            {formOptions.academicLevels.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <FieldError name="academicLevel" error={errors.academicLevel} />
        </div>

        <div>
          <label htmlFor="service" className={labelClass}>
            Service required
          </label>
          <select
            id="service"
            name="service"
            value={values.service}
            onChange={(e) => set('service', e.target.value)}
            className={fieldClass('service')}
            {...aria('service')}
          >
            <option value="">Choose one</option>
            {formOptions.services.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <FieldError name="service" error={errors.service} />
        </div>

        <div>
          <label htmlFor="discipline" className={labelClass}>
            Research discipline
          </label>
          <input
            id="discipline"
            name="discipline"
            value={values.discipline}
            onChange={(e) => set('discipline', e.target.value)}
            className={fieldClass('discipline')}
            placeholder="Structural Engineering"
            {...aria('discipline')}
          />
          <FieldError name="discipline" error={errors.discipline} />
        </div>
      </div>

      <div>
        <label htmlFor="requirement" className={labelClass}>
          Your requirement
        </label>
        <textarea
          id="requirement"
          name="requirement"
          rows={5}
          value={values.requirement}
          onChange={(e) => set('requirement', e.target.value)}
          className={cn(fieldClass('requirement'), 'resize-y')}
          placeholder="Where you are in the process, what your university or journal has asked for, and what you need help with."
          {...aria('requirement')}
        />
        <FieldError name="requirement" error={errors.requirement} />
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          Anything else <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          value={values.message}
          onChange={(e) => set('message', e.target.value)}
          className={cn(fieldClass('message'), 'resize-y')}
          placeholder="Deadlines, supervisor feedback, preferred contact time."
          {...aria('message')}
        />
        <FieldError name="message" error={errors.message} />
      </div>

      {/* -------------------------------------------------------- upload */}
      <div>
        <span className={labelClass}>
          Upload your document <span className="font-normal text-muted">(optional, max 10 MB)</span>
        </span>

        <label
          htmlFor="document"
          className={cn(
            'flex cursor-pointer items-center gap-3 rounded border border-dashed px-4 py-4 transition-colors duration-200',
            errors.document ? 'border-red-600/70' : 'border-rule hover:border-navy/45 hover:bg-surface',
          )}
        >
          <Paperclip size={17} className="shrink-0 text-navy" aria-hidden="true" />
          <span className="text-[0.93rem] text-body">
            {file ? file.name : 'Attach a PDF, Word, text, image or ZIP file'}
          </span>
          <input
            ref={fileInput}
            id="document"
            name="document"
            type="file"
            accept={ACCEPTED_UPLOAD_EXTENSIONS}
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            className="sr-only"
            aria-describedby={errors.document ? 'document-error' : undefined}
          />
        </label>

        {file ? (
          <button
            type="button"
            onClick={() => onFile(null)}
            className="mt-2 inline-flex items-center gap-1.5 text-[0.85rem] text-indigo hover:underline"
          >
            <X size={13} aria-hidden="true" /> Remove {file.name}
          </button>
        ) : null}
        <FieldError name="document" error={errors.document} />
        <p className="mt-2 text-[0.85rem] text-muted">{pages.contact.formNote}</p>
      </div>

      {/* honeypot: hidden from users and assistive tech, filled only by bots */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={values.company}
          onChange={(e) => set('company', e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="consent" className="flex cursor-pointer items-start gap-3">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            checked={values.consent}
            onChange={(e) => set('consent', e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 rounded border-rule text-indigo focus:ring-indigo"
            {...aria('consent')}
          />
          <span className="text-[0.9rem] text-body">
            I agree that SetuVidya may contact me about this enquiry, and I confirm that I remain
            responsible for the originality and final submission of my academic work.
          </span>
        </label>
        <FieldError name="consent" error={errors.consent} />
      </div>

      <Button type="submit" size="lg" disabled={status === 'submitting'} className="w-full sm:w-auto">
        {status === 'submitting' ? (
          <>
            <Loader2 size={17} className="animate-spin" aria-hidden="true" />
            Sending your requirement
          </>
        ) : (
          'Submit your requirement'
        )}
      </Button>
    </form>
  );
}
