/**
 * The View. View presents the model and provides
 * the UI events. The controller is attached to these
 * events to handle the user interaction.
 */

function LibMapperMatrixView(container, model)
{
	var _self = this;
	this._container = $(container);
	this.model = model;

	this.srcSignals = new Array();		// reference to signals in model and extra metadata
	this.dstSignals = new Array();		// reference to signals in model and extra metadata
	this.cells = new Array();
	
	this.svg;
	this.svgRowLabels;
	this.svgColLabels;	// holding <SVG> elements for easy reference 
	this.svgNS = "http://www.w3.org/2000/svg";
	this.svgNSxlink = "http://www.w3.org/1999/xlink";

	this.svgDim = [600, 400];								// x-y dimensions of the svg canvas
	this.colLabelsH = 200;
	this.rowLabelsW = 200;
	
	this.zoomIncrement = 50;							
	this.aspect = this.svgDim[0]/this.svgDim[1];			// aspect ratio of SVG viewbox (for zooming)
	this.aspectCol = this.svgDim[0]/this.colLabelsH;		// aspect ratio of col viewbox (for zooming)
	this.aspectRow = this.rowLabelsW/this.svgDim[1];		// aspect ratio of row viewbox (for zooming)
	
	this.vboxDim = [ this.svgDim[0], this.svgDim[1] ];		// vbox width-height dimensions
	this.vboxPos = [0, 0];									// vbox x-y position
	this.vboxMinDim = [250, 150];							// vbox minimum width-height dimensions
	this.vboxMaxDim = [3000, 3000];		// *not used in zoom scroll bars
	
	this.cellDim = [32, 32];								// cell width-height dimensions
	this.cellRoundedCorner = 0;								// cell rounded corners radius
	this.cellMargin = 1;									// margin between cells
	this.labelMargin = 5;									// offset for source signal labels
	
	var selectedCell = null; 					// hold a reference to the selected cell
	var mousedOverCell = null;					// hold a reference to the cell that's moused over

	this.nRows = 0;											// number of rows in grid (destination signals)
	this.nCols = 0;											// number of columns in grid (source signals)
	this.contentDim = [0, 0];								// width-height dimension of full content
	
	this.init(container);
	this.initHorizontalZoomSlider($("#hZoomSlider"));
	this.initVerticalZoomSlider($("#vZoomSlider"));
	
	this.handleClicked; this.handleClick; this.handleValues;	// helpers for zooming scroll bars
	this.nCellIds = 0;											// helper for generating cell IDs
	
	//Keyboard handlers
	document.onkeyup = function(e){
		_self.keyboardHandler(e, _self);
	};
	/**
	 * Disables my keyboard shortcuts from moving the browser's scroll bar 
	 http://stackoverflow.com/questions/2020414/how-to-disable-page-scrolling-in-ff-with-arrow-keys
	 */
	document.onkeydown = function(e) {
	    var k = e.keyCode;
	    if((k >= 37 && k <= 40) || k == 32) {
	        return false;
	    }
	};
	
		
}

