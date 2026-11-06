"use client";
import type { SVGProps } from "react";

function Svg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  );
}

export const UndoIcon = () => (
  <Svg>
    <path d="M4 4v4h4" />
    <path d="M4.5 8A5 5 0 1 1 6 12.5" />
  </Svg>
);

export const RedoIcon = () => (
  <Svg>
    <path d="M12 4v4H8" />
    <path d="M11.5 8A5 5 0 1 0 10 12.5" />
  </Svg>
);

export const LinkIcon = () => (
  <Svg>
    <path d="M6.5 9.5L9.5 6.5" />
    <path d="M7 4.5l1-1a2.5 2.5 0 013.5 3.5l-1 1" />
    <path d="M9 11.5l-1 1a2.5 2.5 0 01-3.5-3.5l1-1" />
  </Svg>
);

export const ImageIcon = () => (
  <Svg>
    <rect x="2" y="3" width="12" height="10" rx="1" />
    <circle cx="6" cy="7" r="1" />
    <path d="M3 12l4-4 3 3 3-4 1 1" />
  </Svg>
);

export const UnorderedListIcon = () => (
  <Svg>
    <circle cx="3" cy="4" r="0.75" fill="currentColor" stroke="none" />
    <circle cx="3" cy="8" r="0.75" fill="currentColor" stroke="none" />
    <circle cx="3" cy="12" r="0.75" fill="currentColor" stroke="none" />
    <path d="M6 4h8M6 8h8M6 12h8" />
  </Svg>
);

export const OrderedListIcon = () => (
  <Svg>
    <path d="M6 4h8M6 8h8M6 12h8" />
    <text x="1.5" y="5.2" fontSize="4.5" fill="currentColor" stroke="none">
      1
    </text>
    <text x="1.5" y="9.2" fontSize="4.5" fill="currentColor" stroke="none">
      2
    </text>
    <text x="1.5" y="13.2" fontSize="4.5" fill="currentColor" stroke="none">
      3
    </text>
  </Svg>
);

export const ChecklistIcon = () => (
  <Svg>
    <rect x="2" y="3" width="4" height="4" rx="0.5" />
    <path d="M2.8 5l0.8 0.8 1.6-1.8" />
    <path d="M8 5h6" />
    <rect x="2" y="9" width="4" height="4" rx="0.5" />
    <path d="M8 11h6" />
  </Svg>
);

export const QuoteIcon = () => (
  <Svg>
    <path d="M4 5.5c-1.2 0-2 1-2 2.2 0 1.2.8 2 1.8 2 .2 1.3-.6 2.3-1.6 2.8" />
    <path d="M10.5 5.5c-1.2 0-2 1-2 2.2 0 1.2.8 2 1.8 2 .2 1.3-.6 2.3-1.6 2.8" />
  </Svg>
);

export const TableIcon = () => (
  <Svg>
    <rect x="2" y="3" width="12" height="10" rx="1" />
    <path d="M2 6.5h12M2 10h12M6.5 3v10M10.5 3v10" />
  </Svg>
);

export const HrIcon = () => (
  <Svg>
    <path d="M2 8h12" />
  </Svg>
);

export const CodeIcon = () => (
  <Svg>
    <path d="M6 4L2 8l4 4" />
    <path d="M10 4l4 4-4 4" />
  </Svg>
);

export const CodeGroupIcon = () => (
  <Svg>
    <rect x="2" y="4.5" width="12" height="9" rx="1" />
    <path d="M2 4.5h5M2 7h12" />
  </Svg>
);

export const SubscriptIcon = () => (
  <Svg>
    <text x="1.2" y="12" fontSize="9" fontWeight="600" fill="currentColor" stroke="none">
      X
    </text>
    <text x="9.5" y="14.5" fontSize="6" fontWeight="600" fill="currentColor" stroke="none">
      2
    </text>
  </Svg>
);

