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

	
	// handle all events from controller
	$(this._container).on("updateView", function(){
		alert("updateview");
	});
	// END Controller
	
	this.srcSignals = new Array();		// reference to signals in model and extra metadata
	this.dstSignals = new Array();		// reference to signals in model and extra metadata
	this.cells = new Array();
	
	this.svg;
	this.svgRowLabels;
	this.svgColLabels;	// holding <SVG> elements for easy reference 
	this.svgNS = "http://www.w3.org/2000/svg";
	this.svgNSxlink = "http://www.w3.org/1999/xlink";

	this.svgWidth = 600;
	this.svgHeight = 400;
	this.colLabelsH = 100;
	this.rowLabelsW = 200;
	
	this.vboxW = this.svgWidth;
	this.vboxH = this.svgHeight;
	this.vboxX = 0;
	this.vboxY = 0;
	
	this.cellWidth = 32;
	this.cellHeight = 32;
	this.cellRoundedCorner = 4;
	this.cellMargin = 1;
	this.labelMargin = 5;
	
	var selectedCell = null; 	// hold a reference to the selected cell
	var mousedOverCell = null;	// hold a reference to the cell that's moused over
	this.nRows = 0;
	this.nCols = 0;
	this.contentW;
	this.contentH;
	
	this.init(container);
	this.initVerticalScrollbar($("#vScrollbar"));
	this.initHorizontalScrollBar($("#hScrollbar"));

	this.nCellIds = 0;
}

