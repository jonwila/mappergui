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

	this.svgWidth = 600;
	this.svgHeight = 400;
	this.aspect = this.svgWidth/this.svgHeight;
	this.colLabelsH = 100;
	this.rowLabelsW = 200;
	
	this.vboxW = this.svgWidth;
	this.vboxH = this.svgHeight;
	this.vboxX = 0;
	this.vboxY = 0;
	
	this.zoomIncrement = 50;
	this.vboxMinW = 250;
	this.vboxMinH = 150;
	this.vboxMaxW = 3000;	//stopped using
	this.vboxMaxH = 3000;	//stopped using
	
	this.cellWidth = 32;
	this.cellHeight = 32;
	this.cellRoundedCorner = 0;
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
	this.initHorizontalZoomSlider($("#hZoomSlider"));
	this.initVerticalZoomSlider($("#vZoomSlider"));

	this.nCellIds = 0;
	
	//helper for scroll zoom bars
	this.handleClicked;
	this.handleClick;
	this.handleValues;
	
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
		
		//toggle connection button
		btn = document.createElement("button");
		btn.innerHTML = "Toggle";
		btn.addEventListener("click", function(evt){
			_self.toggleConnection();
		});
		div.appendChild(btn);
		
		//zoom in button
		btn = document.createElement("button");
		btn.innerHTML = "Zoom IN";
		btn.addEventListener("click", function(evt){
			_self.zoomIn();
		});
		div.appendChild(btn);
			
		//zoom out button
		btn = document.createElement("button");
		btn.innerHTML = "Zoom OUT";
		btn.addEventListener("click", function(evt){
			_self.zoomOut();
		});
		div.appendChild(btn);
			
		container.appendChild(div);
		
		//h scrollbar
		div = document.createElement("div");
		div.setAttribute("id", "hScrollbar");
		container.appendChild(div);
		
		// a wrapper div to hold vscroll, grid + row labels
		var wrapper1 = document.createElement("div");
		wrapper1.setAttribute("style", "margin-top: 5px; clear: both;");
		
		// v scrollbar
		div = document.createElement("div");
		div.setAttribute("id", "vScrollbar");
		wrapper1.appendChild(div);
		
		// svg canvas
		this.svg = document.createElementNS(this.svgNS,"svg");
		this.svg.setAttribute("id", "svgGrid");
		this.svg.setAttribute("xmlns", this.svgNS);
		this.svg.setAttribute("xmlns:xlink", this.svgNSxlink);
		this.svg.setAttribute("width", this.svgWidth);
		this.svg.setAttribute("height", this.svgHeight);
		this.svg.setAttribute("viewBox", toViewBoxString(this.vboxX, this.vboxY, this.vboxW, this.vboxH));
		this.svg.setAttribute("preserveAspectRatio", "none");
		this.svg.setAttribute("style", "float:left;margin-left: 5px; margin-bottom: 5px");
		wrapper1.appendChild(this.svg);	
		
		// hv zooming scroll bar
		div = document.createElement("div");
		div.setAttribute("id", "vZoomSlider");
		div.setAttribute("style", "float:left;margin-left: 5px; margin-bottom: 5px");
		//div.setAttribute("style", "position: relative; margin-top: 10px; clear:both;");
		wrapper1.appendChild(div);
		
		// svg row labels
		this.svgRowLabels = document.createElementNS(this.svgNS, "svg");
		this.svgRowLabels.setAttribute("id", "svgRows");
		this.svgRowLabels.setAttribute("xmlns", this.svgNS);
		this.svgRowLabels.setAttribute("xmlns:xlink", this.svgNSxlink);
		this.svgRowLabels.setAttribute("width", this.rowLabelsW);
		this.svgRowLabels.setAttribute("height", this.svgHeight);
		this.svgRowLabels.setAttribute("style", "float:left;");
		this.svgRowLabels.setAttribute("preserveAspectRatio", "none");
		wrapper1.appendChild(this.svgRowLabels);
		
		container.appendChild(wrapper1);
		
		// h zooming scroll bar
		div = document.createElement("div");
		div.setAttribute("id", "hZoomSlider");
		div.setAttribute("style", "position: relative; margin-top: 10px; clear:both;");
		container.appendChild(div);
		
		// svg column labels
		this.svgColLabels = document.createElementNS(this.svgNS, "svg");
		this.svgColLabels.setAttribute("id", "svgCols");
		this.svgColLabels.setAttribute("xmlns", this.svgNS);
		this.svgColLabels.setAttribute("xmlns:xlink", this.svgNSxlink);
		this.svgColLabels.setAttribute("width", this.svgWidth);
		this.svgColLabels.setAttribute("height", this.colLabelsH);
		this.svgColLabels.setAttribute("style", "clear:both; margin-left:20px;");
		this.svgColLabels.setAttribute("preserveAspectRatio", "none");
		
		container.appendChild(this.svgColLabels);
		
	},

	sizeZoomBars : function ()
	{
		$("#hZoomSlider").slider("option", "min", 0);
		$("#hZoomSlider").slider("option", "max", this.contentW);
		$("#hZoomSlider").slider( "option", "values", [ this.vboxX, this.vboxX+this.vboxW]);
		$("#vZoomSlider").slider("option", "min", 0);
		$("#vZoomSlider").slider("option", "max", this.contentH);
		$("#vZoomSlider").slider( "option", "values", [this.contentH-(this.vboxY+this.vboxH), this.contentH-this.vboxY]);
	},
	
	initHorizontalZoomSlider : function ()
	{
		var _self = this;
		$("#hZoomSlider").width(this.svgWidth);
		
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
				if(_self.handleClicked)	//for when a handle is clicked (change range and zoom)
				{
					var w = ui.values[1]-ui.values[0];
					//if(w < _self.vboxMinW || w > _self.vboxMaxW || w > _self.contentW)
					if(w < _self.vboxMinW || w > _self.contentW)
						return false;
					else{
						_self.vboxW = w;
						_self.vboxH = w/_self.aspect;
						_self.vboxX = ui.values[0];
						_self.resetViewBoxes();
						_self.sizeHScrollbar();
						_self.sizeVScrollbar();
						_self.sizeZoomBars();
					}
				}
				else	// for when the range was clicked (scroll bar and slide)
				{
					// calculated the drag size of mouse relative to size of the scroll bar
					// multiplied by the range to scrollable range
					var dx = ((event.pageX-_self.handleClick[0]) / _self.svgWidth) * ( _self.contentW-_self.vboxW);
			        var v1 = _self.handleValues[0]+dx;
			        var v2 = _self.handleValues[1]+dx;
			        
			        // fixes glitch when user scrolls with mouse fast beyond min/max by removing the excess 
			        // and snapping to the min/max 
			        if(v1 < 0){
			        	var overflow = 0 - v1;
			        	v1 += overflow;
			        	v2 += overflow;
			        }
			        else if(v2 > _self.contentW)
		        	{
			        	var overflow = _self.contentW - v2;
			        	v1 += overflow;
			        	v2 += overflow;
			        }
			        		
			        // update the slider's values and the vBox's position
		        	$("#" + this.id).slider("option", "values", [v1,v2]);
		        	_self.vboxX =  v1;
		        	_self.resetViewBoxes();
			        
		        	//disables default functionality slider
			        return false;   
				}
			}
		});
		//$( "#amount2" ).val( "$" + $( "#hZoomSlider" ).slider( "values", 0 ) +
		// " - $" + $( "#hZoomSlider" ).slider( "values", 1 ) );
	},
	
	//helper function that customizes JQUERY UI Range slider to have the scrollbar features
	sliderClicked: function (e, ui, _self)
	{
		_self.handleClicked = $(e.originalEvent.target).hasClass("ui-slider-handle");	// true if clicked on a handle
		_self.handleValues = ui.values;	// store the original values 
		_self.handleClick = [e.pageX, e.pageY];	// store the initial x/y click position
		
	},
	
	initVerticalZoomSlider : function ()
	{
		var _self = this;
		$("#vZoomSlider").height(this.svgHeight);
		
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
				if(_self.handleClicked)	//for when a handle is clicked (change range and zoom)
				{
					var h = ui.values[1]-ui.values[0];
				 	if(h < _self.vboxMinH || h > _self.contentH)
				 		return false;
				 	else{
					 	_self.vboxH = h;
					 	_self.vboxW = h*_self.aspect;
					 	_self.vboxY = _self.contentH-ui.values[1];
					 	_self.resetViewBoxes();
					 	_self.sizeZoomBars();
				 	}
				}
				else	// for when the range was clicked (scroll bar and slide)
				{
					// calculated the drag size of mouse relative to size of the scroll bar
					// multiplied by the range to scrollable range
					var dy = ((_self.handleClick[1]-event.pageY) / _self.svgHeight) * ( _self.contentH-_self.vboxH);
			        var v1 = _self.handleValues[0]+dy;
			        var v2 = _self.handleValues[1]+dy;
			        
			        // fixes glitch when user scrolls with mouse fast beyond min/max by removing the excess 
			        // and snapping to the min/max 
			        if(v1 < 0){
			        	var overflow = 0 - v1;
			        	v1 += overflow;
			        	v2 += overflow;
			        }
			        else if(v2 > _self.contentH)
		        	{
			        	var overflow = _self.contentH - v2;
			        	v1 += overflow;
			        	v2 += overflow;
			        }
			        		
			        // update the slider's values and the vBox's position
		        	$("#" + this.id).slider("option", "values", [v1,v2]);
		        	_self.vboxY =  v1;
		        	_self.resetViewBoxes();
			        
		        	//disables default functionality slider
			        return false;   
				}
			}
		  });
		    //$( "#amount2" ).val( "$" + $( "#hZoomSlider" ).slider( "values", 0 ) +
		     // " - $" + $( "#hZoomSlider" ).slider( "values", 1 ) );
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
				_self.resetViewBoxes();
				_self.sizeZoomBars();
				$('ui-slider-range').width(ui.value+'%');//set the height of the range element	//???
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
			handleHeight = Math.round((1-proportion)* this.svgWidth );//set the proportional height - round it to make sure everything adds up correctly later on
		}
		else{
			handleHeight = this.svgWidth;
		}	
		handleHeight -= handleHeight%2;		//if odd, subtract 1 to make even. If even subtract nothing
		
		$("#hScrollbar").find(".ui-slider-handle").css({width:handleHeight,'margin-left':-0.5*handleHeight});
		var origSliderHeight = this.svgWidth;//read the original slider height
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
				_self.resetViewBoxes();
				_self.sizeZoomBars();
				//$('ui-slider-range').height(ui.value+'%');//set the height of the range element
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
			handleHeight = Math.round((1-proportion)* this.svgHeight );//set the proportional height - round it to make sure everything adds up correctly later on
		}
		else
		{
			handleHeight = this.svgHeight;
		}	
		handleHeight -= handleHeight%2;		//if odd, substract 1 to make even. If even substract nothing
		
		$("#vScrollbar").find(".ui-slider-handle").css({height:handleHeight,'margin-bottom':-0.5*handleHeight});
		var origSliderHeight = this.svgHeight;//read the original slider height
		var sliderHeight = origSliderHeight - handleHeight ;//the height through which the handle can move needs to be the original height minus the handle height
		var sliderMargin =  (origSliderHeight - sliderHeight)*0.5;//so the slider needs to have both top and bottom margins equal to half the difference
		$("#vScrollbar").find(".ui-slider").css({height:sliderHeight,'margin-top':sliderMargin});//set the slider height and margins
		$("#vScrollbar").find(".ui-slider-range").css({bottom:-sliderMargin});//position the slider-range div at the top of the slider container
		
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
				colLabel.setAttribute("transform","translate(" + ((j+1)*(this.cellWidth+this.cellMargin)+11).toString() + "," + this.labelMargin + ")rotate(90)");
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
		
		// update GUI data
		this.nCols++;
		this.contentW = this.nCols*(this.cellWidth+this.cellMargin);
		this.sizeHScrollbar();
		this.sizeZoomBars();
		
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
			var y = (i+1)*(this.cellHeight+this.cellMargin);						// calculate the new y coordinate
			if(rowLabel != null){
				rowLabel.setAttribute("id", "rowLabel" + (i+1));					// update the element's ID
				rowLabel.setAttribute("data-row", i+1);								
				rowLabel.setAttribute("y", y+(this.cellHeight/2)+4);				// set the new y coordinate + offset to center vertically
			}
		}
		
		// reposition cells in rows after index
		for(i=0; i<this.cells.length; i++)											// for each cell
		{
			var cell = this.cells[i];												// get the cell 
			var row = parseInt(cell.getAttribute("data-row"));						// get the cell's row
			if(row >= index){
				cell.setAttribute("data-row", row+1);								// store new row number
				cell.setAttribute("y",(row+1)*(this.cellHeight+this.cellMargin));	// reposition y coordinate
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
		
		// update GUI data		
		this.nRows++;
		this.contentH = this.nRows*(this.cellHeight+this.cellMargin);
		this.sizeVScrollbar();
		this.sizeZoomBars();

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
		

		var _self = this;	// to pass to the instance of LibMapperMatrixView to event handlers
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
		if(this.vboxW > this.vboxMinW)
		{
			this.vboxW -= this.zoomIncrement;
			this.vboxH -= this.zoomIncrement/this.aspect;
			this.resetViewBoxes();
			this.sizeHScrollbar();
			this.sizeVScrollbar();
			this.sizeZoomBars();
		}
	},
	
	zoomOut : function()
	{
		if(this.vboxW <= this.contentW-this.zoomIncrement && this.vboxW < this.vboxMaxW-this.zoomIncrement){
			this.vboxW += this.zoomIncrement;
			this.vboxH += this.zoomIncrement/this.aspect;
		}
		else{
			this.vboxW = (this.contentW<this.vboxMaxW)? this.contentW : this.vboxMaxW;
			this.vboxH = this.vboxW/this.aspect; //this.contentW/this.aspect;
		}
		this.resetViewBoxes();
		this.sizeHScrollbar();
		this.sizeVScrollbar();
		this.sizeZoomBars();
	},
	
	resetViewBoxes : function()
	{
		this.svg.setAttribute("viewBox", toViewBoxString(this.vboxX, this.vboxY, this.vboxW, this.vboxH));
		this.svgColLabels.setAttribute("viewBox", toViewBoxString(this.vboxX, 0, this.vboxW, this.colLabelsH));
		this.svgRowLabels.setAttribute("viewBox", toViewBoxString(0, this.vboxY, this.rowLabelsW, this.vboxH));
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
		
		// movement arrows to move the selected cell
		else if (e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40)	
		{
			if(_self.selectedCell != null)	// cases where there is a previously selected cell
			{
				removeCellClass("cell_selected", _self.selectedCell);
				var currentPos = [parseInt(_self.selectedCell.getAttribute('data-row')), parseInt(_self.selectedCell.getAttribute('data-col'))];
				
				switch(e.keyCode)	
				{
					case 37:	// left
						if(currentPos[1] > 0)
							_self.selectedCell = _self.getCellByPos(currentPos[0], currentPos[1]-1);
//						else
//							_self.selectedCell = _self.getCellByPos(currentPos[0], _self.nCols-1);
					  break;
					case 38:	// up
						if(currentPos[0] > 0)
							_self.selectedCell = _self.getCellByPos(currentPos[0]-1, currentPos[1]);
//						else
//							_self.selectedCell = _self.getCellByPos(_self.nRows-1, currentPos[1]);
					  break;
					case 39:	// right
						if(currentPos[1] < _self.nCols-1)
							_self.selectedCell = _self.getCellByPos(currentPos[0], currentPos[1]+1);
//						else
//							_self.selectedCell = _self.getCellByPos(currentPos[0], 0);
					  break;
					case 40:	// down
						if(currentPos[0] < _self.nRows-1)
							_self.selectedCell = _self.getCellByPos(currentPos[0]+1, currentPos[1]);
//						else
//							_self.selectedCell = _self.getCellByPos(0, currentPos[1]);
					  break;
				}
				
			}
			else	// cases where there is no selected cell
			{
				switch(e.keyCode)	
				{
					case 37:	// left 
						_self.selectedCell = _self.getCellByPos(0,_self.nCols-1);
					  break;
					case 38:	// up
						_self.selectedCell = _self.getCellByPos(_self.nRows-1,0);
					  break;
					case 39:	// right
						_self.selectedCell = _self.getCellByPos(0,0);
					  break;
					case 40:	// down
						_self.selectedCell = _self.getCellByPos(0,0);
					  break;
				}
			}
			
			// style the cell as selected
			addCellClass("cell_selected", _self.selectedCell);
			
			// calculate if cell is visible and move viewbox to follow the moving cell
			var row = _self.selectedCell.getAttribute("data-row");
			var col = _self.selectedCell.getAttribute("data-col");
			var cellW = _self.cellWidth+_self.cellMargin;
			var cellH = _self.cellHeight+_self.cellMargin;
			var pos = [cellW*col, cellH*row];
			
			// off screen on left
			if(pos[0] < _self.vboxX)
			{
				if(_self.vboxX-cellW <0)
					_self.vboxX = 0;
				else
					_self.vboxX -= cellW;
			}
			// off screen on right
			else if(pos[0] > _self.vboxX+_self.vboxW-cellW)
			{
				_self.vboxX += 2*cellW;
			}
			// off screen above
			if(pos[1] < _self.vboxY)
			{
				if(_self.vboxY-(2*cellH) < 0)
					_self.vboxY = 0;
				else
					_self.vboxY -= (2*cellH);
			}
			// off screen below
			else if(pos[1] > _self.vboxY+_self.vboxH-cellH)
			{
				_self.vboxY += 2*(cellH);
			}
			
			_self.resetViewBoxes();
			_self.sizeZoomBars();
			_self.updateScrollBars();
		}
	},
	
	updateScrollBars : function() {
		$("#hScrollbar").find('.slider-horizontal').slider( "option", "value", (this.vboxX * 100) / (this.contentW-this.vboxW) );
		$("#vScrollbar").find('.slider-vertical').slider( "option", "value", -((this.vboxY*100/(this.contentH-this.vboxY))-100)  );
	},
	
	
	// FIX this will not work when we remove signals
	nextCellId : function (){
		return "cell" + this.nCellIds++;
	},
	getCellIndex : function (id){
		return (id.substring(4));
	}
	
	
	
};

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
