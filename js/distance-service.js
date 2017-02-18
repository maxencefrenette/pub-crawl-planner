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
        const maxElements = 100;
        const chunkSize = Math.floor(maxElements / locations.length);
        var promises = [];

        for(var i = 0; chunkSize * i < locations.length; i++) {
            const chunkEnd = Math.min(chunkSize * (i + 1), locations.length);
            const chunk = locations.slice(chunkSize * i, chunkEnd);
            promises.push(fetchRawDistanceMatrix(chunk, locations, 10000 * i));
        }

        Promise.all(promises).then(function(subMatrices) {
            resolve(_.flatten(subMatrices, true));
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
        }, delay);
    });
}

export default fetchDistanceMatrix;
