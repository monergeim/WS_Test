var wsUri = "wss://master-ws.genesis.om2.com",
    wsUriDev = "wss://develop-ws.genesis.om2.com",
	ConfigurationUri = "wss://configuration-service-ws.genesis.om2.com";

var output, outputDetails, outputDetailsOffline, data, lines, Message,
    preHeader = document.createElement("p1"),
    preNice = document.createElement("pN"),
    Instrument = "16562665EC17CDF08E97",
    DevInstrument = "1",
    CurrentInstrument = Instrument,
    NeedtoReconnect = true,
    WriteResponse = false,
    book = [],
    book1 = [],
    MarketRates = [],
	orderEventsTable = [],
    ManageBook = false,
    NeedtoDrawBook = false,
    NeedtoDrawRate = false,
    DrawRateChart = false,
	NeedtoDrawOrderEvents = false,
	DrawOrderEvents = false,

    OrderID, d = new Date(),
    timestosend,
    FileContent = "",//d.toISOString() + '\n',
    obj = "",
    myVar = setInterval(myTimer, 1000);

function init() {
    output = document.getElementById("output");
    outputDetails = document.getElementById("outputDetails");
    outputDetailsOffline = document.getElementById("outputDetailsOffline");

    RefreshInstrumentant();

    ManageBook = document.getElementById("ManageBook").checked;
    DrawRateChart = document.getElementById("DrawRateChart").checked;
    WriteResponse = document.getElementById("WritetoScr").checked;
	DrawOrderEvents = document.getElementById("DrawEventTable").checked;
    timestosend = document.getElementById("myTextareaMax").innerText;
    document.getElementById("myTextareaURL").style.visibility = "hidden";

	
    document.getElementById("dynamicinstrumentid").addEventListener("input", function sett() {
        RefreshInstrumentant();
        reDrawBook();
		reDrawRate();
    }, false);

    document.getElementById("ManageBook").addEventListener("input", function() {
        ManageBook = document.getElementById("ManageBook").checked;
        reDrawBook();
    }, false);

    document.getElementById("DrawRateChart").addEventListener("input", function() {
        DrawRateChart = document.getElementById("DrawRateChart").checked;
        reDrawRate();
    }, false);

    document.getElementById("WritetoScr").addEventListener("input", function() {
        WriteResponse = document.getElementById("WritetoScr").checked;

    }, false);

	document.getElementById("DrawEventTable").addEventListener("input", function() {
        DrawOrderEvents = document.getElementById("DrawEventTable").checked;
    }, false);

    document.getElementById("myTextareaMax").addEventListener("input", function() {
        timestosend = document.getElementById("myTextareaMax").innerText;
    }, false);
   
   testWebSocket();
}


