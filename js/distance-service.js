// This files uses the Google Maps API that is loaded globally in index.html

/**
 * Given an array of locations, fetches the distance and walking times from
 * Google Maps between all of these locations.
 *
 * The distances are in meters and the times are in seconds. This function
 * will avoid Google Maps's number of element limitation by making 4 API calls
 * and then merging the 4 sub matrices.
 */
function fetchDistanceMatrix(locations) {
    return new Promise(function(resolve, reject) {
        const firstHalf = locations.splice(0, locations.length / 2);
        const secondHalf = locations.splice(locations.length / 2, locations.length);
        const p1 = fetchRawDistanceMatrix(firstHalf, locations, 0);
        const p2 = fetchRawDistanceMatrix(secondHalf, locations, 1000);

        Promise.all([p1, p2]).then(function(subMatrices) {
            resolve(_.union(subMatrices[0], subMatrices[1]));
        }, reject);
    });
}

/**
 * Fetches a distance matrix from google maps.
 * 
 * This function is still subject to the google maps number of element limitation.
 */
function fetchRawDistanceMatrix(origins, destinations, delay) {
    return new Promise(function (resolve, reject) {
        setTimeout(function() {
            var distanceService = new google.maps.DistanceMatrixService();
            distanceService.getDistanceMatrix({
                origins: origins,
                destinations: destinations,
                travelMode: google.maps.TravelMode.WALKING,
                unitSystem: google.maps.UnitSystem.METRIC,
                durationInTraffic: true
            },
            (function (response, status) {
                if (status !== google.maps.DistanceMatrixStatus.OK) {
                    reject(new Error('Couldn\'t load distances from google maps: ' + status));
                } else {
                    var distanceMatrix = [];
                    for (var i = 0; i < origins.length; i++) {
                        distanceMatrix[i] = [];
                        for (var j = 0; j < destinations.length; j++) {
                            distanceMatrix[i][j] = {
                                distance: response.rows[i].elements[j].distance.value,
                                time: response.rows[i].elements[j].duration.value
                            }
                        }
                    }

                    resolve(distanceMatrix);
                }
            }).bind(this));
        }, 1000);
    });
}

export default fetchDistanceMatrix;
