// ########## UI THINGS ##########
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

// ########## GENERATE THE REPORT ##########
$("#generate-btn").click(function(){
    check_inputs();
    var pub_locations = get_pub_locations();
    var initial_location = get_intial_location();
    var final_location = get_final_location();
});

// ########## GETTERS ##########
function get_pub_locations() {
    var locations = [];
    var i = 0;
    var element;
    while($('#pub'+i).length !== 0) {
        locations.push($('#pub'+i).val());
        i++;
    }
    return locations;
}

function get_intial_location() {
    return $('#initial_location').val();
}

function get_final_location() {
    return $('#final_location').val();
}

function get_dates() {
  var startTime = chrono.parse($('#start_time').val())[0].start.date();
  var endTime = chrono.parse($('#end_time').val())[0].start.date();

  return {
    start: startTime,
    end:endTime
  }
}

// ########## DATA CHECKING ##########
function check_inputs() {
    console.log("TODO: Check the address validity");
    if (!parseInt($('#team_count').val(), 10)) {
        alert("The number of team is not a valid integer.");
    }
    if (!get_intial_location()) {
        alert("The initial location is empty.");
    }
    if (!get_final_location()) {
        alert("The final location is empty.");
    }
    var locations = get_pub_locations();
    if (locations.length < 1) {
        alert("There must be at least of pub location.");
    }
    for (var location of locations) {
        if (!location) {
            alert("There is an empty pub location.");
            return false;
        }
    }
    return check_dates();
}

function check_dates() {
    var time = get_dates();
    if (!time.start) {
        alert("The start time is empty or invalid.");
        return false;
    }
    if (!time.end) {
        alert("The end time is empty or invalid.");
        return false;
    }
    if (time.start > time.end) {
        alert("The end time must be aftert the start time.");
        return false;
    }
    return true;
}
