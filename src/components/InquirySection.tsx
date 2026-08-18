"use client";

import React, { useEffect, useRef, useState } from "react";
import { CONTACT, SUITES, formatPrice } from "@/data/villa";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { magnetic, revealUp, useGsap } from "@/lib/motion";

/**
 * Section 08 — Private consultation.
 *
 * There is no backend behind this page and none is pretended. The form is a
 * composer: it validates what you type, then hands you a pre-filled mail draft
 * and the two channels that genuinely reach the office. Nothing here ever
 * claims a message was sent.
 */

type FieldName = "name" | "email";

interface FormValues {
  name: string;
  email: string;
  phone: string;
  interest: string;
  date: string;
  message: string;
}

const EMPTY_FORM: FormValues = {
  name: "",
  email: "",
  phone: "",
  interest: "",
  date: "",
  message: "",
};

/** Deliberately permissive — it rejects nonsense, not unusual addresses. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

const INTEREST_OPTIONS = [
  ...SUITES.map((suite) => ({
    value: suite.name,
    label: `${suite.name} — ${formatPrice(suite.priceValue)}${
      suite.status === "Reserved" ? " · reserved" : ""
    }`,
  })),
  { value: "The full estate", label: "Full estate — price on application" },
];

const LABEL = "block font-mono text-[10px] uppercase tracking-[0.24em] text-stone";
const FIELD =
  "w-full rounded-soft border bg-surface px-4 py-3 text-sm font-light text-bone transition-colors placeholder:text-stone-dim focus:border-champagne";
const ERROR_TEXT =
  "mt-2 flex items-start gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-champagne-bright";

function validateField(field: FieldName, value: string): string | undefined {
  if (field === "name") {
    return value.trim().length > 0 ? undefined : "Enter the name we should ask for";
  }
  return EMAIL_PATTERN.test(value.trim()) ? undefined : "Enter an address we can reply to";
}

/** Renders the chosen day in longhand; falls back to the raw value if parsing fails. */
function formatDay(iso: string) {
  if (!iso) return "";
  const parsed = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function InquirySection() {
  const rootRef = useRef<HTMLElement | null>(null);
  const contactRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const submitRef = useRef<HTMLButtonElement | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const confirmRef = useRef<HTMLDivElement | null>(null);

  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [prepared, setPrepared] = useState(false);

  useGsap(
    () => {
      const contact = contactRef.current;
      if (contact) {
        revealUp(contact.querySelectorAll("[data-reveal]"), {
          y: 26,
          stagger: 0.09,
          trigger: contact,
          start: "top 88%",
        });
      }

      const panel = panelRef.current;
      if (panel) {
        revealUp(panel, { y: 44, trigger: panel, start: "top 90%" });
      }
    },
    rootRef,
    []
  );

  // Re-attached after the panel swaps back out of the confirmation state.
  useEffect(() => magnetic(submitRef.current, 0.24), [prepared]);

  // The panel is replaced wholesale, so focus has to be carried across or it
  // drops to the document body.
  useEffect(() => {
    if (prepared) confirmRef.current?.focus({ preventScroll: true });
  }, [prepared]);

  const update = (field: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (field === "name" || field === "email") {
      setErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleBlur = (field: FieldName) => () => {
    const message = validateField(field, values[field]);
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nameError = validateField("name", values.name);
    const emailError = validateField("email", values.email);
    const next: Partial<Record<FieldName, string>> = {};
    if (nameError) next.name = nameError;
    if (emailError) next.email = emailError;
    setErrors(next);

    if (nameError) {
      nameRef.current?.focus();
      return;
    }
    if (emailError) {
      emailRef.current?.focus();
      return;
    }

    setPrepared(true);
  };

  const summary = [
    { label: "Name", value: values.name.trim() },
    { label: "Email", value: values.email.trim() },
    { label: "Telephone", value: values.phone.trim() },
    { label: "Residence", value: values.interest },
    { label: "Preferred date", value: formatDay(values.date) },
  ].filter((row) => row.value.length > 0);

  const subject = `Private viewing — Villa Horizon${values.interest ? ` — ${values.interest}` : ""}`;

  const body = [
    ...summary.map((row) => `${row.label}: ${row.value}`),
    "",
    values.message.trim() || "I would like to arrange a private viewing.",
    "",
  ].join("\n");

  const composeHref = `${CONTACT.emailHref}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  return (
    <section
      ref={rootRef}
      id="inquire"
      className="border-t border-hairline-soft px-6 py-28 md:px-12 lg:py-36"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">
          {/* ------------------------------------------------------------ */}
          {/* Left — the header, then the channels that actually work        */}
          {/* ------------------------------------------------------------ */}
          <div className="lg:col-span-5">
            <SectionHeader
              index="08"
              eyebrow="Private Consultation"
              title="Arrange a Private Viewing"
              lede="Viewings are arranged directly with the private client office, by appointment."
              className="mb-12"
            />

            <div ref={contactRef} className="border-t border-hairline pt-10">
              <h3
                data-reveal
                className="font-mono text-[10px] uppercase tracking-[0.24em] text-champagne"
              >
                {CONTACT.advisorName}
              </h3>

              <div data-reveal className="mt-6 flex flex-col gap-4">
                <a
                  href={CONTACT.phoneHref}
                  data-cursor-hover
                  className="font-display inline-flex min-h-11 w-fit items-center text-[1.6rem] font-light leading-tight text-bone transition-colors duration-500 hover:text-champagne md:text-[1.9rem]"
                >
                  {CONTACT.phone}
                </a>
                <a
                  href={CONTACT.emailHref}
                  data-cursor-hover
                  className="font-display inline-flex min-h-11 w-fit items-center break-all text-[1.15rem] font-light leading-tight text-bone transition-colors duration-500 hover:text-champagne md:text-[1.35rem]"
                >
                  {CONTACT.email}
                </a>
              </div>

              <h4
                data-reveal
                className="mt-12 font-mono text-[10px] uppercase tracking-[0.24em] text-champagne"
              >
                Offices
              </h4>

              <ul
                data-reveal
                className="mt-6 grid grid-cols-1 border-t border-hairline sm:grid-cols-2"
              >
                {CONTACT.offices.map((office) => (
                  <li
                    key={office.city}
                    className="flex items-baseline justify-between gap-4 border-b border-hairline-soft py-3.5 sm:odd:pr-6 sm:even:pl-6"
                  >
                    <span className="text-sm font-light text-bone">{office.city}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-stone-dim">
                      {office.street}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* Right — the composer                                          */}
          {/* ------------------------------------------------------------ */}
          <div className="lg:col-span-7">
            <div ref={panelRef} className="glass-bright rounded-card p-8 md:p-12">
              {prepared ? (
                <div
                  ref={confirmRef}
                  role="status"
                  aria-live="polite"
                  tabIndex={-1}
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-champagne">
                    Ready to send
                  </span>

                  <h3 className="font-display mt-4 text-[clamp(1.6rem,3vw,2.1rem)] font-light leading-tight text-bone">
                    Your enquiry is composed
                  </h3>

                  <p className="mt-4 max-w-lg text-sm font-light leading-relaxed text-stone md:text-base">
                    Open it in your own mail application in one tap, or reach the office directly on
                    either line below.
                  </p>

                  <a
                    href={composeHref}
                    data-cursor-hover
                    className="rounded-pill mt-8 flex min-h-12 w-full items-center justify-center bg-champagne px-8 text-center font-mono text-[11px] uppercase tracking-[0.24em] text-ink transition-colors duration-500 hover:bg-champagne-bright"
                  >
                    Open this enquiry in your mail app
                  </a>

                  <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <a
                      href={CONTACT.phoneHref}
                      data-cursor-hover
                      className="rounded-card group flex min-h-11 flex-col justify-center border border-hairline px-5 py-4 transition-colors duration-500 hover:border-champagne"
                    >
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-dim">
                        Telephone
                      </span>
                      <span className="font-display mt-1.5 text-lg font-light text-bone transition-colors duration-500 group-hover:text-champagne">
                        {CONTACT.phone}
                      </span>
                    </a>
                    <a
                      href={CONTACT.emailHref}
                      data-cursor-hover
                      className="rounded-card group flex min-h-11 flex-col justify-center border border-hairline px-5 py-4 transition-colors duration-500 hover:border-champagne"
                    >
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-dim">
                        Email
                      </span>
                      <span className="font-display mt-1.5 break-all text-lg font-light text-bone transition-colors duration-500 group-hover:text-champagne">
                        {CONTACT.email}
                      </span>
                    </a>
                  </div>

                  {summary.length > 0 && (
                    <dl className="mt-10 border-t border-hairline">
                      {summary.map((row) => (
                        <div
                          key={row.label}
                          className="flex items-baseline justify-between gap-6 border-b border-hairline-soft py-3"
                        >
                          <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-dim">
                            {row.label}
                          </dt>
                          <dd className="break-all text-right text-sm font-light text-bone">
                            {row.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  <p className="mt-8 font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-stone-dim">
                    This is a demonstration site. The form is not transmitted — enquiries go to the
                    office directly.
                  </p>

                  <button
                    type="button"
                    onClick={() => setPrepared(false)}
                    data-cursor-hover
                    className="mt-6 inline-flex min-h-11 items-center font-mono text-[10px] uppercase tracking-[0.22em] text-stone transition-colors duration-500 hover:text-champagne"
                  >
                    Edit the details
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-7">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-dim">
                    Fields marked * are required
                  </p>

                  <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
                    {/* Name -------------------------------------------- */}
                    <div>
                      <label htmlFor="enquiry-name" className={LABEL}>
                        Full name{" "}
                        <span aria-hidden="true" className="text-champagne">
                          *
                        </span>
                      </label>
                      <input
                        id="enquiry-name"
                        ref={nameRef}
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder="Your name"
                        value={values.name}
                        onChange={(e) => update("name", e.target.value)}
                        onBlur={handleBlur("name")}
                        aria-required="true"
                        aria-invalid={errors.name ? true : undefined}
                        aria-describedby={errors.name ? "enquiry-name-error" : undefined}
                        className={`mt-3 ${FIELD} ${
                          errors.name ? "border-champagne-bright" : "border-hairline"
                        }`}
                      />
                      {errors.name && (
                        <p id="enquiry-name-error" className={ERROR_TEXT}>
                          <span
                            aria-hidden="true"
                            className="mt-[0.45em] h-px w-3 shrink-0 bg-champagne-bright"
                          />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Email ------------------------------------------- */}
                    <div>
                      <label htmlFor="enquiry-email" className={LABEL}>
                        Email{" "}
                        <span aria-hidden="true" className="text-champagne">
                          *
                        </span>
                      </label>
                      <input
                        id="enquiry-email"
                        ref={emailRef}
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="name@domain.com"
                        value={values.email}
                        onChange={(e) => update("email", e.target.value)}
                        onBlur={handleBlur("email")}
                        aria-required="true"
                        aria-invalid={errors.email ? true : undefined}
                        aria-describedby={errors.email ? "enquiry-email-error" : undefined}
                        className={`mt-3 ${FIELD} ${
                          errors.email ? "border-champagne-bright" : "border-hairline"
                        }`}
                      />
                      {errors.email && (
                        <p id="enquiry-email-error" className={ERROR_TEXT}>
                          <span
                            aria-hidden="true"
                            className="mt-[0.45em] h-px w-3 shrink-0 bg-champagne-bright"
                          />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Telephone --------------------------------------- */}
                    <div>
                      <label htmlFor="enquiry-phone" className={LABEL}>
                        Telephone
                      </label>
                      <input
                        id="enquiry-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="Optional"
                        value={values.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        className={`mt-3 border-hairline ${FIELD}`}
                      />
                    </div>

                    {/* Preferred date ---------------------------------- */}
                    <div>
                      <label htmlFor="enquiry-date" className={LABEL}>
                        Preferred date
                      </label>
                      <input
                        id="enquiry-date"
                        name="date"
                        type="date"
                        value={values.date}
                        onChange={(e) => update("date", e.target.value)}
                        className={`mt-3 border-hairline [color-scheme:dark] ${FIELD}`}
                      />
                    </div>
                  </div>

                  {/* Residence of interest ----------------------------- */}
                  <div>
                    <label htmlFor="enquiry-interest" className={LABEL}>
                      Residence of interest
                    </label>
                    <div className="relative mt-3">
                      <select
                        id="enquiry-interest"
                        name="interest"
                        value={values.interest}
                        onChange={(e) => update("interest", e.target.value)}
                        className={`appearance-none border-hairline pr-11 ${FIELD}`}
                      >
                        <option value="" className="bg-surface text-bone">
                          No preference yet
                        </option>
                        {INTEREST_OPTIONS.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                            className="bg-surface text-bone"
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="pointer-events-none absolute right-4 top-1/2 h-3 w-3 -translate-y-1/2 text-champagne"
                      >
                        <path
                          d="M3 6l5 5 5-5"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="square"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Message ------------------------------------------- */}
                  <div>
                    <label htmlFor="enquiry-message" className={LABEL}>
                      Message
                    </label>
                    <textarea
                      id="enquiry-message"
                      name="message"
                      rows={4}
                      placeholder="Anything the office should know before the viewing"
                      value={values.message}
                      onChange={(e) => update("message", e.target.value)}
                      className={`mt-3 resize-none border-hairline ${FIELD}`}
                    />
                  </div>

                  <button
                    ref={submitRef}
                    type="submit"
                    data-cursor-hover
                    className="rounded-pill mt-1 flex min-h-12 w-full items-center justify-center bg-champagne px-8 font-mono text-[11px] uppercase tracking-[0.24em] text-ink transition-colors duration-500 hover:bg-champagne-bright"
                  >
                    Compose the enquiry
                  </button>

                  <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-stone-dim">
                    This form is not transmitted. It composes a message you send from your own mail
                    application.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
