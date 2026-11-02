/** Original geometric lettering: solid printing blocks paired with fine rules. */
export function WorkshopWordmark() {
 return <svg className="wordmark" viewBox="0 0 812 104" role="img" aria-label="PlayWithMe" focusable="false">
  <g fill="currentColor">
   {/* P */}
   <path d="M0 2h21v100H0z"/>
   <path d="M29 5h16a25 25 0 0 1 0 50H29Z" fill="none" stroke="currentColor" strokeWidth="5"/>
   {/* L */}
   <path d="M84 2h21v78h42v22H84z"/><path d="M112 2v70h35" fill="none" stroke="currentColor" strokeWidth="3"/>
   {/* A */}
   <path d="m192 2 36 100h-25l-25-71Z"/><path d="m192 2-37 100h15l13-35h22" fill="none" stroke="currentColor" strokeWidth="3"/>
   {/* Y */}
   <path d="M234 2h24l18 31 18-31h24l-32 53v47h-22V55Z"/><path d="m239 2 31 51v49" fill="none" stroke="var(--paper)" strokeWidth="3"/>
  </g>
  <g fill="var(--red)">
   {/* W */}
   <path d="M330 2h20l15 68 13-40 12 40 16-68h20l-25 100h-20l-10-34-11 34h-17Z"/>
   <path d="m335 2 22 94" fill="none" stroke="var(--paper)" strokeWidth="3"/>
   {/* I */}
   <path d="M438 2h20v100h-20zM466 2h3v100h-3z"/>
   {/* T */}
   <path d="M481 2h70v20h-70zM506 30h20v72h-20z"/><path d="M481 26h70M533 33v69" fill="none" stroke="var(--red)" strokeWidth="3"/>
   {/* H */}
   <path d="M565 2h20v100h-20zM614 2h20v100h-20zM591 43h17v19h-17z"/><path d="M640 2v100" fill="none" stroke="var(--red)" strokeWidth="3"/>
  </g>
  <g fill="currentColor">
   {/* M */}
   <path d="M654 2h18v100h-18zM678 2l19 35 19-35h18v100h-20V42l-17 30-19-33Z"/>
   <path d="m680 14 17 31 20-36" fill="none" stroke="var(--paper)" strokeWidth="3"/>
   {/* E */}
   <path d="M748 2h20v100h-20zM774 2h38v19h-38zM774 43h32v18h-32zM774 83h38v19h-38z"/>
  </g>
 </svg>;
}
