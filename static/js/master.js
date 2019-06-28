$("#arrival-div").change(function(){

    if($("input[name='arrival_type']:checked").val() === "random"){
        $("#deterministic").hide();
        $("#distributions").show();
    }
    else{
        $("#deterministic").show();
        $("#distributions").hide();
    }

});

$("#distributions").change(function(){

    if($("input[name='distributions']:checked").val() === "uniform"){
        $("#uniform").show();
        $("#exponential").hide();
        $("#normal").hide();
        $("#custom").hide();
    }
    else if($("input[name='distributions']:checked").val() === "exponential"){
        $("#uniform").hide();
        $("#exponential").show();
        $("#normal").hide();
        $("#custom").hide();
    }
    else if($("input[name='distributions']:checked").val() === "normal"){
        $("#uniform").hide();
        $("#exponential").hide();
        $("#normal").show();
        $("#custom").hide();
    }
    else{
        $("#uniform").hide();
        $("#exponential").hide();
        $("#normal").hide();
        $("#custom").show();
    }

});

$("#deterministic").hide();
$("#distributions").show();
$("#arrival_type-0").click();
$("#uniform").hide();
$("#exponential").hide();
$("#normal").hide();
$("#custom").hide();

function addEntryDeterm(){

    row = document.createElement("TR");

    arrival = document.createElement("INPUT");
    arrival.setAttribute("id")

    attendance = document.createElement("INPUT");
}
