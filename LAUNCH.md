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

## Remaining before release

1. **Difficulty tuning.** Review a broad sample of generated weeks. Track top-three pair counts and pattern strength, then playtest memorization difficulty. The current weekly profiles are provisional. Sunday is a patterned 16-card special.
2. **Visual finish.** Check the complete 16-card board and action controls on short mobile screens, landscape, and enlarged text. Refine face-card artwork if needed. Keep reference typography and colors without importing show assets.
3. **Mobile sharing.** Test native sharing, copying, fallback, and cancellation on iOS Safari and Android Chrome.
4. **Reliability.** Browser-test foreground automatic submission, background deadlines, refresh near the deadline, midnight reset, older unfinished games, and multiple tabs. Pure transition tests cover the core timer rules, but physical device testing remains.
5. **Accessibility.** Check keyboard focus across phase changes, screen-reader phase announcements, dialog focus, contrast, and reduced motion.
6. **Release settings.** Confirm the public start date, select a license, establish a version activation policy, create the repository, and publish on GitHub Pages. Test relative paths on the actual repository URL.

## Optional after launch

- Unlimited practice with separate records.
- Export/import personal progress for moving devices.
- Installable app and offline support.

No backend, analytics, public leaderboard, or distribution chart is planned.
