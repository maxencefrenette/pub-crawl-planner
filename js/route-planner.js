import _ from 'underscore';

import Logic from 'logic-solver';

function RoutePlanner(numTeams, locations, startTime, endTime, fetchDistanceMatrix) {
    /**
     * The number of teams participating to the crawl
     */
    this.numTeams = numTeams;
    /**
     * The array of locations that each team has to visit. The first location
     * in the array is the starting location and the last location is the final
     * location.
     */
    this.locations = locations;
    /**
     * Start time of the event
     */
    this.startTime = startTime;
    /**
     * End time of the event
     */
    this.endTime = endTime;
    /**
     * Reference to a method that fetches a distanceMatrix
     */
     this.fetchDistanceMatrix = fetchDistanceMatrix;
    /**
     * Size of the discrete time slots used to generate the routes.
     */
    this.timeSlotSize = 5*60*1000; // 5 minutes
    this.numTimeSlots = Math.floor((this.endTime - this.startTime) / this.timeSlotSize);
    /**
     * Maximum amount of teams that can be at the same location at a time.
     */
    this.numTeamsPerLocation = 3;
    /**
     * Minimum amount of time a team has to spend at a location they are visiting
     */
    this.minTimeAtLocation = 15*60*1000; // 15 minutes
    /**
     * Maximum amount of time a team can spend at a location
     */
    this.maxTimeAtLocation = 2 * this.minTimeAtLocation - 1;
    /**
     * Maximum amount of time a team can spend travelling between two stops
     */
    this.maxTimeTraveling = 40*60*1000; // 25 minutes
}

RoutePlanner.prototype.generateRoutes = function(displayMessage) {
    return new Promise((function(resolve, reject) {
        this.fetchDistanceMatrix(this.locations, (function(distanceMatrix) {
            try {
                this.distanceMatrix = distanceMatrix;
                resolve(this.computeRoutes(displayMessage));
            } catch (e) {
                reject(e);
            }
        }).bind(this));
    }).bind(this));
}

RoutePlanner.prototype.computeRoutes = function(displayMessage) {
    var solver = new Logic.Solver();

    displayMessage('Generating basic routes...');
    solver.require(this.startLocationConstraint());
    solver.require(this.endLocationConstraint());
    solver.require(this.distanceConstraint());
    solver.require(this.visitEveryLocationConstraint());
    this.assertSolution(solver.solve());

    displayMessage('Ensuring no more than ' + this.numTeamsPerLocation + ' teams are at the same location at once...');
    solver.require(this.teamsPerLocationConstraint());
    this.assertSolution(solver.solve());

    displayMessage('Ensuring teams spend at least ' + (this.minTimeAtLocation / 60000) + 'min per location...');
    solver.require(this.minTimeAtLocationConstraint());
    this.assertSolution(solver.solve());

    displayMessage('Ensuring teams don\'t spend more than ' + (this.maxTimeAtLocation / 60000) + 'min per location...');
    solver.require(this.maxTimeAtLocationConstraint());
    this.assertSolution(solver.solve());

    displayMessage('Ensuring that teams aren\'t given more than' + (this.maxTimeTraveling / 60000) + 'min between two stops...');
    solver.require(this.maxTimeTravellingConstraint());
    this.assertSolution(solver.solve());

    displayMessage('Parsing solution...');
    var solution = solver.solve();
    if (solution == null) {
        throw new Error("Routes could not be generated. There are too many teams and pubs and/or the event is too short.");
    }
    var solutionMap = solution.getMap();

    var routes = [];
    for (var team = 0; team < this.numTeams; team++) {
        routes[team] = [];
        for (var timeSlot = 0; timeSlot < this.numTimeSlots; timeSlot++) {
            routes[team][timeSlot] = undefined;
            for (var location = 0; location < this.locations.length; location++) {
                var isAtLocation = solutionMap[v(team, location, timeSlot)];
                if (isAtLocation) {
                    routes[team][timeSlot] = location;
                }
            }
        }
    }

    return routes;
}

RoutePlanner.prototype.assertSolution = function(solution) {
    if (solution == null) {
        throw new Error("There are too many teams and pubs and/or the event is too short.");
    }
}

// Teams start at the starting location
RoutePlanner.prototype.startLocationConstraint = function() {
    var constraints = [];
    for (var team = 0; team < this.numTeams; team++) {
        for (var timeSlot = 0; timeSlot < this.numTimeSlots - 1; timeSlot++) {
            constraints.push(Logic.implies(v(team, 0, timeSlot + 1), v(team, 0, timeSlot)));
        }
    }
    return Logic.and(constraints);
}

// Teams end at the final location
RoutePlanner.prototype.endLocationConstraint = function() {
    var constraints = [];
    for (var team = 0; team < this.numTeams; team++) {
        for (var timeSlot = 0; timeSlot < this.numTimeSlots - 1; timeSlot++) {
            constraints.push(Logic.implies(v(team, this.locations.length - 1, timeSlot), v(team, this.locations.length - 1, timeSlot + 1)));
        }
    }
    return Logic.and(constraints);
}

