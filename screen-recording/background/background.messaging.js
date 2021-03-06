var runtimePort;

chrome.runtime.onConnect.addListener(function (port) {
  runtimePort = port;

  runtimePort.onMessage.addListener(function (message) {
    if (!message || !message.messageFromContentScript1234) {
      return;
    }

    if (message.startRecording) {
      if (message.onlyMicrophone && enableCamera) {
        message.startRecording = false;
        message.stopRecording = true;
        alert("Unable to access camera device.");
        setDefaults();
        return;
      }
    }

    if (message.startRecording) {
      if (message.dropdown) {
        openPreviewOnStopRecording = true;
        openCameraPreviewDuringRecording = true;
      }

      if (isRecording && message.dropdown) {
        stopScreenRecording();
        return;
      }

      if (message.RecordRTC_Extension) {
        openPreviewOnStopRecording = false;
        openCameraPreviewDuringRecording = false;

        enableTabCaptureAPI = message["enableTabCaptureAPI"] === true;
        enableTabCaptureAPIAudioOnly =
          message["enableTabCaptureAPIAudioOnly"] === true;
        enableScreen = message["enableScreen"] === true;
        enableMicrophone = message["enableMicrophone"] === true;
        enableCamera = message["enableCamera"] === true;
        enableSpeakers = message["enableSpeakers"] === true;
        fixVideoSeekingIssues = message["fixVideoSeekingIssues"] === true;
        bitsPerSecond = Number.isInteger(message["bitsPerSecond"])
          ? message["bitsPerSecond"]
          : 100000;
        width = Number.isInteger(message["width"]) ? message["width"] : 1920;
        height = Number.isInteger(message["height"]) ? message["height"] : 1080;

        startRecordingCallback = function (file) {
          port.postMessage({
            messageFromContentScript1234: true,
            startedRecording: true,
          });
        };

        chrome.storage.sync.set(
          {
            enableTabCaptureAPI: enableTabCaptureAPI ? "true" : "false",
            enableTabCaptureAPIAudioOnly: enableTabCaptureAPIAudioOnly
              ? "true"
              : "false",
            enableMicrophone: enableMicrophone ? "true" : "false",
            enableCamera: enableCamera ? "true" : "false",
            enableScreen: enableScreen ? "true" : "false",
            enableSpeakers: enableSpeakers ? "true" : "false",
            fixVideoSeekingIssues: fixVideoSeekingIssues ? "true" : "false",
            bitsPerSecond: bitsPerSecond ? bitsPerSecond : 100000,
            videoResolutions: `${width}x${height}`,
            isRecording: "true",
          },
          function () {
            getUserConfigs();
          }
        );
        return;
      }

      getUserConfigs();
      return;
    }

    if (message.stopRecording) {
      if (message.RecordRTC_Extension) {
        stopRecordingCallback = function (file) {
          var blob_url = window.URL.createObjectURL(file);
          port.postMessage({
            messageFromContentScript1234: true,
            stoppedRecording: true,
            file: blob_url,
          });
        };
      }

      stopScreenRecording();
      return;
    }
  });
});
