// Simulação atual, identificador do intervalo e quantidade de simulações
var currentSimulation = 0;
var simuInterval = null;
var simulationCount = 20;

// Objeto básico do traço do gráfico
var basicTrace = {
    x: [],
    y: [],
    mode: 'lines+markers'
};

// Objeto de layout básico do gráfico
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

// Função para fazer clonagem de objetos
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

// Template da tabela de simulação
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

// Template da tabela de resumo.
var summaryTemplate = '\
    <table class="table table-bordered w-50">\
        <thead class="thead-dark">\
            <tr>\
                <th>Estatística</th>\
                <th>Valor</th>\
            </tr>\
        </thead>\
        <tbody id="sumbody-{{simuNumber}}">\
        </tbody>\
    </table>';

// Objeto que relaciona as colunas da tabela de resumo com seus valores na resposta json
var summaryStats = [
    ["Tempo total na fila", "queue_total"],
    ["Tempo médio na fila", "queue_mean"],
    ["Probabilidade de espera", "queue_prob"],
    ["Intervalo médio de chegada", "arrival_mean"],
    ["Intervalo médio de atendimento", "attendance_mean"],
    ["Tempo total de serviço", "service_total"],
    ["Tempo total no sistema", "system_total"],
    ["Tempo médio no sistema", "system_mean"],
    ["Tempo livre do operador", "server_free"],
    ["Probabilidade do operador ocioso", "server_prob"]
];

// Geração do conjunto de colunas da tabela de sumário
var summaryRows = []

for(var i = 0; i < summaryStats.length; ++i){
    // Criação da linha e coluna de título
    var summaryRow = document.createElement("TR");
    var td = document.createElement("TD");
    td.setAttribute("class", "font-weight-bold")
    td.innerHTML = summaryStats[i][0];

    // Criação da coluna de valor, adição das colunas a linha e da linha ao conjunto
    summaryRow.appendChild(td);
    summaryRow.appendChild(document.createElement("TD"));
    summaryRows.push(summaryRow);
}

// Geração da linha da tabela de simulação e suas colunas
var tableRow = document.createElement("TR");
for(var i = 0; i < 9; ++i){
    tableRow.appendChild(document.createElement("TD"));
}

// Geração do link da barra de navegação
var tabLink = document.createElement("A");
tabLink.setAttribute("class", "nav-item nav-link");
tabLink.setAttribute("data-toggle", "tab");
tabLink.setAttribute("role", "tab");

// Geração da div que comporta as divs da tabela e o sumário de cada simulação
var tabDiv = document.createElement("DIV");
tabDiv.setAttribute("role", "tabpanel");
tabDiv.setAttribute("class", "tab-pane fade mt-2");
tabDiv.setAttribute("aria-expanded", "false");

// Geração das divs que comportam a tabela e o sumário
var tabTable = document.createElement("DIV");
var tabSummary = document.createElement("DIV");


// Renderização dos gráficos na página
function renderGraphs(){
    // Deleta os gráficos se os mesmos estão presentes.
    Plotly.purge('arrival-attendance-means-graph');
    Plotly.purge('durations-graph');
    Plotly.purge('queue-means-graph');
    Plotly.purge('operator-total-graph');
    Plotly.purge('system-means-graph');

    // Construção do gráfico de duração da simulação
    durationsLayout = clone(basicLayout);
    durationsLayout.title.text = "Tempos totais da simulação";
    durationsLayout.xaxis.range = [1, simulationCount];

    // Construção do gráfico de tempo médio na fila
    queueMeansLayout = clone(basicLayout);
    queueMeansLayout.title.text = "Tempos médios na fila";
    queueMeansLayout.xaxis.range = [1, simulationCount];

    // Construção do gráfico de tempos livres do operador
    operatorTotalLayout = clone(basicLayout);
    operatorTotalLayout.title.text = "Tempos livres do operador";
    operatorTotalLayout.xaxis.range = [1, simulationCount];

    // Construção do gráfico de tempo médio gasto no sistema
    systemMeansLayout = clone(basicLayout);
    systemMeansLayout.title.text = "Tempos médios gastos no sistema";
    systemMeansLayout.xaxis.range = [1, simulationCount];

    // Construção do gráfico dos tempos médios de chegada e atendimento
    arrivalAttendanceMeansLayout = clone(basicLayout);
    arrivalAttendanceMeansLayout.title.text = "Tempos médios de chegada e atendimento";
    arrivalAttendanceMeansLayout.xaxis.range = [1, simulationCount];

    // Traços para as linhas de chegada e atendimento
    arrivalTrace = clone(basicTrace);
    arrivalTrace.name = "Tempos de chegada";
    attendanceTrace = clone(basicTrace);
    attendanceTrace.name = "Tempos de atendimento";

    // Plotando os gráficos
    Plotly.newPlot('arrival-attendance-means-graph', [arrivalTrace, attendanceTrace], arrivalAttendanceMeansLayout);
    Plotly.newPlot('durations-graph', [clone(basicTrace)], durationsLayout);
    Plotly.newPlot('queue-means-graph', [clone(basicTrace)], queueMeansLayout);
    Plotly.newPlot('operator-total-graph', [clone(basicTrace)], operatorTotalLayout);
    Plotly.newPlot('system-means-graph', [clone(basicTrace)], systemMeansLayout);
}

