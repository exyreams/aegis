import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <div className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="Aegis RFQ"
            width={28}
            height={28}
            className="dark:hidden"
          />
          <Image
            src="/logo-dark.svg"
            alt="Aegis RFQ"
            width={28}
            height={28}
            className="hidden dark:block"
          />
          <span className="font-semibold">Aegis RFQ</span>
        </div>
      ),
      url: "/",
    },
    links: [
      {
        text: "Documentation",
        url: "/docs",
        active: "nested-url",
      },
      {
        text: "API Reference",
        url: "/docs/rfq",
      },
      {
        text: "GitHub",
        url: "https://github.com/exyreams/aegis",
        external: true,
      },
    ],
    githubUrl: "https://github.com/exyreams/aegis",
  };
}
