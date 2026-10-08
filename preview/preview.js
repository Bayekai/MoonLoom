document.querySelectorAll('[data-screen]').forEach(button=>button.addEventListener('click',()=>{document.querySelector('#app').src='http://localhost:8082'+button.dataset.screen;}));
