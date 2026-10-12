"use client";

import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Globe from "../components/Globe";
import TextAnimation from "../components/TextAnimation";

const FORMSUBMIT_ENDPOINT = "https://formsubmit.app/f/kmffp6e7rs";

type FormStatus = "idle" | "sending" | "success" | "error";

export default function Contact() {
  const shouldReduceMotion = useReducedMotion();
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [renderedAt] = useState(() => Date.now());

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (status === "sending") return;

    const form = e.currentTarget;

    setStatus("sending");
    setErrorMessage("");

    try {
      const response = await fetch(FORMSUBMIT_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: new FormData(form),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        error?: {
          message?: string;
        };
      };

      if (!response.ok || !result.ok) {
        throw new Error(
          result.error?.message || "Unable to send your message. Please try again."
        );
      }

      form.reset();
      setStatus("success");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
      setStatus("error");
    }


  }

  return (
    <section
      className="min-h-screen px-6 py-24 text-white md:px-12 lg:px-20"
      id="contact"
    >
      <div className="mx-auto max-w-7xl">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{
          duration: shouldReduceMotion ? 0.25 : 0.8,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="mb-24"
      >
        <p className="mb-10 font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-400 sm:text-xs">
          06 / Contact
        </p>
        <h2 className="max-w-4xl text-[10vw] font-bold uppercase leading-[0.85] tracking-[-0.04em] text-white sm:text-[8vw] md:text-[5.5vw] xl:text-[4.5vw]">
          Let&apos;s <br />
          make it <br />
          <TextAnimation>happen</TextAnimation>
        </h2>
      </motion.div>

      {/* CONTENT */}
      <div className="grid lg:grid-cols-2 lg:gap-20">
        {/* GLOBE */}
        <motion.div
          initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: shouldReduceMotion ? 0.25 : 0.85,
            delay: shouldReduceMotion ? 0 : 0.15,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="hidden lg:block"
        >
          <div className="border-t border-neutral-300">
            <Globe />
          </div>
        </motion.div>

        {/* CONTACT FORM */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: shouldReduceMotion ? 0.25 : 0.75,
            delay: shouldReduceMotion ? 0 : 0.1,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="border-t border-neutral-300"
        >
          {/* FORM CONFIGURATION */}
          <input
            type="hidden"
            name="_subject"
            value="New Portfolio Contact Message"
          />

          <input type="hidden" name="_ts" value={renderedAt} />

          {/* Honeypot: leave empty to help filter bots */}
          <input
            type="text"
            name="_gotcha"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />

          {/* NAME */}
          <div className="border-b border-neutral-300 py-8">
            <label
              htmlFor="name"
              className="mb-4 block text-xs font-medium uppercase tracking-[0.2em] text-neutral-500"
            >
              Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              required
              maxLength={100}
              className="w-full bg-transparent text-xl font-medium tracking-tight outline-none placeholder:text-neutral-300 md:text-2xl"
            />
          </div>

          {/* EMAIL */}
          <div className="border-b border-neutral-300 py-8">
            <label
              htmlFor="email"
              className="mb-4 block text-xs font-medium uppercase tracking-[0.2em] text-neutral-500"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="your@email.com"
              required
              maxLength={254}
              className="w-full bg-transparent text-xl font-medium tracking-tight outline-none placeholder:text-neutral-300 md:text-2xl"
            />
          </div>

          {/* MESSAGE */}
          <div className="border-b border-neutral-300 py-8">
            <label
              htmlFor="message"
              className="mb-4 block text-xs font-medium uppercase tracking-[0.2em] text-neutral-500"
            >
              Message
            </label>

            <textarea
              id="message"
              name="message"
              rows={5}
              placeholder="Tell me about your project..."
              required
              minLength={10}
              maxLength={5000}
              className="w-full resize-none bg-transparent text-xl font-medium tracking-tight outline-none placeholder:text-neutral-300 md:text-2xl"
            />
            <p className="mt-3 font-mono text-[10px] text-neutral-500">
              10–5000 characters
            </p>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex flex-col items-end py-8">
            <button
              type="submit"
              disabled={status === "sending"}
              className="group relative mt-8 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/30 text-center font-mono text-[10px] uppercase leading-tight tracking-wide text-white transition-colors duration-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-50 md:h-28 md:w-28 before:absolute before:inset-0 before:z-0 before:m-auto before:h-full before:w-full before:rounded-full before:bg-white before:scale-0 before:transition-transform before:duration-500 before:ease-out hover:before:scale-100"
            >
              <span className="relative z-10 font-bold">
                {status === "sending" ? (
                  <>
                    Sending
                    <br />
                    ...
                  </>
                ) : status === "success" ? (
                  <>
                    Sent
                    <br />
                    ✓
                  </>
                ) : (
                  <>
                    Send
                    <br />
                    Message
                  </>
                )}
              </span>
            </button>

            {/* SUBMISSION FEEDBACK */}
            <div
              className="mt-5 w-full text-right text-sm"
              aria-live="polite"
            >
              {status === "success" && (
                <p className="text-green-400">
                  Your message has been submitted successfully. Thank you!
                </p>
              )}

              {status === "error" && (
                <p className="text-red-400">
                  {errorMessage}
                </p>
              )}

              {status === "sending" && (
                <p className="text-neutral-400">
                  Sending your message...
                </p>
              )}
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  </section>


  );
}
