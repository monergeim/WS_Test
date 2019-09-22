<img src="https://www.google.com/a/cpanel/om2.com/images/logo.gif" width="80">


- [Introduction](#Introduction)
  - [General Specifications](#GeneralSpecs)
- [Authentication API](#AuthAPI)
  - [createSession](#createSession)
- [Trading API](#TradingAPI)
  - [placeOrder](#placeOrder)
  - [cancelOrder](#cancelOrder)
- [Market Data API](#MarketDataAPI)
  - [orderBookDepth](#orderBookDepth)

# Introduction
The OM2 exchange API offers real time market data as well as the ability to trade with the exchange.

The underlying technology used is [Scalecube](http://scalecube.io/) a Novel Open-source application-platform that addresses inherent challenges involved in the development of distributed computing.

Exchange API protocol is WebSocket.   
Any request body should be a valid `JSON`, non valid `JSON` objects will be ignored. 

Within the valid JSON please be aware that:
* System ignores any additional parameter that was sent on request body but was not specified in this document.
* In case of multiple parameters sent with different values, system will always use the last value provided.


**Sandbox**
* Navigate to [Scalecube Sandbox](http://scalecube.io/api-sandbox/app/index.html)
* Click on the Settings button then set Sandbox endpoint `wss://master-ws.genesis.om2.com`, click on the Connect button
* Enter the message body in text area and click Send.
* Note: You can import few samples by clicking on Import icon and paste this sample [Json file](https://raw.githubusercontent.com/jivygroup/api-sandbox-data/master/basicTrade) url
 
<details><summary><a name="GeneralSpecs"></a><b>General Specifications</b></summary>

**Request Parameters**  

Parameter|	Type|	Description
---|---|---
q|String|qualifier, contains the method for the specific API call.
sid|Int|stream identifier, for each WebSocket connection this is a unique identifier for the API call. Please note that as long as the sid was not ended (other by exchange or by consumer) this can’t be used again on the same WebSocket connection
d|Json|data object, contain the request body


```javascript
{ 
 "q":"/om2.exchange.orders/placeOrder", 
 "sid":1, 
 "d": 
   { 
	 "userId":"UserTest1", 
	 "orderType":"Limit", 
	 "side":"Buy", 
	 "instrument":"FB", 
	 "quantity":1.3, 
	 "price":170.11
   } 
} 
```

**Success Response**  
The response will always include the `q` and `sid` parameters from request and a `d` parameter with the response body. 

```javascript
{ 
   "q":"/om2.exchange.orders/placeOrder", 
   "sid":1, 
   "d": 
     { 
       "orderId":1234, 
       "orderStatus":"Pending" 
     } 
} 
```

In case of short living stream (i.e. trading action), additional response will be sent upon stream closure with success, this message will include `sid` with request sid and `sig:1`.  

```javascript
{ 
  "sig":1, 
  "sid":1 
} 
```
**Response With Failure**  
The response will always include the below parameters: 

Parameter|Description
---|---
sig|signal will be equal to "2" 
q|always `/io.scalecube.services.error/XXX`, the XXX value is internal and should be ignored
sid|from request 
d|data that contain errorCode and errorMessage. Those are the error code and message to consider

```javascript
{ 
   "sig":2, 
   "q":"/io.scalecube.services.error/500", 
   "sid":1, 
   "d": 
     { 
       "errorCode":1000, 
       "errorMessage":"Unknown order type: SL" 
     } 
} 
```

**Stream Closure**  
In order to close active stream need to send a message with `sig:3` and `sid` with the stream id to be closed.

```javascript
{ 
    "sig":3, 
    "sid":30000 
} 
```

sig parameter summary table:

sig|Description
---|---
1|Stream closed with success
2|Stream closed with failure
3|Stream was closed due to consumer request
</details>



# <a name="AuthAPI"></a>Authentication API
## createSession

The `createSession` API lets you authenticate to exchange API. 

Prior to any exchasnge API call you must create a valid session, this session remains active as long as websocket connection remians open.
Any broker connected to exchnage will be provided with 1 (or more) set of `apiKey` and `secret`, each `apiKey` is assigned with the relevant permissions.


Endpoint: `/om2.exchange.auth/createSession"`

**Request Parameters**

Parameter|	Type|	Description
---|---|---
apiKey|String|Unique broker order ID
timestamp|Unix timestamp |Login timestamp in milliseconds, must be now
signature|String|`HMAC SHA256 signature` computed using provided `secret` key and message body. <br> Example:<br> `Message` = `"apiKey":"1234567abcdz","timestamp":"1558941516123"`<br>`secret` = `MySecretKey`<br>`signature = 265cfbc40c22355d6c1ecc1f3a1e87e8c46954db9096a7bd6967241dd8bc65b6`

How to compute the signature 
```
$ echo -n '"apiKey":"1234567abcdz","timestamp":"1558941516123"' | openssl dgst -sha256 -hmac 'MySecretKey'
(stdin)= 265cfbc40c22355d6c1ecc1f3a1e87e8c46954db9096a7bd6967241dd8bc65b6
```

**Error Codes**

Code|Message
---|---
6000|`Authentication failed`
6001|`Wrong timestamp`
6002|`Missing fields: [Fieldname]`


<details>
<summary><b>Samples</b></summary>  

**Request**  

```javascript
{
        "q":"/om2.exchange.auth/createSession",
        "sid":15,
        "d":{
                    "apiKey":"6ggg",
                    "timestamp":"1563880778434",
                    "signature":"1842286ea411ebdc3dde3e6b3185cc85c19fa0140d0eecebb0c74137e9957981"
        }
}


```

**Success Response**
```javascript
{
        "q":"/om2.exchange.auth/createSession",
        "sid":15,
        "d":{}
}
```

**Failure Response**
```javascript
{
         "sig":2,
         "q":"/io.scalecube.services.error/401",
         "sid":15,
         "d":{
                   "errorCode":6001,
                   "errorMessage":"Wrong timestamp"
         }
}
```
</details>





# <a name="TradingAPI"></a>Trading API
## placeOrder

The `placeOrder` API lets you place a new order into exchange. 

If you send a valid order, you should receive a response with "Pending" status, this means that order was validated and accepted. The response contains the exchange orderId which should be stored and used for later status changes, notified via the orderBookDepth stream. 

Non-valid order will be responded with error message. 
In case that broker system didn't get a response withing the timeout schedule the broker can do the one of the below:
* **Retry** sending same order using same `brokerOrderId` which will result:
  * Rejection in case that previous order was accepted 
  * Success in case that previous order was not accepted
* **Cancel** the order using `brokerOrderId` which will assure that order is no longer active (it might be already executed) 

`brokerOrderId` is unique identifier and should not be used for more than a single order. 
Note: system might accept already used `brokerOrderId` after predefined period but it is not recommended to use same `brokerOrderId` twice.

Order types:  
* **Limit**: Order is being sent with a specific price. A buy order will be executed with the requested price or lower price a sell order will be executed with the requested price or higher price. 
* **Market**: Order is attempted filled at the best price in the market. Partial filled is allowed. In case not all the amount can be filled, the residual amount will be cancelled.

Endpoint: `/om2.exchange.orders/placeOrder`

**Request Parameters**

Parameter|	Type|	Description
---|---|---
brokerOrderId|Long|Unique broker order ID
userId|	String|	Reference data only which is not being used in the exchange
orderType|Enum|Order type Limit or Market
orderSide|Enum|Order side Buy or Sell
instrument|String|Instrument identifier
quantity|Decimal|Order quantity
price `optional`|Decimal|The price of the Limit order. For Market order this will not be sent.

**Response Parameters**

Parameter|	Type|	Description
---|---|---
orderId|Long|	Exchange Order ID
orderStatus|String|Order status: Pending

**Error Codes**

Code|Message
---|---
1000|`Missing fields: [Fieldname]`
1001|`Order must contain a positive quantity` or   <br>`Market order must not specify price` or <br>`Limit order must contain a positive price` or<br>`Wrong orderType` or<br>`Wrong side` or<br>`Wrong brokerOrderId`
1002|`brokerOrderId is already in use`
1003|`Market is closed`
1004|`Instrument trading is not allowed` 
1005|`Price precision is[PricePrecision]` or<br> `Quantity precision is[QuantityPrecision]`
1006|`Minimum order quantity is [MinOrderQuantity]` or<br>`Maximum order quantity is [MaxOrderQuantity]`
1007|`Invalid session`
1008|`This apiKey doesn’t have the right permission`
1009|`Instrument trading is halt`
1010|`Instrument [Instrument] not found`


<details>
<summary><b>Samples</b></summary>  

**Request**  

```javascript
{
	"q":"/om2.exchange.orders/placeOrder",
	"sid": 1,
	"d":{
		   "brokerOrderId": 123,   
                   "userId": "1",
		   "orderType": "Limit",
		   "side": "Buy",
		   "instrument": "BTC",
		   "quantity": 123,
		   "price": 100.555
	}
}
```

**Success Response**
```javascript
{
	"q":"/om2.exchange.orders/placeOrder",
	"sid":1,
	"d":{
		   "orderId":2345,
		   "orderStatus":"Pending"
	   }

}
```

**Failure Response**
```javascript
{
	"sig":2,
	"q":"/io.scalecube.services.error/400",
	"sid":1,
	"d":{
		   "errorCode":1001,
		   "errorMessage":"Limit order must contain a positive price"
	}
}
```
</details>

## cancelOrder
The `cancelOrder` API is used to request that an order be cancelled. 

If you send a valid order to cancel, you should receive a response that confirms that order was cancelled. This means that remaining open quantity of the order was cancelled. 

Non-valid cancel order will be responded with the error message.

Endpoint: `/om2.exchange.orders/cancelOrder`

**Request Parameters**

Parameter|	Type|	Description
---------------------|----|----
orderId `optional`|Long|Exchange Order ID. Not mandatory if `brokerOrderId` was sent
brokerOrderId `optional`|Long|Broker order ID. Not mandatory if `orderId` was sent
instrument|String|Instrument identifier
userId|String|Reference data only which is not being used in the exchange



**Response Parameters**

Parameter|	Type|	Description
---|---|---
orderId|Long|	Exchange Order ID

**Error Codes**

Code|Message
---|---
1100|`Order not found for that instrument` 
1103|`Missing fields: [Fieldname]`
1104|`Please use only one from orderId or brokerOrderId` 
1007|`Invalid session`
1008|`This apiKey doesn’t have the right permission`
1009|`Instrument trading is halt`

<details>
<summary><b>Samples</b></summary>  


**Request**

```javascript
{
        "q":"/om2.exchange.orders/cancelOrder",
        "sid": 1,
        "d":{
               "orderId":3456,
               "userId": "1",
               "instrument": "BTC"
        }
}
```

**Success Response**
```javascript
{
        "q":"/om2.exchange.orders/cancelOrder",
        "sid":1,
        "d":{
               "orderId":3456
        }
}
```


**Failure Response**
```javascript
{
        "sig":2,
        "q":"/io.scalecube.services.error/500",
        "sid":1,
        "d":{
               "errorCode":1100,
               "errorMessage":"Order not found for that instrument"
        }
}
```
</details>


# <a name="MarketDataAPI"></a>Market Data API
## orderBookDepth

The `orderBookDepth` stream provides the full order book depth data.
This stream is public and pseudo anonymous, only the broker that placed the order knows the order origin. (`brokerId` is published but not any other broker details).

The `orderBookDepth` publish only raw data without any aggregation, hence in order to determine the current state of an order, the subscriber needs to maintain the updated order state as per all the messages for that order.

There are 3 message types:

* **Add**
* **Cancelled**
* **Executed**

`eventId` is a sequence number of the events (per instrument). 

In order to build accurate book state need to consume all events per instrument and apply it on the right sequence. 
When subscribing to stream the system publish the current book state by sending synthetic event to all resting orders. (it is synthetic event as any resting order might be result of multiple events as this might be after partial executions).

In case of synthetic event the `eventId = -1` and `eventTimestamp= -1`, the order priority for FIFO matching is determined by `orderId`. 

Note: from technical reasons when you register to `orderBookDepth` stream system will not send the exact current book state but will start from a specific point of time at the past. You will get the synthetic events for that point and some as real past events till you catch the real time events.  (This is derived from that `snapshot` mechanism, if more details are required please contact us). 


Endpoint: `/om2.exchange.market/orderBookDepth`

Note: No subscription parameters are required to subscribe the stream. 

**Add Order Message** indicates that a new order has been accepted by the exchange and was added to the
book. 

Field|Description
---|---
eventId|Identifier for the event, unique per instrument
messageType| **Add**
eventTimestamp|Event timestamp (in milliseconds)
instrument|Instrument symbol
orderId|Exchange order ID
brokerId|Broker identifier
brokerOrderId|Broker order ID
side|Buy / Sell
quantity|Order quantity 
price|Order price

**Order Executed Message** indicates that an order on the book is matched with a new coming order in whole or in part. It is possible to receive several Order Executed Messages for a single orderId.  

Field|Description
---|---
eventId|Identifier for the event, unique per instrument
messageType|**Executed** 
eventTimestamp|Event timestamp (in milliseconds)
instrument|Instrument symbol
makerBrokerId|Resting broker ID
makerBrokerOrderId|Resting broker order ID
makerOrderId|Resting `orderId`
takerBrokerId|Aggressive broker ID
takerBrokerOrderId|Aggressive broker order ID
takerOrderId|Aggressive order ID
takerOrderType|Aggressive order type Limit or Market
takerOrderPrice|Aggressive order requested price
mathchId|Unique ID for the match
executedQuantity|Matched quantity
executedPrice|Matched price (maker order price). 

**Order Cancel Message** indicates that an order on the book is being cancelled. 
This message also sent in case of market order that was not fully filled.  

Field|Description
---|---
messageType|**Cancelled** 
eventId|Identifier for the event, unique per instrument
eventTimestamp|Event timestamp (in milliseconds)
instrument|Instrument symbol
orderSide|Buy/ Sell
orderId|Exchange order ID
brokerId|Broker identifier
brokerOrderId|Broker order ID 
cancelledQuantity|Order cancelled quantity

<details>
<summary><b>Samples</b></summary>  

**Subscription**  

```javascript
{
  "q": "/om2.exchange.market/orderBookDepth",
  "sid": 10,
  "d": {}
}
```

**Add Order Message**
```javascript
{
  "q": "/om2.exchange.market/orderBookDepth",
  "sid": 10,
  "d": {
    "eventId": 29969,
    "messageType": "Add",
    "eventTimestamp": 1565790374956,
    "instrument": "AMZ",
    "orderId": 20012,
    "brokerId": "12",
    "brokerOrderId": 1565790360561,
    "side": "Buy",
    "quantity": 1,
    "price": 1.22
  }
}
```

**Order Executed Message**
```javascript
{
  "q": "/om2.exchange.market/orderBookDepth",
  "sid": 10,
  "d": {
    "eventId": 2,
    "messageType": "Executed",
    "eventTimestamp": 1569161821289,
    "instrument": "INS1",
    "makerBrokerId": 2,
    "makerBrokerOrderId": 1564403702076,
    "makerOrderId": 1,
    "takerBrokerId": 2,
    "takerBrokerOrderId": 1569161798700,
    "takerOrderId": 2,
    "takerOrderType": "Limit",
    "takerOrderPrice": 10,
    "matchId": 1,
    "executedQuantity": 1,
    "executedPrice": 10.25
  }
}

```
**Order Cancel Message**
```javascript
{
  "q": "/om2.exchange.market/orderBookDepth",
  "sid": 10,
  "d": {
    "eventId": 5,
    "messageType": "Cancelled",
    "eventTimestamp": 1569162456164,
    "instrument": "INS1",
    "orderId": 3,
    "orderSide": "Sell",
    "brokerId": 2,
    "brokerOrderId": 1569161878394,
    "cancelledQuantity": 2.2
  }
}
```

</details>

