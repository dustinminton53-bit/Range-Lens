# Play with friends for free

Render has a free web-service plan that can run the included server. The extension package is ready for it; this is not a deployed service yet.

1. Create a free Render account at https://render.com and a GitHub account if you do not already have one.
2. Put the contents of this extension folder into a private GitHub repository. Keep the `table-server` folder and the game files together. Do not upload `table-server/tables.json` if you have already run the server; it contains private table sessions.
3. In Render, select **New → Web Service**, connect that repository, and choose **Node** and the **Free** plan.
4. Set the build command to `node --version` and start command to `node table-server/server.cjs`. The root directory should be the folder containing `blackjack-core.js`.
5. Deploy. Render gives the service an HTTPS address ending in `.onrender.com`.
6. In Range Lens, open Casino → Play with friends. Paste that address under **Table service address**, choose your username, and create a table. Allow connection to that address when the browser asks.
7. Copy the invitation. Your friend can paste it into Play with friends in their own extension to use their existing fishing coins. Both choose a bet; the host clicks **Deal table**.

The service automatically reads Render's PORT setting. No additional packages, database, or paid plan are required for a casual test.

## Free-plan limits

Render sleeps the service after 15 minutes without incoming requests. Waking it can take about a minute. Restarts, redeploys, and sleep clear the server's private tables and server-side save file. Browser wallets still retain the most recently synchronized balance, but an interrupted round cannot be reconstructed if the service's table data was erased. Finish a round before leaving and create a new table if an old invitation stops working. Do not run another game against the same wallet while a shared round is active.

For reliable long-term table persistence, use a host with persistent storage or adapt the service to a durable database. Cloudflare's free Workers/Durable Objects option is possible but requires a different server deployment; the included Node server does not run unchanged there.

Verified provider documentation: https://render.com/docs/free and https://render.com/docs/your-first-deploy.
