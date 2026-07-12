// Ícones SVG simples e leves — evita dependência extra de pacotes de ícones.
import type { SVGProps } from 'react';

const base = (props: SVGProps<SVGSVGElement>) => ({
  width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  ...props
});

export const Home = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" /></svg>
);
export const Wallet = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18" /><circle cx="16" cy="14.5" r="1" /></svg>
);
export const Package = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="m21 8-9-5-9 5 9 5 9-5Z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></svg>
);
export const History = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /><path d="M12 7v5l3 3" /></svg>
);
export const BarChart = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M3 3v18h18" /><rect x="7" y="12" width="3" height="6" /><rect x="13" y="8" width="3" height="10" /><rect x="19" y="5" width="0" height="0" /><rect x="17" y="5" width="3" height="13" /></svg>
);
export const Settings = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></svg>
);
export const Plus = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>);
export const X = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M18 6 6 18M6 6l12 12" /></svg>);
export const Search = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>);
export const Filter = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M4 5h16M7 12h10M10 19h4" /></svg>);
export const Trash = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M3 6h18M8 6V4h8v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" /><path d="M10 11v6M14 11v6" /></svg>);
export const Edit = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>);
export const ArrowUp = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M12 19V5M5 12l7-7 7 7" /></svg>);
export const ArrowDown = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M12 5v14M19 12l-7 7-7-7" /></svg>);
export const AlertTriangle = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M10.3 3.9 1.8 18a1.5 1.5 0 0 0 1.3 2.2h17.8a1.5 1.5 0 0 0 1.3-2.2L13.7 3.9a1.5 1.5 0 0 0-2.6 0Z" /><path d="M12 9v4M12 17h.01" /></svg>);
export const Sun = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>);
export const Moon = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>);
export const Download = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M12 3v12M6 11l6 6 6-6" /><path d="M4 19h16" /></svg>);
export const Upload = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M12 21V9M6 13l6-6 6 6" /><path d="M4 19h16" /></svg>);
export const Check = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M20 6 9 17l-5-5" /></svg>);
export const ShoppingCart = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><circle cx="9" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.5 3h2l2.4 12.3a2 2 0 0 0 2 1.7h8.2a2 2 0 0 0 2-1.6L21 8H6" /></svg>);
export const Tag = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="m20.6 12.8-7.8 7.8a2 2 0 0 1-2.8 0l-7-7a2 2 0 0 1 0-2.8l7.8-7.8H18a2.6 2.6 0 0 1 2.6 2.6v7.2Z" /><circle cx="14.5" cy="9.5" r="1.5" /></svg>);
export const Truck = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><rect x="1" y="6" width="14" height="11" rx="1" /><path d="M15 9h4l3 3.5V17h-7" /><circle cx="6" cy="19" r="2" /><circle cx="17.5" cy="19" r="2" /></svg>);
export const ChevronRight = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="m9 6 6 6-6 6" /></svg>);
export const Boxes = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M12 3 6 6.5v7L12 17l6-3.5v-7Z" /><path d="M6 6.5 12 10l6-3.5M12 10v7" /></svg>);
export const ClipboardList = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" /><path d="M9 11h6M9 15h6M9 19h4" /></svg>);
