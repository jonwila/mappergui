/**
 * The View. View presents the model and provides
 * the UI events. The controller is attached to these
 * events to handle the user interaction.
 */

function LibMapperMatrixView(wrapperDiv, model)
{
	var _self = this;
	this.model = model;
	
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
	
	this.init(wrapperDiv);
	this.initVerticalScrollbar($("#vScrollbar"));
	this.initHorizontalScrollBar($("#hScrollbar"));

	
}

LibMapperMatrixView.prototype = {
		
		
	init : function (wrapperDiv) 
	{ 

		var div;
		
		//h scrollbar
		div = document.createElement("div");
		div.setAttribute("id", "hScrollbar");
		wrapperDiv.appendChild(div);
		
		
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
		
		wrapperDiv.appendChild(wrapper1);
		
		// svg column labels
		this.svgColLabels = document.createElementNS(this.svgNS, "svg");
		this.svgColLabels.setAttribute("id", "svgCols");
		this.svgColLabels.setAttribute("xmlns", this.svgNS);
		this.svgColLabels.setAttribute("xmlns:xlink", this.svgNSxlink);
		this.svgColLabels.setAttribute("width", this.svgWidth);
		this.svgColLabels.setAttribute("height", this.colLabelsH);
		this.svgColLabels.setAttribute("style", "clear:both; margin-left:20px;");
		wrapperDiv.appendChild(this.svgColLabels);
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
	
	/**
	 * insert a column at the specified index
	 * reposition the columns cell and label with index greater than the specified index
	 * reposition the row labels 
	 * create the new column (containg cells + label)
	 * update IDs of all rows that are connected
	 */
	addSourceSourceSignal : function (signal, index)
	{
		if(index > this.nCols)
		{
			alert("invalid col index");
			return;
		}
		
		var i,j;
		var cell, colLabel, rowLabel;
		var newCell, newLabel;
	
		
		// reposition cols after the index
		// change the id's of each cell in the col to match new location in the grid

		for(j=this.nCols-1; j>=index; j--)	// for each column after index
		{
			for(i=0; i<this.nRows; i++)
			{
				cell = document.getElementById(makeId(i,j));
				cell.setAttribute("x",(j+1)*(this.cellWidth+this.cellMargin));	// reposition the cell
				cell.setAttribute("id", makeId(i, j+1));				// update the id
			}
			
			//reposition the col label
			colLabel = this.svgColLabels.getElementById("colLabel" + j);
			if(colLabel != null)
			{
				colLabel.setAttribute("transform","translate(" + ((j+1)*(this.cellWidth+this.cellMargin)+11).toString() + "," + this.labelMargin + ")rotate(90)");
				colLabel.setAttribute("id", "colLabel"+(j+1));
			}
		}
	
		// create new cells
		for(var i=0; i<this.nRows; i++)
		{
			// create new cells
			newCell = this.createCell(i, index);
			var c2 = document.getElementById("row" + i);
			var c3 = c2.childNodes[index]; 
			c2.insertBefore(newCell, c3);
		}

		//create new COL Label
		newLabel = document.createElementNS(this.svgNS,"text");
		newLabel.setAttribute("id", "colLabel" + index.toString()  );
		var xPos = index*(this.cellWidth+this.cellMargin)+11;			// pluss 11 MAKE DYNAMIC!
		var yPos = this.labelMargin;
		newLabel.setAttribute("class","label");
		newLabel.setAttribute("transform","translate(" + xPos + "," + yPos + ")rotate(90)");
		newLabel.appendChild(document.createTextNode(signal.name));	
		this.svgColLabels.insertBefore(newLabel, this.svgColLabels.childNodes[index]);
		
		// update IDs of connections
		// FIX : separate properly between model/view
		model.incConnectionColIndicesAfter(index);
		
		
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
		var row, y, cell;
		var newRow, newRowY, newRowLabel;
		var rowLabel;
		
		// update the existing rows 
		for(i=this.nRows-1; i>=index; i--)	// for each row after index
		{
			// reposition the y position of the entire row group and label
			row = this.svg.getElementById("row" + i);
			y = (i+1)*(this.cellHeight+this.cellMargin);
			row.setAttribute("transform", "translate(0,"+ y +")");
			
			//update row ID
			row.setAttribute("id", "row" + (i+1));
			
			// update the row's label ID
			rowLabel = this.svgRowLabels.getElementById("rowLabel" + i);
			if(rowLabel != null){
				rowLabel.setAttribute("id", "rowLabel" + (i+1));
				rowLabel.setAttribute("y", y+(this.cellHeight/2)+4);
			}
			
			// update IDs of each cell inside the row
			for(j=0; j<this.nCols; j++)
			{
				// change ID of cells
				cell = row.childNodes[j];
				cell.setAttribute("id", i+1 + "," + j);
			}
		}
		
		// create a new row group	
		newRow = document.createElementNS(this.svgNS,"g");
		newRowY = index*(this.cellHeight+this.cellMargin);
		newRow.setAttribute("transform", "translate(0,"+ newRowY +")");
		newRow.setAttribute("id", "row" + index);
				
		// create new cells for the new row
		for(j=0; j<this.nCols; j++)
		{
			newRow.appendChild(this.createCell(index, j));
		}
		this.svg.appendChild(newRow);
		
		// create row label for the new row
		newRowLabel = document.createElementNS(this.svgNS,"text");
		newRowLabel.setAttribute("id", "rowLabel" + index.toString()  );
		newRowLabel.setAttribute("x", this.labelMargin);
		newRowLabel.setAttribute("y", newRowY+(this.cellHeight/2)+4);		// plus 4 to center vertically MAKE DYNAMIC!
		newRowLabel.setAttribute("class","label");
		newRowLabel.appendChild(document.createTextNode(signal.name));	
		this.svgRowLabels.appendChild(newRowLabel);
		
		// update IDs of connections
		// FIX : separate properly between model/view
		model.incConnectionRowIndicesAfter(index);
		
		// update GUI data		
		this.nRows++;
		this.contentH = this.nRows*(this.cellHeight+this.cellMargin);
		this.sizeVScrollbar();
	}, 
	
	createCell : function (row, col)
	{
		var cell = document.createElementNS(this.svgNS,"rect");
		cell.setAttribute("id", makeId(row,col));
		cell.setAttribute("x",col*(this.cellWidth+this.cellMargin));
		cell.setAttribute("y", 0);
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

		return cell;
	},
	
	/**
	 * on cell mouseover, highlights corresponding row and columns
	 * order matters.. I'm styling the row and column first, then the moused over cell
	 * must handle special cases: if the cell is the selected cell or has a connection
	 */
	cellMouseOverHandler : function(evt, _self)    
	{
		// keep reference to cell mouse is over
		if(evt.type == "mouseover")
			_self.mousedOverCell = evt.target;	
		else if (evt.type == "mouseout")
			_self.mousedOverCell = null;	
			
		// row can be found from it's parent <g>
		// columns must be found differently (below)	
		var row = evt.target.parentNode;	
		
		var selectedRow = getRowIndex(evt.target.id);
		var selectedCol = getColIndex(evt.target.id);
		
		// style row cells
		
		for(var i=0; i<_self.nCols; i++)
		{
			var curNode = row.childNodes[i];
			var className = curNode.getAttribute("class");
			if(className.indexOf("cell_connected") == -1)
			{
				className = (className.indexOf("cell_selected") == -1)? "" : "cell_selected "; 
				if(evt.type == "mouseover")
					row.childNodes[i].setAttribute("class", className + "row_over");
				else if(evt.type == "mouseout")
					row.childNodes[i].setAttribute("class",className + "cell_up");
			}
		}
		
		// style row label
		
		//var rowLabel = row.childNodes[model.cols.length];
		var rowLabel = _self.svgRowLabels.getElementById("rowLabel" + selectedRow);
		if(rowLabel != null)
		{
			if(evt.type == "mouseover")
				rowLabel.setAttribute("class","label_over");
			else if(evt.type == "mouseout")
				rowLabel.setAttribute("class","label");
		}
		
		// style col cells
	
		for(var i=0; i<model.rows.length; i++)
		{
			var currentId = makeId(i,selectedCol);
			var colCell = _self.svg.getElementById(currentId);
			var className = colCell.getAttribute("class"); 
			if(className.indexOf("cell_connected") == -1)
			{
				className = (className.indexOf("cell_selected") == -1)? "" : "cell_selected ";
				if(evt.type == "mouseover")
					colCell.setAttribute("class", className+"row_over");
				else if(evt.type == "mouseout")
				{
					colCell.setAttribute("class", className+"cell_up");			
				}
			}
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
		var _self = this;
		
		// do nothing if there is no cell selected
		if(_self.selectedCell == null)	
			return;

		
		// toggle the connection
		
		if(_self.model.isConnected(_self.selectedCell.id))	// is already a connection, so remove it
		{
			//remove from connections array
			_self.model.removeConnection(_self.selectedCell.id);		
											
			//style the cell
			
			if(_self.mousedOverCell != null)	//style when mouse is over the toggled cell's row/col
			{	
				var mouseRow = getRowIndex(_self.mousedOverCell.id);
				var mouseCol = getColIndex(_self.mousedOverCell.id);
				var selectedRow = getRowIndex(_self.selectedCell.id);
				var selectedCol = getColIndex(_self.selectedCell.id);
				if(mouseRow == selectedRow || mouseCol == selectedCol)
					_self.selectedCell.setAttribute("class", "row_over cell_selected");
				else	
					_self.selectedCell.setAttribute("class", "cell_up cell_selected");
			}
			else	// style when no cell is moused over 
				_self.selectedCell.setAttribute("class", "cell_up cell_selected");
				
		
			//FIX Tell the controller we removed the connection
		
		}
		else	// not already a connection, create the new connection
		{
			var row = getRowIndex(_self.selectedCell.id);
			var col = getColIndex(_self.selectedCell.id);
			_self.model.createConnection(row,col);
			_self.selectedCell.setAttribute("class", "cell_connected cell_selected");	//style appropriately for GUI	
		}
	
	}
	
	
	
};



function toViewBoxString(x, y, w, h){
		return x.toString() + " " + y.toString() + " " + w.toString() + " " + h.toString();
};



//NOT USED YET
function moveScrollbar(){
	var remainder = scrollPane.width() - scrollContent.width();
	var leftVal = scrollContent.css( "margin-left" ) === "auto" ? 0 :
		parseInt( scrollContent.css( "margin-left" ) );
	var percentage = Math.round( leftVal / remainder * 100 );
	scrollbar.slider( "value", percentage );
};
//