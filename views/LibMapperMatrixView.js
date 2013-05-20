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
	this.devGrid;
	this.sigGrid;
	
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
		div.setAttribute("id", "devGrid");
		container.appendChild(div);
		this.devGrid = new SvgGrid(document.getElementById("devGrid"), model, 0);
		
		div = document.createElement("div");
		div.setAttribute("id", "sigGrid");
		container.appendChild(div);
		this.sigGrid = new SvgGrid(document.getElementById("sigGrid"), model, 1);
		
	},
	
	keyboardHandler: function (e, _self)
	{
		if(this.activeGridIndex == 0)
			this.devGrid.keyboardHandler(e, _self);
		else if(this.activeGridIndex == 0)
			this.devGrid.keyboardHandler(e, _self);
			
	},
	
	updateDisplay : function (){
		
		//divide devices into sources and destinations
		var srcDevs = new Array();
		var dstDevs = new Array();
		
		for (var i=0; i< this.model.devices.length; i++)
		{
			var dev = this.model.devices[i];
			if(dev.n_outputs>0)		//create new COL Label
				srcDevs.push(dev);
			if(dev.n_inputs>0)
				dstDevs.push(dev);
		}
		
		this.devGrid.updateDisplay(srcDevs, dstDevs);

		
		var srcSigs= new Array();
		var dstSigs = new Array();
		
		
		// for each device, get its signals
		for (var i=0; i< srcDevs.length; i++)
		{	
			var dev = srcDevs[i];
			for (var j=0; j< this.model.signals.length; j++)
			{
				var sig = this.model.signals[j];
				if(sig.device_name == dev.name)
					srcSigs.push(sig);
			}
		}
		for (var i=0; i< dstDevs.length; i++)
		{	
			var dev = dstDevs[i];
			for (var j=0; j< this.model.signals.length; j++)
			{
				var sig = this.model.signals[j];
				if(sig.device_name == dev.name)
					dstSigs.push(sig);
			}
		}
		this.sigGrid.updateDisplay(srcSigs, dstSigs);
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

