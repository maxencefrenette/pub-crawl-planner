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
    var locations = get_all_locations();
    var time = get_dates();

    show_wait_message();

    var planner = new RoutePlanner(num_teams, locations, time.start, time.end);
    planner.generateRoutes(parse_routes);
}

function parse_routes(routes) {
    var locations = get_all_locations();
    var startTime = get_start_time();
    var parsed_data = [];
    var in_bar = false;
    var start_index = -1;
    var end_index = -1;
    var current_location_id = -1;
    routes.forEach(function(team, i){
        parsed_data[i] = [];
        in_bar = false;
        start_index = -1;
        end_index = -1;
        team.forEach(function(timeslot, j){
            if ((timeslot !== current_location_id && in_bar) || j === team.length - 1) {
                end_index = j-1;
                parsed_data[i].push({startTime: new Date(startTime.getTime() + (start_index * 300000)), endTime: new Date(startTime.getTime() + (end_index * 300000)), spot: locations[current_location_id]});
                in_bar = false;
            }
            if (timeslot !== undefined && !in_bar) {
                in_bar = true;
                start_index = j;
                current_location_id = timeslot;
            }
            if (j === team.length - 1) {

            }
        });
    });
    console.log(parsed_data);
    //pdfGenerator(parsed_data);
}

// ########## GETTERS ##########
function get_all_locations() {
    var pub_locations = get_pub_locations();
    var initial_location = get_initial_location();
    var final_location = get_final_location();
    return _.flatten([initial_location, pub_locations, final_location]);
}

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

function get_start_time() {
    return chrono.parse($('#start_time').val())[0].start.date();
}

function get_end_time() {
    return chrono.parse($('#end_time').val())[0].start.date();
}

function get_dates() {
  var startTime = get_start_time();
  var endTime = get_end_time();

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
