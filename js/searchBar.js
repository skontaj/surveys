const btn = document.querySelector('#search_btn');

btn.addEventListener('click', (e) => {
  e.preventDefault();
  
  const searchBarInput = document.querySelector('#searchBar');
  const filter = searchBarInput.value.toUpperCase();
  
  const h2Elements = document.querySelectorAll('h2');
  
  h2Elements.forEach((h2) => {
    const a = h2.parentElement;
    const textValue = h2.textContent;
    
    if (textValue.toUpperCase().indexOf(filter) > -1) {
      a.style.display = "";
    } else {
      a.style.display = "none";
    }
  });
});
