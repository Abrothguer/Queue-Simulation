// Variáveis Globais
var currentClient = 0;
var currentSimulation = 0;

var intervalId = null;
var simuInterval = null;

var simulationCount = $("#simulation-count").val();
simulationCount = 20;

// Objetos para plotar os gráficos
var traceArrivals = {
    x: [],
    y: [],
    name: "Tempos de chegada",
    type: 'scatter',
    mode: 'lines+markers'
};
var traceAttendances = {
    x: [],
    y: [],
    name: "Tempos de atendimento",
    mode: 'lines+markers'
};
var traceQueue = {
    x: [],
    y: [],
    mode: 'lines+markers'
};
var traceSystem = {
    x: [],
    y: [],
    mode: 'lines+markers'
};

// Layout básico para plotar
var basicLayout = {
    title: {
        font: {
            family: 'Courier New, monospace',
            size: 24
        },
        xref: 'paper',
        x: 0.05,
        type: 'scatter'
    },
    xaxis: {
        title: {
            text: '# Cliente',
            font: {
                family: 'Courier New, monospace',
                size: 18,
                color: '#7f7f7f'
            }
        },
        range: [1, clientCount],
        dtick:1
    },
    yaxis: {
        title: {
            text: 'Tempo',
            font: {
                family: 'Courier New, monospace',
                size: 18,
                color: '#7f7f7f'
            }
        },
        rangemode: 'tozero'
    }
}

// Função para clonar um objeto
function clone(item) {
    if (!item) {
        return item;
    }

    var types = [ Number, String, Boolean ], result;
    result = item;

    if (Object.prototype.toString.call( item ) === "[object Array]") {
        result = [];
        item.forEach(function(child, index, array) {
            result[index] = clone( child );
        });
    }
    else if (typeof item == "object") {
        if (!item.prototype) {
            result = {};
            for (var i in item) {
                result[i] = clone( item[i] );
            }
        }
    }
    return result;
}

arrivalAttenanceLayout = clone(basicLayout);
arrivalAttenanceLayout.title.text = "Tempos de chegada e atendimento";
queueLayout = clone(basicLayout);
queueLayout.title.text = "Tempos de espera na fila";
systemLayout = clone(basicLayout);
systemLayout.title.text = "Tempos gastos no sistema";

Plotly.newPlot('arrival-attendance-graph', [traceArrivals, traceAttendances], arrivalAttenanceLayout);
Plotly.newPlot('queue-graph', [traceQueue], queueLayout);
Plotly.newPlot('system-graph', [traceSystem], systemLayout);

function fetchAndFill(){
    if(currentClient >= clientCount){
        stopSimulation();
        return;
    }

    ++currentClient;
    console.log(currentClient);

    fetch(fetchURL)
    .then(response => {
        response.text().then(rawData => {

            var serverResponse = JSON.parse(rawData);

            columns = document.getElementById("client_" + currentClient).children;
            columns[1].textContent = serverResponse["arrival-last"];
            columns[2].textContent = serverResponse["arrival-total"];
            columns[3].textContent = serverResponse["attendance"];
            columns[4].textContent = serverResponse["attendance-begin"];
            columns[5].textContent = serverResponse["queue"];
            columns[6].textContent = serverResponse["attendance-end"];
            columns[7].textContent = serverResponse["system-total"];
            columns[8].textContent = serverResponse["server-free"];

            Plotly.extendTraces("arrival-attendance-graph", {
                x: [[currentClient], [currentClient]],
                y: [[serverResponse["arrival-last"]], [serverResponse["attendance"]]]
            }, [0, 1]);

            Plotly.extendTraces("queue-graph", {
                x: [[currentClient]],
                y: [[serverResponse["queue"]]]
            }, [0]);

            Plotly.extendTraces("system-graph", {
                x: [[currentClient]],
                y: [[serverResponse["system-total"]]]
            }, [0]);

            if(currentClient == clientCount){
                console.log("Time to get summary");
            }
        })
    })
}

var tableTemplate = '\
    <table class="table table-bordered">\
        <thead class="thead-dark">\
            <tr>\
                <th>Cliente</th>\
                <th>Tempo desde a última chegada</th>\
                <th>Tempo de chegada</th>\
                <th>Tempo de serviço</th>\
                <th>Tempo de início do serviço</th>\
                <th>Tempo de fila</th>\
                <th>Tempo final do serviço</th>\
                <th>Tempo gasto no sistema</th>\
                <th>Tempo livre do operador</th>\
            </tr>\
        </thead>\
        <tbody id="tbody-{{simuNumber}}">\
        </tbody>\
    </table>'

var navTab = '<a class="nav-item nav-link active" data-toggle="tab" href="#tab-{{simuNumber}}" role="tab" aria-controls="public" aria-expanded="true">#{{simuNumber}} Sim.</a>'
var divTab = '<div role="tabpanel" class="tab-pane fade active show mt-2" id="tab-{{simuNumber}}" aria-labelledby="public-tab" aria-expanded="true"></div>'

var tableRow = document.createElement("TR");
for(var j = 0; j < 9; ++j){
    tableRow.appendChild(document.createElement("TD"));
}

var tabLink = document.createElement("A");
tabLink.setAttribute("class", "nav-item nav-link");
tabLink.setAttribute("data-toggle", "tab");
tabLink.setAttribute("role", "tab");

