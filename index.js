const crypto = require('crypto');
const superagent = require('superagent');

// YOUR SC-API KEYS!
const API_KEY = '';
const SECRET  = '';

// YOUR SETTINGS!

// The market to trade on, in the format: ASSET_BASE (SCC_BTC)
const strPair = 'SCC_BTC';

// 'BUY' to place buy orders in a descending fashion (start high price, stagger down).
// 'SELL' to place sell orders in an ascending fashion (start low price, stagger up).
const strType = 'BUY';

// The increment (in multiplication) of the price staggering algorithm.
// e.g: An increment of 1.01 will increase the order price by `price * 1.01`, or an increase of 1%, per-order.
// This also works in the negative, ie; for buy staggers: `0.99` will decrease the price by 0.01, or 1%, per-order.
const nIncrementation = 0.99;
// NOTE: Use positive (>1) for sell orders (stagger up), and negative (<1) for buy orders (stagger down).

// The starting price (in base coin, e.g; BTC), the first order will be placed at this price,
// ... consequtive orders are affected by the incrementation rate.
const nStartPrice = 0.00001500;

// The amount of the 'ASSET' per-order
const nAmount = 50;

// Total orders to place, this determines the amount of itterations for the Incrementation algorithm
// ... to run, a higher number will create a 'wider' stagger, a lower number will create a dense stagger.
const nTotalOrders = 10;

// The time (in milliseconds) between each stagger order, increase if you're hitting ratelimits!
const nSleepTime = 1250;


let NONCE = Date.now();
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function getAccount() {
    NONCE++;
    try {
        // Format the input and craft a HMAC signature
        const input = "nonce=" + Date.now();
        const hmac = crypto.createHmac('sha256', SECRET);
        hmac.write(input);
    
        // Send the request
        let res = await superagent
        .get('https://stakecube.io/api/v2/user/account?' + input + "&signature=" + hmac.digest('hex'))
        .set('X-API-KEY', API_KEY)
        .set('User-Agent', 'StakeCube Node.js Library (By JSKitty)')
        .send();
        return res.body;
    } catch (e) {
        return {error: e};
    }
}

async function getOrderbook(market, side) {
    NONCE++;
    let res = await superagent
    .get('https://stakecube.io/api/v2/exchange/spot/orderbook?market=' + market + '&side=' + side)
    .set('X-API-KEY', API_KEY)
    .set('User-Agent', 'StakeCube Node.js Library (By JSKitty)')
    .send();
    return res.body;
}

async function postOrder(market, side, price, amount) {
    NONCE++;
    // Format the input and craft a HMAC signature
    let nNonce = Date.now();
    console.log("Nonce: " + nNonce)
    const input = "nonce=" + nNonce + "&market=" + market + "&side=" + side + "&price=" + price + "&amount=" + amount;
    const hmac = crypto.createHmac('sha256', SECRET);
    hmac.write(input);

    // Send the request
    let res = await superagent
    .post('https://stakecube.io/api/v2/exchange/spot/order')
    .set('X-API-KEY', API_KEY)
    .set('User-Agent', 'StakeCube Node.js Library (By JSKitty)')
    .send(input + "&signature=" + hmac.digest('hex'));
    return res.body;
}

async function cancelAll(market) {
    NONCE++;
    // Format the input and craft a HMAC signature
    const input = "nonce=" + Date.now() + "&market=" + market;
    const hmac = crypto.createHmac('sha256', SECRET);
    hmac.write(input);

    // Send the request
    let res = await superagent
    .post('https://stakecube.io/api/v2/exchange/spot/cancelAll')
    .set('X-API-KEY', API_KEY)
    .set('User-Agent', 'StakeCube Node.js Library (By JSKitty)')
    .send(input + "&signature=" + hmac.digest('hex'));
    return res.body;
}


// Stagger Strategy
async function staggerMaker() {
    let account = await getAccount();
    console.log(" --- Account ---");
    //console.log(account);
    console.log("Balances: " + account.result.wallets[0].balance + " (" + account.result.wallets[0].balanceInOrder + ") " + account.result.wallets[0].asset + " --- " + account.result.wallets[1].balance + " (" + account.result.wallets[1].balanceInOrder + ") " + account.result.wallets[1].asset);
    let book = await getOrderbook(strPair, "");
    console.log(" --- Exchange: Marketmaker '" + strType + "' mode --- ");
    if (book.result.asks)
        console.log("Total asks for " + strPair.split('_')[0] + ": " + book.result.asks.length);
    let price = nStartPrice;
    let totalOrders = new Array(nTotalOrders), i = 0;
    for (const nOrder of totalOrders) {
        i++;
        let order = await postOrder(strPair, strType, price, nAmount);
        if (!order.success) return console.error(order);
        console.log("Placed staggered " + strType + " order of " + nAmount + " " + strPair.split('_')[0] + " at " + price.toFixed(8) + " " + strPair.split('_')[1] + " (Total of " + i + " orders)");
        // Increment price
        price = Number((price * nIncrementation).toFixed(8));
        await sleep(nSleepTime);
    }
}
try {
    // Uncomment 'cancelAll', comment 'staggerMaker' and re-run to cancel unwanted orders.

    //cancelAll(strPair).then(console.log);
    staggerMaker().then(process.exit);
} catch (e) {
    console.error("Caught a bot error!");
    console.error(e);
}