export const SuperscriptIcon = () => (
  <Svg>
    <text x="1.2" y="12" fontSize="9" fontWeight="600" fill="currentColor" stroke="none">
      X
    </text>
    <text x="9.5" y="6" fontSize="6" fontWeight="600" fill="currentColor" stroke="none">
      2
    </text>
  </Svg>
);

export const DetailsIcon = () => (
  <Svg>
    <rect x="2" y="3" width="12" height="10" rx="1" />
    <path d="M2 6.5h12" />
    <path d="M6.8 4.5l1.2 1.3 1.2-1.3" />
  </Svg>
);

export const AlertIcon = () => (
  <Svg>
    <path d="M8 2l6.5 11.5h-13L8 2z" />
    <path d="M8 6.5v3" />
    <circle cx="8" cy="11.5" r="0.6" fill="currentColor" stroke="none" />
  </Svg>
);

export const FullscreenEnterIcon = () => (
  <Svg>
    <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" />
  </Svg>
);

export const FullscreenExitIcon = () => (
  <Svg>
    <path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4" />
  </Svg>
);

export const EditModeIcon = () => (
  <Svg>
    <path d="M3 13l1-3 7-7 2 2-7 7-3 1z" />
  </Svg>
);

export const SplitModeIcon = () => (
  <Svg>
    <rect x="2" y="3" width="12" height="10" rx="1" />
    <path d="M8 3v10" />
  </Svg>
);

export const PreviewModeIcon = () => (
  <Svg>
    <path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z" />
    <circle cx="8" cy="8" r="1.6" />
  </Svg>
);

export const ChevronDownIcon = () => (
  <Svg width={10} height={10} viewBox="0 0 16 16">
    <path d="M3 6l5 5 5-5" />
  </Svg>
);

export const CopyIconSmall = () => (
  <Svg width={13} height={13}>
    <rect x="5" y="5" width="8" height="8" rx="1" />
    <rect x="3" y="3" width="8" height="8" rx="1" />
  </Svg>
);

export const CheckIconSmall = () => (
  <Svg width={13} height={13}>
    <path d="M3 8l3.2 3.2L13 4" />
  </Svg>
);

export const SunIcon = () => (
  <Svg>
    <circle cx="8" cy="8" r="3" />
    <path d="M8 1.5v1.5M8 13v1.5M2.6 2.6l1 1M12.4 12.4l1 1M1.5 8h1.5M13 8h1.5M2.6 13.4l1-1M12.4 3.6l1-1" />
  </Svg>
);

export const MoonIcon = () => (
  <Svg>
    <path d="M13.5 9.5A5.8 5.8 0 116.5 2.5a4.6 4.6 0 007 7z" />
  </Svg>
);

export const ResetIcon = () => (
  <Svg>
    <path d="M3.5 5.2A5.5 5.5 0 0113.2 8" />
    <path d="M10 2.2l3.2 1.6-1 3.4" />
    <path d="M12.5 10.8A5.5 5.5 0 012.8 8" />
    <path d="M6 13.8l-3.2-1.6 1-3.4" />
  </Svg>
);

export const HtmlViewIcon = () => (
  <Svg>
    <rect x="2" y="2.5" width="12" height="11" rx="1" />
    <path d="M5.5 6.5L4 8l1.5 1.5M10.5 6.5L12 8l-1.5 1.5" />
  </Svg>
);

export const DownloadIcon = () => (
  <Svg>
    <path d="M8 2v7.5" />
    <path d="M4.8 6.8L8 10l3.2-3.2" />
    <path d="M3 13h10" />
  </Svg>
);

export const HelpIcon = () => (
  <Svg>
    <circle cx="8" cy="8" r="6.2" />
    <text x="8" y="10.8" fontSize="7.5" fontWeight="700" fill="currentColor" stroke="none" textAnchor="middle">
      ?
    </text>
  </Svg>
);

export const HeadingIcon = () => (
  <Svg>
    <text x="1.5" y="12" fontSize="10" fontWeight="700" fill="currentColor" stroke="none">
      H
    </text>
  </Svg>
);
