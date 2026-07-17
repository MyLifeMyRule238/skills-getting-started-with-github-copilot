console.log("Mergington app.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  let messageTimeoutId;

  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove("hidden");

    if (messageTimeoutId) {
      clearTimeout(messageTimeoutId);
    }

    messageTimeoutId = setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities", { cache: "no-store" });
      const activities = await response.json();
      console.log("Fetched activities:", activities);

      // Clear loading message and reset activity dropdown
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const participants = Array.isArray(details.participants) ? details.participants : [];
        const spotsLeft = details.max_participants - participants.length;

        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";

        const participantsTitle = document.createElement("h5");
        participantsTitle.textContent = `Participants (${participants.length})`;
        participantsSection.appendChild(participantsTitle);

        if (participants.length > 0) {
          const participantList = document.createElement("ul");
          participantList.className = "participant-list";
          participants.forEach((participant) => {
            const listItem = document.createElement("li");
            listItem.className = "participant-item";

            const participantName = document.createElement("span");
            participantName.className = "participant-name";
            participantName.textContent = participant;

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "participant-remove-btn";
            removeButton.dataset.activityName = name;
            removeButton.dataset.email = participant;
            removeButton.setAttribute("aria-label", `Remove ${participant} from ${name}`);
            removeButton.title = `Remove ${participant}`;
            removeButton.textContent = "✕";

            listItem.appendChild(participantName);
            listItem.appendChild(removeButton);
            participantList.appendChild(listItem);
          });
          participantsSection.appendChild(participantList);
        } else {
          const emptyMessage = document.createElement("p");
          emptyMessage.className = "participants-empty";
          emptyMessage.textContent = "No participants yet";
          participantsSection.appendChild(emptyMessage);
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;
        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  activitiesList.addEventListener("click", async (event) => {
    const removeButton = event.target.closest(".participant-remove-btn");
    if (!removeButton) {
      return;
    }

    const activityName = removeButton.dataset.activityName;
    const email = removeButton.dataset.email;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activityName)}/unregister?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success");
        await fetchActivities();
      } else {
        showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage("Failed to unregister participant. Please try again.", "error");
      console.error("Error unregistering participant:", error);
    }
  });

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success");
        signupForm.reset();
        await fetchActivities();
      } else {
        showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage("Failed to sign up. Please try again.", "error");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
