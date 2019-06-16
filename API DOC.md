---


---

<h2 id="table-of-contents">Table of Contents</h2>
<ul>
<li><a href="#Introduction">Introduction</a>
<ul>
<li><a href="#GeneralSpecs">Request and Response General Specifications</a></li>
</ul>
</li>
<li><a href="#TradingAPI">Trading API</a>
<ul>
<li><a href="#placeOrder">placeOrder</a></li>
<li><a href="#cancelOrder">cancelOrder</a></li>
</ul>
</li>
<li><a href="#MarketDataAPI">Market Data API</a>
<ul>
<li><a href="#orderBookDepth">orderBookDepth</a></li>
</ul>
</li>
</ul>
<h1 id="introduction">Introduction</h1>
<p>The OM2 exchange API offers real time market data as well as the ability to trade with the exchange.</p>
<p>The underlying technology used is <a href="http://scalecube.io/">Scalecube</a> a Novel Open-source application-platform that addresses inherent challenges involved in the development of distributed computing.</p>
<p>Exchange API protocol is WebSocket.<br>
Any request body should be a valid <code>JSON</code>, non valid <code>JSON</code> objects will be ignored.</p>
<p>Within the valid JSON please be aware that:</p>
<ul>
<li>System ignores any additional parameter that was sent on request body but was not specified in this document.</li>
<li>In case of multiple parameters sent with different values, system will always use the last value provided.</li>
</ul>
<p><strong>Sandbox</strong></p>
<ul>
<li>Navigate to <a href="http://scalecube.io/api-sandbox/app/index.html">Scalecube Sandbox</a></li>
<li>Click on the Settings button then set Sandbox endpoint <code>wss://master-ws.genesis.om2.com</code>, click on the Connect button</li>
<li>Enter the message body in text area and click Send.</li>
<li>Note: You can import few samples by clicking on Import icon and paste this sample <a href="https://raw.githubusercontent.com/jivygroup/api-sandbox-data/master/basicTrade">Json file</a> url</li>
</ul>
<h2 id="a-namegeneralspecsarequest-and-response-general-specifications"><a></a>Request and Response General Specifications</h2>
<p><strong>Request Parameters</strong></p>

