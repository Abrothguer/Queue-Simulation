// Variáveis Globais
var currentClient = 0;
var intervalId = null;

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

function startSimulation(){
    var simGap = parseFloat(document.getElementById("sim-gap").value);
    simGap = isNaN(simGap) || simGap <= 0 ? 1000 : simGap*1000;
    intervalId = setInterval(fetchAndFill, simGap);
}

function stopSimulation(){
    window.clearInterval(intervalId);
}
