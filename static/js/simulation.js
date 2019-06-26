// GLOBAL VARIABLES
var currentClient = 0;
var currentSimulation = 0;

var intervalId = null;
var simuInterval = null;

var simulationCount = 20;

// GRAPH OBJECTS
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

var basicTrace = {
    x: [],
    y: [],
    mode: 'lines+markers'
};

// BASIC LAYOUT TO PLOT
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
            text: '# Simulação',
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

// CLONE FUNCTION
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

// CONSTRUCTION OF PAGE GRAPHS
function renderGraphs(){
    Plotly.purge('arrival-attendance-means-graph');
    Plotly.purge('durations-graph');
    Plotly.purge('queue-means-graph');
    Plotly.purge('operator-total-graph');
    Plotly.purge('system-means-graph');

    durationsLayout = clone(basicLayout);
    durationsLayout.title.text = "Tempos totais da simulação";
    durationsLayout.xaxis.range = [1, simulationCount];

    queueMeansLayout = clone(basicLayout);
    queueMeansLayout.title.text = "Tempos médios na fila";
    queueMeansLayout.xaxis.range = [1, simulationCount];

    operatorTotalLayout = clone(basicLayout);
    operatorTotalLayout.title.text = "Tempos livres do operador";
    operatorTotalLayout.xaxis.range = [1, simulationCount];

    systemMeansLayout = clone(basicLayout);
    systemMeansLayout.title.text = "Tempos médios gastos no sistema";
    systemMeansLayout.xaxis.range = [1, simulationCount];

    arrivalAttendanceMeansLayout = clone(basicLayout);
    arrivalAttendanceMeansLayout.title.text = "Tempos médios de chegada e atendimento";
    arrivalAttendanceMeansLayout.xaxis.range = [1, simulationCount];

    arrivalTrace = clone(basicTrace);
    arrivalTrace.name = "Tempos de chegada";
    attendanceTrace = clone(basicTrace);
    attendanceTrace.name = "Tempos de atendimento";

    Plotly.newPlot('arrival-attendance-means-graph', [arrivalTrace, attendanceTrace], arrivalAttendanceMeansLayout);
    Plotly.newPlot('durations-graph', [clone(basicTrace)], durationsLayout);
    Plotly.newPlot('queue-means-graph', [clone(basicTrace)], queueMeansLayout);
    Plotly.newPlot('operator-total-graph', [clone(basicTrace)], operatorTotalLayout);
    Plotly.newPlot('system-means-graph', [clone(basicTrace)], systemMeansLayout);

}

// TEMPLATES AND ELEMENTS
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
    </table>';

var summaryTemplate = '\
    <table class="table table-bordered">\
        <thead class="thead-dark">\
            <tr>\
                <th>Estatística</th>\
                <th>Valor</th>\
            </tr>\
        </thead>\
        <tbody id="summary-{{simuNumber}}">\
        </tbody>\
    </table>';

var summaryStats = [
    "Tempo total na fila",
    "Tempo médio na fila",
    "Probabilidade de espera",
    "Intervalo médio de chegada",
    "Intervalo médio de atendimento",
    "Tempo total de serviço",
    "Tempo médio de serviço",
    "Tempo total no sistema",
    "Tempo médio no sistema",
    "Tempo livre do operador",
    "Probabilidade do operador ocioso"
];

var summaryRows = []

for(var i = 0; i < summaryStats.length; ++i){
    var summaryRow = document.createElement("TR");
    var td = document.createElement("TD");
    td.innerHTML = summaryStats[i];
    summaryRow.appendChild(td);
    summaryRows.push(summaryRow);
}

var tableRow = document.createElement("TR");
for(var i = 0; i < 9; ++i){
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


// FILLING TABLES WITH CONTENT

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

function fillSummary(simuNumber, summary){
    var summaryContent = document.getElementById("summary-" + simuNumber).children;

    summaryContent[0][1].textContent = summary[""];
    summaryContent[1][1].textContent = summary[""];
    summaryContent[2][1].textContent = summary[""];
    summaryContent[3][1].textContent = summary[""];
    summaryContent[4][1].textContent = summary[""];
    summaryContent[5][1].textContent = summary[""];
    summaryContent[6][1].textContent = summary[""];
    summaryContent[7][1].textContent = summary[""];
    summaryContent[8][1].textContent = summary[""];
    summaryContent[9][1].textContent = summary[""];
    summaryContent[10][1].textContent = summary[""];
}

// REDERING TAB CONTENT

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
        fillRow(simuNumber, i, simulation.iteration_values[i-1]);
    }
    reAdjust();
}

function renderSummary(simuNumber, summary){

    document.getElementById("sum-" + simuNumber).innerHTML = summaryTemplate.replace("{{simuNumber}}", simuNumber);
    var summary = document.getElementById("summary-" + simuNumber);

    for(var i = 0; i < summaryStats.length; ++i){
        summary.appendChild(summaryRows[i].cloneNode(true));
    }
    fillSummary(simuNumber, summary);
}

// FILLING SIMULATION GRAPHS
function fillGraph(simuNumber, summary){
    Plotly.extendTraces("system-means-graph", {
        x: [[simuNumber]],
        y: [[1]]
    }, [0]);
    Plotly.extendTraces("operator-total-graph", {
        x: [[simuNumber]],
        y: [[1]]
    }, [0]);
    Plotly.extendTraces("durations-graph", {
        x: [[simuNumber]],
        y: [[1]]
    }, [0]);
    Plotly.extendTraces("queue-means-graph", {
        x: [[simuNumber]],
        y: [[1]]
    }, [0]);
    Plotly.extendTraces("arrival-attendance-means-graph", {
        x: [[simuNumber], [currentClient]],
        y: [[1], [1]]
    }, [0, 1]);
}

// SIMULATION

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
            console.log("RESPONSE", simulationCount, serverResponse);

            renderTable(currentSimulation, clientCount, serverResponse);
            renderGraph(currentSimulation, serverResponse["summary"]);
            fillGraph(currentSimulation, serverResponse["summary"]);
        })
    })
}

function startSimulation(){
    var simGap = parseFloat(document.getElementById("sim-gap").value);
    simGap = isNaN(simGap) || simGap <= 0 ? 1000 : simGap*1000;

    let sc = $("#simulation-count").val();
    simulationCount = sc == "" || isNaN(parseFloat(sc)) ? simulationCount : parseFloat(sc);

    renderGraphs();
    simuInterval = setInterval(fetchSimulation, simGap);
}

function stopSimulation(){
    window.clearInterval(simuInterval);
}