<table>
<thead>
<tr>
<th>Parameter</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>q</td>
<td>String</td>
<td>qualifier, contains the method for the specific API call.</td>
</tr>
<tr>
<td>sid</td>
<td>Int</td>
<td>stream identifier, for each WebSocket connection this is a unique identifier for the API call. Please note that as long as the sid was not ended (other by exchange or by consumer) this can’t be used again on the same WebSocket connection</td>
</tr>
<tr>
<td>d</td>
<td>Json</td>
<td>data object, contain the request body</td>
</tr>
</tbody>
</table><pre class=" language-javascript"><code class="prism  language-javascript"><span class="token punctuation">{</span> 
 <span class="token string">"q"</span><span class="token punctuation">:</span><span class="token string">"/om2.exchange.orders/placeOrder"</span><span class="token punctuation">,</span> 
 <span class="token string">"sid"</span><span class="token punctuation">:</span><span class="token number">1</span><span class="token punctuation">,</span> 
 <span class="token string">"d"</span><span class="token punctuation">:</span> 
   <span class="token punctuation">{</span> 
	 <span class="token string">"userId"</span><span class="token punctuation">:</span><span class="token string">"UserTest1"</span><span class="token punctuation">,</span> 
	 <span class="token string">"orderType"</span><span class="token punctuation">:</span><span class="token string">"Limit"</span><span class="token punctuation">,</span> 
	 <span class="token string">"side"</span><span class="token punctuation">:</span><span class="token string">"Buy"</span><span class="token punctuation">,</span> 
	 <span class="token string">"instrument"</span><span class="token punctuation">:</span><span class="token string">"FB"</span><span class="token punctuation">,</span> 
	 <span class="token string">"quantity"</span><span class="token punctuation">:</span><span class="token number">1.3</span><span class="token punctuation">,</span> 
	 <span class="token string">"price"</span><span class="token punctuation">:</span><span class="token number">170.11</span>
   <span class="token punctuation">}</span> 
<span class="token punctuation">}</span> 
</code></pre>
<p><strong>Success Response</strong><br>
The response will always include the <code>q</code> and <code>sid</code> parameters from request and a <code>d</code> parameter with the response body.</p>
<pre class=" language-javascript"><code class="prism  language-javascript"><span class="token punctuation">{</span> 
   <span class="token string">"q"</span><span class="token punctuation">:</span><span class="token string">"/om2.exchange.orders/placeOrder"</span><span class="token punctuation">,</span> 
   <span class="token string">"sid"</span><span class="token punctuation">:</span><span class="token number">1</span><span class="token punctuation">,</span> 
   <span class="token string">"d"</span><span class="token punctuation">:</span> 
     <span class="token punctuation">{</span> 
       <span class="token string">"orderId"</span><span class="token punctuation">:</span><span class="token string">"f633782c-babf-4bc3-80b1-e90c49ba00ce"</span><span class="token punctuation">,</span> 
       <span class="token string">"orderStatus"</span><span class="token punctuation">:</span><span class="token string">"Pending"</span> 
     <span class="token punctuation">}</span> 
<span class="token punctuation">}</span> 
</code></pre>
<p>In case of short living stream (i.e. trading action), additional response will be sent upon stream closure with success, this message will include <code>sid</code> with request sid and <code>sig:1</code>.</p>
<pre class=" language-javascript"><code class="prism  language-javascript"><span class="token punctuation">{</span> 
  <span class="token string">"sig"</span><span class="token punctuation">:</span><span class="token number">1</span><span class="token punctuation">,</span> 
  <span class="token string">"sid"</span><span class="token punctuation">:</span><span class="token number">1</span> 
<span class="token punctuation">}</span> 
</code></pre>
<p><strong>Response With Failure</strong><br>
The response will always include the below parameters:</p>

<table>
<thead>
<tr>
<th>Parameter</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>sig</td>
<td>signal will be equal to “2”</td>
</tr>
<tr>
<td>q</td>
<td>always <code>/io.scalecube.services.error/XXX</code>, the XXX value is internal and should be ignored</td>
</tr>
<tr>
<td>sid</td>
<td>from request</td>
</tr>
<tr>
<td>d</td>
<td>data that contain errorCode and errorMessage. Those are the error code and message to consider</td>
</tr>
</tbody>
</table><pre class=" language-javascript"><code class="prism  language-javascript"><span class="token punctuation">{</span> 
   <span class="token string">"sig"</span><span class="token punctuation">:</span><span class="token number">2</span><span class="token punctuation">,</span> 
   <span class="token string">"q"</span><span class="token punctuation">:</span><span class="token string">"/io.scalecube.services.error/500"</span><span class="token punctuation">,</span> 
   <span class="token string">"sid"</span><span class="token punctuation">:</span><span class="token number">1</span><span class="token punctuation">,</span> 
   <span class="token string">"d"</span><span class="token punctuation">:</span> 
     <span class="token punctuation">{</span> 
       <span class="token string">"errorCode"</span><span class="token punctuation">:</span><span class="token number">1000</span><span class="token punctuation">,</span> 
       <span class="token string">"errorMessage"</span><span class="token punctuation">:</span><span class="token string">"Unknown order type: SL"</span> 
     <span class="token punctuation">}</span> 
<span class="token punctuation">}</span> 
</code></pre>
<p><strong>Stream Closure</strong><br>
In order to close active stream need to send a message with <code>sig:3</code> and <code>sid</code> with the stream id to be closed.</p>
<pre class=" language-javascript"><code class="prism  language-javascript"><span class="token punctuation">{</span> 
    <span class="token string">"sig"</span><span class="token punctuation">:</span><span class="token number">3</span><span class="token punctuation">,</span> 
    <span class="token string">"sid"</span><span class="token punctuation">:</span><span class="token number">30000</span> 
<span class="token punctuation">}</span> 
</code></pre>
<p>sig parameter summary table:</p>

