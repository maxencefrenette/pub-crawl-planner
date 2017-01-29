function initMap() {
    new google.maps.places.Autocomplete(document.getElementById('initial_location'));
    new google.maps.places.Autocomplete(document.getElementById('final_location'));
    $('#initial_location').removeAttr();
}

$(document).ready(function() {
    $('select').material_select();
});


$('#location_number').change(function(){
    var location_number = $('#location_number').val();
    var out = "";
    for(var i=0;i<location_number;i++) {
        if ($('#pub'+i)) {
            var previous_content = $('#pub'+i).val();
        }
        out += '<div class="row">';
        out += '   <div class="input-field col s12">';
        if (previous_content) {
            out += '        <input placeholder="" id="pub'+i+'" type="text" class="validate" value='+previous_content+'>';
        } else {
            out += '        <input placeholder="" id="pub'+i+'" type="text" class="validate">';
        }
        out += '        <label for="pub'+i+'">Pub '+(i+1)+' location</label>';
        out += '   </div>';
        out += '</div>';
    }
    $("#locations").html(out);
    $('select').material_select();
    for(var i=0;i<location_number;i++) {
        new google.maps.places.Autocomplete(document.getElementById('pub'+i));
        // Solves a bug where the input label would overlap the already present content
        $('#pub'+i).focus();
    }
});

$("#generate-btn").click(function(){
    check_inputs();
});

function get_dates() {
  var startTime = chrono.parse($('#start_time').val())[0].start.date();
  var endTime = chrono.parse($('#end_time').val())[0].start.date();

  return {
    start: startTime,
    end:endTime
  }
}

function check_inputs() {
    console.log("TODO: Check the address validity");
    if (!parseInt($('#team_count').val(), 10)) {
        alert("The number of team is not a valid integer.");
    }
    return check_dates();
}

function check_dates() {
    var start_time = moment('2015-01-01, ' + $("#start_time").val(), 'YYYY-MM-DD, h:mm a');
    var end_time = moment('2015-01-01, ' + $("#end_time").val(), 'YYYY-MM-DD, h:mm a');
    if (!start_time) {
        alert("The start time is not in the HH:mm AM/PM format.");
        return false;
    }
    if (!end_time) {
        alert("The end time is not in the HH:mm AM/PM format.");
        return false;
    }
    if (start_time.valueOf() > end_time.valueOf()) {
        alert("The end time must be aftert the start time.");
        return false;
    }
    return true;
}
