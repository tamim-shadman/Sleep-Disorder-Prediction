$(document).ready(function() {
  $('#predictionForm').submit(function(event) {
      event.preventDefault(); // Prevent the form from submitting

      // Collect form data
      let formData = {
          age: parseFloat($('#age').val()),
          sleep_duration: parseFloat($('#sleepDuration').val()),
          quality_of_sleep: parseFloat($('#sleepQuality').val()),
          physical_activity_level: parseFloat($('#physicalActivity').val()),
          stress_level: parseFloat($('#stressLevel').val()),
          heart_rate: parseFloat($('#heartRate').val()),
          daily_steps: parseFloat($('#dailySteps').val()),
          gender: $('#gender').val(),
          occupation: $('#occupation').val(),
          bmi_category: $('#bmiCategory').val(),
          blood_pressure: $('#bloodPressure').val()
      };

      console.log('Form Data:', formData); // Log form data to ensure it's being collected correctly

      // Validate the form data before sending
      let isValid = true;
      for (let key in formData) {
          if (!formData[key]) {
              isValid = false;
              console.error(`Invalid data for ${key}:`, formData[key]);
          }
      }

      if (!isValid) {
          $('#modal').html('<div class="alert alert-danger">Please fill out all fields correctly.</div>');
          return;
      }

      // Send POST request to API
      $.ajax({
          type: 'POST',
          url: 'https://sleep-disorder-prediction-api.onrender.com/predict_sleep_disorder',
          contentType: 'application/json',
          data: JSON.stringify(formData),
          success: function(data) {
              if (data.sleep_disorder == 0) {
                  $('#noSleepDisorderModal').modal('show');
              } else if (data.sleep_disorder == 1) {
                  $('#sleepApneaModal').modal('show');
              } else if (data.sleep_disorder == 2) {
                  $('#insomniaModal').modal('show');
              }
          },
          error: function(jqXHR, textStatus, errorThrown) {
              console.error('Error:', textStatus, errorThrown);
              $('#modal').html('<div class="alert alert-danger">An error occurred while processing your request. Please try again later.</div>');
          }
      });
  });

  // Recommendation button click handlers
  $('#recommendationNoDisorder').click(function() {
      // Handle recommendations for no disorder
      alert('No Sleep Disorder Recommendations...');
  });

  $('#recommendationSleepApnea').click(function() {
      // Handle recommendations for sleep apnea
      alert('Sleep Apnea Recommendations...');
  });

  $('#recommendationInsomnia').click(function() {
      // Handle recommendations for insomnia
      alert('Insomnia Recommendations...');
  });

  // Validate blood pressure format (if required)
});