LibMapperMatrixView.prototype = {
		
	init : function (container) 
	{ 
		var div;
		var _self = this;	// to pass to the instance of LibMApperMatrixView to event handlers
		
		// button bar
		div = document.createElement("div");
		div.setAttribute("id", "buttonBar");
		div.setAttribute("style", "margin-bottom: 5px; margin-left: 16px;");
		
		var btn;
		
		//zoom in button
		btn = document.createElement("button");
		btn.innerHTML = "+";
		btn.addEventListener("click", function(evt){
			_self.zoomIn();
		});
		div.appendChild(btn);
			
		//zoom out button
		btn = document.createElement("button");
		btn.innerHTML = "-";
		btn.addEventListener("click", function(evt){
			_self.zoomOut();
		});
		div.appendChild(btn);
			
		//toggle connection button
		btn = document.createElement("button");
		btn.innerHTML = "Toggle";
		btn.addEventListener("click", function(evt){
			_self.toggleConnection();
		});
		div.appendChild(btn);
		
		container.appendChild(div);
		
		//horizontal scrollbar 
		div = document.createElement("div");
		div.setAttribute("id", "hZoomSlider");
		div.setAttribute("style", "position: relative; margin-top: 10px; clear:both;");
		container.appendChild(div);
		
		// a wrapper div to hold vscroll, grid + row labels
		var wrapper1 = document.createElement("div");
		wrapper1.setAttribute("style", "margin-top: 5px; clear: both;");
		
		// vertical scrollbar
		div = document.createElement("div");
		div.setAttribute("id", "vZoomSlider");
		div.setAttribute("style", "float:left;margin-left: 5px;");
		wrapper1.appendChild(div);
		
		// svg canvas
		this.svg = document.createElementNS(this.svgNS,"svg");
		this.svg.setAttribute("id", "svgGrid");
		this.svg.setAttribute("xmlns", this.svgNS);
		this.svg.setAttribute("xmlns:xlink", this.svgNSxlink);
		this.svg.setAttribute("width", this.svgDim[0]);
		this.svg.setAttribute("height", this.svgDim[1]);
		this.svg.setAttribute("viewBox", toViewBoxString(this.vboxPos[0], this.vboxPos[1], this.vboxDim[0], this.vboxDim[1]));
		this.svg.setAttribute("preserveAspectRatio", "none");
		this.svg.setAttribute("style", "float:left;margin-left: 5px; margin-bottom: 5px");
		wrapper1.appendChild(this.svg);	
		
		// svg row labels
		this.svgRowLabels = document.createElementNS(this.svgNS, "svg");
		this.svgRowLabels.setAttribute("id", "svgRows");
		this.svgRowLabels.setAttribute("xmlns", this.svgNS);
		this.svgRowLabels.setAttribute("xmlns:xlink", this.svgNSxlink);
		this.svgRowLabels.setAttribute("width", this.rowLabelsW);
		this.svgRowLabels.setAttribute("height", this.svgDim[1]);
		this.svgRowLabels.setAttribute("style", "float:left;");
		this.svgRowLabels.setAttribute("preserveAspectRatio", "none");
		wrapper1.appendChild(this.svgRowLabels);
		
		container.appendChild(wrapper1);
		
		// svg column labels
		this.svgColLabels = document.createElementNS(this.svgNS, "svg");
		this.svgColLabels.setAttribute("id", "svgCols");
		this.svgColLabels.setAttribute("xmlns", this.svgNS);
		this.svgColLabels.setAttribute("xmlns:xlink", this.svgNSxlink);
		this.svgColLabels.setAttribute("width", this.svgDim[0]);
		this.svgColLabels.setAttribute("height", this.colLabelsH);
		this.svgColLabels.setAttribute("style", "clear:both; margin-left:30px;");
		this.svgColLabels.setAttribute("preserveAspectRatio", "none");
		
		container.appendChild(this.svgColLabels);
		
	},

	initHorizontalZoomSlider : function ()
	{
		var _self = this;
		$("#hZoomSlider").width(this.svgDim[0]);
		
		$( "#hZoomSlider" ).slider({
			range: true,
			min: 0,
			max: 100,
			values: [ 25, 75 ],
			start: function( event, ui ){
				_self.sliderClicked(event, ui, _self);
			},
			slide: function( event, ui ) 
			{
				_self.zoomSlide(_self, this.id, ui, 0, event.pageX);
				return false;
			}
		});
		$("#hZoomSlider .ui-slider-handle").unbind('keydown');
	},
	
	initVerticalZoomSlider : function ()
	{
		var _self = this;
		$("#vZoomSlider").height(this.svgDim[1]);
		
		 $("#vZoomSlider").slider({
		      range: true,
		      orientation: "vertical",
		      min: 0,
		      max: 100,
		      values: [ 25, 75 ],
		      start: function( event, ui )
		      {
				_self.sliderClicked(event, ui, _self);
		      },
		      slide: function( event, ui ) 
		      {
		    	  _self.zoomSlide(_self, this.id, ui, 1, event.pageY);
		    	  return false;
		      }
		  });
		 $("#vZoomSlider .ui-slider-handle").unbind('keydown');
	},
	
	/**
	 * helper function that customizes JQueryUI Range slider to gain scrollbar functionality 
	 * when slider is clicked, check if clicked one of the handles or the slider
	 * if slider, store the original values (need them saved otherwise slider's default functionality overrides them)
	 * and the click position (used to determine how much user has dragged the mouse)
	 */
	sliderClicked: function (e, ui, _self)
	{
		_self.handleClicked = $(e.originalEvent.target).hasClass("ui-slider-handle");	// true if clicked on handle, false for slider 
		_self.handleValues = ui.values;			// store the original values 
		_self.handleClick = [e.pageX, e.pageY];	// store the initial x/y click position
		
	},

	/**
	 * function that takes care of scrolling and zooming functionality for both zoom bars
	 * param ind: 0 is X dimension, 1 is Y dimension. 
	 * 	It points into any dimension array with X and Y values. 
	 * 	Note Y dimension needs special treatment because dimensions are reversed
 	 */
	zoomSlide : function (_self, sliderID, ui, ind, mousePos)
	{
		//for when a handle is clicked (change range and zoom)
		if(_self.handleClicked)	
		{
			
			var w = ui.values[1]-ui.values[0];	// new slider width
			if(w < _self.vboxMinDim[ind] || w > _self.contentDim[ind])	// do nothing if range is less than minimum or more than content
				return false;
			else
			{
				//set the new dimensions of vbox and reposition it
				_self.vboxDim[ind] = w;		// clicked dimension size
				_self.vboxDim[1-ind] = (ind==0)? w/_self.aspect: w*_self.aspect;	// other dimension's size based on aspect ratio
				_self.vboxPos[ind] = (ind==0)? ui.values[0] : _self.contentDim[ind]-ui.values[1];	// set the vbox position based on value of first handle (reversed for Y)
				
				//if other dimension gets out of range, must adjust the vbox's position appropriately
				if(_self.vboxPos[1-ind]+_self.vboxDim[1-ind] > _self.contentDim[1-ind])
				{	 
					if(_self.vboxPos[1-ind] <= 0)	// when other dimension is at max, keep the view box at 0
						_self.vboxPos[1-ind] = 0;
					else							// when other dimension is not maxed, scroll left by the surpassed amount
					{
						var overflow = _self.contentDim[1-ind] - _self.vboxPos[1-ind] -_self.vboxDim[1-ind];
						_self.vboxPos[1-ind] += overflow;
					}
				}
				
				// update the GUI
				_self.updateViewBoxes();
				_self.updateZoomBars();
			}
		}
		// for when the range was clicked (scroll and slide)
		else	
		{
			// calculate new values after sliding
			var mouseDiff = (ind==0)? mousePos-_self.handleClick[ind] : _self.handleClick[ind]-mousePos;	//reversed for Y
			var dx = (mouseDiff / _self.svgDim[ind]) * ( _self.contentDim[ind]-_self.vboxDim[ind]);	// drag size relative to size of the scroll bar, multiplied by scrollable range	        
			var v1 = _self.handleValues[0]+dx;	// 1st handle new value
	        var v2 = _self.handleValues[1]+dx;	// 2nd handle new value
	        
	        // fixes glitch when user scrolls with mouse fast beyond min/max by removing the excess and snapping to the min/max 
	        var overflow=0;
	        if(v1 < 0)
	        	overflow = 0 - v1;
	        else if(v2 > _self.contentDim[ind])
	        	overflow = _self.contentDim[ind] - v2;
        	v1 += overflow;
	        v2 += overflow;

	        // update the slider's values and the vBox's position
        	$("#" + sliderID).slider("option", "values", [v1,v2]);
        	_self.vboxPos[ind] = (ind==0)? v1 : (_self.contentDim[ind]-_self.vboxDim[ind]) - v1;	//vertical is reversed
        	_self.updateViewBoxes();
		}
	},
	
	/**
	 * reset values of each zoombar based on updated content or viewbox
	 */
	updateZoomBars : function ()
	{
		$("#hZoomSlider").slider("option", "min", 0);
		$("#hZoomSlider").slider("option", "max", this.contentDim[0]);
		$("#hZoomSlider").slider( "option", "values", [ this.vboxPos[0], this.vboxPos[0]+this.vboxDim[0]]);
		$("#vZoomSlider").slider("option", "min", 0);
		$("#vZoomSlider").slider("option", "max", this.contentDim[1]);
		$("#vZoomSlider").slider( "option", "values", [this.contentDim[1]-(this.vboxPos[1]+this.vboxDim[1]), this.contentDim[1]-this.vboxPos[1]]);
	},
	
	/**
	 * insert a column at the specified index
	 * reposition the columns cell and label with index greater than the specified index
	 * reposition the row labels 
	 * create the new column (containng cells + label)
	 * update IDs of all rows that are connected
	 */
	addSourceSignal : function (signal, index)
	{
		var newSig = new MatrixViewSourceSignal(signal);
		newSig.col = index;
		this.srcSignals.push(newSig);
		
		var i,j;
		var cell, column, colLabel, rowLabel;	// old cell
		var newCell, newLabel;					// new cell
		
		// reposition source signals in cols after index
		for(i=0; i<this.srcSignals.length; i++)
		{
			var sig = this.srcSignals[i];
			if(sig.col >= index)
				sig.col++;
		}
		
		// reposition the col labels after index		
		for(j=this.nCols-1; j>=index; j--)	// for each column after index
		{
			var colLabel = this.svgColLabels.getElementById("colLabel" + j);
			if(colLabel != null)
			{
				var halign = colLabel.getBBox().height/4 ;		//for centered alignment 
				colLabel.setAttribute("transform","translate(" + ((j+1)*(this.cellDim[0]+this.cellMargin)+(this.cellDim[0]/2)-halign).toString() + "," + this.labelMargin + ")rotate(90)");
				colLabel.setAttribute("id", "colLabel"+(j+1));
				colLabel.setAttribute("data-col", j+1);
			}
		}
		
		// reposition cells in cols after index
		for(i=0; i<this.cells.length; i++)
		{
			cell = this.cells[i];
			column =  parseInt(cell.getAttribute("data-col"));
			if(column >= index){
				cell.setAttribute("data-col", column+1);
				cell.setAttribute("x",(column+1)*(this.cellDim[0]+this.cellMargin));	// reposition the cell
			}
		}
	
		// create new cells
		for(var i=0; i<this.nRows; i++)
		{
			// match new cells created with corresponding row signal
			var rowLabel = this.svgRowLabels.getElementById("rowLabel" + i);		// get the element with the row label
			
			// create new cells
			this.svg.appendChild(this.createCell(i, index, signal.id, rowLabel.getAttribute("data-dst")));
		}

		//create new COL Label
		newLabel = document.createElementNS(this.svgNS,"text");
		newLabel.setAttribute("id", "colLabel" + index.toString()  );
		newLabel.appendChild(document.createTextNode(signal.name));	
		this.svgColLabels.insertBefore(newLabel, this.svgColLabels.childNodes[index]);
		var halign = (newLabel.getBBox().height)/4 ;		//for centered alignment. *getBBox() only works if used after adding to DOM
		var xPos = ((index)*(this.cellDim[0]+this.cellMargin)+(this.cellDim[0]/2)-halign);			// I don't know why +4 
		var yPos = this.labelMargin;
		newLabel.setAttribute("class", "label");
		newLabel.setAttribute("data-src", signal.id);
		newLabel.setAttribute("data-col", index);
		newLabel.setAttribute("transform","translate(" + xPos + "," + yPos + ")rotate(90)");
		
		// update GUI data
		this.nCols++;
		this.contentDim[0] = this.nCols*(this.cellDim[0]+this.cellMargin);
		this.updateZoomBars();
		
	},
	
	
	/**
	 * insert a new signal at the specified index
	 * reposition the rows with index greater than the specified index
	 * reposition the column labels 
	 * create the new row (containg cells + label)
	 * update IDs of all rows that are connected
	 */
	addDestinationSignal : function (signal, index)
	{
		
		if(index > this.nRows){
			alert("invalid row index");
			return;
		}
		
		var i,j;
		
		for(i=0; i<this.dstSignals.length; i++)
		{
			var sig = this.dstSignals[i];
			if(sig.row >= index)
				sig.row++;
		}
		
		// reposition the existing row labels
		for(i=this.nRows-1; i>=index; i--)											// for each row after index
		{
			var rowLabel = this.svgRowLabels.getElementById("rowLabel" + i);		// get the element with the row label
			var y = (i+1)*(this.cellDim[1]+this.cellMargin);						// calculate the new y coordinate
			var valign = rowLabel.getBBox().height/2 + 2;							// to align vertically
			if(rowLabel != null){
				rowLabel.setAttribute("id", "rowLabel" + (i+1));					// update the element's ID
				rowLabel.setAttribute("data-row", i+1);								
				rowLabel.setAttribute("y", y+this.cellDim[1]-valign);				// set the new y coordinate + offset to center vertically
			}
		}
		
		// reposition cells in rows after index
		for(i=0; i<this.cells.length; i++)											// for each cell
		{
			var cell = this.cells[i];												// get the cell 
			var row = parseInt(cell.getAttribute("data-row"));						// get the cell's row
			if(row >= index){
				cell.setAttribute("data-row", row+1);								// store new row number
				cell.setAttribute("y",(row+1)*(this.cellDim[1]+this.cellMargin));	// reposition y coordinate
			}
		}
		
		// create new cells for the new row
		for(j=0; j<this.nCols; j++)
		{
			// match new cells created with corresponding column signal
			var colLabel = this.svgColLabels.getElementById("colLabel" + j);		// get the element with the row label
			
			//create the cell
			this.svg.appendChild(this.createCell(index, j, colLabel.getAttribute("data-src"), signal.id ));
		}
		
		// create row label for the new row
		var newRowLabel = document.createElementNS(this.svgNS,"text");
		newRowLabel.appendChild(document.createTextNode(signal.name));	
		this.svgRowLabels.appendChild(newRowLabel);
		newRowLabel.setAttribute("id", "rowLabel" + index.toString()  );
		newRowLabel.setAttribute("x", this.labelMargin);
		newRowLabel.setAttribute("data-dst", signal.id);
		newRowLabel.setAttribute("data-row", index);
		newRowLabel.setAttribute("class","label");
		var valign = newRowLabel.getBBox().height/2 + 2;		//BBox only works if used after adding to DOM
		newRowLabel.setAttribute("y", (index)*(this.cellDim[1]+this.cellMargin)+(this.cellDim[1]-valign));	// set after added so BBox method
		
		// update GUI data		
		this.nRows++;
		this.contentDim[1] = this.nRows*(this.cellDim[1]+this.cellMargin);
		this.updateZoomBars();

	}, 
	
	createCell : function (row, col, src, dst)
	{
		var cell = document.createElementNS(this.svgNS,"rect");
		cell.setAttribute("id", this.nextCellId());
		cell.setAttribute("data-row", row);
		cell.setAttribute("data-col", col);
		cell.setAttribute("data-src", src);
		cell.setAttribute("data-dst", dst);
		
		cell.setAttribute("x",col*(this.cellDim[0]+this.cellMargin));
		cell.setAttribute("y",row*(this.cellDim[1]+this.cellMargin));
		cell.setAttribute("rx", this.cellRoundedCorner);
		cell.setAttribute("ry", this.cellRoundedCorner);
		cell.setAttribute("width",this.cellDim[0]);
		cell.setAttribute("height",this.cellDim[1]);
		cell.setAttribute("class","cell_up");
		

		var _self = this;	// to pass to the instance of LibMapperMatrixView to event handlers
		cell.addEventListener("click", function(evt){
			_self.onCellClick(evt, _self);
		});
		cell.addEventListener("mouseover", function(evt){
			_self.onCellMouseOver(evt, _self);
		});
		cell.addEventListener("mouseout", function(evt){
			_self.onCellMouseOver(evt, _self);
		});
		
		_self.cells.push(cell);
		return cell;
	},
	
	getCellByPos : function (row, col)
	{
		for(var i=0; i<this.cells.length; i++){
			if(this.cells[i].getAttribute('data-row') == row && this.cells[i].getAttribute('data-col') == col){
				return this.cells[i];
			}
		}
		if(i==this.cells.length)
			return null;
	},
	
	/**
	 * on cell mouseover, highlights corresponding row and columns
	 * must handle special cases: if the cell is the selected cell or has a connection
	 */
	onCellMouseOver : function(evt, _self)    
	{
		// keep reference to cell mouse is over (useful in other methods)
		if(evt.type == "mouseover")
			_self.mousedOverCell = evt.target;	
		else if (evt.type == "mouseout")
			_self.mousedOverCell = null;	
			
		// row can be found from it's parent <g>
		// columns must be found differently (below)	
		var row = evt.target.parentNode;	
		
		var selectedRow = evt.target.getAttribute("data-row");
		var selectedCol = evt.target.getAttribute("data-col");
		
		// style cells
		for(var i=0; i< this.cells.length; i++)
		{
			var curCell = this.cells[i];
			var curRow = curCell.getAttribute("data-row");;
			var curCol = curCell.getAttribute("data-col");;
			if(curRow == selectedRow || curCol == selectedCol)
			{
				var className = curCell.getAttribute("class");
				if(className.indexOf("cell_connected") == -1)
				{
					className = (className.indexOf("cell_selected") == -1)? "" : "cell_selected "; 
					if(evt.type == "mouseover")
						curCell.setAttribute("class", className + "row_over");
					else if(evt.type == "mouseout")
						curCell.setAttribute("class",className + "cell_up");
				}
			}
		}
		
		// style row label
		var rowLabel = _self.svgRowLabels.getElementById("rowLabel" + selectedRow);
		if(rowLabel != null)
		{
			if(evt.type == "mouseover")
				rowLabel.setAttribute("class","label_over");
			else if(evt.type == "mouseout")
				rowLabel.setAttribute("class","label");
		}
		
	
		// style col label
		var colLabel = _self.svgColLabels.getElementById("colLabel" + selectedCol);
		if(colLabel != null)
		{
			if(evt.type == "mouseover")
				colLabel.setAttribute("class","label_over");
			else if(evt.type == "mouseout")
				colLabel.setAttribute("class","label");
		}
	},
	
	/**
	 * on cell click, set the cell as selected
	 * handle removing the previously selected cell and the special case where the previous was null
	 */
	onCellClick : function(evt, _self)    
	{
		var cell = evt.target;
	
		if(_self.selectedCell == null)
		{
			// set the clicked cell as selected
			addCellClass("cell_selected", cell);
			_self.selectedCell = cell;
		}
		else if(cell.id != _self.selectedCell.id)	
		{	
			// clear last selected cell
			removeCellClass("cell_selected", _self.selectedCell);
			// set the clicked cell as selected
			addCellClass("cell_selected", cell);
			_self.selectedCell = cell;
		}	
		else	// already selected, so deselect
		{
			removeCellClass("cell_selected", cell);
			_self.selectedCell = null;
		}
		
		
		// load cell details into info PANE
		//
		// ...
	
	},
	
	
	/**
	 * toggles a connection
	 * checks if the cell already has a connection then toggles
	 */
	
	toggleConnection : function()
	{
		if(this.selectedCell == null)	
			return;

		var selectedSrc = this.selectedCell.getAttribute("data-src");
		var selectedDst = this.selectedCell.getAttribute("data-dst");
		
		// toggle the connection
		
		if(this.model.isConnected(selectedSrc, selectedDst) == false) // not already a connection, create the new connection
		{
			// trigger create connection event
			this._container.trigger("createConnection", [selectedSrc, selectedDst]);
			// style appropriately for GUI
			this.selectedCell.setAttribute("class", "cell_connected cell_selected");		
		}
		else	// is already a connection, so remove it
		{
			// trigger remove connection event
			this._container.trigger("removeConnection", [selectedSrc, selectedDst]);
			
			//style the cell
			
			if(this.mousedOverCell != null)	//style when mouse is over the toggled cell's row/col
			{	
				var mouseRow = this.mousedOverCell.getAttribute("data-row");
				var mouseCol = this.mousedOverCell.getAttribute("data-col");
				var selectedRow = this.selectedCell.getAttribute("data-row");
				var selectedCol = this.selectedCell.getAttribute("data-col");
				
				if(mouseRow == selectedRow || mouseCol == selectedCol)
					this.selectedCell.setAttribute("class", "row_over cell_selected");
				else	
					this.selectedCell.setAttribute("class", "cell_up cell_selected");
			}
			else	// style when no cell is moused over 
				this.selectedCell.setAttribute("class", "cell_up cell_selected");
		}
	},
	
	
	zoomIn : function()
	{
		if(this.vboxDim[0] > this.vboxMinDim[0])
		{
			this.vboxDim[0] -= this.zoomIncrement;
			this.vboxDim[1] -= this.zoomIncrement/this.aspect;
			this.updateViewBoxes();
			this.updateZoomBars();
		}
	},
	
	zoomOut : function()
	{
		if(this.vboxDim[0] <= this.contentDim[0]-this.zoomIncrement && this.vboxDim[0] < this.vboxMaxDim[0]-this.zoomIncrement){
			this.vboxDim[0] += this.zoomIncrement;
			this.vboxDim[1] += this.zoomIncrement/this.aspect;
		}
		else{
			this.vboxDim[0] = (this.contentDim[0]<this.vboxMaxDim[0])? this.contentDim[0] : this.vboxMaxDim[0];
			this.vboxDim[1] = this.vboxDim[0]/this.aspect; //this.contentDim[0]/this.aspect;
		}
		this.updateViewBoxes();
		this.updateZoomBars();
	},
	
	updateViewBoxes : function()
	{
		this.svg.setAttribute("viewBox", toViewBoxString(this.vboxPos[0], this.vboxPos[1], this.vboxDim[0], this.vboxDim[1]));
		this.svgColLabels.setAttribute("viewBox", toViewBoxString(this.vboxPos[0], 0, this.vboxDim[0], this.vboxDim[0]/this.aspectCol));
		this.svgRowLabels.setAttribute("viewBox", toViewBoxString(0, this.vboxPos[1], this.vboxDim[1]*this.aspectRow, this.vboxDim[1]));
	},
	
	keyboardHandler: function (e, _self)
	{
		if(_self.nCols == 0 || _self.nRows == 0)
			return;
	
		// enter or space to toggle a connection
		if(e.keyCode == 13 || e.keyCode == 32)	
		{
			if(this.selectedCell != null)
				_self.toggleConnection();
		}	
		
		// 'ctrl' + '+' to zoom in
		else if(e.keyCode == 187 && e.ctrlKey)
			_self.zoomIn();
		
		// 'ctrl' + '-' to zoom out
		else if(e.keyCode == 189 && e.ctrlKey)
			_self.zoomOut();
		
		// movement arrows to move the selected cell
		else if (e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40)	
		{
			if(_self.selectedCell != null)	// cases where there is a previously selected cell
			{
				var m = 1;	// cell jump size
				if (e.shiftKey === true)
					m=3;					// if shift key is pressed, increase the jump size;

				
				// get position of the currently selected cell 
				var currentPos = [parseInt(_self.selectedCell.getAttribute('data-row')), parseInt(_self.selectedCell.getAttribute('data-col'))];

				// update style to unselect the current selected cell
				removeCellClass("cell_selected", _self.selectedCell);	
				
				// set position of the new selected cell
				var newPos = [currentPos[0], currentPos[1]];
				switch(e.keyCode)	
				{
					case 37:	// left
						if(currentPos[1] > 0)
							newPos = [currentPos[0], currentPos[1]-m];
					  break;
					case 38:	// up
						if(currentPos[0] > 0)
							newPos = [currentPos[0]-m, currentPos[1]];
					  break;
					case 39:	// right
						if(currentPos[1] < _self.nCols-1)
							newPos = [currentPos[0], currentPos[1]+m];
					  break;
					case 40:	// down
						if(currentPos[0] < _self.nRows-1)
							newPos = [currentPos[0]+m, currentPos[1]];
					  break;
				}
				
				//ensure newPos doesn't exceed bounds
				if(newPos[0] < 0)
					newPos[0] = 0;
				else if(newPos[0] > _self.nRows-1)
					newPos[0] = _self.nRows-1;				
				if(newPos[1] < 0)
					newPos[1] = 0;
				else if(newPos[1] > _self.nCols-1)
					newPos[1] = _self.nCols-1;
				
				// set the new selected cell based on the arrow key movement
				_self.selectedCell = _self.getCellByPos(newPos[0], newPos[1]);

				// style the new cell as selected
				addCellClass("cell_selected", _self.selectedCell);
				
				// calculate if new selected cell is visible or if it is out of view
				// if out of view then move the viewbox
				var row = _self.selectedCell.getAttribute("data-row");
				var col = _self.selectedCell.getAttribute("data-col");
				var cellW = _self.cellDim[0]+_self.cellMargin;
				var cellH = _self.cellDim[1]+_self.cellMargin;
				var pos = [cellW*col, cellH*row];
				
				var dim; 	// helper for code re-useability, set in switch statement following (0=left/right=x, 1=up/down=y)
				if(e.keyCode == 37 || e.keyCode == 39)
					dim = 0;
				else if(e.keyCode == 38 || e.keyCode == 40)
					dim = 1;
				
				switch(e.keyCode)	
				{
					case 37:	// left
					case 39:	// right
					case 38:	// up
					case 40:	// down

						// off screen on left/up
						if(pos[dim] < _self.vboxPos[dim] + ((m-1)*cellW))
							_self.vboxPos[dim] = pos[dim] - ((m-1)*cellW);	// set the new position
							if(_self.vboxPos[dim] < 0) 					// if moved to less than 0, set to 0
								_self.vboxPos[dim] = 0; 
						
						// off screen on right/down
						else if(pos[dim] > _self.vboxPos[dim] + _self.vboxDim[dim] - (m*cellW))
							_self.vboxPos[dim] = pos[dim] - _self.vboxDim[dim] + (m*cellW);		// set the new position
							if(_self.vboxPos[dim] > _self.contentDim[dim] - _self.vboxDim[dim])	// if moved outside of content, set to the max
									_self.vboxPos[dim] = _self.contentDim[dim] - _self.vboxDim[dim];
					  break;
				}
						
				_self.updateViewBoxes();
				_self.updateZoomBars();
			}
		}
	},
	
	
	// FIX this will not work when we remove signals
	nextCellId : function (){
		return "cell" + this.nCellIds++;
	},
	getCellIndex : function (id){
		return (id.substring(4));
	}
	
	
	
};

/**
 * Helper function to format the viewbox string
 * @param x x position
 * @param y y position
 * @param w width
 * @param h height
 */
function toViewBoxString(x, y, w, h){
	return x.toString() + " " + y.toString() + " " + w.toString() + " " + h.toString();
};


//+++++++++++++++++++++++++++++++++++++++++++ //
//		  	   View's Cell Class		  	  //		 
//+++++++++++++++++++++++++++++++++++++++++++ //

function MatrixViewCell(row, col, src, dst)
{
	this.id = this.nextCellId();
	this.row = row;
	this.col = col;
	this.src = src;
	this.dst = dst;
	this.classname = "";
};

//+++++++++++++++++++++++++++++++++++++++++++ //
//		  View's Source Signal Class		  //		 
//+++++++++++++++++++++++++++++++++++++++++++ //

function MatrixViewSourceSignal(signal)
{
	this.id = signal.id;	// reference to the signal object		
	this.col = 0;
};

//+++++++++++++++++++++++++++++++++++++++++++ //
//		View's Destination  Signal Class	  //		 
//+++++++++++++++++++++++++++++++++++++++++++ //

function MatrixViewDestinationSignal(signal)
{
	this.id = signal.id;	// reference to the signal object	
	this.row = 0;
};
