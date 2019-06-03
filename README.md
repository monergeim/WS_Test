# WS_Test
cxvcxvcxv
xcvcxvcxvcxv


# Trading API
## placeOrder

The placeOrder API lets you place a new order into exchange. 

If you send a valid order, you should receive a response with "Pending" status, this means that order was validated and accepted. The response contains the exchange orderId which should be stored and used for later status changes, notified via the orderBookDepth stream. 

Non-valid order will be responded with the error message. 
In case of timeout TBD

Order types: 
**Limit**: Order is being sent with a specific price. A buy order will be executed with the requested price or lower price a sell order will be executed with the requested price or higher price. 
**Market**: Order is attempted filled at the best price in the market. Partial filled is allowed. In case not all the amount can be filled, the residual amount will be cancelled.

Endpoint: `/om2.exchange.orders/placeOrder`

**Request**

Parameter|	Type|	Description
-|-|-
userId|	String|	Reference data only which is not being used in the exchange
OrderType|	Enum|	Order type Limit or Market
OrderSide|	Enum|	Order side Buy or Sell
instrument|	String|	Instrument identifier
quantity|	Long|	Order quantity
price `optional`|	Long|	The price of the Limit order. For Market order this will not be sent.

**Response**

Parameter|	Type|	Description
-|-|-
orderId|String|	Exchange Order ID
orderStatus|String|Order status: Pending

**Error Codes**

Code|Description
-|-
1000	|Not all the required fields were sent
1001	|Invalid data was sent. More details are shown in the error message, for example "Wrong side"

### Samples:
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