LibMapperMatrixView.prototype = {
		
		
	init : function (container) 
	{ 

		var div;
		
		//h scrollbar
		div = document.createElement("div");
		div.setAttribute("id", "hScrollbar");
		container.appendChild(div);
		
		
		// a wrapper div to hold vscroll, grid + row labels
		var wrapper1 = document.createElement("div");
		wrapper1.setAttribute("style", "margin-top: 5px");
		
		// v scrollbar
		div = document.createElement("div");
		div.setAttribute("id", "vScrollbar");
		wrapper1.appendChild(div);
		
		// svg grid
		this.svg = document.createElementNS(this.svgNS,"svg");
		this.svg.setAttribute("id", "svgGrid");
		this.svg.setAttribute("xmlns", this.svgNS);
		this.svg.setAttribute("xmlns:xlink", this.svgNSxlink);
		this.svg.setAttribute("width", this.svgWidth);
		this.svg.setAttribute("height", this.svgHeight);
		this.svg.setAttribute("viewBox", toViewBoxString(this.vboxX, this.vboxY, this.vboxW, this.vboxH));
		this.svg.setAttribute("style", "float:left;margin-left: 5px");
		wrapper1.appendChild(this.svg);	
		
		// svg row labels
		this.svgRowLabels = document.createElementNS(this.svgNS, "svg");
		this.svgRowLabels.setAttribute("id", "svgRows");
		this.svgRowLabels.setAttribute("xmlns", this.svgNS);
		this.svgRowLabels.setAttribute("xmlns:xlink", this.svgNSxlink);
		this.svgRowLabels.setAttribute("width", this.rowLabelsW);
		this.svgRowLabels.setAttribute("height", this.svgHeight);
		this.svgRowLabels.setAttribute("style", "float:left;");
		wrapper1.appendChild(this.svgRowLabels);
		
		container.appendChild(wrapper1);
		
		// svg column labels
		this.svgColLabels = document.createElementNS(this.svgNS, "svg");
		this.svgColLabels.setAttribute("id", "svgCols");
		this.svgColLabels.setAttribute("xmlns", this.svgNS);
		this.svgColLabels.setAttribute("xmlns:xlink", this.svgNSxlink);
		this.svgColLabels.setAttribute("width", this.svgWidth);
		this.svgColLabels.setAttribute("height", this.colLabelsH);
		this.svgColLabels.setAttribute("style", "clear:both; margin-left:20px;");
		container.appendChild(this.svgColLabels);
		
	},
		
	initHorizontalScrollBar : function ($bar)
	{
		var _self = this;
		
		if($bar.find('.slider-wrap').length==0)//if the slider-wrap doesn't exist, insert it and set the initial value
			$bar.append('<\div class="slider-wrap"><\div class="slider-horizontal"><\/div><\/div>');//append the necessary divs so they're only there if needed
		
		$bar.find('.slider-wrap').width(this.svgWidth);//set the height of the slider bar to that of the svg canvas
		
		//initialize the JQueryUI slider
		$bar.find('.slider-horizontal').slider({
			orientation: 'horizontal',
			min: 0,
			max: 100,
			range:'min',
			value: 0,
			slide: function(event, ui) {
			
				var difference = _self.contentW-_self.vboxW;
				if(difference<=0)
					return;
				_self.vboxX =  (ui.value) / 100 * ( _self.contentW-_self.vboxW);		// 0 >= ui.value <= 100
				_self.svg.setAttribute("viewBox", toViewBoxString(_self.vboxX, _self.vboxY, _self.vboxW, _self.vboxH));
				_self.svgColLabels.setAttribute("viewBox", toViewBoxString(_self.vboxX, 0, _self.vboxW, _self.colLabelsH));
				$('ui-slider-range').width(ui.value+'%');//set the height of the range element
			},
			change: function(event, ui) {
				//var topValue = -((ui.value)*($scrollpane.find('.scroll-content').height()-$scrollpane.height())/100);//recalculate the difference on change
				//$('ui-slider-range').width(ui.value+'%');
		  }	  
		});
	
		//code for clicks on the scrollbar outside the slider
		
		$bar.find(".ui-slider").click(function(event){//stop any clicks on the slider propagating through to the code below
			event.stopPropagation();
		});
		   
		$bar.find(".slider-wrap").click(function(event){//clicks on the wrap outside the slider range
			var offsetLeft = $(this).offset().left;//read the offset of the scroll pane
			var clickValue = (event.pageX-offsetLeft)*100/$(this).width();//find the click point, subtract the offset, and calculate percentage of the slider clicked
			$("#out").text(clickValue);
			$(this).find(".slider-horizontal").slider("value", clickValue);//set the new value of the slider
	
			_self.vboxX =  clickValue / 100 * ( _self.contentW-_self.vboxW);		// 0 >= ui.value <= 100
			_self.svg.setAttribute("viewBox", toViewBoxString(_self.vboxX, _self.vboxY, _self.vboxW, _self.vboxH));
			_self.svgColLabels.setAttribute("viewBox", toViewBoxString(_self.vboxX, 0, _self.vboxW, _self.colLabelsH));
			$('ui-slider-range').width(clickValue+'%');//set the height of the range element
		}); 
		
		this.sizeHScrollbar();
	},
	
	sizeHScrollbar : function () 
	{
		var proportion, handleHeight;
		var difference = this.contentW-this.vboxW;
		
		if(difference>0){	// determine the handle's size
			proportion = difference / this.contentW;
			handleHeight = Math.round((1-proportion)* this.vboxW );//set the proportional height - round it to make sure everything adds up correctly later on
		}
		else{
			handleHeight = this.svgWidth;
		}	
		handleHeight -= handleHeight%2;		//if odd, substract 1 to make even. If even substract nothing
		
		$("#hScrollbar").find(".ui-slider-handle").css({width:handleHeight,'margin-left':-0.5*handleHeight});
		var origSliderHeight = this.vboxW;//read the original slider height
		var sliderHeight = origSliderHeight - handleHeight ;//the height through which the handle can move needs to be the original height minus the handle height
		var sliderMargin =  (origSliderHeight - sliderHeight)*0.5;//so the slider needs to have both top and bottom margins equal to half the difference
		$("#hScrollbar").find(".ui-slider").css({width:sliderHeight,'margin-left':sliderMargin});//set the slider height and margins
		$("#hScrollbar").find(".ui-slider-range").css({left:-sliderMargin});//position the slider-range div at the top of the slider container
		
	},
	

	initVerticalScrollbar : function ($bar)	
	{
		var _self = this;
		
		//$bar is the div to create the scrollbar in
		
		if($bar.find('.slider-wrap').length==0)//if the slider-wrap doesn't exist, insert it and set the initial value
			$bar.append('<\div class="slider-wrap"><\div class="slider-vertical"><\/div><\/div>');//append the necessary divs so they're only there if needed
		
		$bar.find('.slider-wrap').height(this.svgHeight);//set the height of the slider bar to that of the svg canvas
		
		//initialize the JQueryUI slider
		$bar.find('.slider-vertical').slider({
			orientation: 'vertical',
			min: 0,
			max: 100,
			range:'min',
			value: 100,
			slide: function(event, ui) {
			var p = this.parentNode;
				var difference = _self.contentH-_self.vboxH;
				if(difference<=0)
					return;
				_self.vboxY =  (100-ui.value) / 100 * ( _self.contentH-_self.vboxH);		// 0 >= ui.value <= 100
				_self.svg.setAttribute("viewBox", toViewBoxString(_self.vboxX, _self.vboxY, _self.vboxW, _self.vboxH));
				_self.svgRowLabels.setAttribute("viewBox", toViewBoxString(0, _self.vboxY, _self.rowLabelsW, _self.vboxH));
				$('ui-slider-range').height(ui.value+'%');//set the height of the range element
			},
			change: function(event, ui) {
				//var topValue = -((100-ui.value)*($scrollpane.find('.scroll-content').height()-$scrollpane.height())/100);//recalculate the difference on change
				//$('ui-slider-range').height(ui.value+'%');
		  }	  
		});

		//code for clicks on the scrollbar outside the slider
		$bar.find(".ui-slider").click(function(event){//stop any clicks on the slider propagating through to the code below
			event.stopPropagation();
		});
		   
		$bar.find(".slider-wrap").click(function(event){//clicks on the wrap outside the slider range
			var offsetTop = $(this).offset().top;//read the offset of the scroll pane
			var clickValue = (event.pageY-offsetTop)*100/$(this).height();//find the click point, subtract the offset, and calculate percentage of the slider clicked
			$(this).find(".slider-vertical").slider("value", 100-clickValue);//set the new value of the slider

			_self.vboxY =  (clickValue) / 100 * ( _self.contentH-_self.vboxH);		// 0 >= ui.value <= 100
			_self.svg.setAttribute("viewBox", toViewBoxString(_self.vboxX, _self.vboxY, _self.vboxW, _self.vboxH));
			_self.svgRowLabels.setAttribute("viewBox", toViewBoxString(0, _self.vboxY, _self.rowLabelsW, _self.vboxH));
		}); 

		this.sizeVScrollbar();
	},
	
	
	sizeVScrollbar : function()
	{
		var proportion, handleHeight;
		var difference = this.contentH-this.vboxH;
		
		if(difference>0) //if the scrollbar is needed, set it up...
		{
			proportion = difference / this.contentH;
			handleHeight = Math.round((1-proportion)* this.vboxH );//set the proportional height - round it to make sure everything adds up correctly later on
		}
		else
		{
			handleHeight = this.svgHeight;
		}	
		handleHeight -= handleHeight%2;		//if odd, substract 1 to make even. If even substract nothing
		
		$("#vScrollbar").find(".ui-slider-handle").css({height:handleHeight,'margin-bottom':-0.5*handleHeight});
		var origSliderHeight = this.vboxH;//read the original slider height
		var sliderHeight = origSliderHeight - handleHeight ;//the height through which the handle can move needs to be the original height minus the handle height
		var sliderMargin =  (origSliderHeight - sliderHeight)*0.5;//so the slider needs to have both top and bottom margins equal to half the difference
		$("#vScrollbar").find(".ui-slider").css({height:sliderHeight,'margin-top':sliderMargin});//set the slider height and margins
		$("#vScrollbar").find(".ui-slider-range").css({bottom:-sliderMargin});//position the slider-range div at the top of the slider container
		
	},
	
	addSrcSignal : function (signal, index)
	{
		var newSig = new MatrixViewSourceSignal(this.model.cols.length-1);
		newSig.col = index;
		this.srcSignals.push(newSig);
		
		if(index > this.nCols)
		{
			alert("invalid col index");
			return;
		}
		
		var i,j;
		
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
				colLabel.setAttribute("transform","translate(" + ((j+1)*(this.cellWidth+this.cellMargin)+11).toString() + "," + this.labelMargin + ")rotate(90)");
				colLabel.setAttribute("id", "colLabel"+(j+1));
				colLabel.setAttribute("data-col", j+1);
			}
		}
		
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

		
		var cell, column, colLabel, rowLabel;	// old cell
		var newCell, newLabel;					// new cell
		
		// reposition cells in cols after index
		for(i=0; i<this.cells.length; i++)
		{
			cell = this.cells[i];
			column =  parseInt(cell.getAttribute("data-col"));
			if(column >= index){
				cell.setAttribute("data-col", column+1);
				cell.setAttribute("x",(column+1)*(this.cellWidth+this.cellMargin));	// reposition the cell
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
		var xPos = index*(this.cellWidth+this.cellMargin)+11;			// pluss 11 MAKE DYNAMIC!
		var yPos = this.labelMargin;
		newLabel.setAttribute("class", "label");
		newLabel.setAttribute("data-src", signal.id);
		newLabel.setAttribute("data-col", index);
		newLabel.setAttribute("transform","translate(" + xPos + "," + yPos + ")rotate(90)");
		newLabel.appendChild(document.createTextNode(signal.name));	
		this.svgColLabels.insertBefore(newLabel, this.svgColLabels.childNodes[index]);
		
		// update IDs of connections
		// FIX : separate properly between model/view
		
		// model.incConnectionColIndicesAfter(index);
		
		// update GUI data
		this.nCols++;
		this.contentW = this.nCols*(this.cellWidth+this.cellMargin);
		this.sizeHScrollbar();
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
		
		// reposition existing cells in rows after index
		for(i=0; i<this.cells.length; i++)											// for each cell
		{
			var cell = this.cells[i];												// get the cell 
			var row = parseInt(cell.getAttribute("data-row"));						// get the cell's row
			if(row >= index){
				cell.setAttribute("data-row", row+1);								// store new row number
				cell.setAttribute("y",(row+1)*(this.cellHeight+this.cellMargin));	// reposition y coordinate
			}
		}
		
		// reposition the existing row labels
		for(i=this.nRows-1; i>=index; i--)											// for each row after index
		{
			var rowLabel = this.svgRowLabels.getElementById("rowLabel" + i);		// get the element with the row label
			var y = (i+1)*(this.cellHeight+this.cellMargin);						// calculate the new y coordinate
			if(rowLabel != null){
				rowLabel.setAttribute("id", "rowLabel" + (i+1));					// update the element's ID
				rowLabel.setAttribute("data-row", i+1);								
				rowLabel.setAttribute("y", y+(this.cellHeight/2)+4);				// set the new y coordinate + offset to center vertically
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
		newRowLabel.setAttribute("id", "rowLabel" + index.toString()  );
		newRowLabel.setAttribute("x", this.labelMargin);
		newRowLabel.setAttribute("y", (index)*(this.cellHeight+this.cellMargin)+(this.cellHeight/2)+4);		// plus 4 to center vertically MAKE DYNAMIC!
		newRowLabel.setAttribute("data-dst", signal.id);
		newRowLabel.setAttribute("data-row", index);
		newRowLabel.setAttribute("class","label");
		newRowLabel.appendChild(document.createTextNode(signal.name));	
		this.svgRowLabels.appendChild(newRowLabel);
		
		// update IDs of connections
		// FIX : separate properly between model/view
		
		//	model.incConnectionRowIndicesAfter(index);
		
		// update GUI data		
		this.nRows++;
		this.contentH = this.nRows*(this.cellHeight+this.cellMargin);
		this.sizeVScrollbar();
	}, 
	
	createCell : function (row, col, src, dst)
	{
		var cell = document.createElementNS(this.svgNS,"rect");
		cell.setAttribute("id", this.nextCellId());
		cell.setAttribute("data-row", row);
		cell.setAttribute("data-col", col);
		cell.setAttribute("data-src", src);
		cell.setAttribute("data-dst", dst);
		
		cell.setAttribute("x",col*(this.cellWidth+this.cellMargin));
		cell.setAttribute("y",row*(this.cellHeight+this.cellMargin));
		cell.setAttribute("rx", this.cellRoundedCorner);
		cell.setAttribute("ry", this.cellRoundedCorner);
		cell.setAttribute("width",this.cellWidth);
		cell.setAttribute("height",this.cellHeight);
		cell.setAttribute("class","cell_up");
		

		var _self = this;	// to pass to the instance of LibMApperMatricView to event handlers
		cell.addEventListener("click", function(evt){
			_self.onCellClick(evt, _self);
		});
		cell.addEventListener("mouseover", function(evt){
			_self.cellMouseOverHandler(evt, _self);
		});
		cell.addEventListener("mouseout", function(evt){
			_self.cellMouseOverHandler(evt, _self);
		});
		
		_self.cells.push(cell);
		return cell;
	},
	
	/**
	 * on cell mouseover, highlights corresponding row and columns
	 * must handle special cases: if the cell is the selected cell or has a connection
	 */
	cellMouseOverHandler : function(evt, _self)    
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
		// do nothing if there is no cell selected
		
		if(this.selectedCell == null)	
			return;

		var selectedSrc = this.selectedCell.getAttribute("data-src");
		var selectedDst = this.selectedCell.getAttribute("data-dst");
		
		var connectionIndex = this.model.getConnectionIndex(selectedSrc, selectedDst);
		
		// toggle the connection
		
		if(connectionIndex == -1)	// not already a connection, create the new connection
		{
			this.model.createConnection(selectedSrc, selectedDst);
			this.selectedCell.setAttribute("class", "cell_connected cell_selected");	//style appropriately for GUI	
		}
			
		else	// is already a connection, so remove it
		{
			//FIX Tell the controller we removed the connection
			//remove from connections array
			this.model.removeConnection(connectionIndex);		
			this._container.trigger("removeConnection", [selectedSrc, selectedDst]);
			
			//style the cell
			
			if(this.mousedOverCell != null)	//style when mouse is over the toggled cell's row/col
			{	
				var mouseRow = this.mousedOverCell.getAttribute("data-row");
				var mouseCol = this.mousedOverCell.getAttribute("data-col");
				var selectedRow = this.selectedCell.id.getAttribute("data-row");
				var selectedCol = this.selectedCell.id.getAttribute("data-col");
				
				if(mouseRow == selectedRow || mouseCol == selectedCol)
					this.selectedCell.setAttribute("class", "row_over cell_selected");
				else	
					this.selectedCell.setAttribute("class", "cell_up cell_selected");
			}
			else	// style when no cell is moused over 
				this.selectedCell.setAttribute("class", "cell_up cell_selected");
			
			
		}
		
	
	},
	
	// FIX this will not work when we remove signals
	nextCellId : function (){
		return "cell" + this.nCellIds++;
	},
	getCellIndex : function (id){
		return (id.substring(4));
	},
	
	
	render : function(){
		
		
	}
	
};


function MatrixViewCell(row, col, src, dst)
{
	this.id = this.nextCellId();
	this.row = row;
	this.col = col;
	this.src = src;
	this.dst = dst;
	this.classname = "";
};

function MatrixViewSourceSignal(modelIndex)
{
	this.modelIndex = modelIndex;	// reference to the signal object	
	this.col = 0;
};
function MatrixViewDestinationSignal(modelIndex)
{
	this.modelIndex = modelIndex;	// reference to the signal object	
	this.row = 0;
};
