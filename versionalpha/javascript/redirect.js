function endBlock() {
	console.log("that worked?");
    browser.runtime.sendMessage({
        type: 'disableBlocker'
    });
}

document.querySelector("#barfoo").addEventListener("click", endBlock);