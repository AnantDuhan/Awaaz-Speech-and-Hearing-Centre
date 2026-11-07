"use client";

import { useRef, useState, type FormEvent } from "react";
import { checklist, links, site, whatsappLink } from "@/content/site";
import ui from "@/styles/ui.module.css";
import { Icon } from "./Icon";
import styles from "./Checklist.module.css";

type Answer = "yes" | "notYet" | "notSure";

const OPTIONS: { value: Answer; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "notYet", label: "Not yet" },
  { value: "notSure", label: "Not sure" },
];

const LABELS: Record<Answer, string> = { yes: "Yes", notYet: "Not yet", notSure: "Not sure" };

export function Checklist() {
  const [bandId, setBandId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [submitted, setSubmitted] = useState(false);
  const resultRef = useRef<HTMLHeadingElement>(null);

  const band = checklist.bands.find((item) => item.id === bandId) ?? null;
  const answeredCount = band ? band.questions.filter((_, i) => answers[i]).length : 0;
  const allAnswered = band !== null && answeredCount === band.questions.length;

  const values = Object.values(answers);
  const notYet = values.filter((value) => value === "notYet").length;
  const notSure = values.filter((value) => value === "notSure").length;
  const suggestCheck = notYet > 0 || notSure >= 2;

  function chooseBand(id: string) {
    setBandId(id);
    setAnswers({});
    setSubmitted(false);
  }

  function showResult(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!allAnswered) return;
    setSubmitted(true);
    // Move focus to the result so screen reader and keyboard users land on it.
    requestAnimationFrame(() => resultRef.current?.focus());
  }

  function restart() {
    setBandId(null);
    setAnswers({});
    setSubmitted(false);
  }

  const shareMessage = band
    ? [
        `Hi, I used the milestone checklist on your website.`,
        `Child's age: ${band.label.toLowerCase()}`,
        ...band.questions.map((question, i) => {
          const answer = answers[i];
          return `• ${question} — ${answer ? LABELS[answer] : "-"}`;
        }),
        `I'd like to talk about whether a check-up would help.`,
      ].join("\n")
    : "";

  return (
    <div className={styles.wrap}>
      {!checklist.reviewed ? (
        <p className={styles.draft} role="note">
          <strong>Draft:</strong> these questions are waiting for review by our speech-language
          pathologist.
        </p>
      ) : null}

      <form onSubmit={showResult} className={styles.form}>
        <fieldset className={styles.step}>
          <legend className={styles.stepTitle}>
            <span className={styles.stepNumber}>1</span>
            How old is your child?
          </legend>
          <div className={styles.options}>
            {checklist.bands.map((item) => (
              <label key={item.id} className={styles.option}>
                <input
                  type="radio"
                  name="age"
                  value={item.id}
                  checked={bandId === item.id}
                  onChange={() => chooseBand(item.id)}
                  className={styles.radio}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
          <p className={styles.hint}>
            Pick the closest age without going over. For children over 3, please{" "}
            <a href={links.whatsapp} target="_blank" rel="noopener noreferrer">
              message us
            </a>
            .
          </p>
        </fieldset>

        {band ? (
          <fieldset className={styles.step}>
            <legend className={styles.stepTitle}>
              <span className={styles.stepNumber}>2</span>
              What does your child do now?
            </legend>
            <ol className={styles.questions}>
              {band.questions.map((question, index) => (
                <li key={question}>
                  <fieldset className={styles.question}>
                    <legend>{question}</legend>
                    <div className={styles.options}>
                      {OPTIONS.map((option) => (
                        <label key={option.value} className={styles.option}>
                          <input
                            type="radio"
                            name={`q-${band.id}-${index}`}
                            value={option.value}
                            checked={answers[index] === option.value}
                            onChange={() => {
                              setAnswers((current) => ({ ...current, [index]: option.value }));
                              setSubmitted(false);
                            }}
                            className={styles.radio}
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </li>
              ))}
            </ol>

            <div className={styles.submitRow}>
              <button
                type="submit"
                className={`${ui.btn} ${ui.btnAccent} ${styles.submit}`}
                disabled={!allAnswered}
              >
                See the result
              </button>
              <p className={styles.hint} aria-live="polite">
                {allAnswered
                  ? "All done."
                  : `${answeredCount} of ${band.questions.length} answered`}
              </p>
            </div>
          </fieldset>
        ) : null}
      </form>

      {submitted && band ? (
        <section
          className={styles.result}
          data-outcome={suggestCheck ? "check" : "ok"}
          aria-labelledby="result-title"
        >
          <h2 id="result-title" ref={resultRef} tabIndex={-1}>
            {suggestCheck ? "A check-up is a good idea" : "Your child is showing these skills"}
          </h2>
          <p>
            {suggestCheck
              ? "Some of these skills haven't shown up yet. Every child develops at their own pace, but a check-up is the quickest way to know whether your child would benefit from support."
              : "That's great to see. If you still have a worry about your child's speech or hearing, trust your instinct and talk to us."}
          </p>
          <div className={styles.resultActions}>
            <a
              href={whatsappLink(shareMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${ui.btn} ${ui.btnDark}`}
            >
              <Icon name="chat" size={20} />
              <span className={styles.btnLabel}>Send these answers on WhatsApp</span>
            </a>
            <a href={links.call} className={`${ui.btn} ${ui.btnWhite}`}>
              Call {site.phone.display}
            </a>
            <button type="button" onClick={restart} className={styles.restart}>
              Start again
            </button>
          </div>
        </section>
      ) : null}

      <p className={styles.privacy}>
        This checklist is a guide, not a diagnosis. Your answers stay on this device — nothing is
        saved or sent unless you choose to send it on WhatsApp.
      </p>
    </div>
  );
}
