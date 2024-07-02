$(document).ready(function() {
    $('#predictionForm').submit(function(event) {
      event.preventDefault(); // Prevent the form from submitting
  
      // Collect form data
      let formData = {
        age: $('#age').val(),
        sleepDuration: $('#sleepDuration').val(),
        sleepQuality: $('#sleepQuality').val(),
        physicalActivity: $('#physicalActivity').val(),
        stressLevel: $('#stressLevel').val(),
        heartRate: $('#heartRate').val(),
        dailySteps: $('#dailySteps').val(),
        gender: $('#gender').val(),
        occupation: $('#occupation').val(),
        bmiCategory: $('#bmiCategory').val(),
        bloodPressure: $('#bloodPressure').val()
      };
  
      // Send POST request to API
      $.ajax({
        type: 'POST',
        url: 'https://sleep-disorder-prediction-api.onrender.com/predict_sleep_disorder',
        contentType: 'application/json',
        data: JSON.stringify(formData),
        success: function(response) {
          // Update UI with prediction result
          $('#result').html('<div class="alert alert-success">' + response.result + '</div>');
        },
        error: function(xhr, status, error) {
          // Handle errors
          $('#result').html('<div class="alert alert-danger">Error: ' + xhr.responseText + '</div>');
        }
      });
    });
  
    // Validate blood pressure format
    $('#bloodPressure').on('input', function(e) {
      const value = e.target.value;
      const pattern = /^\d{1,3}\/\d{1,3}$/;
      if (!pattern.test(value)) {
        e.target.setCustomValidity('Please enter a valid blood pressure (e.g., 180/35).');
      } else {
        e.target.setCustomValidity('');
      }
    });
  });
  