'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import {
  CalendarDays,
  Users,
  Code,
  Globe,
  ExternalLink,
  Bug,
  Send,
  CheckCircle,
} from 'lucide-react';
import type { ContactForm } from '@/lib/types/contact';

// ─── Card reveal (IntersectionObserver, staggered) ────────────────────────

const CARD_INITIAL: React.CSSProperties = {
  opacity: 0,
  transform: 'translateY(8px)',
  transition: 'opacity 250ms ease-in-out, transform 250ms ease-in-out',
};

function useStaggeredReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
    );
    document.querySelectorAll('[data-animate-card]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ─── Input / select / textarea class builders (mirrors Input.tsx) ─────────

const fieldCls = (hasError: boolean, extra = '') =>
  [
    'w-full rounded-sm bg-surface-sunken border text-primary',
    'placeholder:text-tertiary outline-none',
    'shadow-input transition-[border-color,box-shadow] transition-base',
    hasError
      ? 'border-error shadow-input-error'
      : 'border-subtle hover:border-strong hover:shadow-input-hover',
    'focus:border-accent focus:shadow-input-focus',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    extra,
  ]
    .filter(Boolean)
    .join(' ');

// ─── Component ────────────────────────────────────────────────────────────

export default function AboutPage() {
  const t = useTranslations();
  useStaggeredReveal();

  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    subject: 'bug',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ContactForm, string>> = {};
    if (!formData.name.trim()) newErrors.name = t('auth.errorRequired');
    if (!formData.email.trim()) {
      newErrors.email = t('auth.errorRequired');
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t('contact.emailError');
    }
    if (!formData.message.trim()) {
      newErrors.message = t('auth.errorRequired');
    } else if (formData.message.trim().length < 20) {
      newErrors.message = t('contact.minCharError');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: 'bug', message: '' });
      setErrors({});
    } catch {
      setError(t('contact.errorBanner'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({ name: '', email: '', subject: 'bug', message: '' });
    setErrors({});
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ContactForm]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const features = [
    {
      icon: CalendarDays,
      title: t('about.features.0.title'),
      description: t('about.features.0.description'),
    },
    {
      icon: Users,
      title: t('about.features.1.title'),
      description: t('about.features.1.description'),
    },
    {
      icon: Code,
      title: t('about.features.2.title'),
      description: t('about.features.2.description'),
    },
  ];

  const team = [
    {
      name: 'Pablo García Pernas',
      role: t('about.team.pablo.role'),
      description: t('about.team.pablo.description'),
      links: {
        web: 'https://pablogarpe.github.io/',
        github: 'https://github.com/PabloGarPe',
        linkedin: 'https://www.linkedin.com/in/pablo-garcía-pernas-873630352/',
      },
      initials: 'PG',
    },
    {
      name: 'Diego Díaz Mendaña',
      role: t('about.team.diego.role'),
      description: t('about.team.diego.description'),
      links: {
        web: 'https://diego-diaz-mendana.web.app/',
        github: 'https://github.com/Mendana',
        linkedin: 'https://www.linkedin.com/in/diego-díaz-mendaña/',
      },
      initials: 'DD',
    },
  ];

  const msgLen = formData.message.length;
  const charCountCls =
    msgLen === 500 ? 'text-error' : 500 - msgLen < 50 ? 'text-warning' : 'text-tertiary';

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Shared keyframe — used by hero + success state */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Hero ── */}
      <section
        aria-labelledby="about-hero-title"
        className="px-6 sm:px-12 py-12 text-center"
        style={{ animation: 'fadeInUp 250ms ease-in-out both' }}
      >
        <h1 id="about-hero-title" className="text-2xl font-semibold text-primary mb-4">
          {t('about.title')}
        </h1>
        <p className="mx-auto text-sm text-secondary" style={{ maxWidth: '600px' }}>
          {t('about.subtitle')}
        </p>
      </section>

      {/* ── Main content ── */}
      <div className="mx-auto px-6 sm:px-12" style={{ maxWidth: '800px' }}>

        {/* What is */}
        <section className="mb-16" aria-labelledby="about-whatis-title">
          <h2 id="about-whatis-title" className="text-lg font-medium text-primary mb-6">
            {t('about.whatIs.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  data-animate-card
                  style={{ ...CARD_INITIAL, transitionDelay: `${idx * 100}ms` }}
                  className="p-6 bg-surface-raised border border-subtle rounded-md shadow-sm hover:shadow-md transition-shadow transition-smooth"
                >
                  <div className="mb-4 inline-flex p-3 bg-accent-subtle rounded-md">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-sm font-medium text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Team */}
        <section className="mb-16" aria-labelledby="about-team-title">
          <h2 id="about-team-title" className="text-lg font-medium text-primary mb-6">
            {t('about.team.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {team.map((member, idx) => (
              <div
                key={idx}
                data-animate-card
                style={{ ...CARD_INITIAL, transitionDelay: `${idx * 100}ms` }}
                className="p-6 bg-surface-raised border border-subtle rounded-md"
              >
                {/* Avatar + name */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-accent-subtle flex items-center justify-center">
                    <span className="text-base font-semibold text-accent">
                      {member.initials}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary">
                      {member.name}
                    </p>
                    <p className="text-xs text-secondary mt-0.5">
                      {member.role}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-secondary leading-relaxed mb-4">
                  {member.description}
                </p>

                {/* Profile links — ghost sm */}
                <div className="flex flex-wrap gap-1">
                  <a
                    href={member.links.web}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Web de ${member.name} (${t('about.openInNewTab')})`}
                    className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-sm text-xs text-secondary hover:text-primary hover:bg-accent-subtle transition-colors transition-base"
                  >
                    <Globe className="w-3.5 h-3.5" aria-hidden />
                    Web
                  </a>
                  <a
                    href={member.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`GitHub de ${member.name} (${t('about.openInNewTab')})`}
                    className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-sm text-xs text-secondary hover:text-primary hover:bg-accent-subtle transition-colors transition-base"
                  >
                    <Code className="w-3.5 h-3.5" aria-hidden />
                    GitHub
                  </a>
                  <a
                    href={member.links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`LinkedIn de ${member.name} (${t('about.openInNewTab')})`}
                    className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-sm text-xs text-secondary hover:text-primary hover:bg-accent-subtle transition-colors transition-base"
                  >
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden />
                    LinkedIn
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contribute */}
        <section className="mb-16 text-center" aria-labelledby="about-contribute-title">
          <h2 id="about-contribute-title" className="text-lg font-medium text-primary mb-6">
            {t('about.contribute.title')}
          </h2>
          <p className="text-sm text-secondary mx-auto mb-8" style={{ maxWidth: '600px' }}>
            {t('about.contribute.description')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
            <a
              href="https://github.com/PabloGarPe"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t('about.contribute.viewRepo')} (${t('about.openInNewTab')})`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2 bg-accent text-white rounded-sm text-sm font-medium btn-transition hover:brightness-[1.08] active:scale-[0.97]"
            >
              <Code className="w-4 h-4" aria-hidden />
              {t('about.contribute.viewRepo')}
            </a>
            <a
              href="https://github.com/PabloGarPe/issues"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t('about.contribute.reportIssue')} (${t('about.openInNewTab')})`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2 border border-subtle text-secondary hover:text-primary hover:border-strong hover:bg-surface-raised rounded-sm text-sm btn-transition active:scale-[0.97]"
            >
              <Bug className="w-4 h-4" aria-hidden />
              {t('about.contribute.reportIssue')}
            </a>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-16" aria-labelledby="about-contact-title">
          <div className="mx-auto" style={{ maxWidth: '560px' }}>
            {!submitted ? (
              <>
                <h2 id="about-contact-title" className="text-lg font-medium text-primary mb-2 text-center">
                  {t('contact.title')}
                </h2>
                <p className="text-sm text-secondary text-center mb-6">
                  {t('contact.description')}
                </p>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {error && (
                    <div role="alert" className="p-4 bg-error-subtle border border-error rounded-md">
                      <p className="text-sm text-error">{error}</p>
                    </div>
                  )}

                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="contact-name" className="text-sm font-medium text-primary">
                      {t('contact.fieldName')} <span className="text-error" aria-hidden>*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      placeholder={t('contact.placeholder_name')}
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={loading}
                      required
                      aria-required="true"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'contact-name-error' : undefined}
                      className={fieldCls(!!errors.name, 'h-10 px-4 text-sm')}
                    />
                    {errors.name && (
                      <p id="contact-name-error" role="alert" className="text-xs text-error">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="contact-email" className="text-sm font-medium text-primary">
                      {t('contact.fieldEmail')} <span className="text-error" aria-hidden>*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      placeholder={t('contact.placeholder_email')}
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={loading}
                      required
                      aria-required="true"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'contact-email-error' : undefined}
                      className={fieldCls(!!errors.email, 'h-10 px-4 text-sm')}
                    />
                    {errors.email && (
                      <p id="contact-email-error" role="alert" className="text-xs text-error">{errors.email}</p>
                    )}
                  </div>

                  {/* Subject */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="contact-subject" className="text-sm font-medium text-primary">
                      {t('contact.fieldSubject')} <span className="text-error" aria-hidden>*</span>
                    </label>
                    <select
                      id="contact-subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      disabled={loading}
                      className={fieldCls(false, 'h-10 px-4 text-sm')}
                    >
                      <option value="bug">{t('contact.subjectBug')}</option>
                      <option value="suggestion">{t('contact.subjectSuggestion')}</option>
                      <option value="schedule_issue">{t('contact.subjectScheduleIssue')}</option>
                      <option value="other">{t('contact.subjectOther')}</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="contact-message" className="text-sm font-medium text-primary">
                      {t('contact.fieldMessage')} <span className="text-error" aria-hidden>*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      placeholder={t('contact.placeholder_message')}
                      value={formData.message}
                      onChange={handleInputChange}
                      disabled={loading}
                      minLength={20}
                      maxLength={500}
                      required
                      aria-required="true"
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? 'contact-message-error' : 'contact-message-count'}
                      style={{ minHeight: '120px' }}
                      className={fieldCls(!!errors.message, 'resize-none px-4 py-2.5 text-sm')}
                    />
                    <div className="flex justify-between items-center min-h-5">
                      {errors.message ? (
                        <p id="contact-message-error" role="alert" className="text-xs text-error">{errors.message}</p>
                      ) : (
                        <span />
                      )}
                      <p id="contact-message-count" className={`text-xs ${charCountCls} ml-auto`} aria-live="polite">
                        {t('contact.charCount', { current: msgLen })}
                      </p>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      aria-disabled={loading}
                      aria-busy={loading}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-accent text-white rounded-sm text-sm font-medium btn-transition hover:brightness-[1.08] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden />
                          {t('contact.submitButton')}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" aria-hidden />
                          {t('contact.submitButton')}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div
                className="text-center p-8"
                style={{ animation: 'fadeInUp 250ms ease-in-out both' }}
              >
                <div className="flex justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-lg font-medium text-primary mb-2">
                  {t('contact.successTitle')}
                </h3>
                <p className="text-sm text-secondary mb-6">
                  {t('contact.successMessage')}
                </p>
                <button
                  onClick={handleReset}
                  className="text-sm text-accent hover:text-accent-hover transition-colors transition-base"
                >
                  {t('contact.retryButton')}
                </button>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
