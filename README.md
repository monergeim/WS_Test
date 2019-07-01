<img src="https://www.google.com/a/cpanel/om2.com/images/logo.gif" width="80">


- [Introduction](#Introduction)
  - [General Specifications](#GeneralSpecs)
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
</details>


# <a name="TradingAPI"></a>Trading API
## placeOrder

The placeOrder API lets you place a new order into exchange. 

If you send a valid order, you should receive a response with "Pending" status, this means that order was validated and accepted. The response contains the exchange orderId which should be stored and used for later status changes, notified via the orderBookDepth stream. 

Non-valid order will be responded with the error message. 
In case of timeout TBD
`brokerOrder`Id Uniqueness TBD 

Order types:  
* **Limit**: Order is being sent with a specific price. A buy order will be executed with the requested price or lower price a sell order will be executed with the requested price or higher price. 
* **Market**: Order is attempted filled at the best price in the market. Partial filled is allowed. In case not all the amount can be filled, the residual amount will be cancelled.

Endpoint: `/om2.exchange.orders/placeOrder`

**Request Parameters**

Parameter|	Type|	Description
---|---|---
userId|	String|	Reference data only which is not being used in the exchange
OrderType|Enum|Order type Limit or Market
OrderSide|Enum|Order side Buy or Sell
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
1010|`Instrument [Instrument] not found`


<details>
<summary><b>Samples</b></summary>  

**Request**  

```javascript
{
	"q":"/om2.exchange.orders/placeOrder",
	"sid": 1,
	"d":{
		   "brokerOrderId": "1abc",   
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
orderId `optional`|Long|Exchange Order ID. Not mandatory if `brokerOrderId` was sent
brokerOrderId `optional`|String|Broker order ID. Not mandatory if `orderId` was sent
instrument|String|Instrument identifier


**Response Parameters**

Parameter|	Type|	Description
---|---|---
orderId|Long|	Exchange Order ID

**Error Codes**

Code|Message
---|---
1100|`orderId not found` 
1103|`Missing fields: [Fieldname]`
1104|`Please use only one from orderId or brokerOrderId` 

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

The `orderBookDepth` stream provide the full order book depth data.
This stream is public and anonymous, only the broker that placed the order knows the order origin. (As the orderId was provided within `placeOrder` response).

The `orderBookDepth` publish only raw data without any aggregation, hence in order to determine the current state of an order, the subscriber needs to maintain the updated order state as per all the messages for that order.

There are 3 message types:

* **Add**
* **Cancelled**
* **Executed**

Endpoint: `/om2.exchange.market/orderBookDepth`

Note: No subscription parameters are required to subscribe the stream. 

**Add Order Message** indicates that a new order has been accepted by the exchange and was added to the
book. 

Field|Description
---|---
messageType| **Add**
orderId|Exchange OrderId
eventTimestamp|Event timestamp (in microseconds)
side|Buy / Sell
instrument|Instrument symbol
quantity|Order quantity 
price|Order price

**Order Executed Message** indicates that an order on the book is matched with a new coming order in whole or in part. It is possible to receive several Order Executed Messages for a single orderId.  

Field|Description
---|---
messageType|**Executed** 
mathchId|Unique ID for the match
eventTimestamp|Event timestamp (in microseconds)
makerOrderId|Resting `orderId`
takerOrderId|Aggressive `orderId`
instrument|Instrument symbol
executedQuantity|Matched quantity
executedPrice|Matched price (maker order price). 

**Order Cancel Message** indicates that an order on the book is being cancelled. 
This message also sent in case of market order that was not fully filled.  

Field|Description
---|---
messageType|**Cancelled** 
orderId|Exchange `OrderId`
eventTimestamp|Event timestamp (in microseconds)
instrument|Instrument symbol
cancelledQuantity|Order cancelled quantity
 

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
               "quantity": 1.12356,
               "price": 6500.4321
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
               "executedQuantity": 50.12,
               "executedPrice": 180.34,
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
               "canceledQuantity": 50.12
         }
}  
```

</details>

