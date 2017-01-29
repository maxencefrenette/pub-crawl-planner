function RoutePlanner(numTeams, locations, startTime, endTime) {
    this.numTeams = numTeams;
    this.locations = locations;
    this.numLocations = this.locations.length;
    this.startTime = startTime;
    this.endTime = endTime;
    this.timeSlotSize = 5*60*1000; // 5 minutes
    this.numTimeSlots = Math.floor((this.endTime - this.startTime) / this.timeSlotSize);
}

RoutePlanner.prototype.generateRoutes = function(callback) {
    this.fetchDistances((function() {
        this.computeRoutes(callback);
    }).bind(this));
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

RoutePlanner.prototype.computeRoutes = function(callback) {
    var solver = new Logic.Solver();

    // Teams have to visit every stop
    for (var team = 0; team < this.numTeams; team++) {
        for (var location = 0; location < this.numLocations; location++) {
            solver.require(Logic.or(_.range(this.numTimeSlots).map(function(timeSlot) {
                return v(team, location, timeSlot);
            })));
        }
    }

    // A stop hosts one team at a time
    for (var location = 1; location < this.numLocations - 1; location++) {
        for (var timeSlot = 0; timeSlot < this.numTimeSlots; timeSlot++) {
            solver.require(atMost(2, _.range(this.numTeams).map(function(team) {
                return v(team, location, timeSlot);
            })));
        }
    }

    // It takes time to travel from one stop to another
    for (var team = 0; team < this.numTeams; team++) {
        for (var location1 = 0; location1 < this.numLocations; location1++) {
            for (var location2 = 0; location2 < this.numLocations; location2++) {
                for (var timeSlot1 = 0; timeSlot1 < this.numTimeSlots; timeSlot1++) {
                    for (var timeSlot2 = 0; timeSlot2 < this.numTimeSlots; timeSlot2++) {
                        var travelTime = this.time(location1, location2);
                        var dt = Math.abs(timeSlot1 - timeSlot2) * this.timeSlotSize;
                        if (travelTime > dt) {
                            solver.require(Logic.not(Logic.and(v(team, location1, timeSlot1), v(team, location2, timeSlot2))));
                        }
                    }
                }
            }
        }
    }

    // Teams stay at least 15min per stop
    for (var team = 0; team < this.numTeams; team++) {
        for (var location = 0; location < this.numLocations; location++) {
            for (var centralTimeSlot = 0; centralTimeSlot < this.numTimeSlots; centralTimeSlot++) {
                var constraints = [];
                for (var i = Math.min(0); i < 3; i++) {
                    if (centralTimeSlot - i >= 0 && centralTimeSlot - i + 3 <= this.numTimeSlots) {
                        constraints.push(Logic.and(_.range(centralTimeSlot - i, centralTimeSlot - i + 3).map(function(timeSlot) {
                            return v(team, location, timeSlot);
                        })));
                    }
                }
                solver.require(Logic.or(Logic.not(v(team, location, centralTimeSlot)), constraints));
            }
        }
    }

    // Allocated travel time is not significantly longer than actual travel time

    // Teams start at the starting location
    for (var team = 0; team < this.numTeams; team++) {
        for (var timeSlot = 0; timeSlot < this.numTimeSlots - 1; timeSlot++) {
            solver.require(Logic.implies(v(team, 0, timeSlot + 1), v(team, 0, timeSlot)));
        }
    }

    // Teams end at the final location
    for (var team = 0; team < this.numTeams; team++) {
        for (var timeSlot = 0; timeSlot < this.numTimeSlots - 1; timeSlot++) {
            solver.require(Logic.implies(v(team, this.numLocations - 1, timeSlot), v(team, this.numLocations - 1, timeSlot + 1)));
        }
    }

    var solution = solver.solve();
    var solutionMap = solution.getMap();

    var routes = [];
    for (var team = 0; team < this.numTeams; team++) {
        routes[team] = [];
        for (var timeSlot = 0; timeSlot < this.numTimeSlots; timeSlot++) {
            routes[team][timeSlot] = undefined;
            for (var location = 0; location < this.numLocations; location++) {
                var isAtLocation = solutionMap[v(team, location, timeSlot)];
                if (isAtLocation) {
                    routes[team][timeSlot] = location;
                }
            }
        }
    }

    callback(routes);
}

/**
* Returns the walking time between two locations
*
* @param a The first location
* @param b The second location
* @return The walking time (in milliseconds)
*/
RoutePlanner.prototype.time = function(a, b) {
    return 1000 * this.distances.rows[a].elements[b].duration.value;
}

/**
* Returns the walking distance between two locations
*
* @param a The first location
* @param b The second location
* @return The walking distance (in meters)
*/
RoutePlanner.prototype.dist = function(a, b) {
    return this.distances.rows[a].elements[b].distance.value;
}

// ########## Helper functions ##########

// Returns a variable's name as a string
function v(team, location, timeSlot) {
    return team + ' ' + location + ' ' + timeSlot;
}

// Similar to Logic.atMostOne(), but with an arbitrary maximum
function atMost(n, operands) {
    return Logic.lessThanOrEqual(Logic.sum(operands), Logic.constantBits(n));
}
