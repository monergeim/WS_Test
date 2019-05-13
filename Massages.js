var PlaceORders,CancelOrder, FillORders,  orderEvents,    ConfigurationFetchAll;


function ConfigurationFetchAllMessage() {
 ConfigurationFetchAll = '{"q":"/configuration/entries","sid": 1,"d": {"token": "eyJraWQiOiJkOGE5MGZiOS01MDdjLTQzMmItYmU0OS00ODNkYjVlOGUwMDUiLCJhbGciOiJSUzI1NiJ9.eyJqdGkiOiJPUkctNDc1QThERUQyMjQ4RERGMUZEQTQiLCJpYXQiOjE1NTY1MzczODgsInN1YiI6Ik9SRy00NzVBOERFRDIyNDhEREYxRkRBNCIsImlzcyI6InNjYWxlY3ViZS5pbyIsImF1ZCI6Ik9SRy00NzVBOERFRDIyNDhEREYxRkRBNCIsInJvbGUiOiJPd25lciJ9.V7h9Gfq2waBwQasK9yYjw4vRzM-hYb9L0YTsClLmJ0bndFTL01WAf87KftNRuuujZABQmpkxFEUfcirlfARdcSYOR4HQb6DC9LQMPcX8XBSFX5b5QYXz62zCi3f1ZYKXNNwrPJLwDwFBED4S5-mutZrdyV16liObmXPh8BotOslfZOr7fmxG8S3tCrw1tUWOxZsJTiymengx69pGT7EvaEYxjcRGBCIEkaXXtukawziScyuEaFULjYax87jzmaSUbIASubE7ZeMLRm88f3XU1-X5BwBNvQRQQkyv4H30wwJiz7KKYs0zqoA3ijMixCJhaJvntte42tihSgCSWWQghA","repository": "DudiRepo1"  }};'+
 ' {"q":"/configuration/fetch","sid": 2,"d": {"token": "eyJraWQiOiJkOGE5MGZiOS01MDdjLTQzMmItYmU0OS00ODNkYjVlOGUwMDUiLCJhbGciOiJSUzI1NiJ9.eyJqdGkiOiJPUkctNDc1QThERUQyMjQ4RERGMUZEQTQiLCJpYXQiOjE1NTY1MzczODgsInN1YiI6Ik9SRy00NzVBOERFRDIyNDhEREYxRkRBNCIsImlzcyI6InNjYWxlY3ViZS5pbyIsImF1ZCI6Ik9SRy00NzVBOERFRDIyNDhEREYxRkRBNCIsInJvbGUiOiJPd25lciJ9.V7h9Gfq2waBwQasK9yYjw4vRzM-hYb9L0YTsClLmJ0bndFTL01WAf87KftNRuuujZABQmpkxFEUfcirlfARdcSYOR4HQb6DC9LQMPcX8XBSFX5b5QYXz62zCi3f1ZYKXNNwrPJLwDwFBED4S5-mutZrdyV16liObmXPh8BotOslfZOr7fmxG8S3tCrw1tUWOxZsJTiymengx69pGT7EvaEYxjcRGBCIEkaXXtukawziScyuEaFULjYax87jzmaSUbIASubE7ZeMLRm88f3XU1-X5BwBNvQRQQkyv4H30wwJiz7KKYs0zqoA3ijMixCJhaJvntte42tihSgCSWWQghA","repository": "DudiRepo1",        "key":"DudiKey2"  }};';
 
 }

 
 function PlaceOrdersMessage() {
    PlaceORders = '{"q": "/om2.exchange.orders/placeOrder","sid": 1,"d": {"userId": "1A","type": "Limit","side": "Buy","instrument":"' + CurrentInstrument + '","quantity": 2,"price": 1200}};' + '\n' +
        '{"q": "/om2.exchange.orders/placeOrder","sid": 2,"d": {"userId": "1A","type": "Limit","side": "Sell","instrument":"' + CurrentInstrument + '","quantity": 3,"price": 1201}};' + '\n' +
        '{"q": "/om2.exchange.orders/placeOrder","sid": 3,"d": {"userId": "1A","type": "Limit","side": "Buy","instrument":"' + CurrentInstrument + '","quantity": 4,"price": 1202}};' + '\n' +
        '{"q": "/om2.exchange.orders/placeOrder","sid": 4,"d": {"userId":"1A","type": "Limit","side": "Buy","instrument":"' + CurrentInstrument + '","quantity": 5,"price": 1203}};';
}

function PlaceOrders() {

    PlaceOrdersMessage();
     document.getElementById("myTextarea").value = PlaceORders;
}

function FillFlow() {
    CurrentInstrument = document.getElementById("dynamicinstrumentid").innerText;

     FillORders = '{"q": "/om2.exchange.orders/placeOrder","sid": 1,"d": {"userId": "1A","type": "Limit","side": "Buy","instrument":"' + CurrentInstrument + '","quantity": 2,"price": 1200}};' + '\n' +
        '{"q": "/om2.exchange.orders/placeOrder","sid": 2,"d": {"userId": "1A","type": "Limit","side": "Sell","instrument":"' + CurrentInstrument + '","quantity": 3,"price": 1200}}';
    document.getElementById("myTextarea").value = FillORders;
}

 function CancelOrdersMessage() {
	CancelOrder = '{"q":"/om2.exchange.orders/cancelOrder","sid":75,"d":{"userId":"1A","orderId":"' + OrderID + '"}}';
 }
 
function StreamsMessage() {
  	orderEvents   = '{"q": "/om2.exchange.orders/orderEvents","sid": 60000,"d":{}}';
  }


function Streams() {
     StreamsMessage();
	document.getElementById("myTextarea").value =  orderEvents + ';\n' ;
}