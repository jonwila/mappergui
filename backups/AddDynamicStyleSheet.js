
/**
 * For when there are multiple views that needs their own CSS
 */
 /*
	addStylesheet("views/LibMapperMatrixView_style.css");

	function addStylesheet(theHref) {
		if (document.createStyleSheet) {
			document.createStyleSheet(theHref);
		} else {
			var newSheet = document.createElement('link');
			newSheet.setAttribute('rel', 'stylesheet');
			newSheet.setAttribute('type', 'text/css');
			newSheet.setAttribute('href', theHref);
			document.getElementsByTagName('head')[0].appendChild(newSheet);
		}
	} // end addStylesheet()

	function removeStylesheet(theHref) {
		var sheets = document.styleSheets;
		for (i = 0; i < sheets.length; i++) {
			if (sheets[i].href == theHref) {
				sheets[i].disabled = true;
			} // endif sheets[i].href
		} // end for i
	} // end removeStylesheet
	*/