import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

export default function FaqAccordion({ faqs, testIdPrefix = "faq" }) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((f, i) => (
        <AccordionItem key={i} value={`item-${i}`} data-testid={`${testIdPrefix}-item-${i}`}>
          <AccordionTrigger className="text-left text-base font-semibold text-slate-900 hover:no-underline">
            {f.q}
          </AccordionTrigger>
          <AccordionContent className="text-base leading-relaxed text-slate-600">
            {f.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
