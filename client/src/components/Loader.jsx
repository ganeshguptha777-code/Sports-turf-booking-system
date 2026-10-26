export function PageLoader({ label = 'Loading the good stuff…' }) {
  return (
    <div className="page-loader" role="status">
      <span className="page-loader__ball" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton--image" />
      <div className="skeleton-card__body">
        <div className="skeleton skeleton--line skeleton--short" />
        <div className="skeleton skeleton--line" />
        <div className="skeleton skeleton--line skeleton--medium" />
      </div>
    </div>
  );
}

export function InlineLoader({ label = 'Loading…' }) {
  return (
    <span className="inline-loader" role="status">
      <span aria-hidden="true" />
      {label}
    </span>
  );
}
