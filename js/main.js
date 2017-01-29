// ########## UI THINGS ##########
function initMap() {
    new google.maps.places.Autocomplete(document.getElementById('initial_location'));
    new google.maps.places.Autocomplete(document.getElementById('final_location'));
    $('#initial_location').removeAttr();
}

$(document).ready(function() {
    $('select').material_select();
    $('.modal').modal();
});


$('#location_count').change(function(){
    var location_count = $('#location_count').val();
    var out = "";
    for(var i=0;i<location_count;i++) {
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
    for(var i=0;i<location_count;i++) {
        new google.maps.places.Autocomplete(document.getElementById('pub'+i));
        // Solves a bug where the input label would overlap the already present content
        $('#pub'+i).focus();
    }
});

function show_wait_message() {
    $("#generate-btn").fadeOut(300, function() {
        $("#wait-message").hide().fadeIn(300);
    });
}

// ########## GENERATE THE REPORT ##########
$("#generate-btn").click(function(){
    generate_report();
});

function generate_report() {
    if (!check_inputs()) {
        return;
    }
    var num_teams = parseInt($('#team_count').val(), 10);
    var pub_locations = get_pub_locations();
    var initial_location = get_initial_location();
    var final_location = get_final_location();
    var locations = _.flatten([initial_location, pub_locations, final_location]);
    var time = get_dates();

    show_wait_message();

    var planner = new RoutePlanner(num_teams, locations, time.start, time.end);
    var routes = planner.generateRoutes(console.log.bind(console));
}

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

function get_initial_location() {
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
    if (!get_initial_location()) {
        alert("The initial location is empty.");
        return false;
    }
    if (!get_final_location()) {
        alert("The final location is empty.");
        return false;
    }
    var locations = get_pub_locations();
    if (locations.length < 1) {
        alert("There must be at least of pub location.");
        return false;
    }
    for (var location of locations) {
        if (!location) {
            alert("There is an empty pub location.");
            return false;
        }
    }
    if (!parseInt($('#team_count').val(), 10)) {
        alert("The number of team is not a valid integer.");
        return false;
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
