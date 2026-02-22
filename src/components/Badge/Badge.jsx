import './Badge.css';

function Badge({ children, variant = 'default', size = 'md', dot = false }) {
  return (
    <span className={`badge badge--${variant} badge--${size}`}>
      {dot && <span className="badge__dot" />}
      {children}
    </span>
  );
}

export default Badge;