function myTimer() {
    if (NeedtoDrawBook) DrawBook();
    if (NeedtoDrawRate) DrawRateChartFunc();
	if (NeedtoDrawOrderEvents) DrawOrderEventsDrawing();

	 if (WriteResponse && FileContent.length >0 ) {
		writeToScreenNice(FileContent);
		FileContent="";
	 }
	//doSend('{"q": "/om2.exchange.orders/placeOrder","sid": 1,"d": {"Dummy Ping":"D"}}');	
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function reDrawBook() {
    book1 = [];
   if (ManageBook){	   
		doSend('{"sid": 30000,"sig": 3}');
		doSend(orderEvents);
   }
}
function reDrawRate() {
    MarketRates = [];
    if (DrawRateChart){
		doSend('{"sid": 600,"sig": 3}');
		doSend(Fills);
	}
}

function RefreshInstrumentant() {
    CurrentInstrument = document.getElementById("dynamicinstrumentid").innerText;
    PlaceOrdersMessage();
    StreamsMessage();
}


function OpenURL() {
    if (document.getElementById("SelectEnv").value == "Dev") {
        document.getElementById("dynamicinstrumentid").innerText = DevInstrument;
        CurrentUri = wsUriDev;
    } else if (document.getElementById("SelectEnv").value == "Master") {
        document.getElementById("dynamicinstrumentid").innerText = Instrument;
        CurrentUri = wsUri;

    } else if (document.getElementById("SelectEnv").value == "Other") {
        document.getElementById("myTextareaURL").style.visibility = "visible";
		CurrentUri = document.getElementById("myTextareaURL").innerText;
        document.getElementById("dynamicinstrumentid").innerText = DevInstrument;
    }else if (document.getElementById("SelectEnv").value == "Configuration") {
        CurrentUri = document.getElementById("myTextareaURL").innerText;
		CurrentUri = ConfigurationUri;
		ConfigurationFetchAllMessage();
		document.getElementById("myTextarea").value=ConfigurationFetchAll;
     }

    RefreshInstrumentant();
    reDrawBook();
	reDrawRate();
}

function ChangeMessage() {
switch (document.getElementById("SelectMessage").value) {
        case 'Place Orders':
            PlaceOrders();
            break;
        case "Streams":
           Streams();
            break;
        case "Fill Order":
            FillFlow();
            break;
		case "Send Cancellation":
            CancelFlow();
            break;
    }
}

async function CancelFlow() {
    WriteResponse = true;
    data = PlaceORders; //document.getElementById("myTextarea").value;
    lines = data.split(';');
    doSend(lines[0]);
     await sleep(1000);
	CancelOrdersMessage();
    doSend(CancelOrder);
}

function Send() {
    data = document.getElementById("myTextarea").value;
    lines = data.split(';');

    if (timestosend == 1) {
        for (var i = 0; i < lines.length; i++) {
            //console.log (lines[i]);
            doSend(lines[i]);
        }
    } else {
        var newLines = "";
        for (var j = 0; j < timestosend; j++) {
            newLines = newLines + data + ';';
        }
        newLines = newLines.split(';')
        for (var i = 0; i < newLines.length - 1; i++) {
            doSend(newLines[i].replace('"sid": ', '"sid": 1' + i));
        }
    }
}

function Clear() {
    preNice.innerHTML = "";
    FileContent = "";
}

function Disconnect() {
    NeedtoReconnect = false;
    book1 = [];
    writeToScreenHeader('Disconnecting ' + CurrentUri);
    websocket.close();
}

function ReConnect() {
    NeedtoReconnect = true;
    testWebSocket();
}

async function testWebSocket() {
    if (document.getElementById("SelectEnv").value == "Dev") CurrentUri = wsUriDev;
    else if (document.getElementById("SelectEnv").value == "Master") CurrentUri = wsUri;
    else if (document.getElementById("SelectEnv").value == "Other") CurrentUri = document.getElementById("myTextareaURL").innerText;

    writeToScreenHeader('Connecting ' + CurrentUri);
    try {
        websocket = new WebSocket(CurrentUri);


        websocket.onopen = function(evt) {
            onOpen(evt)
        };
        websocket.onclose = function(evt) {
            onClose(evt)
        };
        websocket.onmessage = function(evt) {
            onMessage(evt)
        };
        websocket.onerror = function(evt) {
            onError(evt)
        };
    } catch (err) {
        console.log(err.message);

    }
}

async function doSend(message) { //d=new Date();
if (message.length<=1) return;
    try {
        JSON.parse(message);
        websocket.send(message);
        if (WriteResponse) writeToScreenNice(message, "#878787");
        else FileContent = FileContent + "    " + ":" + message + '\n';
    } catch (err) {
		
	d = new Date();
    writeToScreenNice(d.toISOString() + ' ' +err.message, "#C93F3B");
    }
}

async function onMessage(evt) {
    dt = new Date(evt.timeStamp + d.getTime());
    obj = JSON.parse(evt.data);
    if (WriteResponse) {
			if (evt.data.includes("error") == true) color = "#C93F3B"
			else if (evt.data.includes("sig") == true) color = "#D2C057"
			else color = "#5DB0CC"
		
    d = new Date();
	FileContent =   '<span style="color: ' + color + ';">' + d.toISOString() + ' ' + evt.data + '</span>' + '<br>' +FileContent;
			
	}
    else FileContent = FileContent + evt.timeStamp + ":" + evt.data + '\n';
    //console.log(JSON.stringify(evt.data));
    switch (obj.q) {
        case '/om2.exchange.orders/placeOrder':
            OrderID = obj.d.orderId;
            break;
     /*   case "/om2.exchange.marketdata/orderBookEvents":
            if (ManageBook) ManageBookFunc();
            break;
        case "/om2.exchange.trade/orderFillInfo":
            if (DrawRateChart) DrawChartFunc();*/
            break;
		case "/om2.exchange.orders/orderEvents":
			if (ManageBook) ManageBookFunc();
			if (DrawOrderEvents)	DrawOrderEventsFunc();
            break;
    }
}

function onOpen(evt) {
    writeToScreenHeader('CONNECTED!', 'LIME');

	if (ManageBook) {
        book1 = [];
        doSend(orderEvents);
    }

    if (DrawRateChart) {
        doSend(orderEvents);
    }
}

async function onClose(evt) {
    writeToScreenHeader('Disconnected', 'red');
    console.log(evt);
    if (NeedtoReconnect == true) {
        testWebSocket();
    }
}

function onError(evt) {
	    d = new Date();
		writeToScreenNice(d.toISOString() + ' ' +evt.data, "red");
    console.log(evt);
}

function setupDownloadLink() {
    console.log(FileContent)
}
async function writeToScreenHeader(message, color) {
    var da = new Date();
    preHeader.style.wordWrap = "break-word";
    preHeader.innerHTML = da.toISOString() + ': ' + '<span style="color: ' + color + ';">' + message + '</span>' + '<BR>' + preHeader.innerHTML;
    output.appendChild(preHeader);
}

async function writeToScreenNice(message, color) {
    if (color == null)  preNice.innerHTML =  message + preNice.innerHTML;
	else    {
		d = new Date();
		preNice.innerHTML = '<span style="color: ' + color + ';">'  + d.toISOString() + ' ' + message + '</span>' + '<br>'+ preNice.innerHTML;	
	}
    outputDetails.appendChild(preNice);
}

window.addEventListener("load", init, false);
