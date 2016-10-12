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

- `AWAITING_PICKUP` (1) - This sale has been created but the item has not been traded to an OPSkins storage account yet. There may or may not be an active trade offer for this sale.
- `ON_SALE` (2) - This item has been traded to the storage account, and it is currently up for sale.
- `AWAITING_DELIVERY` (3) - This item has been purchased, but it has not yet been delivered to its buyer. The seller has not yet been paid for this sale. It is possible that the buyer may refund this sale, which will put the sale back into state `ON_SALE` (2).
- `SOLD` (4) - This item has been sold and delivered. The seller has now been paid for this sale. *
- `AWAITING_RETURN` (5) - The seller has taken this item off of sale and requested that it be returned to their Steam inventory, but the return is not yet complete. There may or may not be an active trade offer for this sale to return it to its seller.
- `RETURNED` (6) - The seller has taken this item off of sale and it has been returned to their Steam inventory. *

*\* = It is not possible (under normal circumstances) for an item to change from this state to another one.*

These sale statuses are available as an enum accessible via the `SaleStatus` property of the `OPSkinsAPI` object.
[View this here.](https://github.com/OPSkins/node-opskins/blob/master/resources/SaleStatus.json) Example:

```js
var OPSkinsAPI = require('@opskins/api');
var SaleStatus = OPSkinsAPI.SaleStatus;

var status = getSaleStatusSomehow();

if (status == SaleStatus.ON_SALE) {
	// this item is currently on sale
}
```

# Prices

All prices accepted as input and provided as output are in USD cents. This means that a price of $5.42 is represented
as the integer 542.

# Methods

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
