# Path to launch

## Done

- Daily seeded generation and UTC reset.
- Complete poker evaluation and dense hand grouping.
- Memorization, one-second conceal, selection, overtime, and result reveal.
- Progress recovery, older unfinished deals, personal records, and streaks.
- Compact result sharing and clipboard fallback.
- Native share sheet where supported, with a separate Copy result control.
- Reference-inspired responsive cards and table.
- Minimal gameplay copy with optional rules in Help.
- Next-deal countdown and site icon.
- Locally bundled traditional illustrated card deck, deal/flip animations, and reduced-motion support.
- Share-link preference remembered across reloads.
- Local-only daily reset and separate 16-card test board.
- Dependency-free tests and GitHub Actions checks.
- Isolated browser lifecycle QA, tab-safe saves/replays, keyboard phase focus, and live announcements.
- Enlarged-text reflow checks and JavaScript reduced-motion verification.

- Public GitHub Pages deployment and MIT source license, with third-party notices retained.

## Remaining before release

1. **Difficulty tuning.** Review a broad sample of generated weeks. Track top-three pair counts and pattern strength, then playtest memorization difficulty. The current weekly profiles are provisional. Sunday is a patterned 16-card special.
2. **Visual finish.** Check the complete 16-card board and action controls on short mobile screens, landscape, and enlarged text. Refine face-card artwork if needed. Keep reference typography and colors without importing show assets.
3. **Mobile sharing.** Test native sharing, copying, fallback, and cancellation on iOS Safari and Android Chrome.
4. **Reliability.** Browser-test foreground automatic submission, background deadlines, refresh near the deadline, midnight reset, older unfinished games, and multiple tabs. Automated rules and an isolated browser harness cover these scenarios, including stale-tab replay and streaks across rollover. Physical device testing remains.
5. **Accessibility.** Keyboard focus, dialog return focus, live-region semantics, enlarged-text reflow, and the JavaScript reduced-motion path have been checked. Confirm actual spoken output with VoiceOver/TalkBack/NVDA and native reduced-motion settings; complete a formal contrast audit before claiming accessibility conformance.
6. **Release settings.** Confirm the official start date and establish a generator version activation policy. Public beta uses the provisional numbering.

## Optional after launch

- Optional practice history and aggregate difficulty statistics.
- Export/import personal progress for moving devices.
- Installable app and offline support.

No backend, analytics, public leaderboard, or distribution chart is planned.
