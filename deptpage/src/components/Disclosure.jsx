import { useState } from "react";

const Disclosure = ({ title, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="soft-card" style={{ marginBottom: open ? "24px" : "12px" }}>
      <button type="button" className="disclosure-head" aria-expanded={open} onClick={() => setOpen(!open)}>
        <svg
          className="disclosure-chevron"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-purple)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 6 15 12 9 18"></polyline>
        </svg>
        <span className="title" style={{ fontSize: "17px" }}>
          {title}
        </span>
      </button>
      {open ? (
        <div style={{ padding: "0 16px 18px 42px" }}>{children}</div>
      ) : null}
    </div>
  );
};

export default Disclosure;
