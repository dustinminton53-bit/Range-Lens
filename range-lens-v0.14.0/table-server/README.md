# Private Stillwater tables

Run `node table-server/server.cjs` from the extension folder using Node.js 20 or newer. No packages are required. For internet invitations, deploy the whole folder to a Node-capable service with HTTPS (a persistent disk is recommended). Use the resulting HTTPS base URL in Play with friends. Set PORT if your host requires it. The service uses HTTP JSON polling, not WebSockets.

The host creates a private table, chooses a bet, and copies its invite link. Friends open that link or paste it into their extension, enter their username, and join. Up to four seats share one dealer and play hands in order. The host starts each round; players who did not choose a funded bet watch that round. A player who takes no action for 45 seconds automatically stands. Existing split and double rules apply. Hidden dealer cards and the deck are never sent to clients before reveal.

The service stores sessions, balances, and current tables in `table-server/tables.json`; preserve that file across restarts and keep it private. Invites contain a table secret: share only with intended players. Only fictional coins are supported. Client-reported initial balances are trusted, so this is a casual game, not a fraud-resistant currency system. Use one device/table session per local wallet; avoid playing solo and online simultaneously. This service is not deployed by the package.

Each browser origin has its own wallet. A guest opening a hosted invitation in a browser begins with that origin's saved fishing balance. To use extension coins, open Play with friends in the extension and paste the invite link. A guest can return to the included fishing game to earn coins. Leave an active online session by returning after the round, so your local wallet reflects the final balance.
