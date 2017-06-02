# OPSkins API for Node.js

This module provides a simple interface to the HTTP-based API for [OPSkins](https://opskins.com).

In order to use most methods, you will need an API key. You can get one from your [account page](https://opskins.com/account).

Like the Steam Web API, the OPSkins API is divided into "interfaces", each of which contains methods which apply to that
interface. This module hides this implementation detail from you, but for simplicity's sake, this documentation is
divided by interface.

# Setting Up

First, you will need to install this module. To do so, simply type on the command line:

    $ npm install @opskins/api
    
If you are developing an application which will depend on this module, you might want to save it in your `package.json`
file as a dependency:

    $ npm install --save @opskins/api

This package's root export is the `OPSkinsAPI` object, which you need to instantiate with your API key.
 
```js
var OPSkinsAPI = require('@opskins/api');
var opskins = new OPSkinsAPI('yourapikey');
```

Instantiation with an API key is optional, but if you don't provide one then you will only be able to use unauthenticated
API methods. Such methods are marked in this documentation.

# Error Handling

There are two types of errors which might be returned by the OPSkins API. **HTTP errors** indicate a serious problem.
For example, the HTTP status code `401` indicates that your API key is invalid, and `404` indicates that the requested
API method does not exist.

The other type of error is an **OPSkins error code**. These error codes [are documented here](https://opskins.com/kb/error-codes).
There is also an enum (implemented as an object) available as an `ErrorCode` property of the root export. [This can be
viewed here.](https://github.com/OPSkins/node-opskins/blob/master/resources/ErrorCode.json) To use the `ErrorCode`
enum, you will want to do something like this:

```js
var OPSkinsAPI = require('@opskins/api');
var ErrorCode = OPSkinsAPI.ErrorCode;

var code = getAnErrorCodeSomehow();
if (code == ErrorCode.ACCESS_DENIED) {
	// access denied
}
```

When you get an `Error` object from a request, it will contain an `httpCode` property, containing the HTTP status code
that the server returned to your request. If this is not `200`, then there will be no other properties defined (save
`message`). If it is `200`, then there will also be a `code` property containing the OPSkins ErrorCode that was returned.
The `Error` object's `message` will usually be a descriptive error message as well.

# Sale Status

An item in the OPSkins system is referred to as a *sale*. Each sale has a *status*, which indicates what state it is in.
Here are the available sale statuses, at time of writing:

- `AwaitingPickup` (1) - This sale has been created but the item has not been traded to an OPSkins storage account yet. There may or may not be an active trade offer for this sale.
- `OnSale` (2) - This item has been traded to the storage account, and it is currently up for sale.
- `AwaitingDelivery` (3) - This item has been purchased, but it has not yet been delivered to its buyer. The seller has not yet been paid for this sale. It is possible that the buyer may refund this sale, which will put the sale back into state `OnSale` (2).
- `Sold` (4) - This item has been sold and delivered. The seller has now been paid for this sale. *
- `AwaitingReturn` (5) - The seller has taken this item off of sale and requested that it be returned to their Steam inventory, but the return is not yet complete. There may or may not be an active trade offer for this sale to return it to its seller.
- `Returned` (6) - The seller has taken this item off of sale and it has been returned to their Steam inventory. *

\* = It is not possible (under normal circumstances) for an item to change from this state to another one.

These sale statuses are available as an enum accessible via the `SaleStatus` property of the `OPSkinsAPI` object.
[View this here.](https://github.com/OPSkins/node-opskins/blob/master/resources/SaleStatus.json) Example:

```js
var OPSkinsAPI = require('@opskins/api');
var SaleStatus = OPSkinsAPI.SaleStatus;

var status = getSaleStatusSomehow();

if (status == SaleStatus.OnSale) {
	// this item is currently on sale
}
```

# Prices

All prices accepted as input and provided as output are in USD cents. This means that a price of $5.42 is represented
as the integer 542.

# HTTPS Agent

As of v1.3.0, by default the module will create a single `keepAlive` HTTPS agent and use it for all requests. This means
reduced latency for requests after the first one within a relatively small time period.

If you need to, you can specify your own Agent by overriding the `getAgent` method. For example:

```js
var OPSkins = require('@opskins/api');
var op = new OPSkins();

op.getAgent = function() {
	return new SomeCustomAgent();
};

op.getSteamID(function(err, steamID) {
	if (err) {
	    console.log(err);
    } else {
		console.log("My SteamID is " + steamID);
    }
});
```

All requests are HTTPS, so your agent should be based on `require('https').Agent`.

# Methods

## IInventory

### getInventory(callback)
- `callback` - A function to be called when the request completes.
    - `err` - An `Error` object on failure, or `null` on success
    - `data` - An object containing these properties:
        - `items` - An array containing one object for each item in your OPSkins inventory. Each object has these properties:
            - `id` - The OPSkins ID of the item. If you choose to relist this item, this will be its sale ID.
            - `name` - The Steam name of the item
            - `inspect` - If this item is inspectable, this is its inspect link. May be a steam:// link for CS:GO/TF2, or possibly an HTTP(S) link (e.g. Steam profile backgrounds)
            - `type` - The Steam "type" of this item (displayed next to its game icon in the Steam inventory)
            - `appid` - The Steam AppID of the game which owns this item
            - `contextid` - The Steam context ID which contains this item
            - `assetid` - The Steam asset ID of this item (unique within a given app + context combo)
            - `classid` - The Steam class ID of this item
            - `instanceid` - The Steam instance ID of this item
            - `bot_id` - The internal ID of the bot which is holding this item
            - `bot_id64` - The 64-bit SteamID of the bot which is holding this item (as a string)
            - `added_time` - The Unix timestamp for when this item was added to your OPSkins inventory
            - `offer_id` - If there is an outstanding withdrawal trade offer for this item, this is its ID. If not, this is null. If you have requested a trade offer that couldn't be sent immediately but is queued to be sent in the future, this is 0.
            - `offer_declined` - If there was previously a withdrawal trade offer for this item but it was declined, this is true.
            - `offer_untradable` - If we previously attempted to send a withdrawal trade offer for this item but we were unable to due to a bad trade URL or another trading restriction (e.g. Steam Guard), this is true.
            - `requires_support` - If this item has a problem and requires support intervention before it can be withdrawn or relisted, this is true.
            - `can_repair` - If this item requires support but you can attempt to self-repair it, this is true. If true, you can use ISupport/RepairItem to try to repair it.

**v1.2.0 or later is required to use this method**

Retrieves the contents of your [OPSkins inventory](https://opskins.com/?loc=inventory).

### withdrawInventoryItems(items, callback)
- `items` - Either a single OPSkins item ID, or an array of OPSkins item IDs.
- `callback` - A function to be called when the request completes.
    - `err` - An `Error` object on failure, or `null` on success. On failure, it may have `data.offers` defined, which is identical to the `offers` argument.
    - `offers` - When all trade offers succeed, this is an array of objects. When one or more offers fail, this is available as `data.offers` on `err`. Each object has this structure:
        - `bot_id` - The internal ID of the bot which sent (or tried to send) the trade offer
        - `tradeoffer_id` - If we were able to successfully send a trade offer, this is its ID, as a string. If error, this is null.
        - `tradeoffer_error` - If we were not able to send a trade offer, this is a string containing an error message. If no error, this is null.
        - `items` - An array of OPSkins item IDs in this trade offer

**v1.2.0 or later is required to use this method**

Requests OPSkins bots to send you trade offers to withdraw one or more items from your OPSkins inventory to your Steam
inventory.

## IPricing

### getPriceList(appid, callback)
- `appid` - The [Steam Application ID](https://developer.valvesoftware.com/wiki/Steam_Application_IDs) of the game for which you want prices. Use `753` for Steam Community items.
- `callback` - A function to be called when the request completes.
    - `err` - An `Error` object on failure, or `null` on success
    - `prices` - An object of the structure shown below.

**This method does not require an API key.**

Downloads a list of prices for the past 60 days for an entire app. Prices are provided as the average sale price for
an item in a particular day. The returned data is updated once every 24 hours. The `prices` object structure resembles
the following:

```json
{
    "AK-47 | Black Laminate (Factory New)": {
        "2016-08-10": {"price": 10500},
        "2016-08-14": {"price": 10810},
        "2016-08-15": {"price": 11000},
        "2016-08-16": {"price": 10667},
        ... and so on
    },
    "AK-47 | Black Laminate (Field-Tested)": {
        "2016-08-10": {"price": 494},
        "2016-08-11": {"price": 489},
        "2016-08-12": {"price": 506},
        ... and so on
    },
    ... and so on
}
```

### getLowestPrices(appid, callback)
- `appid` - The [Steam Application ID](https://developer.valvesoftware.com/wiki/Steam_Application_IDs) of the game for which you want prices. Use `753` for Steam Community items.
- `callback` - A function to be called when the request completes.
    - `err` - An `Error` object on failure, or `null` on success
    - `prices` - An object of the structure shown below.

**This method does not require an API key.**

Downloads the current lowest list price and quantity on sale for each item in an app. Note that these two figures are
in no way related to one another. `quantity` is how many of that item are currently on sale, and `price` is the lowest
price at which the item is available. The returned data is updated at most once every 30 minutes. The `prices` object
structure resembles the following:

```json
{
    "AK-47 | Black Laminate (Battle-Scarred)": {
        "price": 590,
        "quantity": 13
    },
    "AK-47 | Black Laminate (Factory New)": {
        "price": 9899,
        "quantity": 12
    },
    "AK-47 | Black Laminate (Field-Tested)": {
        "price": 584,
        "quantity": 51
    },
    "AK-47 | Black Laminate (Minimal Wear)": {
        "price": 622,
        "quantity": 83
    },
    "AK-47 | Black Laminate (Well-Worn)": {
        "price": 598,
        "quantity": 9
    },
    ... and so on
}
```

### getSuggestedPrices(appid, items, callback)
- `appid` - The [Steam Application ID](https://developer.valvesoftware.com/wiki/Steam_Application_IDs) of the game for which you want prices. Use `753` for Steam Community items.
- `items` - An array of market_hash_names for the items for which you want prices. You cannot more than the [listing limit](#getlistinglimitcallback) at once.
- `callback` - A function to be called when the request completes.
    - `err` - An `Error` object on failure, or `null` on success
    - `prices` - An object whose keys are market_hash_name strings, and values are objects containing properties `opskins_price` (OPSkins 7-day suggested price), `market_price` (Steam Analyst/Community Market suggested price), and `opskins_lowest_price` (the current lowest list price on OPSkins). Any or all of these may be `null`.

Gets suggested prices for one or more items. Note that if you're interested in many OPSkins lowest price values,
then you may use [`getLowestPrices`](#getlowestpricesappid-callback).

## ISales

### getSales([req, ]callback)
- `req` - Optional. An object containing request filters. Available filters:
    - `page` - The number of the page you would like. Currently, there are 10,000 sales returned per page. Default is page 1.
    - `type` - Provide a [`SaleStatus`](#sale-status) value here to only return sales in that status. Default (omitted) is to get all statuses.
- `callback` - A function to be called when the request completes
	- `err` - An `Error` object on failure, or `null` on success
	- `totalPages` - A number containing the total number of pages that exist in this listing
	- `sales` - An array of objects, where each object represents one sale on your account. Each object has these properties:
		- `id` - The item's OPSkins sale ID
		- `price` - The item's list price, in USD cents
		- `commission` - If the item has sold, this is how much OPSkins took in commission
		- `tax` - If the item has sold, this is how much sales tax was taken from your cut
		- `classid` - The item's Steam class ID
		- `instanceid` - The item's Steam instance ID
		- `appid` - The Steam AppID of the game to which this item belongs
		- `contextid` - The Steam context ID to which this item belongs
		- `assetid` - The Steam asset ID of this item, if it is awaiting pickup or is in our system
		- `name` - The item's name
		- `bot` - The internal OPSkins ID of the bot which is holding this item
		- `bot_id64` - The 64-bit SteamID of the bot which is holding this item
		- `offerid` - If there is an active trade offer for this item, this is its ID. May also be a negative value representing a [trade offer status code](https://opskins.com/kb/error-codes)
		- `state` - The item's current [state](#sale-status)
		- `escrow_end_date` - If the item is currently in a trade hold or a temporary trade lock (e.g. H1Z1), this is a Unix timestamp representing when the hold period will expire
		- `list_time` - A Unix timestamp representing when the item was listed.
			- If the item is awaiting pickup, this is the time when you sent the request to our servers to list the item
			- If the item is on sale, this is the time when either our bot confirmed the Steam trade, or the time when you re-listed it from your OPSkins inventory, if applicable
		- `bump_time` - A Unix timestamp representing when the item was last bumped. Will be at least the same as `list_time` if never bumped.
		- `last_updated` - A Unix timestamp representing when the item last had its state or price changed. May be 0 for older items.
		- `security_token` - The security token sent in the trade offer from our bot to pick up this item.
		- `wear` - If this item has a wear value and it's known, this is it.
		- `txid` - If the item has been sold, this is the transaction ID of the wallet transaction in which you were paid.
		- `trade_locked` - A boolean representing whether or not the item is in a temporary (H1Z1) trade lock.
			- If `escrow_end_date` is set and is in the future and this is `false`, then the item is in a Steam trade hold
			- If `escrow_end_date` is set and is in the future and this is `true`, then the item is in a Daybreak trade lock
		- `repair_attempted` - If the item requires support intervention and you have already attempted to repair it and the attempt failed, then this is `true`. If this is `true` then you will need to contact support to have this item fixed.
		- `addons` - An array of strings for each addon which is applied to this item.
 
Gets a listing of items you listed on your account.

### getActiveTradeOffers(callback)
- `callback` - A function to be called when the request completes
    - `err` - An `Error` object on failure, or `null` on success
    - `offers` - An object whose keys are trade offer IDs. Each key contains an object with this structure:
        - `saleids` - An array of sale IDs for the items contained in this offer
        - `bot_id` - The internal OPSkins ID of the bot which sent this trade
        - `bot_id64` - The 64-bit SteamID of the bot which sent this trade, as a string
        - `type` - A string which is `pickup` if this offer is picking up new listings, `return` if this offer is returning listings to you, or `withdrawal` if this offer is delivering items from your OPSkins inventory

**v1.1.0 or later is required to use this method**

Gets a list of outstanding trade offers which have been sent to you. Note that there may be a delay between when you
accept offers (particularly offers which are delivering items to you) and when they disappear from this list.

### editPrice(saleID, price, callback)
- `saleID` - The numeric ID of the sale you wish to edit.
- `price` - The desired new price for this sale, in USD cents.
- `callback` - A function to be called when the request completes
    - `err` - An `Error` object on failure, or `null` on success
    - `relisted` - `true` if this item was in your OPSkins inventory and has now been listed for sale, or `false` if this item was already listed for sale

Edits the price of one of your sales. If the item is in your OPSkins inventory, then calling this will list it for sale
at the provided price.

### editPrices(sales, callback)
- `sales` - An object whose keys are sale IDs and values are new prices, in USD cents. 500 items max.
- `callback` - A function to be called when the request completes
    - `err` - An `Error` object on failure, or `null` on success

**v1.2.0 or later is required to use this method**

Edit the prices for multiple items in one go. This method queues price updates server-side, and the callback will be
fired before any prices have actually been updated. The server will process your request and you will not be notified
when it completes in any way, unless you request your sales list and check the prices yourself.

This will fail if you attempt to queue a price update for an item which already has a queued price update. Price update
errors will not be reported and will be silently dropped in the background. For example, requests to edit the prices of
items you do not own or which do not exist will be accepted, but will not actually be processed.

### getListingLimit(callback)
- `callback` - A function to be called when the request completes
    - `err` - An `Error` object on failure, or `null` on success
    - `liimt` - The current limit of how many items you can list at one time via [`listItems`](#listitemsitems-callback)

Gets the current limit of how many items you can list at one time via [`listItems`](#listitemsitems-callback).

### listItems(items, callback)
- `items` - An array of objects, one object for each item you wish to list. Each object should contain these properties:
    - `appid` - The [Steam Application ID](https://developer.valvesoftware.com/wiki/Steam_Application_IDs) of the game which owns this item
    - `contextid` - The Steam context ID which owns this item. For all current Valve games, this is 2. For H1Z1, this is 1. For Steam Community, this is 6.
    - `assetid` - The Steam asset ID (or just the item's ID) of this item.
    - `price` - The price at which you wish to sell this item, in USD cents.
    - `addons` - Optional. An array of strings for addons you wish to apply to this item. Available addons:
        - `featured` - Feature this item. Costs $3.00 if you don't have any featured credits remaining. Uses a credit if you do.
        - `screenshots` - Inspectable CS:GO items only. Takes screenshots of this item and displays them (Instant Field Inspection). Costs 2% of list price, minimum $0.50. If you also feature this item, then the total cost of both addons is capped at $4.50.
- `callback` - A function to be called when the request completes
    - `err` - An `Error` object on failure, or `null` on success
    - `result` - An object containing these properties:
        - `tradeoffer_id` - If a trade offer was successfully sent, this is its ID as a string. If an offer could not be sent, this is `null`.
        - `tradeoffer_error` - If a trade offer could not be sent, this is an error message explaining why, as a string. If an offer was sent, this is `null`.
        - `bot_id` - The internal OPSkins ID of the bot which sent this trade. This is the number in the bot's Steam name.
        - `bot_id64` - The 64-bit SteamID of the bot which sent this trade, as a string.
        - `security_token` - The 6-character security token which will be included in the trade offer message.
        - `sales` - An array of objects describing the sales that were created. Each object has these properties:
            - `saleid` - The ID of the sale which was created for this item
            - `appid` - The Steam AppID for this item
            - `contextid` - The Steam context ID in which this item resides in your inventory
            - `assetid` - The Steam asset ID for this item in your inventory
            - `market_name` - The name of this item
            - `price` - The list price of this item
            - `addons` - An array (possibly empty) containing strings for each addon this item has

Lists one or more and sends a trade offer. This will fail if any item has price restrictions which are not met, if any
item cannot be sold on OPSkins, if any item does not exist, or if there is already an active trade offer out to pick up
any of these items. There is a limit on how many items you can list in one request; this can be accessed via
[`getListingLimit`](#getlistinglimitcallback).

If there are already sales created for any of these items but they do not currently have active trade offers, then those
sales will be deleted and new ones will be created. This means that if this request fails to send a trade offer, you may
safely re-request it for the same items.

### bumpItems(saleids, callback)
- `saleids` - An array of sale IDs
- `callback` - A function to be called when the request completes
    - `err` - An `Error` object on failure, or `null` on success
    - `balance` - Your account's new balance, in USD cents
    - `results` - An object whose keys are sale IDs, and values are objects with this structure:
        - `status` - An `ErrorCode` indicating the result of bumping this item (1 = OK, indicates success)
        - `message` - An error message ("OK" on success)

**v1.4.0 or later is required to use this method**

Bumps one or more items. Bumps cost $0.50, and this will be charged to your account balance (unless you have free bump
credits on your account, in which case those will be consumed first).

### returnItems(saleids, callback)
- `saleids` - An array of sale IDs
- `callback` - A function to be called when the request completes
    - `err` - An `Error` object on failure, or `null` on success
    - `offers` - An array of objects, where each object in this array represents one trade offer that we sent (or tried to send)
        - `bot_id` - The internal ID of the bot that sent (or tried to send) this offer
        - `items` - An array of sale IDs that are in this offer
        - `tradeoffer_id` - The ID of the offer we sent as a string, on success; `null` on failure
        - `tradeoffer_error` - An error message explaining why the offer couldn't be sent, on failure; `null` on success

**v1.3.0 or later is required to use this method**

Requests the return of one or more items you currently have listed for sale on your account. These items must currently
be on sale (state 2) or awaiting return (state 5), and must not already have a trade offer out.

### search(params, callback)
- `params` - An object containing search parameters. Please [see here](https://opskins.com/kb/api-isales#method-search-v1) for documentation regarding this.
- `callback` - A function to be called when the request completes
    - `err` - An `Error` object on failure, or `null` on success

**v1.2.0 or later is required to use this method**

Search active OPSkins listings for particular items. This endpoint is relatively heavily rate-limited. Current limits
are documented on the [OPSkins knowledgebase](https://opskins.com/kb/api-isales#method-search-v1).

### buyItems(saleids, total, callback)
- `saleids` - An array of OPSkins sale IDs for the items you want to buy
- `total` - The total cost of the items you wish to buy, in USD cents. If this is not correct, the request will fail.
- `callback` - A function to be called when the request completes
    - `err` - An `Error` object on failure, or `null` on success
    - `items` - An array of objects, each of which corresponds to an item you purchased. Each object has these properties:
        - `saleid` - The OPSkins sale ID of the item. This will be one of the IDs you passed in.
        - `new_itemid` - The new OPSkins ID of this item in your OPSkins inventory. This is the ID you need to pass to `withdrawInventoryItems` to withdraw the item to your Steam inventory.
        - `name` - The name of the item
        - `bot_id` - The internal OPSkins ID of the bot which is holding this item
    - `balance` - Your new OPSkins account balance after this purchase, in USD cents

**v1.2.0 or later is required to use this method**

Purchase one or more items and deliver them to your OPSkins inventory. Once purchased, the item(s) can be delivered to
your Steam inventory using `withdrawInventoryItems`. To prevent bot sniping, this endpoint will only purchase listings
which have been publicly visible for at least ten minutes, and are not currently limited to Buyers Club members.

## ISupport

### repairItem(saleID, callback)
- `saleID` - The ID of the sale which you want to repair
- `callback` - A function to be called when the request completes
    - `err` - An `Error` object on failure, or `null` on success
    - `repaired` - `true` if this item was successfully repaired, or `false` if it could not be repaired automatically
    - `type` - A string explaining this item's relationship to you (`sale` if you're selling it, or `item` if it's in your OPSkins inventory)
    - `bot` - The internal ID of the storage account which is holding this item
    - `repairedSaleIds` - An array of sale IDs which were successfully repaired as a result of this request (see below)

Attempts to automatically repair an item which is in a bad state. This will also attempt to repair all other such items
on the same storage account. Sale IDs of all items which were successfully repaired are returned, even those which do
not belong to you. If this fails (`repaired` is `false`), then you will need to contact support in order to have this
item repaired.

## ITest

### getSteamID(callback)
- `callback` - A function to be called when the request completes
    - `err` - An `Error` object on failure, or `null` on success
    - `steamID` - Your 64-bit SteamID, as a string
    - `time` - A `Date` object containing the current server time

Gets the SteamID of the account which owns this API key.

## IUser

### getBalance(callback)
- `callback` - A function to be called when the request completes
    - `err` - An `Error` object on failure, or `null` on success
    - `balance` - Your account's current balance, in USD cents

Gets your OPSkins account's current balance.

### updateTradeURL(url, callback)
- `url` - Your new Trade URL
- `callback` - A function to be called when the request completes
    - `err` - An `Error` object on failure, or `null` on success

**v1.4.1 or later is required to use this method**

Update the Steam Trade URL which is linked with your account. It must belong to the same Steam account as is linked
to your OPSkins account.


## IStatus

### getBotList(callback)
- `callback` - A function to be called when the request completes
    - `err` - An `Error` object on failure, or `null` on success
    - `bots` - An object with numeric keys corresponding to a specific bots internal ID, and Steam 64 ID.

**v1.3.0 or later is required to use this method**

Retrieves a listing of all active OPSkins bots, namely their internal IDs (the number in their Steam name), their SteamIDs, and their online status.

You may wish to note that some internal IDs have either been skipped or retired, so this list is not exactly sequential.

# Events

### queryLimit
- `queriesRemaining` - How many queries you have left today.

Emitted when a request completes and includes an `X-Queries-Remaining` header, indicating how many queries you have
left available for your API key. Query limits reset daily at approximately midnight Eastern Time.

### debug
- `message` - A string containing the debug message.
