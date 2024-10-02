self.onmessage = function (e) {
  const { userData } = e.data;

  if (!userData) {
    self.postMessage({ type: 'error', message: 'No user data provided' });
    return;
  }

  const eventSource = new EventSource(
    `/api/bookmarks/all?user_data=${encodeURIComponent(userData)}`
  );

  // Handle incoming bookmark data
  eventSource.onmessage = function (event) {
    const bookmark = JSON.parse(event.data);
    self.postMessage({ type: 'bookmark', data: bookmark });
  };

  // Handle the 'stop' event sent by the server
  eventSource.addEventListener('stop', function (event) {
    self.postMessage({ type: 'finished' });
    eventSource.close(); // Close the EventSource
    self.close();        // Terminate the worker
  });

  // Handle errors, including when the server closes the connection
  eventSource.onerror = function (event) {
    console.error('Worker EventSource error:', event);

    // Send a more meaningful error message
    const errorDetails = {
      type: event.type,
      readyState: eventSource.readyState,  // Ready state of the EventSource
      status: eventSource.status || 'unknown', // Status if available
      url: eventSource.url, // The URL being connected to
    };

    if (eventSource.readyState === EventSource.CLOSED) {
      self.postMessage({ type: 'finished' });
      eventSource.close();
      self.close(); // Terminate the worker
    } else {
      // Send the error details to the main thread
      self.postMessage({
        type: 'error',
        message: 'SSE error occurred',
        details: errorDetails,
      });
      eventSource.close();
      self.close(); // Terminate the worker
    }
  };

  // Listen for a 'stop' message from the main thread to manually stop the worker
  self.onmessage = function (e) {
    if (e.data === 'stop') {
      eventSource.close();
      self.close();
    }
  };
};
