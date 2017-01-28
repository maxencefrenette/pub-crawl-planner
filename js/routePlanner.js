function RoutePlanner(numTeams, locations, startTime, endTime) {
  this.numTeams = numTeams;
  this.locations = locations;
  this.numLocations = this.locations.length;
  this.startTime = startTime;
  this.endTime = endTime;
  this.timeSlotSize = 5*60*1000; // 5 minutes
  this.numTimeSlots = Math.floor((endTime - startTime) / timeSlotSize);
}

routePlanner.prototype.generateRoute = function() {
  
}
