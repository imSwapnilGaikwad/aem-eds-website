function showMessage() {
    const messageDiv = document.getElementById('message');
    const messages = [
        '🚀 Hello from AI generated JavaScript!',
        '✨ This code was automatically synchronized!',
        '🎉 GitHub integration is working perfectly!',
        '💡 Your code is now live on GitHub!'
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    messageDiv.innerHTML = randomMessage;
    
    // Add some animation
    messageDiv.style.opacity = '0';
    setTimeout(() => {
        messageDiv.style.opacity = '1';
        messageDiv.style.transition = 'opacity 0.5s ease-in-out';
    }, 100);
    
    console.log('AI Generated Code Executed Successfully!');
    console.log('Generated at:', new Date().toISOString());
}