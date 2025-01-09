import React from "react";

const SatisfactionProgressBar = ({ satisfactionPercentage }: any) => {
  console.log("Inside SatisfactionProgressBar, percentage:", satisfactionPercentage);
  // Determine the color of the progress bar based on satisfaction percentage
  let barColor = "red"; // Default to red for low satisfaction
  if (satisfactionPercentage >= 70) {
    barColor = "green"; // High satisfaction
  } else if (satisfactionPercentage >= 40) {
    barColor = "orange"; // Moderate satisfaction
  }

  // Enhanced style object for the progress bar
  const progressBarStyle = {
    width: `${satisfactionPercentage}%`,
    backgroundColor: barColor,
    height: "30px", // Increased height for better visibility
    borderRadius: "5px", // Rounded corners
    transition: "width 0.5s ease-in-out", // Smooth transition for width changes
  };

  // Style for the container to make the rounded corners visible and add padding
  const containerStyle = {
    width: "100%",
    backgroundColor: "#ddd",
    borderRadius: "5px", // Match the progress bar for consistency
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Subtle shadow for depth
    overflow: "hidden", // Ensures the progress bar's rounded corners are visible
    marginBottom: "10px", // Added space between the bar and the percentage text
  };

  // Style for the percentage text
  const percentageTextStyle = {
    textAlign: "center", // Center-align the text
    fontSize: "18px", // Adjust font size as needed
    fontWeight: "bold", // Make the text bold
    color: "#000", // Text color (you can adjust it as needed)
    marginTop: "10px", // Space between the progress bar and the text
  };

  return (
    <div style={{ marginTop: "20px" }}>
      {" "}
      {/* Adjust this value as needed for spacing */}
      <div className="progress-bar-container" style={containerStyle}>
        <div className="progress-bar" style={progressBarStyle}></div>
      </div>
      {/* Percentage text */}
      <div style={percentageTextStyle}>{Math.round(satisfactionPercentage)}% </div>
      <div>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>All Locations</h2>
      </div>
    </div>
  );
};

export default SatisfactionProgressBar;
