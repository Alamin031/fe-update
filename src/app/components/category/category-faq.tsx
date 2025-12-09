'use client';

import {useState, useEffect} from 'react';
import faqsService from '@/app/lib/api/services/faqs';
import {ChevronDown} from 'lucide-react';
import {cn} from '../../lib/utils';

export interface FAQItem {
  question: string;
  answer: string;
}

interface CategoryFAQProps {
  faqs?: FAQItem[];
  categoryId?: string;
}

export function CategoryFAQ(props: CategoryFAQProps) {
  const { faqs, categoryId } = props;
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [dynamicFaqs, setDynamicFaqs] = useState<FAQItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If faqs prop is provided, use it; otherwise, try to fetch from API, else fallback to default
  useEffect(() => {
    if (!faqs && categoryId) {
      let cancelled = false;

      const fetchFaqs = async () => {
        await Promise.resolve();
        if (cancelled) return;

        setLoading(true);
        setError(null);

        try {
          const res = await faqsService.getByCategory(categoryId);
          if (cancelled) return;

          const apiFaqs = Array.isArray(res)
            ? (
                res as Array<
                  Partial<{
                    question: string;
                    title: string;
                    answer: string;
                    content: string;
                  }>
                >
              ).map(faq => ({
                question: faq.question ?? faq.title ?? '',
                answer: faq.answer ?? faq.content ?? '',
              }))
            : [];
          setDynamicFaqs(apiFaqs);
        } catch (e) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Failed to fetch category FAQs:', e);
          }
          if (!cancelled) {
            setDynamicFaqs([]);
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

      fetchFaqs();

      return () => {
        cancelled = true;
      };
    }
  }, [faqs, categoryId]);

  let faqList: FAQItem[] = [];
  if (faqs && faqs.length > 0) {
    faqList = faqs;
  } else if (dynamicFaqs && dynamicFaqs.length > 0) {
    faqList = dynamicFaqs;
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold tracking-tight">
        Frequently Asked Questions
      </h2>
      {loading && (
        <div className="py-8 text-center text-muted-foreground">
          Loading FAQs...
        </div>
      )}
      {error && (
        <div className="py-8 text-center text-destructive">{error}</div>
      )}
      <div className="space-y-3">
        {faqList.map((faq, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl border border-border">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="flex w-full items-center justify-between p-4 text-left font-medium hover:bg-muted/50">
              {faq.question}
              <ChevronDown
                className={cn(
                  'h-5 w-5 shrink-0 transition-transform',
                  openIndex === index && 'rotate-180',
                )}
              />
            </button>
            <div
              className={cn(
                'overflow-hidden transition-all',
                openIndex === index ? 'max-h-40' : 'max-h-0',
              )}>
              <p className="border-t border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                {faq.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
