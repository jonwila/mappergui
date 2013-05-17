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
	
	this.activeGridIndex = 0;
	this.devicesGrid;
	this.signalsGrid;
	
	this.init(container, model);

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
		
	init : function (container, model) 
	{ 
		var _self = this;	// to pass to the instance of LibMApperMatrixView to event handlers
		
		var div = document.createElement("div");
		div.setAttribute("id", "devicesGrid");
		container.appendChild(div);
		this.devicesGrid = new SvgGrid(document.getElementById("devicesGrid"), model, 0);
		
		div = document.createElement("div");
		div.setAttribute("id", "signalsGrid");
		container.appendChild(div);
		this.signalsGrid = new SvgGrid(document.getElementById("signalsGrid"), model, 1);
		
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
		
	keyboardHandler: function (e, _self)
	{
		if(this.activeGridIndex == 0)
			this.devicesGrid.keyboardHandler(e, _self);
			
	},
	
	updateDisplay : function (){
		
		this.devicesGrid.updateDisplay();
		this.signalsGrid.updateDisplay();

	},
	
	
	// FIX this will not work when we remove signals
	
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
