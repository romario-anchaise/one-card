import { CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
export function Brand() {
  return (
    <Link className="brand" to="/" aria-label="ONE CARD, inicio">
      <span className="brand-icon">
        <CreditCard size={20} />
      </span>
      ONE CARD<span className="brand-by">by R&A</span>
    </Link>
  );
}
