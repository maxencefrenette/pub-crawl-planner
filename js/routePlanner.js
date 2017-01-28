function RoutePlanner(numTeams, locations, startTime, endTime) {
  this.numTeams = numTeams;
  this.locations = locations;
  this.numLocations = this.locations.length;
  this.startTime = startTime;
  this.endTime = endTime;
  this.timeSlotSize = 5*60*1000; // 5 minutes
  this.numTimeSlots = Math.floor((this.endTime - this.startTime) / this.timeSlotSize);
}

RoutePlanner.prototype.generateRoutes = function() {
  this.fetchDistances(this.computeRoutes.bind(this));
}

RoutePlanner.prototype.fetchDistances = function(callback) {
  var distanceService = new google.maps.DistanceMatrixService();
  distanceService.getDistanceMatrix({
    origins: this.locations,
    destinations: this.locations,
    travelMode: google.maps.TravelMode.WALKING,
    unitSystem: google.maps.UnitSystem.METRIC,
    durationInTraffic: true
  },
  (function (response, status) {
    if (status !== google.maps.DistanceMatrixStatus.OK) {
      console.log('Error:', status);
    } else {
      this.distances = response;
      callback();
    }
  }).bind(this));
}

RoutePlanner.prototype.computeRoutes = function() {
  var solver = new Logic.Solver();

  // Teams have to visit every stop
  _.range(this.numTeams).forEach(function(team) {
    _.range(this.numLocations).forEach(function(location) {
      solver.require(Logic.or(_.range(this.numTimeSlots).map(function(timeSlot){
        return v(team, location, timeSlot);
      })));
    });
  });

  // A team is at one spot at a time
  _.range(this.numTeams).forEach(function(team) {
    _.range(this.numTimeSlots).forEach(function(timeSlot) {
      solver.require(Logic.atMostOne(_.range(this.numLocations).map(function(location){
        return v(team, location, timeSlot);
      })));
    });
  });

  // A stop hosts one team at a time
  _.range(this.numLocations).forEach(function(location) {
    _.range(this.numTimeSlots).forEach(function(timeSlot) {
      solver.require(Logic.atMostOne(_.range(this.numTeams).map(function(team){
        return v(team, location, timeSlot);
      })));
    });
  });

  // It takes time to travel from one stop to another
  _.range(this.numTeams).forEach(function(team) {
    _.range(this.numLocations).forEach(function(location1) {
      _.range(this.numLocations).forEach(function(location2) {
        // TODO
      });
    });
  });

  // Teams stay exactly 15min per stop

  // Allocated travel time is not significantly longer than actual travel time

  // Teams start at the starting location

  // Teams end at the final location

  s = solver.solve();
  console.log(s.getTrueVars());
}

/**
* Returns the walking time between two locations
*
* @param a The first location
* @param b The second location
* @return The walking time (in seconds)
*/
RoutePlanner.prototype.time = function(a, b) {
  return distances.rows[a].elements[b].duration.value;
}

/**
* Returns the walking distance between two locations
*
* @param a The first location
* @param b The second location
* @return The walking distance (in meters)
*/
RoutePlanner.prototype.dist = function(a, b) {
  return distances.rows[a].elements[b].distance.value;
}

// Returns a variable's name as a string
function v(team, location, timeSlot) {
  return team + ' ' + location + ' ' + timeSlot;
}
