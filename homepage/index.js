document.addEventListener("DOMContentLoaded", function() {
  const myMenu = document.getElementById("menu");
  const sidebar = document.querySelector('.sidebar');
  myMenu.addEventListener("click", () => {
    
    sidebar.style.display = 'flex';
  });
  const myClose=document.getElementById('close');
  myClose.addEventListener('click',()=>{
    sidebar.style.display = 'none';
  });
});
// to hide the nav bar in mobile when clicked on any nav items
const mobiNav=document.querySelectorAll('.M');
mobiNav.forEach(n=>{
  n.addEventListener('click',()=>{
    const sidebar = document.querySelector('.sidebar');
    sidebar.style.display = 'none';
  });
});