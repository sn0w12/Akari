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
  eventSource.onerror = function (error) {
    console.error('Worker EventSource error:', error);

    if (eventSource.readyState === EventSource.CLOSED) {
      self.postMessage({ type: 'finished' });
      eventSource.close();
      self.close(); // Terminate the worker
    } else {
      // Instead of sending the entire error object, just send a message
      self.postMessage({
        type: 'error',
        message: 'SSE error',
        details: error.message || 'Unknown error occurred',
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
