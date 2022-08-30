var open = false;

function sidebar_open() {
    document.getElementById("sidebar").style.width = "15%";
    document.getElementById("sidebar").style.display = "block";
}

function sidebar_close() {
    document.getElementById("sidebar").style.width = "0%";
    document.getElementById("sidebar").style.display = "none";
}

function sidebar_click() {
    if (open) {
        sidebar_close();
    }
    else {
        sidebar_open();
    }
    open = !open;
}