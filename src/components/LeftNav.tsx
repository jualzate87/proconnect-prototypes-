
import './LeftNav.css'

const icons = {
  home: <svg viewBox="0 0 20 20" fill="none"><path d="M10 2L2 9h2v9h5v-5h2v5h5V9h2L10 2z" fill="currentColor"/></svg>,
  returns: <svg viewBox="0 0 20 20" fill="none"><path d="M4 3h8l4 4v11H4V3zm8 0v4h4M7 9h6M7 12h6M7 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  clients: <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  dashboard: <svg viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="11" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="3" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="11" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>,
  link: <svg viewBox="0 0 20 20" fill="none"><path d="M8 12L12 8M9.5 6.5l2-2a3.5 3.5 0 0 1 4.95 4.95l-2 2A3.5 3.5 0 0 1 9.5 6.5zM10.5 13.5l-2 2a3.5 3.5 0 0 1-4.95-4.95l2-2a3.5 3.5 0 0 1 4.95 4.95z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  chat: <svg viewBox="0 0 20 20" fill="none"><path d="M17 3H3v11h3v3l4-3h7V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  settings: <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10 3v1.5M10 15.5V17M3 10h1.5M15.5 10H17M4.6 4.6l1.1 1.1M14.3 14.3l1.1 1.1M4.6 15.4l1.1-1.1M14.3 5.7l1.1-1.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  advisor: <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M10 9v5M10 7v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  collapse: <svg viewBox="0 0 20 20" fill="none"><path d="M4 6h12M4 10h8M4 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M14 8l3 2-3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
}

export default function LeftNav() {
  return (
    <nav className="left-nav">
      <div className="left-nav-logo">
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#pc-logo-clip)">
            <path d="M13 0C5.82969 0 0 5.82969 0 13C0 20.1703 5.82969 26 13 26C20.1703 26 26 20.1703 26 13C26 5.82969 20.1703 0 13 0ZM7.15 16.8391C6.825 16.5141 6.825 16.0062 7.15 15.6812L14.3 8.53125H8.59219C8.14531 8.53125 7.77969 8.16563 7.77969 7.71875V6.90625H16.25C16.9812 6.90625 17.3266 7.77969 16.8188 8.2875L7.71875 17.4078L7.15 16.8391ZM19.0938 18.2406H18.2812C17.8344 18.2406 17.4688 17.875 17.4688 17.4281V11.7L10.3187 18.85C9.99375 19.175 9.48594 19.175 9.16094 18.85L8.59219 18.2812L17.6922 9.18125C18.2 8.67344 19.0734 9.03906 19.0734 9.75V18.2406H19.0938Z" fill="white"/>
          </g>
          <defs>
            <clipPath id="pc-logo-clip">
              <rect width="26" height="26" fill="white"/>
            </clipPath>
          </defs>
        </svg>
      </div>

      <div className="left-nav-items">
        <button className="left-nav-item" title="Home">{icons.home}</button>
        <button className="left-nav-item left-nav-item--active" title="Tax Returns">{icons.returns}</button>
        <button className="left-nav-item" title="Clients">{icons.clients}</button>
        <button className="left-nav-item" title="E-File Dashboard">{icons.dashboard}</button>
        <button className="left-nav-item" title="Intuit Link">{icons.link}</button>
        <div className="left-nav-divider" />
        <button className="left-nav-item" title="Live Chat">{icons.chat}</button>
        <button className="left-nav-item" title="Settings">{icons.settings}</button>
        <button className="left-nav-item" title="Tax Advisor">{icons.advisor}</button>
      </div>

      <div className="left-nav-bottom">
        <div className="left-nav-divider" />
        <button className="left-nav-item" title="Collapse">{icons.collapse}</button>
      </div>
    </nav>
  )
}