<table>
<thead>
<tr>
<th>sig</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>1</td>
<td>Stream closed with success</td>
</tr>
<tr>
<td>2</td>
<td>Stream closed with failure</td>
</tr>
<tr>
<td>3</td>
<td>Stream was closed due to consumer request</td>
</tr>
</tbody>
</table><h1 id="a-nametradingapiatrading-api"><a></a>Trading API</h1>
<h2 id="placeorder">placeOrder</h2>
<p>The placeOrder API lets you place a new order into exchange.</p>
<p>If you send a valid order, you should receive a response with “Pending” status, this means that order was validated and accepted. The response contains the exchange orderId which should be stored and used for later status changes, notified via the orderBookDepth stream.</p>
<p>Non-valid order will be responded with the error message.<br>
In case of timeout TBD</p>
<p>Order types:</p>
<ul>
<li><strong>Limit</strong>: Order is being sent with a specific price. A buy order will be executed with the requested price or lower price a sell order will be executed with the requested price or higher price.</li>
<li><strong>Market</strong>: Order is attempted filled at the best price in the market. Partial filled is allowed. In case not all the amount can be filled, the residual amount will be cancelled.</li>
</ul>
<p>Endpoint: <code>/om2.exchange.orders/placeOrder</code></p>
<p><strong>Request Parameters</strong></p>

<table>
<thead>
<tr>
<th>Parameter</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>userId</td>
<td>String</td>
<td>Reference data only which is not being used in the exchange</td>
</tr>
<tr>
<td>OrderType</td>
<td>Enum</td>
<td>Order type Limit or Market</td>
</tr>
<tr>
<td>OrderSide</td>
<td>Enum</td>
<td>Order side Buy or Sell</td>
</tr>
<tr>
<td>instrument</td>
<td>String</td>
<td>Instrument identifier</td>
</tr>
<tr>
<td>quantity</td>
<td>Decimal</td>
<td>Order quantity</td>
</tr>
<tr>
<td>price <code>optional</code></td>
<td>Decimal</td>
<td>The price of the Limit order. For Market order this will not be sent.</td>
</tr>
</tbody>
</table><p><strong>Response Parameters</strong></p>

<table>
<thead>
<tr>
<th>Parameter</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>orderId</td>
<td>String</td>
<td>Exchange Order ID</td>
</tr>
<tr>
<td>orderStatus</td>
<td>String</td>
<td>Order status: Pending</td>
</tr>
</tbody>
</table><p><strong>Error Codes</strong></p>

