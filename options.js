const DEFAULT_OPTIONS_FILE = "BatsuOptions.txt"; //where the options are saved to

function getElement(id) { return document.getElementById(id); } //get the websites

function isTrue(str) { return /^true$/i.test(str); } //returns true if success

//Set up JQuery UI widgets 
$("#saveOptions").button();
$("#saveOptions").click({ closeOptions: false }, saveOptions);
$("#saveOptionsClose").button();
$("#saveOptionsClose").click({ closeOptions: true }, saveOptions);

// Save options to local storage (returns true if success)

function saveOptions(event) {
	//log("saveOptions");

    let blockURL = $(`#blockURL${set}`).val();
    
    if (blockURL != DEFAULT_BLOCK_URL && blockURL != DELAYED_BLOCK_URL
            && !getParsedURL(blockURL).page) {
        $("#tabs").tabs("option", "active", (set - 1));
        $(`#blockURL${set}`).focus();
        $("#alertBadBlockURL").dialog("open");
        return false;   
    }
}

function closeOptions() {
	// Request tab close
	browser.runtime.sendMessage({ type: "close" });
}

function othername() {
    var input = document.getElementById("userInput").value;
    alert(input);
}