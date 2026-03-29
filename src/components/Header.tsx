import { useAppContext } from '../index'
import './Header.css'

export default function Header() {
  const { previewVersionId, returnName } = useAppContext()
  const isPreview = !!previewVersionId

  return (
    <header className={`header ${isPreview ? 'header--preview' : ''}`}>
      {/* Top product bar */}
      <div className="header-top">
        <span className="header-product-name">JOHNSON TAX</span>
        <div className="header-top-actions">
          <button className="header-top-btn">
            {/* Help circle icon */}
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
              <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M8 8c0-1.1.9-2 2-2s2 .9 2 2c0 .9-.6 1.6-1.4 1.9L10 10.5V12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <circle cx="10" cy="14" r="0.75" fill="currentColor"/>
            </svg>
            Help
          </button>
          <button className="header-top-btn">
            {/* Bell icon */}
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
              <path d="M10 2.5a5.5 5.5 0 00-5.5 5.5c0 2.8-.8 4.2-1.5 5h14c-.7-.8-1.5-2.2-1.5-5A5.5 5.5 0 0010 2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
              <path d="M8.5 15.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Notifications
          </button>
          <button className="header-top-btn">
            {/* Settings icon — Intuit design */}
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.0201 6.65206H10.0143C9.1302 6.65206 8.28235 7.00325 7.65723 7.62837C7.03211 8.25349 6.68092 9.10134 6.68092 9.98539C6.68092 10.8694 7.03211 11.7173 7.65723 12.3424C8.28235 12.9675 9.1302 13.3187 10.0143 13.3187C10.8983 13.3195 11.7465 12.9691 12.3721 12.3445C12.9978 11.7199 13.3497 10.8724 13.3505 9.98831C13.3513 9.10425 13.0008 8.2561 12.3763 7.63043C11.7517 7.00476 10.9041 6.65283 10.0201 6.65206ZM10.0151 11.6521C9.68544 11.6517 9.36332 11.5535 9.08946 11.37C8.81559 11.1866 8.60229 10.926 8.47652 10.6213C8.35074 10.3166 8.31816 9.98143 8.38287 9.6582C8.44759 9.33497 8.6067 9.03819 8.84009 8.80539C8.99426 8.65045 9.17765 8.52765 9.37963 8.44411C9.58162 8.36057 9.79818 8.31795 10.0168 8.31873C10.4588 8.31873 10.8827 8.49432 11.1953 8.80688C11.5078 9.11944 11.6834 9.54337 11.6834 9.98539C11.6834 10.4274 11.5078 10.8513 11.1953 11.1639C10.8827 11.4765 10.4588 11.6521 10.0168 11.6521H10.0151Z" fill="currentColor"/>
              <path d="M17.0367 11.167L16.6126 10.9211C16.7031 10.3095 16.7031 9.68779 16.6126 9.07613L17.0384 8.83196C17.421 8.61057 17.7003 8.24659 17.8151 7.81972C17.9299 7.39286 17.8708 6.93789 17.6509 6.55446L16.8176 5.11029C16.5965 4.72787 16.2329 4.44856 15.8064 4.33347C15.3799 4.21837 14.9252 4.27686 14.5417 4.49613L14.1151 4.74196C13.6283 4.36095 13.0913 4.04885 12.5192 3.81446V3.32279C12.5192 2.88077 12.3436 2.45684 12.0311 2.14428C11.7185 1.83172 11.2946 1.65613 10.8526 1.65613H9.1859C8.74387 1.65613 8.31995 1.83172 8.00739 2.14428C7.69483 2.45684 7.51923 2.88077 7.51923 3.32279V3.82279C6.94871 4.05353 6.4128 4.36201 5.92673 4.73946L5.49423 4.48946C5.1138 4.26871 4.66153 4.20728 4.236 4.31858C3.81047 4.42988 3.44619 4.70488 3.22256 5.08363L2.38923 6.52529C2.16768 6.90776 2.10714 7.36257 2.22091 7.78968C2.33468 8.21679 2.61345 8.58121 2.9959 8.80279L3.42006 9.04863C3.37494 9.35435 3.35183 9.66292 3.3509 9.97196C3.35095 10.282 3.37295 10.5917 3.41673 10.8986L2.99256 11.1428C2.60946 11.3628 2.3294 11.726 2.21392 12.1524C2.09844 12.5788 2.157 13.0337 2.37673 13.417L3.21006 14.8611C3.31916 15.0509 3.46456 15.2173 3.63798 15.3509C3.8114 15.4845 4.00943 15.5826 4.22077 15.6396C4.4321 15.6966 4.6526 15.7115 4.86968 15.6833C5.08675 15.6551 5.29614 15.5844 5.4859 15.4753L5.91256 15.2295C6.39931 15.6108 6.93631 15.9232 7.5084 16.1578V16.6461C7.5084 17.0882 7.68399 17.5121 7.99655 17.8246C8.30911 18.1372 8.73304 18.3128 9.17506 18.3128H10.8417C11.2838 18.3128 11.7077 18.1372 12.0202 17.8246C12.3328 17.5121 12.5084 17.0882 12.5084 16.6461V16.167C13.0813 15.9349 13.6192 15.6244 14.1067 15.2445L14.5326 15.4945C14.915 15.716 15.3698 15.7766 15.797 15.6628C16.2241 15.549 16.5885 15.2702 16.8101 14.8878L17.6434 13.4461C17.7534 13.2567 17.8249 13.0474 17.8539 12.8303C17.8829 12.6132 17.8689 12.3925 17.8125 12.1808C17.7562 11.9691 17.6587 11.7706 17.5255 11.5967C17.3924 11.4227 17.2263 11.2767 17.0367 11.167ZM14.8759 8.83363C15.0636 9.59417 15.0636 10.3889 14.8759 11.1495C14.8338 11.3242 14.8494 11.5079 14.9203 11.6731C14.9912 11.8384 15.1136 11.9762 15.2692 12.0661L16.2042 12.6095L15.3709 14.0503L14.4351 13.5086C14.2798 13.4188 14.0996 13.3814 13.9214 13.4021C13.7432 13.4228 13.5764 13.5005 13.4459 13.6236C12.8782 14.1592 12.1934 14.555 11.4459 14.7795C11.2738 14.8304 11.1228 14.9356 11.0153 15.0793C10.9078 15.223 10.8496 15.3975 10.8492 15.577V16.6553H9.18256V15.5778C9.18294 15.3982 9.1253 15.2234 9.01823 15.0792C8.91117 14.935 8.76041 14.8293 8.5884 14.7778C7.83992 14.5522 7.15487 14.154 6.5884 13.6153C6.45779 13.4922 6.29111 13.4143 6.1129 13.393C5.93469 13.3717 5.75434 13.4081 5.5984 13.497L4.6609 14.037L3.82756 12.5928L4.76506 12.0536C4.92119 11.9641 5.04412 11.8264 5.11547 11.6611C5.18682 11.4959 5.20276 11.312 5.1609 11.137C5.06924 10.7585 5.02253 10.3705 5.02173 9.98113C5.02425 9.59135 5.07207 9.20319 5.16423 8.82446C5.20632 8.64968 5.19075 8.46598 5.11986 8.30078C5.04897 8.13557 4.92656 7.99772 4.7709 7.90779L3.83506 7.36613L4.6684 5.92363L5.60506 6.46696C5.6209 6.47613 5.63923 6.47529 5.65506 6.48363C5.70482 6.50632 5.75676 6.52391 5.81006 6.53613C5.86421 6.55324 5.92012 6.56414 5.97673 6.56863C5.9934 6.56863 6.00923 6.57863 6.0259 6.57863C6.06408 6.57411 6.10194 6.56715 6.13923 6.55779C6.18715 6.5531 6.23455 6.54418 6.2809 6.53113C6.3283 6.51117 6.37377 6.4869 6.41673 6.45863C6.46287 6.43503 6.50668 6.40713 6.54756 6.37529C6.56006 6.36446 6.5759 6.36113 6.58756 6.34946C7.15491 5.81303 7.8398 5.41665 8.58756 5.19196C8.6016 5.18557 8.61524 5.17833 8.6284 5.17029C8.68216 5.14825 8.7333 5.1203 8.7809 5.08696C8.82532 5.06356 8.86721 5.03564 8.9059 5.00363C8.94377 4.96627 8.97782 4.92523 9.00756 4.88113C9.03925 4.84043 9.06715 4.79691 9.0909 4.75113C9.11041 4.70452 9.12575 4.65628 9.13673 4.60696C9.15371 4.5527 9.16516 4.49686 9.1709 4.44029C9.1709 4.42529 9.18006 4.41196 9.18006 4.39613V3.31779H10.8467V4.39613C10.8464 4.57569 10.904 4.75057 11.0111 4.89472C11.1181 5.03888 11.2689 5.14459 11.4409 5.19613C12.1888 5.42307 12.8735 5.82108 13.4409 6.35863C13.5711 6.48193 13.7375 6.55997 13.9156 6.58113C14.0936 6.6023 14.2738 6.56548 14.4292 6.47613L15.3676 5.93696L16.2009 7.38113L15.2634 7.92029C15.1094 8.0109 14.9887 8.14857 14.9189 8.31301C14.8491 8.47745 14.8341 8.65997 14.8759 8.83363Z" fill="currentColor"/>
            </svg>
            Settings
          </button>
          <div className="header-avatar">S</div>
        </div>
      </div>

      {/* Client info bar */}
      <div className="header-client">
        <div className="header-client-left">
          <div className="header-client-name">
            {returnName.includes(' ')
              ? <>{returnName.split(' ').slice(0, -1).join(' ')}<br/>{returnName.split(' ').slice(-1)}</>
              : returnName}
          </div>

          {/* Lock icon in preview mode */}
          {isPreview && (
            <svg className="header-lock-icon" viewBox="0 0 16 16" fill="none" width="14" height="14">
              <title>Preview mode — read only</title>
              <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <circle cx="8" cy="11" r="1" fill="currentColor"/>
            </svg>
          )}

          <div className="header-client-sep" />

          {!isPreview && (
            <button className="header-client-btn">
              {/* People icon */}
              <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                <circle cx="8" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M2.5 17c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <circle cx="14.5" cy="7" r="2" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M17.5 17c0-2.2-1.3-3.9-3-4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              Client profile
            </button>
          )}

          <div className="header-client-sep" />

          <div className="header-meta-item">
            <span className="header-meta-label">Tax year</span>
            <span className="header-meta-value">2025</span>
          </div>
          <div className="header-meta-item">
            <span className="header-meta-label">Return type</span>
            <span className="header-meta-value">1040</span>
          </div>
        </div>

        <div className="header-client-actions">
          {isPreview ? (
            /* Preview mode: disabled (non-interactive) controls + preview badge */
            <>
              <button className="header-btn header-btn--ghost header-btn--disabled" disabled>
                <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                  <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M2 14c0-2.5 2.5-4.5 6-4.5s6 2 6 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                Sarah Miller
                <svg viewBox="0 0 12 12" fill="none" width="9" height="9" style={{opacity:0.4}}>
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="header-btn header-btn--ghost header-btn--disabled" disabled>
                E-file Pending
                <svg viewBox="0 0 12 12" fill="none" width="9" height="9" style={{opacity:0.4}}>
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="header-preview-badge">
                <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                  <ellipse cx="8" cy="8" rx="6.5" ry="4" stroke="currentColor" strokeWidth="1.3"/>
                  <circle cx="8" cy="8" r="2" fill="currentColor"/>
                </svg>
                Preview mode
              </div>
            </>
          ) : (
            /* Normal mode: interactive controls */
            <>
              <div className="header-avatars-row">
                <div className="header-mini-avatar header-mini-avatar--d" title="David Hansen">D</div>
                <div className="header-mini-avatar header-mini-avatar--h" title="Jason Hansen">H</div>
                <div className="header-mini-avatar header-mini-avatar--more">+1</div>
              </div>
              <button className="header-btn header-btn--ghost">
                Select Assignee
                <svg viewBox="0 0 12 12" fill="none" width="10" height="10">
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="header-btn header-btn--ghost">
                Select Status
                <svg viewBox="0 0 12 12" fill="none" width="10" height="10">
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="header-btn header-btn--primary">
                Return actions
                <svg viewBox="0 0 12 12" fill="none" width="10" height="10">
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="header-tabs-bar">
        <div className="header-tabs">
          <button className="header-tab">
            {/* List icon */}
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Profile
          </button>
          <button className="header-tab">
            {/* SmartReturn icon */}
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <path d="M8 2l1.5 3 3.5.5-2.5 2.4.6 3.4L8 9.75 4.9 11.3l.6-3.4L3 5.5 6.5 5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
            </svg>
            SmartReturn
          </button>
          <button className="header-tab header-tab--active">
            {/* Edit/pencil icon */}
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <path d="M11.5 2.5l2 2-8 8H3.5V11l8-8.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              <path d="M9.5 4.5l2 2" stroke="currentColor" strokeWidth="1.3"/>
            </svg>
            Input return
          </button>
          <button className="header-tab">
            {/* Checkbox/check icon */}
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M5 8l2.5 2.5L11 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Check return
          </button>
          <button className="header-tab">
            {/* Send/arrow icon */}
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <path d="M2 8h10M9 5l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 3v10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            File return
          </button>
        </div>
        <button className="header-btn header-btn--outline header-btn--sm">
          <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
            <path d="M7 1.5v3M7 9.5v3M1.5 7h3M9.5 7h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            <path d="M3.5 3.5l2 2M8.5 8.5l2 2M3.5 10.5l2-2M8.5 5.5l2-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          Refresh forms
        </button>
      </div>
    </header>
  )
}