// Lista que guarda os nomes das variáveis no json de reposta
var rowsNames = [
    "arrival-last",
    "arrival-total",
    "attendance",
    "attendance-begin",
    "queue",
    "attendance-end",
    "system-total",
    "server-free"
]

// Preenche uma linha na tabela de simulação
function fillRow(simuNumber, rowNumber, row){
    columns = document.getElementById("sim-" + simuNumber + "-clt-" + rowNumber).children;
    for(var i = 0; i < rowsNames.length; ++i){
        columns[i+1].textContent = row[ rowsNames[i] ].toFixed(3);
    }
}

// Preenche a tabela de sumário da simulação
function fillSummary(simuNumber, summary){
    var summaryContent = document.getElementById("sumbody-" + simuNumber).children;
    for(var i = 0; i < summaryStats.length; ++i){
        summaryContent[i].children[1].textContent = summary[ summaryStats[i][1] ].toFixed(3);
    }
}

// Associa os ids da página com os nomes do json
summaryNames = [
    ["g-mean-duration", "g-mean-duration"],
    ["g-mean-system", "g-mean-system"],
    ["g-mean-queue", "g-mean-queue"],
    ["g-mean-server", "g-mean-server"]
]

// Preenche o sumário geral
function fillGeneralSummary(summary){
    document.getElementById("num-clients").textContent = clientCount;
    document.getElementById("num-simu").textContent = simulationCount;
    document.getElementById("chosen-dist").textContent = distr;
    for(var i = 0; i < summaryNames.length; ++i){
        document.getElementById(summaryNames[i][0]).textContent =
            summary[ summaryNames[i][1] ].toFixed(3);
    }
    $("#simu-summary").show();
}

// Preenche os gráficos da página
function fillGraph(simuNumber, summary){
    Plotly.extendTraces("system-means-graph", {
        x: [[simuNumber]],
        y: [[summary["system_mean"]]]
    }, [0]);
    Plotly.extendTraces("operator-total-graph", {
        x: [[simuNumber]],
        y: [[summary["server_free"]]]
    }, [0]);
    Plotly.extendTraces("durations-graph", {
        x: [[simuNumber]],
        y: [[summary["service_total"]]]
    }, [0]);
    Plotly.extendTraces("queue-means-graph", {
        x: [[simuNumber]],
        y: [[summary["queue_mean"]]]
    }, [0]);
    Plotly.extendTraces("arrival-attendance-means-graph", {
        x: [[simuNumber], [simuNumber]],
        y: [[summary["arrival_mean"]], [summary["attendance_mean"]]]
    }, [0, 1]);
}

// Renderização da tabela de simulação
function renderTable(simuNumber, nRows, simulation){

    // Atribuindo o corpo da tabela ao template declarado
    document.getElementById("table-" + simuNumber).innerHTML =
        tableTemplate.replace("{{simuNumber}}", simuNumber);
    var tbody = document.getElementById("tbody-" + simuNumber);

    // Renderizando as linhas da tabela de simulação
    for(var i = 1; i <= nRows; ++i){
        rowClone = tableRow.cloneNode(true);
        rowClone.setAttribute("id", "sim-" + simuNumber + "-clt-" + i);
        rowClone.children[0].setAttribute("class", "font-weight-bold");
        rowClone.children[0].innerHTML = i;

        // Adicionando a linha a tabela e preenchendo a mesma
        tbody.appendChild(rowClone);
        fillRow(simuNumber, i, simulation.iteration_values[i-1]);
    }
}

