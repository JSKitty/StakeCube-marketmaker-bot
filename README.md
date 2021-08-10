# StakeCube-marketmaker-bot
A market-maker bot designed under DevCube - Powered by the StakeCube API


### Installation
To install the bot, you'll need Node.js on your device and a single network dependency, you can install these with these steps:
1. [Download Node.js](https://nodejs.org/en/)
2. Download and/or Clone this repository.
3. Open your terminal, change directory (cd) into the `StakeCube-marketmaker-bot` directory.
4. Run `npm i superagent`
5. Edit the `index.js` file, the start of the file contains all of the bot's trading settings and params.
5. Run the bot using `node index`


Done! The bot is a basic and simple one-run system which executes many Staggered orders in a single run, the orders & strategies are fully customizable, and just require some simple maths knowledge to configure.

**If things go wrong:** Edit the file, go to the bottom, uncomment the `cancelAll` line and comment-out the Strategy line, then re-run the bot, this will cancel all orders within your given market pair, highly useful if you accidently place some incorrect orders.

---

_This is a basic bot to demo / showcase the StakeCube trading API, operating this bot is your own responsibility._

_Feel free to open a PR or Issue if you believe you have improvements or ideas for this project!_