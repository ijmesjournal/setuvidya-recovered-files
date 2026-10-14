import { z } from 'zod';
import { formOptions } from './content';

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export const ACCEPTED_UPLOAD_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
  'text/plain',
  'image/png',
  'image/jpeg',
];

export const ACCEPTED_UPLOAD_EXTENSIONS = '.pdf,.doc,.docx,.txt,.zip,.png,.jpg,.jpeg';

/**
 * Shared shape for the enquiry form.
 * Messages are written as instructions, not apologies: each one says
 * what is wrong and what to do about it.
 */
export const enquirySchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Enter your full name.')
    .max(120, 'Keep your name under 120 characters.'),

  email: z
    .string()
    .trim()
    .min(1, 'Enter an email address so we can reply.')
    .email('Enter a valid email address, for example name@university.edu.'),

  phone: z
    .string()
    .trim()
    .min(7, 'Enter a phone number with country code.')
    .max(24, 'Phone numbers cannot be longer than 24 characters.')
    .regex(/^[+0-9()\-\s]+$/, 'Use digits, spaces and the characters + ( ) - only.'),

  academicLevel: z
    .string()
    .refine((v) => formOptions.academicLevels.includes(v), 'Choose your academic level.'),

  service: z
    .string()
    .refine((v) => formOptions.services.includes(v), 'Choose the service you need.'),

  discipline: z
    .string()
    .trim()
    .min(2, 'Enter your research discipline, for example Structural Engineering.')
    .max(120, 'Keep the discipline under 120 characters.'),

  requirement: z
    .string()
    .trim()
    .min(20, 'Describe your requirement in at least 20 characters so we can assess it.')
    .max(4000, 'Keep your requirement under 4000 characters.'),

  message: z.string().trim().max(2000, 'Keep additional notes under 2000 characters.').optional(),

  consent: z.literal(true, {
    errorMap: () => ({ message: 'Tick the box to let us contact you about this enquiry.' }),
  }),

  // Honeypot. Real users never see or fill this.
  company: z.string().max(0).optional(),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

export type EnquiryFieldErrors = Partial<Record<keyof EnquiryInput | 'document', string>>;

export function validateUpload(file: File | null): string | null {
  if (!file) return null;
  if (file.size > MAX_UPLOAD_BYTES) {
    return 'That file is over 10 MB. Compress it or send a download link in your requirement.';
  }
  if (file.type && !ACCEPTED_UPLOAD_TYPES.includes(file.type)) {
    return 'Attach a PDF, Word, text, image or ZIP file.';
  }
  return null;
}

/* -------------------------------------------------------------------------
   Book order (checkout) validation.

   Only fields genuinely needed to ship a physical book are collected. There is
   no account, no marketing consent, no date of birth.
------------------------------------------------------------------------- */

export const orderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Enter the name the order should be addressed to.')
    .max(120, 'Keep the name under 120 characters.'),

  email: z
    .string()
    .trim()
    .min(1, 'Enter an email address so we can confirm your order.')
    .email('Enter a valid email address, for example name@example.com.'),

  mobile: z
    .string()
    .trim()
    .regex(/^[+0-9()\-\s]{10,18}$/, 'Enter a mobile number with country code, e.g. +91 98765 43210.')
    .refine((v) => v.replace(/\D/g, '').length >= 10, 'A mobile number needs at least 10 digits.'),

  address: z
    .string()
    .trim()
    .min(8, 'Enter the full delivery address, including house or flat number.')
    .max(400, 'Keep the address under 400 characters.'),

  city: z.string().trim().min(2, 'Enter your city.').max(80, 'Keep the city under 80 characters.'),

  state: z.string().trim().min(2, 'Choose your state.'),

  pin: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, 'Enter a 6-digit Indian PIN code, e.g. 110001.'),

  country: z.string().trim().min(2, 'Enter your country.'),

  notes: z.string().trim().max(500, 'Keep any note under 500 characters.').optional(),

  // Honeypot. Real customers never see or fill this.
  company: z.string().max(0).optional(),
});

export type OrderInput = z.infer<typeof orderSchema>;
export type OrderFieldErrors = Partial<Record<keyof OrderInput, string>>;

/** Cart lines as submitted. Prices are deliberately absent: the server
 *  recomputes every amount from its own catalogue. */
export const orderLinesSchema = z
  .array(
    z.object({
      id: z.string().min(1),
      quantity: z.number().int().min(1, 'Quantity must be at least 1.').max(50, 'Maximum 50 per title.'),
    }),
  )
  .min(1, 'Your cart is empty.');