// Renderização da tabela de sumário
function renderSummary(simuNumber, summary){

    // Atribuindo o corpo do sumário ao template declarado
    document.getElementById("summary-" + simuNumber).innerHTML =
        summaryTemplate.replace("{{simuNumber}}", simuNumber);
    var summaryDiv = document.getElementById("sumbody-" + simuNumber);

    // Renderizando as linhas da tabela e preenchendo a tabela de sumário
    for(var i = 0; i < summaryStats.length; ++i){
        summaryDiv.appendChild(summaryRows[i].cloneNode(true));
    }
    fillSummary(simuNumber, summary);
}

// Renderização do conteúdo com base na simulação que o servidor retornou
function renderContent(simuNumber, nRows, simulation){

    // Renderização do link na barra de navegação
    linkClone = tabLink.cloneNode(true);
    linkClone.setAttribute("href", "#tab-" + simuNumber);
    linkClone.innerHTML = "#" + simuNumber + " Sim."
    document.getElementById("slider-tab").appendChild(linkClone);

    // Renderização da div de contenção
    divClone = tabDiv.cloneNode(true);
    divClone.setAttribute("id", "tab-" + simuNumber);
    document.getElementById("tab-content").appendChild(divClone);

    // Renderização da div da tabela de simulação
    tableClone = tabTable.cloneNode(true);
    tableClone.setAttribute("id", "table-" + simuNumber);
    divClone.appendChild(tableClone);

    // Renderização da div da tabela de sumário
    summaryClone = tabSummary.cloneNode(true);
    summaryClone.setAttribute("id", "summary-" + simuNumber);
    divClone.appendChild(summaryClone);

    // Renderização das tabelas
    renderTable(simuNumber, nRows, simulation);
    renderSummary(simuNumber, simulation["summary"]);

    // Reajuste da barra de navegação
    reAdjust();
}

// Requisição das simulações
function fetchSimulation(){
    // Fim das iterações de simulações e busca pelo sumário geral
    if(currentSimulation >= simulationCount){
        stopSimulation();
        fetchSimulationsSummary();
        return;
    }

    // Requisição da simulação para o servidor
    ++currentSimulation;
    fetch(simulationURL)
    .then(response => {
        response.text().then(rawData => {

            // Passa resposta do servidor para JSON, renderiza o conteúdo e preenche os gráficos
            var serverResponse = JSON.parse(rawData);
            renderContent(currentSimulation, clientCount, serverResponse);
            fillGraph(currentSimulation, serverResponse["summary"]);
        })
    })
}

// Requisição do sumário geral da simulação
function fetchSimulationsSummary(){

    // Faz a requisição
    fetch(summaryURL)
    .then(response => {
        response.text().then(rawData => {

            // Passa a resposta para JSON e preenche o sumário
            var serverResponse = JSON.parse(rawData);
            console.log(serverResponse);
            fillGeneralSummary(serverResponse);
        })
    })
}

// Função que dá início a simulação
function startSimulation(){

    // Renderização dos gráficos
    if(currentSimulation == 0 || currentSimulation >= simulationCount){

        // Intervalo de simulação e quantidade de simulações
        let sc = $("#simulation-count").val();
        simulationCount = sc == "" || isNaN(parseFloat(sc)) ? simulationCount : parseFloat(sc);

        renderGraphs();
    }
    var simGap = parseFloat(document.getElementById("sim-gap").value);
    simGap = isNaN(simGap) || simGap <= 0 ? 1000 : simGap*1000;

    // Inicia a requisição de simulações para o servidor no intervalo especificado
    $("#simu-summary").hide();
    simuInterval = setInterval(fetchSimulation, simGap);
}

// Para a requisição de novas simulações
function stopSimulation(){
    window.clearInterval(simuInterval);
}

$("#simu-summary").hide();
