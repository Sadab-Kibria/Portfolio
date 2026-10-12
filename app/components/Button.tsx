import Link from "next/link";

type ButtonProps = {
    href: string;
    text: string;
};

export default function Button({ href, text }: ButtonProps) {
    return (
        <Link
            href={href}
            className="group inline-flex items-center gap-4 rounded-xl
        border border-zinc-500
        bg-linear-to-b from-zinc-600 to-zinc-800
        px-4 py-1.5 text-sm font-semibold text-white
        shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_3px_6px_rgba(0,0,0,0.4)]
        transition-all duration-200
        active:translate-y-0.5
        md:text-base"
        >
            {text}

            <span
                aria-hidden
                className="flex h-9 w-9 items-center justify-center rounded-md bg-black text-white"
            >
                <span className="inline-block transition-transform duration-200 group-hover:-rotate-45">
                    →
                </span>
            </span>
        </Link>
    );
}