<table>
<thead>
<tr>
<th>Code</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>1000</td>
<td>Not all the required fields were sent</td>
</tr>
<tr>
<td>1001</td>
<td>Invalid data was sent. More details are shown in the error message, for example “Wrong side”</td>
</tr>
</tbody>
</table>
<b>Samples</b>  
<p><strong>Request</strong></p>
<pre class=" language-javascript"><code class="prism  language-javascript"><span class="token punctuation">{</span>
	<span class="token string">"q"</span><span class="token punctuation">:</span><span class="token string">"/om2.exchange.orders/placeOrder"</span><span class="token punctuation">,</span>
	<span class="token string">"sid"</span><span class="token punctuation">:</span> <span class="token number">1</span><span class="token punctuation">,</span>
	<span class="token string">"d"</span><span class="token punctuation">:</span><span class="token punctuation">{</span>
		   <span class="token string">"userId"</span><span class="token punctuation">:</span> <span class="token string">"1"</span><span class="token punctuation">,</span>
		   <span class="token string">"orderType"</span><span class="token punctuation">:</span> <span class="token string">"Limit"</span><span class="token punctuation">,</span>
		   <span class="token string">"side"</span><span class="token punctuation">:</span> <span class="token string">"Buy"</span><span class="token punctuation">,</span>
		   <span class="token string">"instrument"</span><span class="token punctuation">:</span> <span class="token string">"BTC"</span><span class="token punctuation">,</span>
		   <span class="token string">"quantity"</span><span class="token punctuation">:</span> <span class="token number">123</span><span class="token punctuation">,</span>
		   <span class="token string">"price"</span><span class="token punctuation">:</span> <span class="token number">100.555</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre>
<p><strong>Success Response</strong></p>
<pre class=" language-javascript"><code class="prism  language-javascript"><span class="token punctuation">{</span>
	<span class="token string">"q"</span><span class="token punctuation">:</span><span class="token string">"/om2.exchange.orders/placeOrder"</span><span class="token punctuation">,</span>
	<span class="token string">"sid"</span><span class="token punctuation">:</span><span class="token number">1</span><span class="token punctuation">,</span>
	<span class="token string">"d"</span><span class="token punctuation">:</span><span class="token punctuation">{</span>
		   <span class="token string">"orderId"</span><span class="token punctuation">:</span><span class="token string">"aca1bdf9-60ec-497a-91e2-3c858a7e70a8"</span><span class="token punctuation">,</span>
		   <span class="token string">"orderStatus"</span><span class="token punctuation">:</span><span class="token string">"Pending"</span>
	   <span class="token punctuation">}</span>

<span class="token punctuation">}</span>
</code></pre>
<p><strong>Failure Response</strong></p>
<pre class=" language-javascript"><code class="prism  language-javascript"><span class="token punctuation">{</span>
	<span class="token string">"sig"</span><span class="token punctuation">:</span><span class="token number">2</span><span class="token punctuation">,</span>
	<span class="token string">"q"</span><span class="token punctuation">:</span><span class="token string">"/io.scalecube.services.error/400"</span><span class="token punctuation">,</span>
	<span class="token string">"sid"</span><span class="token punctuation">:</span><span class="token number">1</span><span class="token punctuation">,</span>
	<span class="token string">"d"</span><span class="token punctuation">:</span><span class="token punctuation">{</span>
		   <span class="token string">"errorCode"</span><span class="token punctuation">:</span><span class="token number">1001</span><span class="token punctuation">,</span>
		   <span class="token string">"errorMessage"</span><span class="token punctuation">:</span><span class="token string">"Limit order must contain a positive price"</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre>

<h2 id="cancelorder">cancelOrder</h2>
<p>The cancelOrder API is used to request that an order be cancelled.</p>
<p>If you send a valid order to cancel, you should receive a response that confirms that order was cancelled. This means that remaining open quantity of the order was cancelled.</p>
<p>Non-valid cancel order will be responded with the error message.</p>
<p>Endpoint: <code>/om2.exchange.orders/cancelOrder</code></p>
<p><strong>Request Parameters</strong></p>

<table>
<thead>
<tr>
<th>Parameter</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>userId</td>
<td>String</td>
<td>Reference data only which is not being used in the exchange</td>
</tr>
<tr>
<td>orderId</td>
<td>String</td>
<td>Exchange Order ID</td>
</tr>
<tr>
<td>instrument</td>
<td>String</td>
<td>Instrument identifier</td>
</tr>
</tbody>
</table><p><strong>Response Parameters</strong></p>

<table>
<thead>
<tr>
<th>Parameter</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>orderId</td>
<td>String</td>
<td>Exchange Order ID</td>
</tr>
</tbody>
</table><p><strong>Error Codes</strong></p>

<table>
<thead>
<tr>
<th>Code</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>1100</td>
<td>System can’t find open order with that ID for the specified instrument</td>
</tr>
<tr>
<td>1103</td>
<td>Not all the required fields were sent</td>
</tr>
</tbody>
</table>
<b>Samples</b>  
<p><strong>Request</strong></p>
<pre class=" language-javascript"><code class="prism  language-javascript"><span class="token punctuation">{</span>
        <span class="token string">"q"</span><span class="token punctuation">:</span><span class="token string">"/om2.exchange.orders/cancelOrder"</span><span class="token punctuation">,</span>
        <span class="token string">"sid"</span><span class="token punctuation">:</span> <span class="token number">1</span><span class="token punctuation">,</span>
        <span class="token string">"d"</span><span class="token punctuation">:</span><span class="token punctuation">{</span>
               <span class="token string">"orderId"</span><span class="token punctuation">:</span><span class="token string">"aca1bdf9-60ec-497a-91e2-3c858a7e70a8"</span><span class="token punctuation">,</span>
               <span class="token string">"userId"</span><span class="token punctuation">:</span> <span class="token string">"1"</span><span class="token punctuation">,</span>
               <span class="token string">"instrument"</span><span class="token punctuation">:</span> <span class="token string">"BTC"</span>
        <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre>
<p><strong>Success Response</strong></p>
<pre class=" language-javascript"><code class="prism  language-javascript"><span class="token punctuation">{</span>
        <span class="token string">"q"</span><span class="token punctuation">:</span><span class="token string">"/om2.exchange.orders/cancelOrder"</span><span class="token punctuation">,</span>
        <span class="token string">"sid"</span><span class="token punctuation">:</span><span class="token number">1</span><span class="token punctuation">,</span>
        <span class="token string">"d"</span><span class="token punctuation">:</span><span class="token punctuation">{</span>
               <span class="token string">"orderId"</span><span class="token punctuation">:</span><span class="token string">"aca1bdf9-60ec-497a-91e2-3c858a7e70a8"</span>
        <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre>
<p><strong>Failure Response</strong></p>
<pre class=" language-javascript"><code class="prism  language-javascript"><span class="token punctuation">{</span>
        <span class="token string">"sig"</span><span class="token punctuation">:</span><span class="token number">2</span><span class="token punctuation">,</span>
        <span class="token string">"q"</span><span class="token punctuation">:</span><span class="token string">"/io.scalecube.services.error/500"</span><span class="token punctuation">,</span>
        <span class="token string">"sid"</span><span class="token punctuation">:</span><span class="token number">1</span><span class="token punctuation">,</span>
        <span class="token string">"d"</span><span class="token punctuation">:</span><span class="token punctuation">{</span>
               <span class="token string">"errorCode"</span><span class="token punctuation">:</span><span class="token number">1100</span><span class="token punctuation">,</span>
               <span class="token string">"errorMessage"</span><span class="token punctuation">:</span><span class="token string">"orderId not found"</span>
        <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre>

<h1 id="a-namemarketdataapiamarket-data-api"><a></a>Market Data API</h1>
<h2 id="orderbookdepth">orderBookDepth</h2>
<p>The <code>orderBookDepth</code> stream provide the full order book depth data.<br>
This stream is public and anonymous, only the broker that placed the order knows the order origin. (As the orderId was provided within <code>placeOrder</code> response).</p>
<p>The <code>orderBookDepth</code> publish only raw data without any aggregation, hence in order to determine the current state of an order, the subscriber needs to maintain the updated order state as per all the messages for that order.</p>
<p>There are 3 message types:</p>
<ul>
<li><strong>Add</strong></li>
<li><strong>Cancelled</strong></li>
<li><strong>Executed</strong></li>
</ul>
<p>Endpoint: <code>/om2.exchange.market/orderBookDepth</code></p>
<p>Note: No subscription parameters are required to subscribe the stream.</p>
<p><strong>Add Order Message</strong> indicates that a new order has been accepted by the exchange and was added to the<br>
book.</p>

<table>
<thead>
<tr>
<th>Field</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>messageType</td>
<td><strong>Add</strong> - Add order</td>
</tr>
<tr>
<td>orderId</td>
<td>Exchange OrderId</td>
</tr>
<tr>
<td>eventTimestamp</td>
<td>Event timestamp (in microseconds)</td>
</tr>
<tr>
<td>side</td>
<td>Buy / Sell</td>
</tr>
<tr>
<td>instrument</td>
<td>Instrument symbol</td>
</tr>
<tr>
<td>quantity</td>
<td>Order quantity</td>
</tr>
<tr>
<td>price</td>
<td>Order price</td>
</tr>
</tbody>
</table><p><strong>Order Executed Message</strong> indicates that an order on the book is executed in whole or in part. It is possible to receive several Order Executed Messages for a single orderId.</p>

<table>
<thead>
<tr>
<th>Field</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>messageType</td>
<td><strong>Executed</strong> - Active order on book was matched with a new coming order.</td>
</tr>
<tr>
<td>mathchId</td>
<td>Unique ID for the match</td>
</tr>
<tr>
<td>eventTimestamp</td>
<td>Event timestamp (in microseconds)</td>
</tr>
<tr>
<td>makerOrderId</td>
<td>Resting orderId</td>
</tr>
<tr>
<td>takerOrderId</td>
<td>Aggressive orderId</td>
</tr>
<tr>
<td>instrument</td>
<td>Instrument symbol</td>
</tr>
<tr>
<td>executedQuantity</td>
<td>Matched quantity</td>
</tr>
<tr>
<td>executedPrice</td>
<td>Matched price (maker order price).</td>
</tr>
</tbody>
</table><p><strong>Order Cancel Message</strong> indicates that an order on the book is being cancelled.<br>
This message also sent in case of market order that was not fully filled.</p>

<table>
<thead>
<tr>
<th>Field</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>messageType</td>
<td><strong>Cancelled</strong> - Remaining quantity of the order was cancelled.</td>
</tr>
<tr>
<td>orderId</td>
<td>Exchange OrderId</td>
</tr>
<tr>
<td>eventTimestamp</td>
<td>Event timestamp (in microseconds)</td>
</tr>
<tr>
<td>instrument</td>
<td>Instrument symbol</td>
</tr>
<tr>
<td>cancelledQuantity</td>
<td>Order cancelled quantity</td>
</tr>
</tbody>
</table>
<b>Samples</b>  
<p><strong>Subscription</strong></p>
<pre class=" language-javascript"><code class="prism  language-javascript"><span class="token punctuation">{</span>
	<span class="token string">"q"</span><span class="token punctuation">:</span><span class="token string">"/om2.exchange.market/orderBookDepth"</span><span class="token punctuation">,</span>
        <span class="token string">"sid"</span><span class="token punctuation">:</span> <span class="token number">1</span><span class="token punctuation">,</span>
        <span class="token string">"d"</span><span class="token punctuation">:</span><span class="token punctuation">{</span><span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre>
<p><strong>Add Order Message</strong></p>
<pre class=" language-javascript"><code class="prism  language-javascript"><span class="token punctuation">{</span>
        <span class="token string">"q"</span><span class="token punctuation">:</span><span class="token string">"/om2.exchange.market/orderBookDepth"</span><span class="token punctuation">,</span>
        <span class="token string">"sid"</span><span class="token punctuation">:</span><span class="token number">1</span><span class="token punctuation">,</span>
        <span class="token string">"d"</span><span class="token punctuation">:</span><span class="token punctuation">{</span>
               <span class="token string">"messageType"</span><span class="token punctuation">:</span> <span class="token string">"Add"</span><span class="token punctuation">,</span>
               <span class="token string">"eventTimestamp"</span><span class="token punctuation">:</span> <span class="token number">1559833699198</span><span class="token punctuation">,</span>
               <span class="token string">"instrument"</span><span class="token punctuation">:</span> <span class="token string">"BTCUSD"</span><span class="token punctuation">,</span>
               <span class="token string">"orderId"</span><span class="token punctuation">:</span> <span class="token string">"92f9b6eb-3c73-4192-9896-9db81b1045e5"</span><span class="token punctuation">,</span>
               <span class="token string">"side"</span><span class="token punctuation">:</span> <span class="token string">"Buy"</span><span class="token punctuation">,</span>
               <span class="token string">"quantity"</span><span class="token punctuation">:</span> <span class="token number">1.12356</span><span class="token punctuation">,</span>
               <span class="token string">"price"</span><span class="token punctuation">:</span> <span class="token number">6500.4321</span>
    	   <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre>
<p><strong>Order Executed Message</strong></p>
<pre class=" language-javascript"><code class="prism  language-javascript">
<span class="token punctuation">{</span>      
        <span class="token string">"q"</span><span class="token punctuation">:</span><span class="token string">"/om2.exchange.market/orderBookDepth"</span><span class="token punctuation">,</span>
        <span class="token string">"sid"</span><span class="token punctuation">:</span><span class="token number">1</span><span class="token punctuation">,</span>
        <span class="token string">"d"</span><span class="token punctuation">:</span><span class="token punctuation">{</span>
               <span class="token string">"messageType"</span><span class="token punctuation">:</span> <span class="token string">"Executed"</span><span class="token punctuation">,</span>
               <span class="token string">"eventTimestamp"</span><span class="token punctuation">:</span> <span class="token number">1559833871143</span><span class="token punctuation">,</span>
               <span class="token string">"instrument"</span><span class="token punctuation">:</span> <span class="token string">"FB"</span><span class="token punctuation">,</span>
               <span class="token string">"matchId"</span><span class="token punctuation">:</span> <span class="token string">"1235fty-3c98-8888-9896-9db81b1697"</span><span class="token punctuation">,</span>
               <span class="token string">"makerOrderId"</span><span class="token punctuation">:</span> <span class="token string">"92f9b6eb-3c73-4192-9896-9db81b1045e5"</span><span class="token punctuation">,</span>
               <span class="token string">"takerOrderId"</span><span class="token punctuation">:</span> <span class="token string">"825b5e62-7e25-411a-a3ce-9c3697aaec05"</span><span class="token punctuation">,</span>
               <span class="token string">"executedQuantity"</span><span class="token punctuation">:</span> <span class="token number">50.12</span><span class="token punctuation">,</span>
               <span class="token string">"executedPrice"</span><span class="token punctuation">:</span> <span class="token number">180.34</span><span class="token punctuation">,</span>
         <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre>
<p><strong>Order Cancel Message</strong></p>
<pre class=" language-javascript"><code class="prism  language-javascript">
<span class="token punctuation">{</span>   
        <span class="token string">"q"</span><span class="token punctuation">:</span><span class="token string">"/om2.exchange.market/orderBookDepth"</span><span class="token punctuation">,</span>
        <span class="token string">"sid"</span><span class="token punctuation">:</span><span class="token number">1</span><span class="token punctuation">,</span>
        <span class="token string">"d"</span><span class="token punctuation">:</span><span class="token punctuation">{</span>
               <span class="token string">"messageType"</span><span class="token punctuation">:</span> <span class="token string">"Cancelled"</span><span class="token punctuation">,</span>
               <span class="token string">"eventTimestamp"</span><span class="token punctuation">:</span> <span class="token number">1559834204805</span><span class="token punctuation">,</span>
               <span class="token string">"instrument"</span><span class="token punctuation">:</span> <span class="token string">"GOOG"</span><span class="token punctuation">,</span>
               <span class="token string">"orderId"</span><span class="token punctuation">:</span> <span class="token string">"2729fb31-f5b5-4458-9a8d-626230f2879e"</span><span class="token punctuation">,</span>
               <span class="token string">"canceledQuantity"</span><span class="token punctuation">:</span> <span class="token number">50.12</span>
         <span class="token punctuation">}</span>
<span class="token punctuation">}</span>  
</code></pre>


