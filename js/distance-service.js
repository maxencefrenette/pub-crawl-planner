// This files uses the Google Maps API that is loaded globally in index.html

/**
 * Given an array of locations, fetches the distance and walking times from
 * Google Maps between all of these locations.
 *
 * The distances are in meters and the times are in seconds.
 */
function fetchDistanceMatrix(locations) {
    return new Promise(function (resolve, reject) {
        var distanceService = new google.maps.DistanceMatrixService();
        distanceService.getDistanceMatrix({
            origins: locations,
            destinations: locations,
            travelMode: google.maps.TravelMode.WALKING,
            unitSystem: google.maps.UnitSystem.METRIC,
            durationInTraffic: true
        },
        (function (response, status) {
            if (status !== google.maps.DistanceMatrixStatus.OK) {
                reject(new Error('Couldn\'t load distances from google maps: ' + status));
            } else {
                var distanceMatrix = [];
                for (var i = 0; i < locations.length; i++) {
                    distanceMatrix[i] = [];
                    for (var j = 0; j < locations.length; j++) {
                        distanceMatrix[i][j] = {
                            distance: response.rows[i].elements[j].distance.value,
                            time: response.rows[i].elements[j].duration.value
                        }
                    }
                }

                resolve(distanceMatrix);
            }
        }).bind(this));
    });
}

export default fetchDistanceMatrix;
