## Table of Contents
- [Introduction](#Introduction)
  - [Request and Response General Specifications](#GeneralSpecs)
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

## <a name="GeneralSpecs"></a>Request and Response General Specifications
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
       "orderId":"f633782c-babf-4bc3-80b1-e90c49ba00ce", 
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


# <a name="TradingAPI"></a>Trading API
## placeOrder

The placeOrder API lets you place a new order into exchange. 

If you send a valid order, you should receive a response with "Pending" status, this means that order was validated and accepted. The response contains the exchange orderId which should be stored and used for later status changes, notified via the orderBookDepth stream. 

Non-valid order will be responded with the error message. 
In case of timeout TBD

Order types: 
**Limit**: Order is being sent with a specific price. A buy order will be executed with the requested price or lower price a sell order will be executed with the requested price or higher price. 
**Market**: Order is attempted filled at the best price in the market. Partial filled is allowed. In case not all the amount can be filled, the residual amount will be cancelled.

Endpoint: `/om2.exchange.orders/placeOrder`

**Request Parameters**

Parameter|	Type|	Description
---|---|---
userId|	String|	Reference data only which is not being used in the exchange
OrderType|	Enum|	Order type Limit or Market
OrderSide|	Enum|	Order side Buy or Sell
instrument|	String|	Instrument identifier
quantity|	Long|	Order quantity
price `optional`|	Long|	The price of the Limit order. For Market order this will not be sent.

**Response Parameters**

Parameter|	Type|	Description
---|---|---
orderId|String|	Exchange Order ID
orderStatus|String|Order status: Pending

**Error Codes**

Code|Description
---|---
1000	|Not all the required fields were sent
1001	|Invalid data was sent. More details are shown in the error message, for example "Wrong side"


<details>
<summary><b>Samples</b></summary>  

**Request**  

```javascript
{
	"q":"/om2.exchange.orders/placeOrder",
	"sid": 1,
	"d":{
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
		   "orderId":"aca1bdf9-60ec-497a-91e2-3c858a7e70a8",
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
The cancelOrder API is used to request that an order be cancelled. 

If you send a valid order to cancel, you should receive a response that confirms that order was cancelled. This means that remaining open quantity of the order was cancelled. 

Non-valid cancel order will be responded with the error message.

Endpoint: `/om2.exchange.orders/cancelOrder`

**Request Parameters**

Parameter|	Type|	Description
---|----|----
userId|String|Reference data only which is not being used in the exchange
orderId|String|Exchange Order ID
instrument|String|Instrument identifier


**Response Parameters**

Parameter|	Type|	Description
---|---|---
orderId|String|	Exchange Order ID

**Error Codes**

Code|Description
---|---
1100|System can’t find open order with that ID for the specified instrument
1103|Not all the required fields were sent

<details>
<summary><b>Samples</b></summary>  


**Request**

```javascript
{
        "q":"/om2.exchange.orders/cancelOrder",
        "sid": 1,
        "d":{
               "orderId":"aca1bdf9-60ec-497a-91e2-3c858a7e70a8",
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
               "orderId":"aca1bdf9-60ec-497a-91e2-3c858a7e70a8"
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
               "errorMessage":"orderId not found"
        }
}
```
</details>


# <a name="MarketDataAPI"></a>Market Data API
## orderBookDepth

The orderBookDepth stream lets you get all the updated data on the order book (raw data and not aggregated) in real-time stream.
Stream is public to all exchange consumer - but only the authorized broker know that a specific order belongs to him.

There are **3 available messages** in that stream:

* **Add:** when a new order is captured in the book
* **Execute:** when there is a match
* **Cancel:** when order is cancelled

Endpoint: `/om2.exchange.market/orderBookDepth`

**Request Parameters**

Parameter|	Type|	Description
---|---|---
emptyObject {}|	String|	subscription to infinite events stream

**Add Order Message**

Parameter| Type| Description
---|---|---
messageType|String| **Add** - order is captured in the order book
orderId|String|	Exchange Order ID
eventTimestamp|Long| Event timestamp (in microseconds)
side|String| Buy / Sell
instrument|String| Instrument symbol
quantity|BigDecimal| Order quantity 
price|BigDecimal| Order price

**Order Executed Message**

Parameter| Type| Description
---|---|---
messageType|String| **Executed** - orders (resting&aggressive) were matched
orderId|String|	Exchange Orders' Match ID
eventTimestamp|Long| Event timestamp (in microseconds)
makerOrderId|String| Resting Order ID
takerOrderId|String| Aggressive order ID
instrument|String| Instrument symbol
executedQuantity|BigDecimal| Order matched quantity
executedPrice|BigDecimal| Order matched price 

**Order Cancel Message**

Parameter| Type| Description
---|---|---
messageType|String| **Cancelled** - `resting` order's quantity was removed from the order book either `Market` order's quantity wasn't matched  
orderId|String|	Exchange Orders' Match ID
eventTimestamp|Long| Event timestamp (in microseconds)
instrument|String| Instrument symbol
cancelledQuantity|BigDecimal| Order's cancelled quantity
 

<details>
<summary><b>Samples</b></summary>  

**Subscription**  

```javascript
{
	"q":"/om2.exchange.market/orderBookDepth",
        "sid": 1,
        "d":{}
}
```

**Add Order Message**
```javascript
{
        "q":"/om2.exchange.market/orderBookDepth",
        "sid":1,
        "d":{
               "messageType": "Add",
               "eventTimestamp": 1559833699198,
               "instrument": "BTCUSD",
               "orderId": "92f9b6eb-3c73-4192-9896-9db81b1045e5",
               "side": "Buy",
               "quantity": 50,
               "price": 6500
    	   }
}
```
**Order Executed Message**
```javascript

{      
        "q":"/om2.exchange.market/orderBookDepth",
        "sid":1,
        "d":{
               "messageType": "Executed",
               "eventTimestamp": 1559833871143,
               "instrument": "FB",
               "matchId": "1235fty-3c98-8888-9896-9db81b1697",
               "makerOrderId": "92f9b6eb-3c73-4192-9896-9db81b1045e5",
               "takerOrderId": "825b5e62-7e25-411a-a3ce-9c3697aaec05",
               "executedQuantity": 50,
               "executedPrice": 10,
         }
}
```
**Order Cancel Message**
```javascript

{   
        "q":"/om2.exchange.market/orderBookDepth",
        "sid":1,
        "d":{
               "messageType": "Cancelled",
               "eventTimestamp": 1559834204805,
               "instrument": "GOOG",
               "orderId": "2729fb31-f5b5-4458-9a8d-626230f2879e",
               "canceledQuantity": 50
         }
}  
```

</details>