// It takes time to travel from one stop to another
RoutePlanner.prototype.distanceConstraint = function() {
    var constraints = [];
    for (var team = 0; team < this.numTeams; team++) {
        for (var location1 = 0; location1 < this.locations.length; location1++) {
            for (var location2 = 0; location2 < this.locations.length; location2++) {
                for (var timeSlot1 = 0; timeSlot1 < this.numTimeSlots; timeSlot1++) {
                    for (var timeSlot2 = 0; timeSlot2 < this.numTimeSlots; timeSlot2++) {
                        var travelTime = this.time(location1, location2);
                        var dt = Math.abs(timeSlot1 - timeSlot2 - 1) * this.timeSlotSize;
                        if (travelTime > dt) {
                            constraints.push(Logic.not(Logic.and(v(team, location1, timeSlot1), v(team, location2, timeSlot2))));
                        }
                    }
                }
            }
        }
    }
    return Logic.and(constraints);
}

// Teams have to visit every stop
RoutePlanner.prototype.visitEveryLocationConstraint = function() {
    var constraints = [];
    for (var team = 0; team < this.numTeams; team++) {
        for (var location = 0; location < this.locations.length; location++) {
            constraints.push(Logic.or(_.range(this.numTimeSlots).map(function(timeSlot) {
                return v(team, location, timeSlot);
            })));
        }
    }
    return Logic.and(constraints);
}

// A stop hosts hosts a maximum of n teams at a time
RoutePlanner.prototype.teamsPerLocationConstraint = function() {
    var constraints = [];
    for (var location = 1; location < this.locations.length - 1; location++) {
        for (var timeSlot = 0; timeSlot < this.numTimeSlots; timeSlot++) {
            constraints.push(atMost(this.numTeamsPerLocation, _.range(this.numTeams).map(function(team) {
                return v(team, location, timeSlot);
            })));
        }
    }
    return Logic.and(constraints);
}

// Teams stay a minimum of this.minTimeAtLocation per location
RoutePlanner.prototype.minTimeAtLocationConstraint = function() {
    var constraints = [];
    var minTimeSlotsPerLocation = this.minTimeAtLocation / this.timeSlotSize;
    for (var team = 0; team < this.numTeams; team++) {
        for (var location = 0; location < this.locations.length; location++) {
            for (var centralTimeSlot = 0; centralTimeSlot < this.numTimeSlots; centralTimeSlot++) {
                var constraints2 = [];
                for (var i = 0; i < minTimeSlotsPerLocation; i++) {
                    if (centralTimeSlot - i >= 0 && centralTimeSlot - i + minTimeSlotsPerLocation <= this.numTimeSlots) {
                        constraints2.push(Logic.and(_.range(centralTimeSlot - i, centralTimeSlot - i + minTimeSlotsPerLocation).map(function(timeSlot) {
                            return v(team, location, timeSlot);
                        })));
                    }
                }
                constraints.push(Logic.or(Logic.not(v(team, location, centralTimeSlot)), constraints));
            }
        }
    }
    return Logic.and(constraints);
}

// Teams stay a maximum of this.maxTimeAtLocation per location
RoutePlanner.prototype.maxTimeAtLocationConstraint = function() {
    var constraints = [];
    var maxTimeSlotsPerLocation = Math.floor(this.maxTimeAtLocation / this.timeSlotSize);
    for (var team = 0; team < this.numTeams; team++) {
        for (var location = 1; location < this.locations.length - 1; location++) {
            constraints.push(atMost(maxTimeSlotsPerLocation, _.range(this.numTimeSlots).map(function(timeSlot) {
                return v(team, location, timeSlot);
            })));
        }
    }
    return Logic.and(constraints);
}

// Allocated travel time is not significantly longer than this.maxTravelTime
RoutePlanner.prototype.maxTimeTravellingConstraint = function() {
    var constraints = [];
    var maxTimeSlotsTraveling = this.maxTimeTraveling / this.timeSlotSize;
    for (var team = 0; team < this.numTeams; team++) {
        for (var timeSlot = 0; timeSlot < this.numTimeSlots - maxTimeSlotsTraveling; timeSlot++) {
            var constraints = [];
            for (var i = 0; i < maxTimeSlotsTraveling; i++) {
                constraints.push(Logic.or(_.range(this.numLocations).map(function(location) {
                    return v(team, location, timeSlot+i);
                })));
            }
            constraints.push(Logic.or(constraints));
        }
    }
    return Logic.and(constraints);
}

/**
* Returns the walking time between two locations
*
* @param a The first location
* @param b The second location
* @return The walking time (in milliseconds)
*/
RoutePlanner.prototype.time = function(a, b) {
    return 1000 * this.distanceMatrix[a][b].time;
}

/**
* Returns the walking distance between two locations
*
* @param a The first location
* @param b The second location
* @return The walking distance (in meters)
*/
RoutePlanner.prototype.dist = function(a, b) {
    return this.distanceMatrix[a][b].distance;
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

export default RoutePlanner;
