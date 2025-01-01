const textBox = document.getElementById('text-box');
const toggleModeButton = document.getElementById('toggle-mode');
let isDarkMode = true;

toggleModeButton.addEventListener('click', () => {
  isDarkMode = !isDarkMode;
  document.documentElement.style.setProperty('--contrast-bg', isDarkMode ? '#000' : '#fff');
  document.documentElement.style.setProperty('--contrast-color', isDarkMode ? '#fff' : '#000');
});

textBox.addEventListener('mousedown', () => {
  textBox.style.background = getComputedStyle(document.documentElement).getPropertyValue('--contrast-bg');
  textBox.style.color = getComputedStyle(document.documentElement).getPropertyValue('--contrast-color');
});

textBox.addEventListener('mouseup', () => {
  textBox.style.background = 'rgba(255, 255, 255, 0.5)';
  textBox.style.color = '#333';
});
