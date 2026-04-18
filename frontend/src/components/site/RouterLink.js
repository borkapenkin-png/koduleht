import { Link } from "react-router-dom";

export default function RouterLink({ to, href, children, ...props }) {
  return (
    <Link to={to || href || "/"} {...props}>
      {children}
    </Link>
  );
}
