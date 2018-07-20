class FaceJS {
    /**
     *
     * @param {string} key The Azure Service key
     * @param {string} region The region the key is for
     */
    constructor(key, region) {
        this.key = key;
        this.region = region;
    }

    /**
     * Send a request to an Azure Face endpoint.
     *
     * @private
     *
     * @param {string} endpoint The Azure endpoint to send a request to.
     * @param {string} method The HTTP method of the request.
     * @param {Object[]} parameters The parameters of the request.
     * @param {string} parameters[].name The name of the parameter.
     * @param {string} parameters[].value The value of the parameter.
     * @param {*} [body] The body of the request.
     * @param {string} [contentType] The Content-Type of the body if present.
     *
     * @returns {Promise<Response>} The request response.
     */
    
    sendRequest(endpoint, method, parameters, body, contentType) {
        // Format the url for the request
        let url = `https://${this.region}.api.cognitive.microsoft.com/face/v1.0/${endpoint}`;

        // Create the query string
        let queryString = parameters.map((param, index, array) => {
            // All names and values are url-encoded
            return `${encodeURIComponent(param.name)}=${encodeURIComponent(param.value)}`;
        }).join('&');

        // Add the query string to the url if present
        if (queryString) {
            url += '?' + queryString;
        }

        // Create the headers
        let headers = new Headers();
        if (method === 'POST') {
            headers.set('Content-Type', contentType);
        }
        headers.set('Ocp-Apim-Subscription-Key', this.key);

        // Make the request
        return fetch(url, {
            method: method,
            headers: headers,
            body: body
        });
    }

    /**
     * Detect faces in an image.
     *
     * @param {Blob|BufferSource} image The image to detect faces in.
     * @param {boolean} [faceId] Whether or not to return ids of the faces.
     * @param {boolean} [faceLandmarks] Whether or not to return landmarks of the faces.
     * @param {Array<string>} [faceAttributes=[]] What attributes of the face to return.
     *
     * @returns {Promise<Object>} The request reponse.
     */
    detectFaces(image, faceId, faceLandmarks, faceAttributes) {
        if (image === undefined) {
            throw new Error('image is not an optional parameter');
        }

        let parameters = [];
        if (faceId !== undefined) {
            parameters.push({
                name: 'returnFaceId',
                value: faceId
            });
        }
        if (faceLandmarks !== undefined) {
            parameters.push({
                name: 'returnFaceLandmarks',
                value: faceLandmarks
            });
        }
        if (faceAttributes !== undefined) {
            parameters.push({
                name: 'returnFaceAttributes',
                value: faceAttributes.join(',')
            });
        }

        return this.sendRequest('detect', 'POST', parameters, image, 'application/octet-stream').then(response => {
            return response.json();
        });
    }

    /**
     * Verify that two face ids are the same face.
     *
     * @param {string} faceId1 The first face id.
     * @param {string} faceId2 The second face id.
     *
     * @returns {Promise<Object>} The response request.
     */
    verifyFace(faceId1, faceId2) {
        if (faceId1 === undefined) {
            throw new Error('faceId1 is not an optional parameter');
        }
        if (faceId2 === undefined) {
            throw new Error('faceId2 is not an optional parameter');
        }

        return this.sendRequest('verify', 'POST', [], JSON.stringify({
            faceId1: faceId1,
            faceId2: faceId2
        }), 'application/json').then(response => response.json());
    }
}
