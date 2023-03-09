// for popup message on copy click

$(document).ready(function() {
    $("#mar_display_popup").click(function() {
        showpopup();
    });
    $("#mar_cancel_button").click(function() {
        hidepopup();
    });
    $("#mar_close_button").click(function() {
        hidepopup();
    });
});

function showpopup() {
    $("#mar_popup_box").fadeToggle();
    $("#mar_popup_box").css({ visibility: "visible", display: "block" });
}

function hidepopup() {
    $("#mar_popup_box").fadeToggle();
    $("#mar_popup_box").css({ visibility: "hidden", display: "none" });
}