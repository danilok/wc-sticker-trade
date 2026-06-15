// icons.jsx — conjunto enxuto de ícones (stroke, herdam currentColor)
const Ic = {};
const mk = (paths, fill=false) => ({size=24, stroke=2, ...p}={}) =>
  React.createElement('svg', {width:size, height:size, viewBox:'0 0 24 24', fill: fill?'currentColor':'none',
    stroke: fill?'none':'currentColor', strokeWidth:stroke, strokeLinecap:'round', strokeLinejoin:'round', ...p}, paths);

Ic.Album   = mk(<><path d="M4 5a2 2 0 0 1 2-2h11a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2z"/><path d="M8 3v18"/></>);
Ic.Swap    = mk(<><path d="M7 4 3 8l4 4"/><path d="M3 8h13a4 4 0 0 1 4 4"/><path d="m17 20 4-4-4-4"/><path d="M21 16H8a4 4 0 0 1-4-4"/></>);
Ic.User    = mk(<><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>);
Ic.Gear    = mk(<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 2.6 14H2.5a2 2 0 0 1 0-4h.1A1.6 1.6 0 0 0 4.6 7a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 2.6V2.5a2 2 0 0 1 4 0v.1A1.6 1.6 0 0 0 17 4.6a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.6 1.6 0 0 0 21.4 10h.1a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.4 1z"/></>);
Ic.Check   = mk(<polyline points="20 6 9 17 4 12"/>);
Ic.Plus    = mk(<><path d="M12 5v14"/><path d="M5 12h14"/></>);
Ic.Minus   = mk(<path d="M5 12h14"/>);
Ic.Back    = mk(<><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></>);
Ic.Search  = mk(<><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></>);
Ic.Eye     = mk(<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></>);
Ic.EyeOff  = mk(<><path d="M10.7 5.1A9 9 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-3 3.8"/><path d="M6.6 6.6A16 16 0 0 0 2 12s3.5 7 10 7a9 9 0 0 0 4.4-1.1"/><path d="m2 2 20 20"/></>);
Ic.Copy    = mk(<><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></>);
Ic.Tag     = mk(<><path d="M3 11V5a2 2 0 0 1 2-2h6l9 9-8 8z"/><circle cx="8" cy="8" r="1.4" fill="currentColor" stroke="none"/></>);
Ic.Logout  = mk(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></>);
Ic.Bell    = mk(<><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 20a2 2 0 0 0 4 0"/></>);
Ic.Layers  = mk(<><path d="m12 2 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/></>);
Ic.Sparkle = mk(<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>, true);
Ic.Alert   = mk(<><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></>);
Ic.Inbox   = mk(<><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.4 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.4-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.8 1.1z"/></>);
Ic.Lock    = mk(<><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>);
Ic.Mail    = mk(<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>);
Ic.Chevron = mk(<path d="m9 18 6-6-6-6"/>);
Ic.Palette = mk(<><circle cx="12" cy="12" r="9"/><circle cx="8.5" cy="9.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="9.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="15.5" r="1.1" fill="currentColor" stroke="none"/></>);
Ic.Google  = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 1 1 0-24c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1 0 24 44c11 0 20-9 20-20 0-1.2-.1-2.3-.4-3.5z"/>
    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28l-6.5 5A20 20 0 0 0 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C42.9 35.6 44 30.3 44 24c0-1.2-.1-2.3-.4-3.5z"/>
  </svg>
);

window.Ic = Ic;