var tabDiv = document.createElement("DIV");
tabDiv.setAttribute("role", "tabpanel");
tabDiv.setAttribute("class", "tab-pane fade mt-2");
tabDiv.setAttribute("aria-expanded", "false");

function fillRow(simuNumber, rowNumber, row){
    columns = document.getElementById("sim-" + simuNumber + "-clt-" + rowNumber).children;
    columns[1].textContent = row["arrival-last"];
    columns[2].textContent = row["arrival-total"];
    columns[3].textContent = row["attendance"];
    columns[4].textContent = row["attendance-begin"];
    columns[5].textContent = row["queue"];
    columns[6].textContent = row["attendance-end"];
    columns[7].textContent = row["system-total"];
    columns[8].textContent = row["server-free"];
}

function renderTable(simuNumber, nRows, simulation){

    linkClone = tabLink.cloneNode(true);
    linkClone.setAttribute("href", "#tab-" + simuNumber);
    linkClone.innerHTML = "#" + simuNumber + " Sim."
    document.getElementById("slider-tab").appendChild(linkClone);

    divClone = tabDiv.cloneNode(true);
    divClone.setAttribute("id", "tab-" + simuNumber);
    document.getElementById("tab-content").appendChild(divClone);

    document.getElementById("tab-" + simuNumber).innerHTML = tableTemplate.replace("{{simuNumber}}", simuNumber);
    var tbody = document.getElementById("tbody-" + simuNumber);

    for(var i = 1; i <= nRows; ++i){
        rowClone = tableRow.cloneNode(true);
        rowClone.setAttribute("id", "sim-" + simuNumber + "-clt-" + i);
        rowClone.children[0].setAttribute("class", "font-weight-bold");
        rowClone.children[0].innerHTML = i;

        tbody.appendChild(rowClone);
        fillRow(simuNumber, i, simulation[i-1]);
    }
    reAdjust();

    /*
    for(var i = 0; i < nRows; ++i){
        var row = document.createElement("TR");
        row.setAttribute("id", "sim-" + simuNumber + "-clt-" + i);

        var client = document.createElement("TD");
        client.setAttribute("class", "font-weight-bold");
        client.innerHTML = i;
        row.appendChild(client);

        for(var j = 0; j < 8; ++j){
            row.appendChild(document.createElement("TD"));
        }
        tbody.appendChild(row);
    }
    */
}

function fetchSimulation(){
    if(currentSimulation >= simulationCount){
        stopSimulation();
        return;
    }
    ++currentSimulation;

    fetch(simulationURL)
    .then(response => {
        response.text().then(rawData => {

            var serverResponse = JSON.parse(rawData);
            console.log("RESPONSE", serverResponse);
            renderTable(currentSimulation, simulationCount, serverResponse)
        })
    })
}

function startSimulation(){
    var simGap = parseFloat(document.getElementById("sim-gap").value);
    simGap = isNaN(simGap) || simGap <= 0 ? 1000 : simGap*1000;
    intervalId = setInterval(fetchAndFill, simGap);
    simuInterval = setInterval(fetchSimulation, simGap);
}

function stopSimulation(){
    window.clearInterval(intervalId);
    window.clearInterval(simuInterval);
}











var hidWidth;
var scrollBarWidths = 40;

var widthOfList = function(){
    var itemsWidth = 0;
    $('.list a').each(function(){
        var itemWidth = $(this).outerWidth();
        itemsWidth+=itemWidth;
    });
    return itemsWidth;
};

var widthOfHidden = function(){
    var ww = 0 - $('.wrapper').outerWidth();
    var hw = (($('.wrapper').outerWidth())-widthOfList()-getLeftPosi())-scrollBarWidths;
    var rp = $(document).width() - ($('.nav-item.nav-link').last().offset().left + $('.nav-item.nav-link').last().outerWidth());

    if (ww>hw) {
        //return ww;
        return (rp>ww?rp:ww);
    }
    else {
        //return hw;
        return (rp>hw?rp:hw);
    }
};

var getLeftPosi = function(){
    var ww = 0 - $('.wrapper').outerWidth();
    var lp = $('.list').position().left;

    if (ww>lp) {
        return ww;
    }
    else {
        return lp;
    }
};

var reAdjust = function(){

  // check right pos of last nav item
  var rp = $(document).width() - ($('.nav-item.nav-link').last().offset().left + $('.nav-item.nav-link').last().outerWidth());
  if (($('.wrapper').outerWidth()) < widthOfList() && (rp<0)) {
    $('.scroller-right').show().css('display', 'flex');
  }
  else {
    $('.scroller-right').hide();
  }

  if (getLeftPosi()<0) {
    $('.scroller-left').show().css('display', 'flex');
  }
  else {
    $('.item').animate({left:"-="+getLeftPosi()+"px"},'slow');
  	$('.scroller-left').hide();
  }
}

reAdjust();

$(window).on('resize',function(e){
  	reAdjust();
});

$('.scroller-right').click(function() {

  $('.scroller-left').fadeIn('slow');
  $('.scroller-right').fadeOut('slow');

  var pace = widthOfHidden();
  pace = pace > -500 ? pace-100 : -500;
  $('.list').animate({left:"+="+pace+"px"},'slow',function(){
    reAdjust();
  });
});

$('.scroller-left').click(function() {

	$('.scroller-right').fadeIn('slow');
	$('.scroller-left').fadeOut('slow');

    console.log(getLeftPosi());
  	$('.list').animate({left:"-="+getLeftPosi()+"px"},'slow',function(){
  	    reAdjust();
  	});
});
