
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
            $('#alertMessage').text('Please fill in all fields correctly.');
            showPopup();
            return;
        }

        // Send POST request to API
        $.ajax({
            type: 'POST',
            url: 'https://sleep-disorder-prediction-api.onrender.com/predict_sleep_disorder',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function(data) {
                let message;
                if (data.sleep_disorder === 0) {
                    message = 'You have a healthy Sleep Routine';
                } else if (data.sleep_disorder === 1) {
                    message = 'Insomnia';
                } else if (data.sleep_disorder === 2) {
                    message = 'Sleep Apnea';
                } else {
                    message = 'Unexpected result.';
                }
                $('#alertMessage').text(message);
                showPopup();
            },
            error: function(xhr, status, error) {
                console.error('Error:', error);
                $('#alertMessage').text('An error occurred while processing your request.');
                showPopup();
            }
        });
    });

    // Function to show the popup
    function showPopup() {
        var popup = document.getElementById("customAlert");
        popup.style.display = "block";
    }

    // Function to close the popup
    var span = document.getElementsByClassName("close")[0];
    span.onclick = function() {
        var popup = document.getElementById("customAlert");
        popup.style.display = "none";
    }

    // Close the popup when the user clicks anywhere outside of it
    window.onclick = function(event) {
        var popup = document.getElementById("customAlert");
        if (event.target == popup) {
            popup.style.display = "none";
        }
    }

    // Handle option buttons
    $('#option1').click(function() {
        alert('You are Welcome');
        var popup = document.getElementById("customAlert");
        popup.style.display = "none";
    });

    $('#option2').click(function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showError);
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    });

    function showPosition(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        var hospitalUrl = `https://www.google.com/maps/search/hospital/@${lat},${lon},15z`;
        $('#option2').replaceWith(`<a href="${hospitalUrl}" target="_blank" class="button-link">Find nearby hospitals</a>`);
    }

    function showError(error) {
        switch(error.code) {
            case error.PERMISSION_DENIED:
                $('#alertMessage').text("User denied the request for Geolocation.");
                break;
            case error.POSITION_UNAVAILABLE:
                $('#alertMessage').text("Location information is unavailable.");
                break;
            case error.TIMEOUT:
                $('#alertMessage').text("The request to get user location timed out.");
                break;
            case error.UNKNOWN_ERROR:
                $('#alertMessage').text("An unknown error occurred.");
                break;
        }
    }
});
