class Heart {
    constructor(emoji) {
        this.element = document.createElement('div'); // Create a new div element for the heart
        this.element.classList.add('heart'); // Add 'heart' class to the element for styling
        this.element.innerText = emoji; // Set the passed emoji as the content of the element
        // Set the initial position of the heart to be near the center of the viewport with a random offset
        this.element.style.left = `calc(50vw - 15px + ${(Math.random() * 10) - 5}vw)`;
        this.element.style.top = `calc(50vh - 15px + ${(Math.random() * 10) - 5}vh)`;
        this.size = 70; // Initial size of the heart
        this.element.style.fontSize = `${this.size}px`; // Apply the size to the heart's font size
        // Set the initial velocity of the heart with a random direction and speed
        this.velocity = {
            x: (Math.random() - 0.5) * 10,
            y: (Math.random() + 1) * -5
        };
        document.body.appendChild(this.element); // Add the heart element to the document body
    }

    update() {
        const rect = this.element.getBoundingClientRect(); // Get the current position and size of the heart
        this.velocity.y += 0.1; // Apply gravity effect by increasing the y-velocity
        // Update the position of the heart based on its velocity
        this.element.style.top = `${rect.top + this.velocity.y}px`;
        this.element.style.left = `${rect.left + this.velocity.x}px`;

        this.size -= 0.2; // Gradually decrease the size of the heart to simulate shrinking
        this.element.style.fontSize = `${this.size}px`; // Apply the new size to the heart's font size

        // Check if the heart is out of the viewport bounds and remove it if so
        if (rect.top > document.documentElement.clientHeight || rect.left < 0 || rect.right > document.documentElement.clientWidth) {
            this.element.remove(); // Remove the heart element from the document
            return false; // Return false to indicate the heart should be removed from the array
        }
        return true; // Return true to keep the heart in the array
    }
}

// Function to update the emoji for new hearts
function changeHeartEmoji(newEmoji) {
    Heart.prototype.defaultEmoji = newEmoji;
}

// Add a button to the page for changing the emoji
function addEmojiChangeButton() {
    const button = document.createElement('button');
    button.innerText = 'Change Heart Emoji';
    button.addEventListener('click', () => {
        const newEmoji = prompt('Enter a new emoji for the hearts:');
        if (newEmoji) {
            changeHeartEmoji(newEmoji);
        }
    });
    document.body.appendChild(button);
}

const hearts = []; // Array to store all heart instances
let lastHeartCreationTime = Date.now(); // Timestamp of the last heart creation
const heartCreationInterval = 25; // Time interval between creating hearts in milliseconds

function update() {
    const currentTime = Date.now();
    if (currentTime - lastHeartCreationTime > heartCreationInterval) {
        const heart = new Heart(Heart.prototype.defaultEmoji || '❤️'); // Use default emoji or fallback to heart
        hearts.push(heart);
        lastHeartCreationTime = currentTime;
    }

    // Update each heart and remove it from the array if it's out of bounds
    hearts.forEach((heart, index) => {
        if (!heart.update()) {
            hearts.splice(index, 1); // Remove the heart from the array
        }
    });

    requestAnimationFrame(update); // Request the next animation frame to continue the loop
}

window.addEventListener('load', () => {
    addEmojiChangeButton(); // Call this function to add the button to the page
    requestAnimationFrame(update);
});