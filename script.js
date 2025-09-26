const API_BASE_URL = 'https://api.torn.com/user/?selections=travel&key=';

async function checkStatus() {
    const apiKey = document.getElementById('apiKeyInput').value.trim();
    const statusDisplay = document.getElementById('statusDisplay');
    const errorDisplay = document.getElementById('errorDisplay');
    const descriptionElement = document.getElementById('description');
    const detailsElement = document.getElementById('details');
    const statusIconElement = document.getElementById('statusIcon');
    const planeElement = document.getElementById('plane');

    // Clear previous status
    statusDisplay.classList.add('hidden');
    errorDisplay.classList.add('hidden');
    statusDisplay.className = 'status-display'; // Reset classes
    planeElement.classList.add('hidden');
    statusIconElement.innerHTML = '';
    descriptionElement.textContent = 'Checking...';
    detailsElement.textContent = '';

    if (!apiKey) {
        errorDisplay.textContent = 'Please enter a valid API Key.';
        errorDisplay.classList.remove('hidden');
        return;
    }

    const url = `${API_BASE_URL}${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            errorDisplay.textContent = `API Error: ${data.error.error}`;
            errorDisplay.classList.remove('hidden');
            return;
        }

        const travelData = data.travel;
        let statusClass = '';
        let statusDescription = '';
        let details = '';
        let iconHTML = '';
        let showPlane = false;

        // Determine status based on Torn API response structure
        // Note: The Torn API returns 'traveling' only when the player is mid-flight.
        // It returns 'abroad' with location when player is at a destination.
        // If the player is in Torn, the 'travel' selection returns location as 'Torn'
        // or a different main status from the /user/ endpoint like 'Hospital'
        
        // This simplified logic assumes player is 'Home' if travel is not 'Travelling' or 'Abroad'
        const travelStatus = travelData.status;

        if (travelStatus === 'Travelling') {
            // 2 - flying, 4 - returning (both mid-air)
            statusClass = 'status-flying';
            showPlane = true;
            statusDescription = `Flying ${travelData.from_to.startsWith('Torn') ? 'from' : 'to'} ${travelData.destination}`;
            details = `Time left: ${formatTime(travelData.time_left)}`;
        } else if (travelData.destination !== 'Torn') {
             // 3 - abroad (Vacation Area/Beach)
            statusClass = 'status-abroad';
            iconHTML = '<i class="fas fa-umbrella-beach"></i>'; // Beach icon for abroad
            statusDescription = `Abroad in ${travelData.destination}`;
            details = 'Enjoying the vacation area!';
        } else {
            // 1 - not flying (Home/Something Dark) - assuming player is in Torn
            statusClass = 'status-home';
            iconHTML = '<i class="fas fa-home"></i>'; // Home icon for not flying
            statusDescription = 'Not Flying - Home in Torn';
            details = 'Status: Safe and sound in Torn City.';
        }


        // Update the display elements
        statusDisplay.classList.remove('hidden');
        statusDisplay.classList.add(statusClass);
        descriptionElement.textContent = statusDescription;
        detailsElement.textContent = details;
        statusIconElement.innerHTML = iconHTML;

        if (showPlane) {
            planeElement.classList.remove('hidden');
        } else {
            planeElement.classList.add('hidden');
        }

    } catch (error) {
        console.error('Fetch error:', error);
        errorDisplay.textContent = 'Failed to connect to the Torn API.';
        errorDisplay.classList.remove('hidden');
    }
}

// Utility function to format seconds into readable time
function formatTime(seconds) {
    if (seconds <= 0) return '0s';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    let parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0) parts.push(`${s}s`);
    
    return parts.join(' ');
}