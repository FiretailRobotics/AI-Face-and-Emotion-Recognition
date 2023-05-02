const video = document.querySelector("#video");

// Load models to detect face and expressions
// Asynchronous calls will be made in parallel for quicker execution
Promise.all([
	faceapi.nets.tinyFaceDetector.loadFromUri("/models"), // Characterization of scale, resolution, and context to find faces
	faceapi.nets.faceLandmark68Net.loadFromUri("/models"), // Register diff parts of face (mouth, eyes..)
	faceapi.nets.faceRecognitionNet.loadFromUri("/models"), // Register face total area
	faceapi.nets.faceExpressionNet.loadFromUri("/models"), // Register expressions - smiling, frowning, etc.
]).then(startVideo);

// Start webcam access
async function startVideo() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (error) {
    console.error('Error accessing webcam:', error);
  }
}

// When video starts playing, recognize face
video.addEventListener("play", () => {
	const canvas = faceapi.createCanvasFromMedia(video); //
	document.body.append(canvas);
	const displaySize = { width: video.width, height: video.height };
	faceapi.matchDimensions(canvas, displaySize);
	setInterval(async () => {
		// Detect each / every face rendered in webcam video
		// Using .detectAllFaces method with video element and instance model TinyFaceDetectorOptions as parameters
		const detections = await faceapi
			.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
			.withFaceLandmarks() // Methods to detect human face anatomy and visual expression
			.withFaceExpressions();

		const resizedDetections = faceapi.resizeResults(detections, displaySize); // resizeResults method calculates size of face detection per video sceen dimension and fits accurately to detected face
		canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
		faceapi.draw.drawDetections(canvas, resizedDetections);
		faceapi.draw.drawFaceLandmarks(canvas, resizedDetections); // drawing methods to display detections to canvas
		faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
	}, 100);
});
