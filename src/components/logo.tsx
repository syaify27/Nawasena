import type { SVGProps } from 'react';

export default function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8 text-primary"
      {...props}
    >
      <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
      <path d="M12 12l0 -9" />
      <path d="M12 12l6.364 6.364" />
      <path d="M12 12l-6.364 6.364" />
      <path d="M12 12l9 0" />
      <path d="M12 12l-6.364 -6.364" />
      <path d="M12 12l6.364 -6.364" />
    </svg>
  );
}
