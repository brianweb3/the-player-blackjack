export function DevPanel() {
  return (
    <aside className="dev-panel">
      <div className="dev-panel-avatar">
        <img src="/pavel-bennett.png" alt="Pavel Bennett" className="dev-panel-avatar-img" />
      </div>
      <div className="dev-panel-body">
        <h4 className="dev-panel-title">Developer</h4>
        <p className="dev-panel-name">Pavel Bennett</p>
        <a
          href="https://x.com/pavelbennet"
          target="_blank"
          rel="noopener noreferrer"
          className="dev-panel-link"
        >
          @pavelbennet
        </a>
      </div>
    </aside>
  )
}

