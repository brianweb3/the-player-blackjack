import { THE_PLAYER_POSTS } from '../data/twitterPosts'

export function TwitterPanel() {
  return (
    <aside className="twitter-panel">
      <h4 className="twitter-panel-title">The Player on X</h4>
      <div className="twitter-panel-list">
        {[...THE_PLAYER_POSTS].slice().reverse().map((post) => (
          <article key={post.url} className="twitter-post">
            <blockquote className="twitter-post-text">&ldquo;{post.text}&rdquo;</blockquote>
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="twitter-post-link"
            >
              View on X
            </a>
          </article>
        ))}
      </div>
    </aside>
  )
}
