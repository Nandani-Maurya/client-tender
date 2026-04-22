const GLOBAL_LOADER_MESSAGE = 'Loading your data...'

function GlobalApiLoader({ visible, scope = 'panel' }) {
  if (!visible) return null

  return (
    <div
      className={`global-loader-overlay global-loader-overlay--${scope}`}
      role="alert"
      aria-live="assertive"
      aria-busy="true"
    >
      <div className="premium-spinner">
        <div className="spinner-rings" aria-hidden="true">
          <div className="spinner-ring spinner-ring-primary" />
          <div className="spinner-ring spinner-ring-secondary" />
          <div className="spinner-core" />
        </div>
        <p className="spinner-text">{GLOBAL_LOADER_MESSAGE}</p>
      </div>
    </div>
  )
}

export default GlobalApiLoader
