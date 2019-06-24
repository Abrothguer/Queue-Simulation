$("#arrival-div").change(function(){

    if($("input[name='arrival_type']:checked").val() === "random"){
        $("#deterministic").hide();
        $("#random-arrival").show();
        $("#random-attendance").show();
    }
    else{
        $("#deterministic").show();
        $("#random-arrival").hide();
        $("#random-attendance").hide();
    }

});

$("#deterministic").hide();
$("#random-arrival").show();
$("#random-attendance").show();
$("#arrival_type-1").click();
