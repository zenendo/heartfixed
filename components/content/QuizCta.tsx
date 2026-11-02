import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { routes } from "@/config/site";

/** The "check your own scores" block every profile page carries (Section 6). */
export function QuizCta({
  heading,
  body,
  cta,
  className = "",
}: {
  heading: string;
  body: string;
  cta: string;
  className?: string;
}) {
  return (
    <Card className={`bg-panel ${className}`} data-testid="quiz-cta">
      <h2 className="text-xl font-semibold">{heading}</h2>
      <p className="mt-2">{body}</p>
      <ButtonLink href={routes.quiz} className="mt-4">
        {cta}
      </ButtonLink>
    </Card>
  );
}
