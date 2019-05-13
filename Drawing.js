function ManageBookFunc() {
    var len1 = book1.length;
    if (obj.d.type == "com.om2.exchange.market.service.api.OrderAddedEvent") {

        var order1 = [obj.d.price, ((obj.d.side == 'Sell') ? obj.d.quantity * -1 : obj.d.quantity), ((obj.d.side == 'Buy') ? 'Buy' : 'Sell')]
        if (len1 == 0) book1[len1] = order1;
        else {
            for (var j = 0; j < len1; j++) {
				//TODO 
                if ((book1[j][0] == obj.d.price) & (book1[j][1] == obj.d.quantity)) { //if registered to a stream more than once there is duplication on the book so here we filter the dups
                    return;
                }
            }
            book1[len1] = order1;
        }

    } 
	else if (obj.d.action == "com.om2.exchange.market.service.api.OrderExecutedEvent" || obj.d.action == "com.om2.exchange.market.service.api.OrderCanceledEvent"){
        for (var j = 0; j < book1.length; j++) {
            if (book1[j][0] == obj.d.price) {

			//TODO 
                book1[j][1] =  book1[j][1] + ((obj.d.side == 'Sell') ? obj.d.quantity * -1 : obj.d.quantity);
                book1[j][2] = ((obj.d.side == 'Buy') ? 'Buy' : 'Sell');
            }
        }
    }
    NeedtoDrawBook = true;

    //DrawBook();
}

function DrawBook() {
    google.charts.load('current', {
        'packages': ['table']
    });
    google.charts.setOnLoadCallback(drawTable);
}

function drawTable() {
    NeedtoDrawBook = false;
    var dataTable1 = new google.visualization.DataTable();
    dataTable1.addColumn('number', 'Price');
    dataTable1.addColumn('number', 'Quantity');
    dataTable1.addColumn('string', 'Buy/Sell');
    for (var j = 0; j < book1.length; j++) {
        dataTable1.addRows([book1[j]]);
    }

    var cssClassNames = {
        'headerRow': 'table-background',
        'tableRow': 'table-background',
        'oddTableRow': 'table-background',
        'selectedTableRow': 'table-background',
        'hoverTableRow': 'table-background',
        'headerCell': 'table-backgroundHead',
        'tableCell': 'table-background',
        'rowNumberCell': 'table-background'
    };

    var options = {
        'showRowNumber': false,
        'allowHtml': true,
        sortColumn: 0,
        sortAscending: false,
        'cssClassNames': cssClassNames
    };

    var formatter = new google.visualization.BarFormat({
        width: 80,
        colorPositive: 'green',
        drawZeroLine: true /*,showValue:false*/
    });
    formatter.format(dataTable1, 1); // Apply formatter to second column
    var table = new google.visualization.Table(document.getElementById('chart_div1'));
    table.draw(dataTable1, options);

}

function DrawRateChartFunc() {
    google.charts.load('current', {
        packages: ['corechart', 'line']
    });
    google.charts.setOnLoadCallback(drawBasic);
}

function drawBasic() {
    NeedtoDrawRate = false;

    var dataRates = new google.visualization.DataTable();
    dataRates.addColumn('timeofday', 'Time');
    dataRates.addColumn('number', 'Rate');

    for (var j = 0; j < MarketRates.length; j++) {
        dataRates.addRows([MarketRates[j]]);

        var options = {
            title: 'Market Rate',
            titleTextStyle: {
                color: 'gray'
            },
            hAxis: {
                title: 'Time',
                titleTextStyle: {
                    color: '#878787'
                },
                gridlines: {
                    color: '#878787',
                    count: 1
                }
            },
            vAxis: {
                title: 'Rate',
                titleTextStyle: {
                    color: '#878787'
                },
                gridlines: {
                    color: '#878787',
                    count: 1
                }

            },
            backgroundColor: '#242424',

        };
        var chart = new google.visualization.LineChart(document.getElementById('chart_div2'));
        chart.draw(dataRates, options);

    }
}

function DrawChartFunc() {
    var len2 = MarketRates.length;
    //should be this!!!!! if (evt.data.includes("marketRateEvents") == true ){
    //	if (evt.data.includes("orderFillInfo") == true ){

    var timeStamp = new Date(obj.d.timestamp);
    MarketRates[len2] = [
        [timeStamp.getHours(), timeStamp.getMinutes(), timeStamp.getSeconds(), timeStamp.getMilliseconds()], obj.d.fillPrice
    ];
    NeedtoDrawRate = true;

    //DrawRateChartFunc();
    //}
}



function DrawOrderEventsFunc() {
    var len2 = orderEventsTable.length;
    //should be this!!!!! if (evt.data.includes("marketRateEvents") == true ){
    //	if (evt.data.includes("orderFillInfo") == true ){

    var timeStamp = new Date(obj.d.timestamp);
    orderEventsTable[len2] = [
        [timeStamp.getHours(), timeStamp.getMinutes(), timeStamp.getSeconds(), timeStamp.getMilliseconds()],
		obj.d.orderId,
		obj.d.status,
		obj.d.side,
		obj.d.orderType,
		obj.d.quantity,
		obj.d.price
    ];
   // NeedtoDrawRate = true;

    //D
	NeedtoDrawOrderEvents= true;
}



function DrawOrderEventsDrawing() {
    google.charts.load('current', {'packages': ['table']});
    google.charts.setOnLoadCallback(DrawOrderEventsTable);
}

function DrawOrderEventsTable() {
  //  NeedtoDrawBook = false;
    var dataTable1 = new google.visualization.DataTable();
    dataTable1.addColumn('timeofday', 'Timestamp');
   dataTable1.addColumn('string', 'OrderID');
	dataTable1.addColumn('string', 'Status');
	dataTable1.addColumn('string', 'Buy/Sell');
	dataTable1.addColumn('string', 'Type');
    dataTable1.addColumn('number', 'Quantity');
	dataTable1.addColumn('number', 'Price');
 
    for (var j = 0; j < orderEventsTable.length; j++) {
        dataTable1.addRows([orderEventsTable[j]]);
    }

    var cssClassNames = {
        'headerRow': 'table-background',
        'tableRow': 'table-background',
        'oddTableRow': 'table-background',
        'selectedTableRow': 'table-background',
        'hoverTableRow': 'table-background',
        'headerCell': 'table-backgroundHead',
        'tableCell': 'table-background',
        'rowNumberCell': 'table-background'
    };

    var options = {
        'showRowNumber': false,
        'allowHtml': true,
        sortColumn: 0,
        sortAscending: false,
        'cssClassNames': cssClassNames
    };

    var table = new google.visualization.Table(document.getElementById('chart_div3'));
    table.draw(dataTable1, options);
	NeedtoDrawOrderEvents= false;

}

